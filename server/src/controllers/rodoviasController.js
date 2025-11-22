const db = require('../config/db');

const filterMap = {
  ano: 'ano',
  uf: 'uf_abrev',
  categoria_acidente: 'categoria_acidente',
  municipio: 'municipio',
  mes: 'nome_mes',
  nome_dia_semana: 'nome_dia_semana',
  flag_fim_de_semana: 'flag_fim_de_semana',
  tipo_acidente: 'tipo_acidente',
  causa_acidente: 'causa_acidente',
};

const getRodovias = async (req, res) => {
  const filters = req.query;
  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;

  for (const [key, rawValue] of Object.entries(filters)) {
    if (!rawValue || key === 'data_inicio' || key === 'data_fim') continue;
    const column = filterMap[key];
    if (!column) continue;

    const value = String(rawValue);

    if (value.includes(',')) {
      const parts = value.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) continue;

      if (["uf", "municipio", "mes", "nome_dia_semana", "categoria_acidente", "tipo_acidente", "causa_acidente"].includes(key)) {
        const ilikeClauses = parts.map(() => `${column} ILIKE $${paramIndex++}`).join(' OR ');
        whereClauses.push(`(${ilikeClauses})`);
        queryParams.push(...parts);
      } else {
        const placeholders = parts.map(() => `$${paramIndex++}`).join(', ');
        whereClauses.push(`${column} IN (${placeholders})`);
        queryParams.push(...parts);
      }
    } else {
      if (["uf", "municipio", "mes", "nome_dia_semana", "categoria_acidente", "tipo_acidente", "causa_acidente"].includes(key)) {
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

  if (filters.data_inicio && filters.data_fim) {
    whereClauses.push(`data_completa BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
    queryParams.push(filters.data_inicio, filters.data_fim);
    paramIndex += 2;
  } else if (filters.data_inicio) {
    whereClauses.push(`data_completa >= $${paramIndex}`);
    queryParams.push(filters.data_inicio);
    paramIndex++;
  } else if (filters.data_fim) {
    whereClauses.push(`data_completa <= $${paramIndex}`);
    queryParams.push(filters.data_fim);
    paramIndex++;
  }

  let baseQuery = `
    SELECT *
    FROM gold.analytics_rodovias
    ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''}
  `;

  try {
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM gold.analytics_rodovias
      ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''}
    `;

    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total || 0);
    res.setHeader('X-Total-Count', String(total));

    const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;

    if (limit && limit > 0) {
      baseQuery += ` LIMIT $${paramIndex}`;
      queryParams.push(limit);
      paramIndex++;

      if (page && page > 0) {
        const offset = (page - 1) * limit;
        baseQuery += ` OFFSET $${paramIndex}`;
        queryParams.push(offset);
        paramIndex++;
      }
    }

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
    SELECT *
    FROM gold.analytics_rodovias
    WHERE id_acidente_bronze = $1
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


const exportRodovias = async (req, res) => {
  const filters = { ...req.query, ...req.body };
  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;

  for (const [key, rawValue] of Object.entries(filters)) {
    if (!rawValue || key === 'data_inicio' || key === 'data_fim' || key === 'limit' || key === 'page') continue;

    const column = filterMap[key];
    if (!column) continue;

    const value = String(rawValue);
    if (value.includes(',')) {
      const parts = value.split(',').map(p => p.trim()).filter(Boolean);
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
    whereClauses.push(`data_completa BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
    queryParams.push(filters.data_inicio, filters.data_fim);
    paramIndex += 2;
  } else if (filters.data_inicio) {
    whereClauses.push(`data_completa >= $${paramIndex}`);
    queryParams.push(filters.data_inicio);
    paramIndex++;
  } else if (filters.data_fim) {
    whereClauses.push(`data_completa <= $${paramIndex}`);
    queryParams.push(filters.data_fim);
    paramIndex++;
  }

  const baseQuery = `
    SELECT *
    FROM gold.analytics_rodovias
    ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''}
    ORDER BY data_completa DESC
  `;

  const QueryStream = require('pg-query-stream');
  const { pool } = db;

  const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-');
  const filename = `relatorio_rodovias_${timestamp}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const headerRow = Object.keys({
    id_acidente_bronze: '',
    total_mortos: '',
    total_feridos: '',
    total_feridos_graves: '',
    total_feridos_leves: '',
    total_veiculos: '',
    data_completa: '',
    ano: '',
    nome_mes: '',
    nome_dia_semana: '',
    flag_fim_de_semana: '',
    municipio: '',
    uf_abrev: '',
    localidade: '',
    tipo_acidente: '',
    causa_acidente: '',
    categoria_acidente: '',
    modelo_veiculo: '',
    tipo_veiculo: '',
    marcas: '',
    idade: '',
    sexo: '',
    km: '',
    br: '',
    delegacia: '',
    condicao_metereologica: '',
    longitude: '',
    latitude: '',
    tipo_pista: '',
    fase_dia: ''
  }).join(',');

  res.write(headerRow + '\n');

  let client;
  try {
    client = await pool.connect();
    const qs = new QueryStream(baseQuery, queryParams, { batchSize: 1000 });
    const stream = client.query(qs);

    stream.on('data', (row) => {
      const values = Object.values(row).map(v =>
        v === null || v === undefined ? '' : `"${String(v).replace(/"/g, '""')}"`
      );
      res.write(values.join(',') + '\n');
    });

    stream.on('end', () => {
      client.release();
      res.end();
    });

    stream.on('error', err => {
      client.release();
      res.status(500).json({ error: 'Erro ao exportar rodovias' });
    });
  } catch (err) {
    if (client) client.release();
    res.status(500).json({ error: 'Erro ao exportar rodovias' });
  }
};
// Endpoint para indicadores agregados (cards + gráficos)
const getIndicadores = async (req, res) => {

  const filters = req.query;
  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;

  for (const [key, rawValue] of Object.entries(filters)) {
    if (!rawValue || key === 'data_inicio' || key === 'data_fim') continue;
    const column = filterMap[key];
    if (!column) continue;

    const value = String(rawValue);

    if (value.includes(',')) {
      const parts = value.split(',').map(p => p.trim()).filter(Boolean);
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
    whereClauses.push(`data_completa BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
    queryParams.push(filters.data_inicio, filters.data_fim);
    paramIndex += 2;
  } else if (filters.data_inicio) {
    whereClauses.push(`data_completa >= $${paramIndex}`);
    queryParams.push(filters.data_inicio);
    paramIndex++;
  } else if (filters.data_fim) {
    whereClauses.push(`data_completa <= $${paramIndex}`);
    queryParams.push(filters.data_fim);
    paramIndex++;
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    const indicadoresQuery = `
      SELECT
        COUNT(*) AS total_acidentes,
        SUM(total_mortos) AS total_mortos,
        SUM(total_feridos) AS total_feridos,
        SUM(total_feridos_graves) AS total_feridos_graves,
        SUM(total_feridos_leves) AS total_feridos_leves,
        COUNT(DISTINCT municipio) AS rodovias_monitoradas
      FROM gold.analytics_rodovias
      ${whereSQL}
    `;

    const porMesQuery = `
      SELECT
        nome_mes,
        COUNT(*) AS total,
        SUM(total_mortos) AS mortos
      FROM gold.analytics_rodovias
      ${whereSQL}
      GROUP BY nome_mes
      ORDER BY nome_mes
    `;

    const porCausaQuery = `
      SELECT
        causa_acidente,
        COUNT(*) AS total
      FROM gold.analytics_rodovias
      ${whereSQL}
      GROUP BY causa_acidente
      ORDER BY total DESC
      LIMIT 10
    `;

    const porTipoQuery = `
      SELECT
        tipo_acidente,
        COUNT(*) AS total
      FROM gold.analytics_rodovias
      ${whereSQL}
      GROUP BY tipo_acidente
      ORDER BY total DESC
      LIMIT 10
    `;

    const porCategoriaQuery = `
      SELECT
        categoria_acidente,
        COUNT(*) AS total
      FROM gold.analytics_rodovias
      ${whereSQL}
      GROUP BY categoria_acidente
      ORDER BY total DESC
      LIMIT 10
    `;

    const porUfQuery = `
      SELECT
        uf_abrev,
        COUNT(*) AS total,
        SUM(total_mortos) AS mortos
      FROM gold.analytics_rodovias
      ${whereSQL}
      GROUP BY uf_abrev
      ORDER BY total DESC
    `;

    const porDiaSemanaQuery = `
      SELECT
        nome_dia_semana,
        COUNT(*) AS total
      FROM gold.analytics_rodovias
      ${whereSQL}
      GROUP BY nome_dia_semana
      ORDER BY nome_dia_semana
    `;

    const porCondicaoMeterologicaQuery = `
      SELECT
        condicao_metereologica,
        COUNT(*) AS total
      FROM gold.analytics_rodovias
      ${whereSQL}
      GROUP BY condicao_metereologica
      ORDER BY total DESC
      LIMIT 10
    `;

    const porMarcasQuery = `
      SELECT
        marcas,
        COUNT(*) AS total
      FROM gold.analytics_rodovias
      ${whereSQL}
      ${whereSQL ? 'AND' : 'WHERE'} marcas IS NOT NULL AND marcas != ''
      GROUP BY marcas
      ORDER BY total DESC
      LIMIT 15
    `;

    const porModeloVeiculoQuery = `
      SELECT
        modelo_veiculo,
        COUNT(*) AS total
      FROM gold.analytics_rodovias
      ${whereSQL}
      ${whereSQL ? 'AND' : 'WHERE'} modelo_veiculo IS NOT NULL AND modelo_veiculo != ''
      GROUP BY modelo_veiculo
      ORDER BY total DESC
    `;

    const porTipoPistaQuery = `
      SELECT
        tipo_pista,
        COUNT(*) AS total
      FROM gold.analytics_rodovias
      ${whereSQL}
      GROUP BY tipo_pista
      ORDER BY total DESC
    `;

    const porPercapita = `
    select 
      uf,
      municipio,
      ano,
      populacao,
      mortos_per_capita_100k,
      feridos_graves_per_capita_100k,
      feridos_per_capita_100k,
      severidade_per_capita_100k
    from gold.analytics_rodovias_percapita
    ${whereSQL}

    `

    const indicadorParam = req.query.indicador || 'all';

    const queries = {};
    const order = [];

    if (indicadorParam === 'all' || indicadorParam === 'gerais') {
      queries.indicadores = db.query(indicadoresQuery, queryParams);
      order.push('indicadores');
    }
    if (indicadorParam === 'all' || indicadorParam === 'mes') {
      queries.porMes = db.query(porMesQuery, queryParams);
      order.push('porMes');
    }
    if (indicadorParam === 'all' || indicadorParam === 'causa') {
      queries.porCausa = db.query(porCausaQuery, queryParams);
      order.push('porCausa');
    }
    if (indicadorParam === 'all' || indicadorParam === 'tipo') {
      queries.porTipo = db.query(porTipoQuery, queryParams);
      order.push('porTipo');
    }
    if (indicadorParam === 'all' || indicadorParam === 'categoria') {
      queries.porCategoria = db.query(porCategoriaQuery, queryParams);
      order.push('porCategoria');
    }
    if (indicadorParam === 'all' || indicadorParam === 'uf') {
      queries.porUf = db.query(porUfQuery, queryParams);
      order.push('porUf');
    }
    if (indicadorParam === 'all' || indicadorParam === 'dia_semana') {
      queries.porDiaSemana = db.query(porDiaSemanaQuery, queryParams);
      order.push('porDiaSemana');
    }
    if (indicadorParam === 'all' || indicadorParam === 'condicao_metereologica') {
      queries.porCondicaoMeterologica = db.query(porCondicaoMeterologicaQuery, queryParams);
      order.push('porCondicaoMeterologica');
    }
    if (indicadorParam === 'all' || indicadorParam === 'marcas') {
      queries.porMarcas = db.query(porMarcasQuery, queryParams);
      order.push('porMarcas');
    }
    if (indicadorParam === 'all' || indicadorParam === 'modelo_veiculo') {
      queries.porModeloVeiculo = db.query(porModeloVeiculoQuery, queryParams);
      order.push('porModeloVeiculo');
    }
    if (indicadorParam === 'all' || indicadorParam === 'tipo_pista') {
      queries.porTipoPista = db.query(porTipoPistaQuery, queryParams);
      order.push('porTipoPista');
    }
    if (indicadorParam === 'all' || indicadorParam === 'percapita') {
      queries.porPercapita = db.query(porPercapita, queryParams);
      order.push('porPercapita');
    }

    const resultsArray = await Promise.all(Object.values(queries));

    const results = {};
    order.forEach((key, index) => {
      results[key] = resultsArray[index];
    });

    res.json({
      indicadores_gerais: results.indicadores?.rows[0] || {
        total_acidentes: 0,
        total_mortos: 0,
        total_feridos: 0,
        total_feridos_graves: 0,
        total_feridos_leves: 0,
        rodovias_monitoradas: 0
      },
      acidentes_por_mes: results.porMes?.rows || [],
      acidentes_por_causa: results.porCausa?.rows || [],
      acidentes_por_tipo: results.porTipo?.rows || [],
      acidentes_por_categoria: results.porCategoria?.rows || [],
      acidentes_por_uf: results.porUf?.rows || [],
      acidentes_por_dia_semana: results.porDiaSemana?.rows || [],
      acidentes_por_condicao_metereologica: results.porCondicaoMeterologica?.rows || [],
      acidentes_por_marcas: results.porMarcas?.rows || [],
      acidentes_por_modelo_veiculo: results.porModeloVeiculo?.rows || [],
      acidentes_por_tipo_pista: results.porTipoPista?.rows || [],
      acidentes_por_percapita: results.porPercapita?.rows || []

    });

  } catch (error) {
    console.error('Erro ao consultar indicadores:', error);
    res.status(500).json({ error: 'Erro ao consultar indicadores' });
  }
};


module.exports = { getRodovias, getRodoviaById, exportRodovias, getIndicadores };
