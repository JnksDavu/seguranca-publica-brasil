const db = require('../config/db');

const getRodovias = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bronze.prf limit 1000');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao consultar rodovias:', error);
    res.status(500).json({ error: 'Erro ao consultar rodovias' });
  }
};

const getRodoviaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM bronze.prf WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rodovia não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao consultar rodovia:', error);
    res.status(500).json({ error: 'Erro ao consultar rodovia' });
  }
};

module.exports = {
  getRodovias,
  getRodoviaById,
};