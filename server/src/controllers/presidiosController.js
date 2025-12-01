const db = require('../config/db');

const filterMap = {
  ano: 'ano',
  uf: 'uf_abrev',
  municipio: 'municipio',
  cod_municipio: 'cod_municipio',
  semestre: 'semestre_nome',
  semestre_nome: 'semestre_nome',
  nome_estabelecimento: 'nome_estabelecimento',
  tipo_estabelecimento: 'tipo_estabelecimento',
  situacao_estabelecimento: 'situacao_estabelecimento',
  ambito: 'ambito'
};

const textFilterKeys = [
  'uf',
  'municipio',
  'semestre',
  'semestre_nome',
  'nome_estabelecimento',
  'tipo_estabelecimento',
  'situacao_estabelecimento',
  'ambito'
];

// Colunas para export (ajuste se quiser menos)
const exportColumns = [
  'id_fato_presidio',
  'ano',
  'semestre_nome',
  'data_referencia_formatada',
  'data_completa',
  'municipio',
  'uf_abrev',
  'cod_municipio',
  'nome_estabelecimento',
  'tipo_estabelecimento',
  'situacao_estabelecimento',
  'ambito',
  'cap_provisorios_total',
  'cap_fechado_total',
  'cap_semiaberto_total',
  'cap_aberto_total',
  'cap_total_geral',
  'cap_total_masc',
  'cap_total_fem'
];

function buildWhere(filters) {
  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;

  for (const [key, rawValue] of Object.entries(filters)) {
    if (!rawValue || ['data_inicio', 'data_fim', 'limit', 'page'].includes(key)) continue;
    const column = filterMap[key];
    if (!column) continue;
    const value = String(rawValue);

    if (value.includes(',')) {
      const parts = value.split(',').map(p => p.trim()).filter(Boolean);
      if (!parts.length) continue;
      if (textFilterKeys.includes(key)) {
        const ilikes = parts.map(() => `${column} ILIKE $${paramIndex++}`).join(' OR ');
        whereClauses.push(`(${ilikes})`);
        queryParams.push(...parts);
      } else {
        const placeholders = parts.map(() => `$${paramIndex++}`).join(', ');
        whereClauses.push(`${column} IN (${placeholders})`);
        queryParams.push(...parts);
      }
    } else {
      if (textFilterKeys.includes(key)) {
        whereClauses.push(`${column} ILIKE $${paramIndex}`);
        queryParams.push(value);
      } else {
        whereClauses.push(`${column} = $${paramIndex}`);
        queryParams.push(value);
      }
      paramIndex++;
    }
  }

  // Filtro de data (data_completa)
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

  return { whereClauses, queryParams, paramIndex };
}

const getPresidios = async (req, res) => {
  const filters = req.query;
  const { whereClauses, queryParams, paramIndex: startIndex } = buildWhere(filters);

  let baseQuery = `
    SELECT *
    FROM gold.analytics_presidios
    ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
    ORDER BY data_completa DESC
  `;

  try {
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM gold.analytics_presidios
      ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
    `;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total || 0, 10);
    res.setHeader('X-Total-Count', String(total));

    let paramIndex = startIndex;
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
      }
    }

    const result = await db.query(baseQuery, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao consultar presidios:', err);
    res.status(500).json({ error: 'Erro ao consultar presidios' });
  }
};

const exportPresidios = async (req, res) => {
  const filters = { ...req.query, ...req.body };
  const { whereClauses, queryParams } = buildWhere(filters);

  const baseQuery = `
    SELECT ${exportColumns.join(', ')}
    FROM gold.analytics_presidios
    ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
    ORDER BY data_completa DESC
  `;

  const QueryStream = require('pg-query-stream');
  const { pool } = db;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filename = `relatorio_presidios_${timestamp}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  res.write(exportColumns.join(',') + '\n');

  let client;
  try {
    client = await pool.connect();
    const qs = new QueryStream(baseQuery, queryParams, { batchSize: 1000 });
    const stream = client.query(qs);

    stream.on('data', row => {
      const values = exportColumns.map(col => {
        const v = row[col];
        return v === null || v === undefined ? '' : `"${String(v).replace(/"/g, '""')}"`;
      });
      res.write(values.join(',') + '\n');
    });

    stream.on('end', () => {
      client.release();
      res.end();
    });

    stream.on('error', err => {
      client.release();
      console.error('Erro stream export presidios:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao exportar presidios' });
      }
    });
  } catch (err) {
    if (client) client.release();
    console.error('Erro export presidios:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao exportar presidios' });
    }
  }
};

module.exports = {
  getPresidios,
  exportPresidios
};