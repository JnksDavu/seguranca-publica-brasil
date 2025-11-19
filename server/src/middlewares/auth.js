const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];

  // Verifica se veio o header Authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // O padrão é: "Bearer TOKEN"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }

    req.user = user;
    next();
  });
};
