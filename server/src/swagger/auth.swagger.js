/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticação e obtenção de tokens
 */

/**
 */

/**
 * @swagger
 * /api/auth/system-token:
 *   get:
 *     summary: Gera um token JWT de sistema (longo prazo)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token de sistema
 *         content:
 *           application/json:
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */