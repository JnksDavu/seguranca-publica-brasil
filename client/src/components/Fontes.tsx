import React, { useState } from 'react';

type Fonte = {
  id: string;
  titulo: string;
  url: string;
  metodo: string;
  descricao: string;
  passos: string[];
};

const fontes: Fonte[] = [
  {
    id: 'ibge',
    titulo: 'IBGE – API SIDRA',
    url: 'https://apisidra.ibge.gov.br',
    metodo: 'Requisições HTTP (REST JSON)',
    descricao:
      'Utilizada para obter população municipal (estimativas e censo).',
    passos: [
      'Endpoint base /values com parâmetros: tabela, variável, período, nível territorial',
      'Ex.: /values/t/6579/n1/all/n3/all/v/9324/p/2023',
      'Limpeza de nomes de municípios e normalização de UF',
      'Persistência em schema bronze para posterior enriquecimento'
    ]
  },
  {
    id: 'sinesp',
    titulo: 'SINESP – Bases Estaduais',
    url: 'https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/estatistica/dados-nacionais-1/base-de-dados-e-notas-metodologicas-dos-gestores-estaduais-sinesp-vde-2022-e-2023',
    metodo: 'Download direto / web scraping controlado',
    descricao:
      'Planilhas públicas com indicadores consolidados de segurança. Apenas agregados; sem dados pessoais.',
    passos: [
      'Download manual ou script de captura HTTP',
      'Conversão para UTF-8',
      'Padronização de cabeçalhos'
    ]
  },
  {
    id: 'prf',
    titulo: 'PRF – Acidentes em Rodovias',
    url: 'https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-da-prf',
    metodo: 'Web scraping de página de dados abertos + ingestão CSV',
    descricao:
      'Arquivos com históricos de acidentes (localização, tipo, severidade).',
    passos: [
      'Extração lista de arquivos (CSV/XLSX)',
      'Parse e normalização de colunas (datas, lat/long)',
      'Agrupamento dos dados'
    ]
  },
  {
    id: 'senappen',
    titulo: 'SENAPPEN – Ciclos População Carcerária',
    url: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen/bases-de-dados',
    metodo: 'Download público (CSV)',
    descricao:
      'Dados agregados de população carcerária por ciclo (ex.: 14º, 15º, 16º).',
    passos: [
      'Download dos arquivos CSV',
      'Validação de delimitadores e tipos',
      'Remoção de colunas não utilizadas',
      'Carga em tabelas auxiliares'
    ]
  },
  {
    id: 'fipe',
    titulo: 'FIPE – Indicadores Econômicos',
    url: 'https://fipe.online/',
    metodo: 'Dados via assinatura (CSV e API)',
    descricao:
      'Referências econômicas para contextualizar análises (ex.: marcas, modelos). Apenas indicadores agregados usados.',
    passos: [
      'Coleta pontual de séries públicas',
      'Sem armazenamento de dados sensíveis',
      'Integração somente como dimensão complementar'
    ]
  }
];

const leis = [
  {
    titulo: 'Lei de Acesso à Informação (Lei 12.527/2011)',
    pontos: [
      'Autoriza obtenção e reutilização de dados públicos disponibilizados oficialmente',
      'Garante transparência e livre acesso salvo exceções legais'
    ]
  },
  {
    titulo: 'Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018)',
    pontos: [
      'Aplicação mitigada pois não há dados pessoais identificáveis',
      'Princípios de minimização e finalidade respeitados (uso estatístico)'
    ]
  },
  {
    titulo: 'Política de Dados Abertos (Decreto 8.777/2016)',
    pontos: [
      'Incentiva padronização e abertura de bases governamentais',
      'Reforça legitimidade da integração multibase'
    ]
  }
];

export function Fontes() {
  const [fonteAtiva, setFonteAtiva] = useState<string>('ibge');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Fontes de Dados</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {fontes.map(f => (
            <button
              key={f.id}
              onClick={() => setFonteAtiva(f.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                fonteAtiva === f.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {f.titulo.split('–')[0].trim()}
            </button>
          ))}
        </div>

        {fontes.filter(f => f.id === fonteAtiva).map(f => (
          <div key={f.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-600">{f.titulo}</h3>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Acessar Fonte
              </a>
            </div>
            <p className="text-sm text-gray-700">
              <strong>Método de Coleta:</strong> {f.metodo}
            </p>
            <p className="text-sm text-gray-700">{f.descricao}</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
              {f.passos.map(p => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className="text-[11px] text-gray-500 border-t pt-3">
              Uso exclusivamente estatístico / agregações. Sem identificação individual.
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold text-blue-700">Base Legal e Conformidade</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {leis.map(l => (
            <div key={l.titulo} className="border border-blue-100 rounded-lg p-4 bg-blue-50/30">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">{l.titulo}</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
                {l.pontos.map(p => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-600 border-t pt-4">
          A aplicação utiliza somente dados públicos ou anonimizados, concentrando estatísticas para análise exploratória.
          Não são armazenados nomes, CPFs ou quaisquer identificadores diretos. Em conformidade com princípios de minimização
          e finalidade da LGPD e diretrizes da LAI.
        </div>
      </div>
    </div>
  );
}