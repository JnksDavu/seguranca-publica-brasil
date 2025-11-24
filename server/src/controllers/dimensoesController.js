const db = require('../config/db');

const getCalendario = async (req, res) => {

  let Query = `
    SELECT *
    from silver.dim_calendario
    where ano > 2022 and ano <= EXTRACT(YEAR FROM CURRENT_DATE)
    and 1 = 1
  `;
  try {
    const result = await db.query(Query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao consultar dim_calendario:', error);
    res.status(500).json({ error: 'Erro ao consultar calendario' });
  }
};


const getLocalidade = async (req, res) => {

  let Query = `
    SELECT *
    from silver.dim_localidade
    where 1 = 1
  `;
  try {
    const result = await db.query(Query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao consultar dim_localidade:', error);
    res.status(500).json({ error: 'Erro ao consultar localidade' });
  }
};

const getTipoAcidente = async (req, res) => {

  let Query = `
    SELECT *
    from silver.dim_tipo_acidente
    where 1 = 1
  `;
  try {
    const result = await db.query(Query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao consultar dim_tipo_acidente:', error);
    res.status(500).json({ error: 'Erro ao consultar tipo acidente' });
  }
};

const getCrime = async (req, res) => {

  let Query = `
    SELECT *
    from silver.dim_crime
    where 1 = 1
  `;
  try {
    const result = await db.query(Query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao consultar dim_crime:', error);
    res.status(500).json({ error: 'Erro ao consultar crime' });
  }
};

module.exports = { getCalendario,getLocalidade,getTipoAcidente,getCrime };