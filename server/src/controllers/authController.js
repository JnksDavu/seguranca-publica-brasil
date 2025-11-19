const express = require('express');
const jwt = require('jsonwebtoken');

const getTokenTest = async (req, res) => {
  // Payload mínimo só para validar o token
  const payload = {
    user: 'dev-teste'
  };

  // Gera token válido por 5 minutos
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '5m'
  });

  return res.json({ token });
};

const getSystemToken = async (req, res) => {
    const payload = { system: true };
  
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '900d'
    });
  
    return res.json({ token });
  }

module.exports = {getSystemToken,getTokenTest};
