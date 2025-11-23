import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';

/**
 * Interface para os dados de localização dos acidentes
 * Vem do endpoint /rodovias/indicadores
 */
export interface LocalizacaoAcidente {
  longitude: number;
  latitude: number;
  total_acidentes: number;
  total_mortos: number;
  total_feridos: number;
  total_feridos_graves: number;
  total_feridos_leves: number;
}

/**
 * Props do componente HeatmapBrasil
 */
interface HeatmapBrasilProps {
  dados: LocalizacaoAcidente[];
  carregando?: boolean;
}

/**
 * Componente principal do mapa de calor do Brasil
 *
 * Renderiza um mapa interativo com:
 * - Tiles do OpenStreetMap
 * - Heatmap baseado em dados de acidentes
 * - Centralização no Brasil com zoom apropriado
 * 
 * Este componente usa Leaflet diretamente sem react-leaflet
 * para evitar problemas de tipo com versões incompatíveis
 */
export function HeatmapBrasil({ dados, carregando }: HeatmapBrasilProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const heatmapRef = useRef<any>(null);
  const heatmapPending = useRef(false);
  const aggregatedPointsRef = useRef<Array<{ lat: number; lng: number; valor: number }>>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(4);
  // Removidos modos e filtro mínimo para simplificação

  // Inicializar o mapa uma única vez garantindo altura
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Se o container ainda não tem altura, força uma altura mínima
    const el = mapContainer.current;
    if (el.offsetHeight === 0) {
      el.style.minHeight = '600px';
    }

    mapInstance.current = L.map(el, {
      zoomControl: true,
      preferCanvas: true
    }).setView([-14.235, -51.925], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Invalida tamanho após pequeno delay para garantir cálculo correto
    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    }, 100);

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Função de categorização de intensidade por faixas discretas
  function categoriaParaIntensidade(v: number): number {
    if (v <= 1) return 0.05; // só usado se exibido (zoom > 5)
    if (v <= 5) return 0.25;
    if (v <= 15) return 0.45;
    if (v <= 40) return 0.65;
    if (v <= 80) return 0.85;
    return 1.0;
  }

  // Rebuild heatmap layer com base em zoom atual e pontos agregados
  function rebuildHeatLayer() {
    const map = mapInstance.current;
    if (!map) return;
    if (heatmapRef.current) {
      map.removeLayer(heatmapRef.current);
      heatmapRef.current = null;
    }
    const pontosOrig = aggregatedPointsRef.current;
    if (!pontosOrig.length) return;
    // Filtro: remover valor=1 em zoom baixo (<=5)
    const mostrarSingletons = map.getZoom() > 5;
    let filtrados = mostrarSingletons ? pontosOrig : pontosOrig.filter(p => p.valor > 1);
    // Converter para intensidades categóricas
    let pontos: [number, number, number][] = filtrados.map(p => [p.lat, p.lng, categoriaParaIntensidade(p.valor)]);
    // Downsampling se muitos pontos ainda
    const LIMITE = 30000;
    if (pontos.length > LIMITE) {
      const step = Math.ceil(pontos.length / LIMITE);
      pontos = pontos.filter((_, idx) => idx % step === 0);
      console.log('[Heatmap] Downsampling (rebuild):', filtrados.length, '->', pontos.length);
    }
    // Raio dinâmico
    const z = map.getZoom();
    let radius = 20;
    let blur = 12;
    if (z <= 4) { radius = 10; blur = 10; }
    else if (z === 5) { radius = 14; blur = 11; }
    else if (z === 6) { radius = 16; blur = 12; }
    else if (z >= 7) { radius = 20; blur = 12; }
    try {
      const layer = (L as any).heatLayer(pontos, {
        radius,
        blur,
        maxZoom: 18,
        max: 1,
        gradient: {
          0.05: '#0014B8', // 1 (quando exibido)
          0.25: '#004CFF', // 2–5
          0.45: '#00C2FF', // 6–15
          0.65: '#00FF88', // 16–40
          0.85: '#FF7F00', // 41–80
          1.0: '#FF0000'   // >80
        }
      }).addTo(map);
      heatmapRef.current = layer;
      console.log('[Heatmap] Rebuild layer zoom=', z, 'points=', pontos.length, 'singletonsShown=', mostrarSingletons);
    } catch (e) {
      console.error('[Heatmap] Erro rebuild:', e);
    }
  }

  // Atualizar agregação quando os dados mudam
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Se container sem tamanho ainda, retentar depois
    if (mapContainer.current && (mapContainer.current.offsetHeight === 0 || mapContainer.current.offsetWidth === 0)) {
      if (!heatmapPending.current) {
        heatmapPending.current = true;
        setTimeout(() => {
          heatmapPending.current = false;
          map.invalidateSize();
        }, 150);
      }
      return;
    }

    // Remove o heatmap anterior se existir
    if (heatmapRef.current) {
      map.removeLayer(heatmapRef.current);
      heatmapRef.current = null;
    }

    if (!dados || dados.length === 0) return;

    console.log('[Heatmap] Total registros recebidos:', dados.length);
    if (dados.length) console.log('[Heatmap] Exemplo primeiro registro:', dados[0]);

    // Agrupação por grade (reduz singletons) - arredonda para 3 casas decimais (~110m)
    const COORD_PRECISION = 3;
    const groupMap = new Map<string, { lat: number; lng: number; valor: number }>();
    for (let i = 0; i < dados.length; i++) {
      const ponto = dados[i] as any;
      let lat: any = ponto.latitude;
      let lng: any = ponto.longitude;
      if (typeof lat === 'string') lat = parseFloat(lat.replace(',', '.'));
      if (typeof lng === 'string') lng = parseFloat(lng.replace(',', '.'));
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
      let valor: any = ponto.total_acidentes || 1;
      if (typeof valor === 'string') valor = parseFloat(valor.replace(',', '.'));
      if (isNaN(valor) || valor <= 0) valor = 1;
      const latR = Number(lat.toFixed(COORD_PRECISION));
      const lngR = Number(lng.toFixed(COORD_PRECISION));
      const key = latR.toFixed(COORD_PRECISION) + '|' + lngR.toFixed(COORD_PRECISION);
      const atual = groupMap.get(key);
      if (atual) {
        atual.valor += valor;
      } else {
        groupMap.set(key, { lat: latR, lng: lngR, valor });
      }
    }
    let pontosTemp: { lat: number; lng: number; valor: number }[] = Array.from(groupMap.values());
    aggregatedPointsRef.current = pontosTemp;
    console.log('[Heatmap] Coordenadas agrupadas (grade 3 decimais):', pontosTemp.length);
    const intensidades: number[] = pontosTemp.map(p => p.valor);

    if (!pontosTemp.length) {
      console.warn('[Heatmap] Nenhum ponto válido após processamento');
      return;
    }

    // Estatísticas gerais para log
    intensidades.sort((a,b)=>a-b);
    const distinct = Array.from(new Set(intensidades));
    const minVal = distinct[0];
    const maxVal = distinct[distinct.length - 1];
    const freqMin = intensidades.filter(v=> v===minVal).length / intensidades.length;
    console.log('[Heatmap-Dist] min=', minVal, 'max=', maxVal, 'distinct=', distinct.length, 'freqMin%=', (freqMin*100).toFixed(1));
    // Build inicial
    rebuildHeatLayer();
  }, [dados]);

  // Listener de zoom para reconstruir camada dinâmica
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    function onZoomEnd() {
      const z = map.getZoom();
      setZoomLevel(z);
      rebuildHeatLayer();
    }
    map.on('zoomend', onZoomEnd);
    return () => {
      map.off('zoomend', onZoomEnd);
    };
  }, []);

  // Tabela por município removida temporariamente até API fornecer municipio/uf

  return (
    <div className="w-full flex flex-col" style={{ minHeight: 'calc(100vh - 160px)' }}>
      {/* Header com informações */}
      <div className="bg-white border-b border-gray-200 p-4 shadow">
        <h2 className="text-2xl font-bold text-gray-800">Mapa de Calor - Acidentes em Rodovias</h2>
        <p className="text-gray-600 mt-1">
          Visualização da densidade de acidentes no Brasil
          {carregando && <span className="ml-2 text-sm italic">Carregando dados...</span>}
        </p>
        <div className="mt-3 text-xs text-gray-500">Escala categórica; pontos com 1 ocultos em zoom ≤5. Zoom atual: {zoomLevel}</div>
      </div>

      {/* Container do mapa */}
      <div className="flex-1 relative min-h-[600px]">
        {/* Div ref para o Leaflet */}
        <div
          ref={mapContainer}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        />

        {/* Legenda do heatmap */}
        <div className="absolute bottom-6 left-6 bg-white p-4 rounded-lg shadow-lg max-w-xs" style={{ zIndex: 10000 }}>
          <h3 className="font-semibold text-gray-800 mb-3">Categorias de Acidentes</h3>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#0014B8' }}></div>
              <span>1 acidente {zoomLevel <=5 ? '(oculto neste zoom)' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#004CFF' }}></div>
              <span>2–5 acidentes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#00C2FF' }}></div>
              <span>6–15 acidentes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#00FF88' }}></div>
              <span>16–40 acidentes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#FF7F00' }}></div>
              <span>41–80 acidentes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#FF0000' }}></div>
              <span>&gt;80 acidentes</span>
            </div>
          </div>
        </div>

        {/* Mensagem quando não há dados */}
        {!carregando && dados.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-gray-700 font-semibold">Nenhum dado disponível</p>
              <p className="text-gray-600 text-sm mt-2">Ajuste os filtros para visualizar o mapa de calor</p>
            </div>
          </div>
        )}
      </div>
      {/* Tabela por município removida */}
    </div>
  );
}

export default HeatmapBrasil;
