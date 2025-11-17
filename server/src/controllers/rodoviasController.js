const db = require('../config/db');

const getRodovias = async (req, res) => {
  // Mapeia filtros recebidos para suas respectivas colunas no banco
  const filterMap = {
    ano: 'c.ano',
    uf: 'l.uf_abrev',
    categoria_acidente: 'ta.categoria_acidente',
    municipio: 'l.municipio',
    mes: 'c.nome_mes',
    nome_dia_semana: 'c.nome_dia_semana',
    flag_fim_de_semana: 'c.flag_fim_de_semana',
    tipo_acidente: 'ta.tipo_acidente',
    causa_acidente: 'ta.causa_acidente',
  };

  const filters = req.query;
  const whereClauses = [];   // Armazena condições dinâmicas
  const queryParams = [];    // Armazena valores dos filtros
  let paramIndex = 1;        // Controle dos placeholders ($1, $2...)

  // Monta filtros dinâmicos com suporte a múltiplos valores
  for (const [key, rawValue] of Object.entries(filters)) {
    if (rawValue === undefined || rawValue === '') continue;
    if (key === 'data_inicio' || key === 'data_fim') continue;

    const column = filterMap[key];
    if (!column) continue;

    const value = String(rawValue);

    // Suporte a filtros separados por vírgula
    if (value.includes(',')) {
      const parts = value.split(',').map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length === 0) continue;

      // Para colunas textuais, usa ILIKE (busca parcial)
      if (["uf", "uf_abrev", "municipio", "nome_mes", "nome_dia_semana", "categoria_acidente", "tipo_acidente", "causa_acidente"].includes(key)) {
        const ilikeClauses = parts.map(() => `${column} ILIKE $${paramIndex++}`).join(' OR ');
        whereClauses.push(`(${ilikeClauses})`);
        queryParams.push(...parts);
      } else {
        // Para colunas não textuais, usa IN
        const placeholders = parts.map(() => `$${paramIndex++}`).join(', ');
        whereClauses.push(`${column} IN (${placeholders})`);
        queryParams.push(...parts);
      }
    } else {
      // Filtro simples (ILIKE para textos e = para números)
      if (["uf", "uf_abrev", "municipio", "nome_mes", "nome_dia_semana", "categoria_acidente", "tipo_acidente", "causa_acidente"].includes(key)) {
        whereClauses.push(`${column} ILIKE $${paramIndex}`);
        queryParams.push(value);
        paramIndex++;
      } else {
        whereClauses.push(`${column} = $${paramIndex}`);
        queryParams.push(value);
        paramIndex++;
      }
    }
  }

  // Filtro por intervalo de datas
  if (filters.data_inicio && filters.data_fim) {
    whereClauses.push(`c.data_completa BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
    queryParams.push(filters.data_inicio, filters.data_fim);
    paramIndex += 2;
  } else if (filters.data_inicio) {
    whereClauses.push(`c.data_completa >= $${paramIndex}`);
    queryParams.push(filters.data_inicio);
    paramIndex++;
  } else if (filters.data_fim) {
    whereClauses.push(`c.data_completa <= $${paramIndex}`);
    queryParams.push(filters.data_fim);
    paramIndex++;
  }

  // Query principal com normalização e unificação das marcas de veículos
  let baseQuery = `
  WITH marcas AS (
    -- Carrega marcas normalizadas da tabela de veículos
    SELECT DISTINCT marca_normalizada, UPPER(marca) AS marca
    FROM silver.dim_veiculos
  ),

  fato_expandido AS (
    -- Quebra lista de marcas em linhas individuais
    SELECT
      f.id_acidente_bronze,
      trim(mn.marca_raw) AS marca_raw
    FROM silver.fato_rodovias f
    CROSS JOIN LATERAL unnest(string_to_array(f.marca_normalizada_prf, ', ')) AS mn(marca_raw)
  ),

  fato_validado AS (
    -- Corrige variações de marcas (ex: "gm" => "chevrolet")
    SELECT
      fe.id_acidente_bronze,
      CASE
        WHEN marca_raw IN ('chev','gm') THEN 'chevrolet'
        WHEN marca_raw IN ('mbenz','mercedes') THEN 'mercedesbenz'
        WHEN marca_raw IN ('lr','lrover') THEN 'landrover'
        WHEN marca_raw IN ('vw','volks') THEN 'volkswagen'
        WHEN marca_raw = 'hyunda' THEN 'hyundai'
        WHEN marca_raw = 'mmc' THEN 'mitsubishi'
        WHEN marca_raw IN ('renalt','reanault','reanaut') THEN 'renault'
        WHEN marca_raw = 'ivecofiat' THEN 'iveco'
        WHEN marca_raw LIKE 'harleydavidson%' THEN 'harleydavidson'
        WHEN marca_raw IN ('hd','hdavidson') THEN 'harleydavidson'
        WHEN marca_raw LIKE 'mototraxx%' THEN 'traxx'
        WHEN marca_raw = 'monark' THEN 'monark'
        WHEN marca_raw = 'mvagusta' THEN 'mvagusta'
        WHEN marca_raw = 'lavrale' THEN 'lavrale'
        WHEN marca_raw = 'miura' THEN 'miura'
        WHEN marca_raw = 'troller' THEN 'troller'
        ELSE marca_raw
      END AS marca_normalizada_corrigida
    FROM fato_expandido fe
  ),

  marcas_unificadas AS (
    -- Reagrupar marcas corrigidas em uma lista por acidente
    SELECT
      fv.id_acidente_bronze,
      STRING_AGG(DISTINCT m.marca, ',') AS marcas_validadas
    FROM fato_validado fv
    LEFT JOIN marcas m ON m.marca_normalizada = fv.marca_normalizada_corrigida
    GROUP BY fv.id_acidente_bronze
  )

  -- Seleção final com joins e dados agregados
  SELECT
    f.id_acidente_bronze,
    f.total_mortos,
    f.total_feridos,
    f.total_feridos_graves,
    f.total_feridos_leves,
    f.total_veiculos,

    to_char(c.data_completa, 'DD/MM/YYYY') AS data_completa,
    c.ano,
    c.nome_mes,
    c.nome_dia_semana,
    c.flag_fim_de_semana,

    l.municipio,
    l.uf_abrev,
    l.localidade,

    STRING_AGG(DISTINCT ta.tipo_acidente, ',') AS tipo_acidente,
    STRING_AGG(DISTINCT ta.causa_acidente, ',') AS causa_acidente,
    STRING_AGG(DISTINCT ta.categoria_acidente, ',') AS categoria_acidente,

    f.modelo_veiculo,
    f.tipo_veiculo,
    mu.marcas_validadas AS marcas,

    f.idade,
    f.sexo,
    f.km,
    f.br,
    f.delegacia,
    f.condicao_metereologica,
    f.longitude,
    f.latitude,
    f.tipo_pista,
    f.fase_dia

  FROM silver.fato_rodovias f
  LEFT JOIN marcas_unificadas mu ON mu.id_acidente_bronze = f.id_acidente_bronze
  LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
  LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
  LEFT JOIN Silver.Dim_Tipo_Acidente AS ta ON f.fk_tipo_acidente = ta.id_acidente_tipo

  ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''}

  GROUP BY
    f.id_acidente_bronze, f.total_mortos, f.total_feridos, f.total_feridos_graves,
    f.total_feridos_leves, f.total_veiculos, f.modelo_veiculo, f.tipo_veiculo,
    f.idade, f.sexo, f.km, f.br, f.delegacia, f.condicao_metereologica,
    f.longitude, f.latitude, f.tipo_pista, f.fase_dia,
    c.data_completa, c.ano, c.nome_mes, c.nome_dia_semana, c.flag_fim_de_semana,
    l.municipio, l.uf_abrev, l.localidade, mu.marcas_validadas

  ORDER BY c.data_completa DESC
  `;

  try {
    // Query de contagem para paginação
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM Silver.fato_rodovias AS f
      LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
      LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
      LEFT JOIN Silver.Dim_Tipo_Acidente AS ta ON f.fk_tipo_acidente = ta.id_acidente_tipo
      ${whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : ''}
    `;

    const countResult = await db.query(countQuery, queryParams);
    const total = countResult?.rows?.[0] ? parseInt(String(countResult.rows[0].total), 10) : 0;

    res.setHeader('X-Total-Count', String(total)); // Retorna total no header

    // Aplica paginação na query principal
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

    if (limit && Number.isFinite(limit) && limit > 0) {
      baseQuery += ` LIMIT $${paramIndex}`;
      queryParams.push(limit);
      paramIndex++;

      if (page && Number.isFinite(page) && page > 0) {
        const offset = (page - 1) * limit;
        baseQuery += ` OFFSET $${paramIndex}`;
        queryParams.push(offset);
        paramIndex++;
      }
    }

    // Executa busca final
    const result = await db.query(baseQuery, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao consultar rodovias:', error);
    res.status(500).json({ error: 'Erro ao consultar rodovias' });
  }
};


const getRodoviaById = async (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT
      f.total_mortos, f.total_feridos_graves, f.total_veiculos,
      c.data_completa, c.ano, c.nome_mes, c.nome_dia_semana,
      l.municipio, l.uf_abrev,
      ta.tipo_acidente, ta.causa_acidente, ta.categoria_acidente,
      f.id_acidente_bronze
    FROM Silver.fato_rodovias AS f
    LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
    LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
    LEFT JOIN Silver.Dim_Tipo_Acidente AS ta ON f.fk_tipo_acidente = ta.id_acidente_tipo
    WHERE f.id_acidente_bronze = $1
  `;
  try {
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Acidente não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao consultar rodovia por ID:', error);
    res.status(500).json({ error: 'Erro ao consultar rodovia' });
  }
};

// Export completo em CSV via streaming (paginação no servidor)
const exportRodovias = async (req, res) => {
  const filterMap = {
    ano: 'c.ano',
    uf: 'l.uf_abrev',
    categoria_acidente: 'ta.categoria_acidente',
    municipio: 'l.municipio',
    mes: 'c.nome_mes',
    nome_dia_semana: 'c.nome_dia_semana',
    flag_fim_de_semana: 'c.flag_fim_de_semana',
    tipo_acidente: 'ta.tipo_acidente',
    causa_acidente: 'ta.causa_acidente',
  };

  const filters = Object.assign({}, req.query || {}, req.body || {});
  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;

  for (const [key, rawValue] of Object.entries(filters)) {
    if (rawValue === undefined || rawValue === '') continue;
    if (key === 'data_inicio' || key === 'data_fim' || key === 'limit' || key === 'page') continue;
    const column = filterMap[key];
    if (!column) continue;
    const value = String(rawValue);
    if (value.includes(',')) {
      const parts = value.split(',').map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length === 0) continue;
      const placeholders = parts.map(() => `$${paramIndex++}`).join(', ');
      whereClauses.push(`${column} IN (${placeholders})`);
      queryParams.push(...parts);
    } else {
      whereClauses.push(`${column} = $${paramIndex}`);
      queryParams.push(value);
      paramIndex++;
    }
  }

  if (filters.data_inicio && filters.data_fim) {
    whereClauses.push(`c.data_completa BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
    queryParams.push(filters.data_inicio, filters.data_fim);
    paramIndex += 2;
  } else if (filters.data_inicio) {
    whereClauses.push(`c.data_completa >= $${paramIndex}`);
    queryParams.push(filters.data_inicio);
    paramIndex++;
  } else if (filters.data_fim) {
    whereClauses.push(`c.data_completa <= $${paramIndex}`);
    queryParams.push(filters.data_fim);
    paramIndex++;
  }

  // Use the same query structure as getRodovias so exported rows match the on-screen table
  let baseQuery = `
  WITH marcas AS (
    SELECT DISTINCT marca_normalizada, UPPER(marca) AS marca
    FROM silver.dim_veiculos
  ),

  fato_expandido AS (
    SELECT
      f.id_acidente_bronze,
      trim(mn.marca_raw) AS marca_raw
    FROM silver.fato_rodovias f
    CROSS JOIN LATERAL unnest(string_to_array(f.marca_normalizada_prf, ', ')) AS mn(marca_raw)
  ),

  fato_validado AS (
    SELECT
      fe.id_acidente_bronze,
      CASE
        WHEN marca_raw IN ('chev','gm') THEN 'chevrolet'
        WHEN marca_raw IN ('mbenz','mercedes') THEN 'mercedesbenz'
        WHEN marca_raw IN ('lr','lrover') THEN 'landrover'
        WHEN marca_raw IN ('vw','volks') THEN 'volkswagen'
        WHEN marca_raw = 'hyunda' THEN 'hyundai'
        WHEN marca_raw = 'mmc' THEN 'mitsubishi'
        WHEN marca_raw IN ('renalt','reanault','reanaut') THEN 'renault'
        WHEN marca_raw = 'ivecofiat' THEN 'iveco'
        WHEN marca_raw LIKE 'harleydavidson%' THEN 'harleydavidson'
        WHEN marca_raw IN ('hd','hdavidson') THEN 'harleydavidson'
        WHEN marca_raw LIKE 'mototraxx%' THEN 'traxx'
        WHEN marca_raw = 'monark' THEN 'monark'
        WHEN marca_raw = 'mvagusta' THEN 'mvagusta'
        WHEN marca_raw = 'lavrale' THEN 'lavrale'
        WHEN marca_raw = 'miura' THEN 'miura'
        WHEN marca_raw = 'troller' THEN 'troller'
        ELSE marca_raw
      END AS marca_normalizada_corrigida
    FROM fato_expandido fe
  ),

  marcas_unificadas AS (
    SELECT
      fv.id_acidente_bronze,
      STRING_AGG(DISTINCT m.marca, ',') AS marcas_validadas
    FROM fato_validado fv
    LEFT JOIN marcas m ON m.marca_normalizada = fv.marca_normalizada_corrigida
    GROUP BY fv.id_acidente_bronze
  )

  SELECT
    f.id_acidente_bronze,
    f.total_mortos,
    f.total_feridos,
    f.total_feridos_graves,
    f.total_feridos_leves,
    f.total_veiculos,

    to_char(c.data_completa, 'DD/MM/YYYY') AS data_completa,
    c.ano,
    c.nome_mes,
    c.nome_dia_semana,
    c.flag_fim_de_semana,

    l.municipio,
    l.uf_abrev,
    l.localidade,

    STRING_AGG(DISTINCT ta.tipo_acidente, ',') AS tipo_acidente,
    STRING_AGG(DISTINCT ta.causa_acidente, ',') AS causa_acidente,
    STRING_AGG(DISTINCT ta.categoria_acidente, ',') AS categoria_acidente,

    f.modelo_veiculo,
    f.tipo_veiculo,
    mu.marcas_validadas AS marcas,

    f.idade,
    f.sexo,
    f.km,
    f.br,
    f.delegacia,
    f.condicao_metereologica,
    f.longitude,
    f.latitude,
    f.tipo_pista,
    f.fase_dia
  FROM Silver.fato_rodovias AS f
  LEFT JOIN marcas_unificadas mu ON mu.id_acidente_bronze = f.id_acidente_bronze
  LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
  LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
  LEFT JOIN Silver.Dim_Tipo_Acidente AS ta ON f.fk_tipo_acidente = ta.id_acidente_tipo

  ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''}

  GROUP BY
    f.id_acidente_bronze, f.total_mortos, f.total_feridos, f.total_feridos_graves,
    f.total_feridos_leves, f.total_veiculos, f.modelo_veiculo, f.tipo_veiculo,
    f.idade, f.sexo, f.km, f.br, f.delegacia, f.condicao_metereologica,
    f.longitude, f.latitude, f.tipo_pista, f.fase_dia,
    c.data_completa, c.ano, c.nome_mes, c.nome_dia_semana, c.flag_fim_de_semana,
    l.municipio, l.uf_abrev, l.localidade, mu.marcas_validadas

  ORDER BY c.data_completa DESC
  `;

  const QueryStream = require('pg-query-stream');
  const { pool } = db;

  const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-');
  const filename = `relatorio_rodovias_${timestamp}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const headerRow = [
    'ID','Mortos','Feridos','Feridos Graves','Feridos Leves','Veículos',
    'Data','Ano','Mês','Dia Semana','Fim de Semana',
    'Município','UF','Localidade',
    'Tipo Acidente','Categoria Acidente','Causa Acidente',
    'Modelo Veículo','Tipo Veículo','Marcas',
    'Idade','Sexo','KM','BR','Delegacia','Condicao Meteo','Longitude','Latitude','Tipo Pista','Fase Dia'
  ];
  res.write(headerRow.join(',') + '\n');

  let client;
  try {
    client = await pool.connect();
    const qs = new QueryStream(baseQuery, queryParams, { batchSize: 1000 });
    const stream = client.query(qs);

    stream.on('data', (r) => {
      const safe = (v) => {
        if (v === null || v === undefined) return '';
        return String(v).replace(/"/g, '""');
      };
      const cols = [
        `"${safe(r.id_acidente_bronze)}"`,
        `"${safe(r.total_mortos)}"`,
        `"${safe(r.total_feridos)}"`,
        `"${safe(r.total_feridos_graves)}"`,
        `"${safe(r.total_feridos_leves)}"`,
        `"${safe(r.total_veiculos)}"`,

        `"${safe(r.data_completa)}"`,
        `"${safe(r.ano)}"`,
        `"${safe(r.nome_mes)}"` ,
        `"${safe(r.nome_dia_semana)}"`,
        `"${safe(r.flag_fim_de_semana)}"`,

        `"${safe(r.municipio)}"`,
        `"${safe(r.uf_abrev)}"`,
        `"${safe(r.localidade)}"`,

        `"${safe(r.tipo_acidente)}"`,
        `"${safe(r.categoria_acidente)}"`,
        `"${safe(r.causa_acidente)}"`,

        `"${safe(r.modelo_veiculo)}"`,
        `"${safe(r.tipo_veiculo)}"`,
        `"${safe(r.marcas)}"`,

        `"${safe(r.idade)}"`,
        `"${safe(r.sexo)}"`,
        `"${safe(r.km)}"`,
        `"${safe(r.br)}"`,
        `"${safe(r.delegacia)}"`,
        `"${safe(r.condicao_metereologica)}"`,
        `"${safe(r.longitude)}"`,
        `"${safe(r.latitude)}"`,
        `"${safe(r.tipo_pista)}"`,
        `"${safe(r.fase_dia)}"`,
      ];
      const ok = res.write(cols.join(',') + '\n');
      if (!ok) stream.pause();
    });

    res.on('drain', () => {
      try { if (stream && stream.readable) stream.resume(); } catch (e) { /* ignore */ }
    });

    stream.on('end', async () => {
      res.end();
      try { client.release(); } catch (e) { /* ignore */ }
    });

    stream.on('error', async (err) => {
      console.error('Stream error ao exportar rodovias:', err);
      try { client.release(); } catch (e) { /* ignore */ }
      if (!res.headersSent) res.status(500).json({ error: 'Erro ao exportar rodovias (stream)' });
      else res.end();
    });
  } catch (err) {
    console.error('Erro ao iniciar export stream rodovias:', err);
    try { if (client) client.release(); } catch (e) { /* ignore */ }
    if (!res.headersSent) res.status(500).json({ error: 'Erro ao exportar rodovias' });
    else res.end();
  }
};

module.exports = { getRodovias, getRodoviaById, exportRodovias };
