module.exports = {
  apps: [
    {
      name: "n8n",
      script: "n8n",
      env: {
        N8N_SECURE_COOKIE: false,
	N8N_BASIC_AUTH_ACTIVE: true,
        N8N_BASIC_AUTH_USER: "daviandre.junkes@gmail.com",
        N8N_BASIC_AUTH_PASSWORD: "Da.1596753258",
      }
    }
  ]
};