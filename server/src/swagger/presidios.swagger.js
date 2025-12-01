/**
 * @swagger
 * tags:
 *   name: Presidios
 *   description: Consulta de dados de estabelecimentos prisionais e exportação
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Presidio:
 *       type: object
 *       properties:
 *         id_fato_presidio: { type: integer }
 *         ano: { type: integer }
 *         semestre_nome: { type: string }
 *         data_referencia_formatada: { type: string }
 *         data_completa: { type: string, format: date }
 *         municipio: { type: string }
 *         uf_abrev: { type: string }
 *         cod_municipio: { type: string }
 *         nome_estabelecimento: { type: string }
 *         tipo_estabelecimento: { type: string }
 *         situacao_estabelecimento: { type: string }
 *         ambito: { type: string }
 *         cap_provisorios_total: { type: integer }
 *         cap_fechado_total: { type: integer }
 *         cap_semiaberto_total: { type: integer }
 *         cap_aberto_total: { type: integer }
 *         cap_total_geral: { type: integer }
 *         cap_total_masc: { type: integer }
 *         cap_total_fem: { type: integer }
 */

/**
 * @swagger
 * /api/presidios:
 *   get:
 *     summary: Lista registros (paginado)
 *     tags: [Presidios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ano
 *         schema: { type: string }
 *       - in: query
 *         name: uf
 *         schema: { type: string }
 *       - in: query
 *         name: municipio
 *         schema: { type: string }
 *       - in: query
 *         name: nome_estabelecimento
 *         schema: { type: string }
 *       - in: query
 *         name: tipo_estabelecimento
 *         schema: { type: string }
 *       - in: query
 *         name: situacao_estabelecimento
 *         schema: { type: string }
 *       - in: query
 *         name: ambito
 *         schema: { type: string }
 *       - in: query
 *         name: data_inicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: data_fim
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 100 }
 *     responses:
 *       200:
 *         description: Lista de registros
 *         headers:
 *           X-Total-Count:
 *             schema: { type: integer }
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Presidio' }
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/presidios/export:
 *   get:
 *     summary: Exporta dados em CSV (stream)
 *     tags: [Presidios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ano
 *         schema: { type: string }
 *       - in: query
 *         name: uf
 *         schema: { type: string }
 *       - in: query
 *         name: municipio
 *         schema: { type: string }
 *       - in: query
 *         name: nome_estabelecimento
 *         schema: { type: string }
 *       - in: query
 *         name: tipo_estabelecimento
 *         schema: { type: string }
 *       - in: query
 *         name: situacao_estabelecimento
 *         schema: { type: string }
 *       - in: query
 *         name: ambito
 *         schema: { type: string }
 *       - in: query
 *         name: data_inicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: data_fim
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: CSV
 *         content:
 *           text/csv:
 *             schema: { type: string }
 *       401:
 *         description: Não autorizado
 *   post:
 *     summary: Exporta dados em CSV via POST
 *     tags: [Presidios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ano: { type: string }
 *               uf: { type: string }
 *               municipio: { type: string }
 *               data_inicio: { type: string, format: date }
 *               data_fim: { type: string, format: date }
 *     responses:
 *       200:
 *         description: CSV
 *         content:
 *           text/csv:
 *             schema: { type: string }
 *       401:
 *         description: Não autorizado
 */