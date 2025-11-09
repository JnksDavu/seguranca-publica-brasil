const db = require('../config/db');

const getRodovias = async (req, res) => {
  const filterMap = {
    ano: "c.ano",
    uf: "l.uf",
    categoria_acidente: "ta.categoria_acidente",
    municipio: "l.municipio",
    mes: "c.nome_mes",
    nome_dia_semana: "c.nome_dia_semana",
    flag_fim_de_semana: "c.flag_fim_de_semana",
    tipo_acidente: "ta.tipo_acidente",
    causa_acidente: "ta.causa_acidente",
    data_inicio: "c.data_completa >= $PARAM",
    data_fim: "c.data_completa <= $PARAM"
  };

  const filters = req.query;
  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(filters)) {
    const column = filterMap[key];
    if (column && value !== undefined && value !== "") {
      if (key === "data_inicio" || key === "data_fim") {
        whereClauses.push(column.replace("$PARAM", `$${paramIndex}`));
      } else {
        whereClauses.push(`${column} = $${paramIndex}`);
      }
      queryParams.push(value);
      paramIndex++;
    }
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
      l.uf,
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
      l.municipio, l.uf,
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
