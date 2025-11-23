import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface LocalizacaoAcidente {
  longitude: number;
  latitude: number;
  total_acidentes: number;
  total_mortos: number;
  total_feridos: number;
  total_feridos_graves: number;
  total_feridos_leves: number;
}

interface MapaAnaliticoHexProps {
  dados: LocalizacaoAcidente[];
  carregando?: boolean;
}

export function MapaAnaliticoHex({ dados, carregando }: MapaAnaliticoHexProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const heatmapPending = useRef(false);
  const aggregatedPointsRef = useRef<Array<{ lat: number; lng: number; valor: number }>>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(6); // mínimo 6
  const MIN_ZOOM = 6;

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    const el = mapContainer.current;
    if (el.offsetHeight === 0) el.style.minHeight = '600px';
    mapInstance.current = L.map(el, {
      zoomControl: true,
      preferCanvas: true,
      minZoom: MIN_ZOOM
    }).setView([-14.235, -51.925], MIN_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    setTimeout(() => { mapInstance.current && mapInstance.current.invalidateSize(); }, 120);
    return () => { mapInstance.current && mapInstance.current.remove(); mapInstance.current = null; };
  }, []);

  function rebuildHexLayer() {
    const map = mapInstance.current;
    if (!map) return;
    const pontosOrig = aggregatedPointsRef.current;
    if (!pontosOrig.length) return;
    const mostrarSingletons = map.getZoom() > 6; // só mostra valor=1 se mais perto
    const filtrados = mostrarSingletons ? pontosOrig : pontosOrig.filter(p => p.valor > 1);

    // Remove SVG anterior
    const overlayPane = map.getPanes().overlayPane;
    let svg = overlayPane.querySelector('svg');
    if (!svg) { L.svg().addTo(map); svg = overlayPane.querySelector('svg'); }
    if (!svg) return;
    const old = svg.querySelector('#hexbin-layer');
    if (old) old.remove();
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'hexbin-layer');
    svg.appendChild(group);

    const layerPoints = filtrados.map(p => {
      const pt = map.latLngToLayerPoint([p.lat, p.lng]);
      return { x: pt.x, y: pt.y, valor: p.valor };
    });
    const z = map.getZoom();
    const hexRadius = (() => {
      if (z === 6) return 26;
      if (z === 7) return 20;
      if (z === 8) return 16;
      if (z >= 9) return 12;
      return 26;
    })();
    const size = hexRadius;
    const toAxial = (x: number, y: number) => {
      const q = (2/3 * x) / size;
      const r = (-1/3 * x + Math.sqrt(3)/3 * y) / size;
      return { q, r };
    };
    const axialRound = (q: number, r: number) => {
      let x = q, zc = r, y = -x - zc;
      let rx = Math.round(x), ry = Math.round(y), rz = Math.round(zc);
      const xDiff = Math.abs(rx - x), yDiff = Math.abs(ry - y), zDiff = Math.abs(rz - zc);
      if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz; else if (yDiff > zDiff) ry = -rx - rz; else rz = -rx - ry;
      return { q: rx, r: rz };
    };
    const axialToPixel = (q: number, r: number) => {
      const px = size * (3/2 * q);
      const py = size * (Math.sqrt(3) * (r + q/2));
      return { x: px, y: py };
    };
    const binMap = new Map<string, { q: number; r: number; total: number }>();
    for (const pt of layerPoints) {
      const a = toAxial(pt.x, pt.y); const ar = axialRound(a.q, a.r);
      const key = ar.q + '|' + ar.r;
      const b = binMap.get(key) || { q: ar.q, r: ar.r, total: 0 };
      b.total += pt.valor || 0; binMap.set(key, b);
    }
    const binData = Array.from(binMap.values()).map(b => {
      const center = axialToPixel(b.q, b.r);
      return { x: center.x, y: center.y, total: b.total };
    });
    function binColor(total: number): string {
      if (total <= 1) return '#0020FF';
      if (total <= 5) return '#0078FF';
      if (total <= 15) return '#00CFFF';
      if (total <= 40) return '#2DFF6A';
      if (total <= 80) return '#FFD33A';
      return '#FF3A00';
    }
    const hexPath = (() => {
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i + 30);
        pts.push((i === 0 ? 'M' : 'L') + (size * Math.cos(angle)).toFixed(2) + ' ' + (size * Math.sin(angle)).toFixed(2));
      }
      pts.push('Z');
      return pts.join(' ');
    })();
    for (const b of binData) {
      if (b.total <= 1 && z <= 6) continue;
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', hexPath);
      pathEl.setAttribute('transform', `translate(${b.x},${b.y})`);
      pathEl.setAttribute('fill', binColor(b.total));
      pathEl.setAttribute('fill-opacity', '0.85');
      pathEl.setAttribute('stroke', '#111');
      pathEl.setAttribute('stroke-width', '0.5');
      const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleEl.textContent = `Acidentes: ${b.total}`;
      pathEl.appendChild(titleEl);
      group.appendChild(pathEl);
    }
    console.log('[MapaAnaliticoHex] bins=', binData.length, 'zoom=', z);
  }

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (mapContainer.current && (mapContainer.current.offsetHeight === 0 || mapContainer.current.offsetWidth === 0)) {
      if (!heatmapPending.current) {
        heatmapPending.current = true;
        setTimeout(() => { heatmapPending.current = false; map.invalidateSize(); }, 160);
      }
      return;
    }
    if (!dados || dados.length === 0) return;
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
      if (atual) atual.valor += valor; else groupMap.set(key, { lat: latR, lng: lngR, valor });
    }
    aggregatedPointsRef.current = Array.from(groupMap.values());
    console.log('[MapaAnaliticoHex] pontos agrupados=', aggregatedPointsRef.current.length);
    rebuildHexLayer();
  }, [dados]);

  useEffect(() => {
    const map = mapInstance.current; if (!map) return;
    function onZoomEnd() {
      let z = map.getZoom();
      if (z < MIN_ZOOM) { map.setZoom(MIN_ZOOM); z = MIN_ZOOM; }
      setZoomLevel(z);
      rebuildHexLayer();
    }
    map.on('zoomend', onZoomEnd);
    return () => { map.off('zoomend', onZoomEnd); };
  }, []);

  return (
    <div className="w-full flex flex-col" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div className="bg-white border-b border-gray-200 p-4 shadow">
        <h2 className="text-2xl font-bold text-gray-800">Mapa Analítico - Acidentes em Rodovias</h2>
        <p className="text-gray-600 mt-1">Visualização agregada por células hexagonais
          {carregando && <span className="ml-2 text-sm italic">Carregando dados...</span>}
        </p>
        <div className="mt-2 text-xs text-gray-500">Zoom atual: {zoomLevel} (mínimo {MIN_ZOOM}) | Pontos com 1 ocultos em zoom &lt;= 6</div>
      </div>
      <div className="flex-1 relative min-h-[600px]">
        <div ref={mapContainer} style={{ height: '100%', width: '100%' }} className="z-0" />
        <div className="absolute bottom-6 left-6 bg-white p-4 rounded-lg shadow-lg max-w-xs" style={{ zIndex: 10000 }}>
          <h3 className="font-semibold text-gray-800 mb-3">Categorias de Acidentes (Hex)</h3>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded" style={{ backgroundColor: '#0020FF' }}></div><span>1 acidente {zoomLevel <=6 ? '(oculto)' : ''}</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded" style={{ backgroundColor: '#0078FF' }}></div><span>2–5 acidentes</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded" style={{ backgroundColor: '#00CFFF' }}></div><span>6–15 acidentes</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded" style={{ backgroundColor: '#2DFF6A' }}></div><span>16–40 acidentes</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded" style={{ backgroundColor: '#FFD33A' }}></div><span>41–80 acidentes</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded" style={{ backgroundColor: '#FF3A00' }}></div><span>&gt;80 acidentes</span></div>
          </div>
        </div>
        {!carregando && dados.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-gray-700 font-semibold">Nenhum dado disponível</p>
              <p className="text-gray-600 text-sm mt-2">Ajuste os filtros para visualizar o mapa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapaAnaliticoHex;