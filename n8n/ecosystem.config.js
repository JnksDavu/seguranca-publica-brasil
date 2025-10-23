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
	EXECUTIONS_DATA_SAVE_ON_SUCCESS: "false",
	EXECUTIONS_DATA_SAVE_ON_ERROR: "false",
	EXECUTIONS_DATA_PRUNE: "true",
	EXECUTIONS_DATA_MAX_AGE: "72"

      }
    }
  ]
};
