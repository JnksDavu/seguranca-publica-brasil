const db = require('../config/db');

const filterMap = {
  ano: 'ano',
  uf: 'uf_abrev',
  municipio: 'municipio',
  cod_municipio: 'cod_municipio',
  mes: 'nome_mes',
  nome_dia_semana: 'nome_dia_semana',
  flag_fim_de_semana: 'flag_fim_de_semana',
  categoria_crime: 'categoria_crime',
  evento: 'evento',
  trimestre: 'trimestre_nome',
  trimestre_nome: 'trimestre_nome'
};

const textFilterKeys = [
  'uf',
  'municipio',
  'mes',
  'nome_dia_semana',
  'categoria_crime',
  'evento',
  'trimestre',
  'trimestre_nome'
];

// Lista de colunas disponíveis para export e SELECT *
const exportColumns = [
  'id_ocorrencia',
  'quantidade_ocorrencias',
  'quantidade_vitimas',
  'peso_apreendido',
  'total_feminino',
  'total_masculino',
  'total_nao_informado',
  'data_formatada',
  'data_completa',
  'ano',
  'nome_mes',
  'nome_dia_semana',
  'flag_fim_de_semana',
  'trimestre_nome',
  'municipio',
  'uf_abrev',
  'cod_municipio',
  'evento',
  'categoria_crime'
];

function buildWhere(filters) {
  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;

  for (const [key, rawValue] of Object.entries(filters)) {
    if (!rawValue || ['data_inicio', 'data_fim', 'limit', 'page', 'indicador'].includes(key)) continue;
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

  // Filtro de data
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

const getOcorrencias = async (req, res) => {
  const filters = req.query;
  const { whereClauses, queryParams, paramIndex: startIndex } = buildWhere(filters);

  let baseQuery = `
    SELECT *
    FROM gold.analytics_ocorrencias
    ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
    ORDER BY data_completa DESC
  `;

  try {
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM gold.analytics_ocorrencias
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
    console.error('Erro ao consultar ocorrencias:', err);
    res.status(500).json({ error: 'Erro ao consultar ocorrencias' });
  }
};

const getOcorrenciaById = async (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT *
    FROM gold.analytics_ocorrencias
    WHERE id_ocorrencia = $1
  `;
  try {
    const result = await db.query(query, [id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao consultar ocorrencia por ID:', err);
    res.status(500).json({ error: 'Erro ao consultar ocorrencia' });
  }
};

const exportOcorrencias = async (req, res) => {
  const filters = { ...req.query, ...req.body };
  const { whereClauses, queryParams } = buildWhere(filters);

  const baseQuery = `
    SELECT ${exportColumns.join(', ')}
    FROM gold.analytics_ocorrencias
    ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
    ORDER BY data_completa DESC
  `;

  const QueryStream = require('pg-query-stream');
  const { pool } = db;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filename = `relatorio_ocorrencias_${timestamp}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const headerRow = exportColumns.join(',');
  res.write(headerRow + '\n');

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
      console.error('Erro stream export ocorrencias:', err);
      res.status(500).json({ error: 'Erro ao exportar ocorrencias' });
    });
  } catch (err) {
    if (client) client.release();
    console.error('Erro export ocorrencias:', err);
    res.status(500).json({ error: 'Erro ao exportar ocorrencias' });
  }
};

const getIndicadores = async (req, res) => {
  const filters = req.query;
  const { whereClauses, queryParams } = buildWhere(filters);
  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const indicadorParam = req.query.indicador || 'all';

  const indicadoresQuery = `
    SELECT
      COUNT(*) AS total_registros,
      SUM(quantidade_ocorrencias) AS total_ocorrencias,
      SUM(quantidade_vitimas) AS total_vitimas,
      SUM(peso_apreendido) AS peso_apreendido_total,
      SUM(total_feminino) AS vitimas_femininas,
      SUM(total_masculino) AS vitimas_masculinas,
      SUM(total_nao_informado) AS vitimas_nao_informadas,
      COUNT(DISTINCT uf_abrev) AS ufs_monitoradas,
      COUNT(DISTINCT municipio) AS municipios_monitorados,
      COUNT(DISTINCT evento) AS eventos_monitorados,
      COUNT(DISTINCT categoria_crime) AS categorias_monitoradas
    FROM gold.analytics_ocorrencias
    ${whereSQL}
  `;

  const porMesQuery = `
    SELECT
      nome_mes,
      SUM(quantidade_ocorrencias) AS total_ocorrencias,
      SUM(quantidade_vitimas) AS total_vitimas
    FROM gold.analytics_ocorrencias
    ${whereSQL}
    GROUP BY nome_mes
    ORDER BY nome_mes
  `;

  const porCategoriaQuery = `
    SELECT
      categoria_crime,
      SUM(quantidade_ocorrencias) AS total_ocorrencias,
      SUM(quantidade_vitimas) AS total_vitimas
    FROM gold.analytics_ocorrencias
    ${whereSQL}
    GROUP BY categoria_crime
    ORDER BY total_ocorrencias DESC
    LIMIT 20
  `;

  const porEventoQuery = `
    SELECT
      evento,
      SUM(quantidade_ocorrencias) AS total_ocorrencias,
      SUM(quantidade_vitimas) AS total_vitimas,
      SUM(peso_apreendido) AS peso_apreendido_total
    FROM gold.analytics_ocorrencias
    ${whereSQL}
    GROUP BY evento
    ORDER BY total_ocorrencias DESC
    LIMIT 20
  `;

  const porUfQuery = `
    SELECT
      uf_abrev,
      SUM(quantidade_ocorrencias) AS total_ocorrencias,
      SUM(quantidade_vitimas) AS total_vitimas,
      SUM(peso_apreendido) AS peso_apreendido_total
    FROM gold.analytics_ocorrencias
    ${whereSQL}
    GROUP BY uf_abrev
    ORDER BY total_ocorrencias DESC
  `;

  const porMunicipioQuery = `
    SELECT
      municipio,
      SUM(quantidade_ocorrencias) AS total_ocorrencias,
      SUM(quantidade_vitimas) AS total_vitimas
    FROM gold.analytics_ocorrencias
    ${whereSQL}
    GROUP BY municipio
    ORDER BY total_ocorrencias DESC
    LIMIT 15
  `;

  const porDiaSemanaQuery = `
    SELECT
      nome_dia_semana,
      SUM(quantidade_ocorrencias) AS total_ocorrencias,
      SUM(quantidade_vitimas) AS total_vitimas
    FROM gold.analytics_ocorrencias
    ${whereSQL}
    GROUP BY nome_dia_semana
    ORDER BY nome_dia_semana
  `;

  const porTrimestreQuery = `
    SELECT
      trimestre_nome,
      SUM(quantidade_ocorrencias) AS total_ocorrencias,
      SUM(quantidade_vitimas) AS total_vitimas
    FROM gold.analytics_ocorrencias
    ${whereSQL}
    GROUP BY trimestre_nome
    ORDER BY trimestre_nome
  `;

  const porSexoQuery = `
    SELECT
      SUM(total_feminino) AS total_feminino,
      SUM(total_masculino) AS total_masculino,
      SUM(total_nao_informado) AS total_nao_informado
    FROM gold.analytics_ocorrencias
    ${whereSQL}
  `;

  try {
    const queries = {};
    const order = [];

    const add = (key, sql) => {
      queries[key] = db.query(sql, queryParams);
      order.push(key);
    };

    if (['all', 'gerais'].includes(indicadorParam)) add('indicadores', indicadoresQuery);
    if (['all', 'mes'].includes(indicadorParam)) add('porMes', porMesQuery);
    if (['all', 'categoria'].includes(indicadorParam)) add('porCategoria', porCategoriaQuery);
    if (['all', 'evento'].includes(indicadorParam)) add('porEvento', porEventoQuery);
    if (['all', 'uf'].includes(indicadorParam)) add('porUf', porUfQuery);
    if (['all', 'municipio'].includes(indicadorParam)) add('porMunicipio', porMunicipioQuery);
    if (['all', 'dia_semana'].includes(indicadorParam)) add('porDiaSemana', porDiaSemanaQuery);
    if (['all', 'trimestre'].includes(indicadorParam)) add('porTrimestre', porTrimestreQuery);
    if (['all', 'sexo'].includes(indicadorParam)) add('porSexo', porSexoQuery);

    const resultsArray = await Promise.all(Object.values(queries));
    const results = {};
    order.forEach((key, i) => results[key] = resultsArray[i]);

    res.json({
      indicadores_gerais: results.indicadores?.rows[0] || {
        total_registros: 0,
        total_ocorrencias: 0,
        total_vitimas: 0,
        peso_apreendido_total: 0,
        vitimas_femininas: 0,
        vitimas_masculinas: 0,
        vitimas_nao_informadas: 0,
        ufs_monitoradas: 0,
        municipios_monitorados: 0,
        eventos_monitorados: 0,
        categorias_monitoradas: 0
      },
      ocorrencias_por_mes: results.porMes?.rows || [],
      ocorrencias_por_categoria: results.porCategoria?.rows || [],
      ocorrencias_por_evento: results.porEvento?.rows || [],
      ocorrencias_por_uf: results.porUf?.rows || [],
      ocorrencias_por_municipio: results.porMunicipio?.rows || [],
      ocorrencias_por_dia_semana: results.porDiaSemana?.rows || [],
      ocorrencias_por_trimestre: results.porTrimestre?.rows || [],
      ocorrencias_por_sexo: results.porSexo?.rows[0] || {
        total_feminino: 0,
        total_masculino: 0,
        total_nao_informado: 0
      }
    });
  } catch (err) {
    console.error('Erro ao consultar indicadores ocorrencias:', err);
    res.status(500).json({ error: 'Erro ao consultar indicadores' });
  }
};

module.exports = {
  getOcorrencias,
  getOcorrenciaById,
  exportOcorrencias,
  getIndicadores
};