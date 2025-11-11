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
      c.data_completa,
      c.ano,
      c.nome_mes,
      c.nome_dia_semana,
      c.flag_fim_de_semana,
      l.municipio,
      l.uf_abrev,
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

  baseQuery += ` ORDER BY c.data_completa DESC LIMIT 5000`;

  try {
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

module.exports = { getRodovias, getRodoviaById };
