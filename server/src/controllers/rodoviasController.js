const db = require('../config/db');

const getRodovias = async (req, res) => {
  // Mapeamento de filtros para colunas
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
  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;

  // suporta valores únicos ou CSV (ex: uf=SC,PR)
  for (const [key, rawValue] of Object.entries(filters)) {
    if (rawValue === undefined || rawValue === '') continue;
    // datas tratadas separadamente
    if (key === 'data_inicio' || key === 'data_fim') continue;

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

  // Range de datas
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

  let baseQuery = `
    SELECT
      f.total_mortos,
      f.total_feridos_graves,
      f.total_veiculos,
      to_char(data_completa, 'DD/MM/YYYY') as data_completa,
      c.ano,
      c.nome_mes,
      c.nome_dia_semana,
      c.flag_fim_de_semana,
      l.municipio,
      l.uf_abrev,
      l.localidade,
      ta.tipo_acidente,
      ta.causa_acidente,
      ta.categoria_acidente
    FROM Silver.fato_rodovias AS f
    LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
    LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
    LEFT JOIN Silver.Dim_Tipo_Acidente AS ta ON f.fk_tipo_acidente = ta.id_acidente_tipo
  `;

  if (whereClauses.length > 0) {
    baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  baseQuery += ` ORDER BY c.data_completa DESC`;
  // compute total count first (without limit/offset)
  try {
    const countQuery = `SELECT COUNT(*) AS total FROM Silver.fato_rodovias AS f
      LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
      LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
      LEFT JOIN Silver.Dim_Tipo_Acidente AS ta ON f.fk_tipo_acidente = ta.id_acidente_tipo
      ${whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : ''}`;

    const countResult = await db.query(countQuery, queryParams);
    const total = countResult && countResult.rows && countResult.rows[0] ? parseInt(String(countResult.rows[0].total), 10) : 0;
    // expose total in header
    res.setHeader('X-Total-Count', String(total));

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

  // Accept filters in body (preferred) or query string
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

  // date range
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

  // base select (same columns as getRodovias)
  let baseQuery = `
    SELECT
      f.total_mortos,
      f.total_feridos_graves,
      f.total_veiculos,
      to_char(data_completa, 'DD/MM/YYYY') as data_completa,
      c.ano,
      c.nome_mes,
      c.nome_dia_semana,
      c.flag_fim_de_semana,
      l.municipio,
      l.uf_abrev,
      l.localidade,
      ta.tipo_acidente,
      ta.causa_acidente,
      ta.categoria_acidente
    FROM Silver.fato_rodovias AS f
    LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
    LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
    LEFT JOIN Silver.Dim_Tipo_Acidente AS ta ON f.fk_tipo_acidente = ta.id_acidente_tipo
  `;

  if (whereClauses.length > 0) {
    baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  baseQuery += ` ORDER BY c.data_completa DESC`;

  // Use pg-query-stream to stream rows directly (efficient, avoids large memory)
  const QueryStream = require('pg-query-stream');
  const { pool } = db;

  const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-');
  const filename = `relatorio_rodovias_${timestamp}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // write CSV header
  const headerRow = ['Data','Ano','Mês','Dia Semana','Município','UF','Localidade','Tipo','Categoria','Causa','Mortos','Feridos','Veículos'];
  res.write(headerRow.join(',') + '\n');

  let client;
  try {
    client = await pool.connect();
    const qs = new QueryStream(baseQuery, queryParams, { batchSize: 1000 });
    const stream = client.query(qs);

    // handle stream events and backpressure
    stream.on('data', (r) => {
      const safe = (v) => {
        if (v === null || v === undefined) return '';
        return String(v).replace(/"/g, '""');
      };
      const cols = [
        `"${safe(r.data_completa)}"`,
        `"${safe(r.ano)}"`,
        `"${safe(r.nome_mes)}"` ,
        `"${safe(r.nome_dia_semana)}"`,
        `"${safe(r.municipio)}"`,
        `"${safe(r.uf_abrev)}"`,
        `"${safe(r.localidade)}"`,
        `"${safe(r.tipo_acidente)}"`,
        `"${safe(r.categoria_acidente)}"`,
        `"${safe(r.causa_acidente)}"`,
        `"${safe(r.total_mortos)}"`,
        `"${safe(r.total_feridos_graves)}"`,
        `"${safe(r.total_veiculos)}"`,
      ];
      const ok = res.write(cols.join(',') + '\n');
      if (!ok) stream.pause();
    });

    res.on('drain', () => {
      // resume the DB stream when the writable buffer is drained
      // stream may be undefined if connection failed
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
