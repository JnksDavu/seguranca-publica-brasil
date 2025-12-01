/**
 * @swagger
 * tags:
 *   name: Ocorrencias
 *   description: Consulta de ocorrências, indicadores e exportação
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Ocorrencia:
 *       type: object
 *       properties:
 *         id_ocorrencia: { type: integer }
 *         quantidade_vitimas: { type: integer }
 *         quantidade_mortos: { type: integer }
 *         peso_apreendido: { type: number }
 *         total_feminino: { type: integer }
 *         total_masculino: { type: integer }
 *         total_nao_informado: { type: integer }
 *         data_formatada: { type: string }
 *         data_completa: { type: string, format: date }
 *         ano: { type: integer }
 *         nome_mes: { type: string }
 *         nome_dia_semana: { type: string }
 *         flag_fim_de_semana: { type: boolean }
 *         trimestre_nome: { type: string }
 *         municipio: { type: string }
 *         uf_abrev: { type: string }
 *         cod_municipio: { type: string }
 *         evento: { type: string }
 *         categoria_crime: { type: string }
 *
 *     IndicadoresOcorrenciasGerais:
 *       type: object
 *       properties:
 *         total_registros: { type: integer }
 *         total_ocorrencias: { type: integer }
 *         total_vitimas: { type: integer }
 *         peso_apreendido_total: { type: string }
 *         vitimas_femininas: { type: integer }
 *         vitimas_masculinas: { type: integer }
 *         vitimas_nao_informadas: { type: integer }
 *         quantidade_mortos: { type: integer }
 *         suicidios: { type: integer }
 *         estupros: { type: integer }
 *         ufs_monitoradas: { type: integer }
 *         municipios_monitorados: { type: integer }
 *         eventos_monitorados: { type: integer }
 *         categorias_monitoradas: { type: integer }
 *
 *     IndicadoresOcorrenciasResponse:
 *       type: object
 *       properties:
 *         indicadores_gerais: { $ref: '#/components/schemas/IndicadoresOcorrenciasGerais' }
 *         ocorrencias_por_mes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome_mes: { type: string }
 *               total_ocorrencias: { type: integer }
 *               total_vitimas: { type: integer }
 *         ocorrencias_por_categoria:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               categoria_crime: { type: string }
 *               total_ocorrencias: { type: integer }
 *               total_vitimas: { type: integer }
 *         ocorrencias_por_evento:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               evento: { type: string }
 *               total_ocorrencias: { type: integer }
 *               total_vitimas: { type: integer }
 *               peso_apreendido_total: { type: number }
 *         ocorrencias_por_uf:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               uf_abrev: { type: string }
 *               total_ocorrencias: { type: integer }
 *               total_vitimas: { type: integer }
 *               peso_apreendido_total: { type: number }
 *         ocorrencias_por_municipio:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               municipio: { type: string }
 *               total_ocorrencias: { type: integer }
 *               total_vitimas: { type: integer }
 *         ocorrencias_por_dia_semana:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome_dia_semana: { type: string }
 *               total_ocorrencias: { type: integer }
 *               total_vitimas: { type: integer }
 *         ocorrencias_por_trimestre:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               trimestre_nome: { type: string }
 *               total_ocorrencias: { type: integer }
 *               total_vitimas: { type: integer }
 *         ocorrencias_por_sexo:
 *           type: object
 *           properties:
 *             total_feminino: { type: integer }
 *             total_masculino: { type: integer }
 *             total_nao_informado: { type: integer }
 */

/**
 * @swagger
 * /api/ocorrencias:
 *   get:
 *     summary: Lista ocorrências (paginado)
 *     tags: [Ocorrencias]
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
 *         name: mes
 *         schema: { type: string }
 *       - in: query
 *         name: nome_dia_semana
 *         schema: { type: string }
 *       - in: query
 *         name: flag_fim_de_semana
 *         schema: { type: string }
 *       - in: query
 *         name: categoria_crime
 *         schema: { type: string }
 *       - in: query
 *         name: evento
 *         schema: { type: string }
 *       - in: query
 *         name: trimestre
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
 *         description: Lista de ocorrências
 *         headers:
 *           X-Total-Count:
 *             schema: { type: integer }
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Ocorrencia' }
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/ocorrencias/indicadores:
 *   get:
 *     summary: Indicadores agregados
 *     tags: [Ocorrencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: indicador
 *         schema:
 *           type: string
 *           enum: [all, gerais, mes, categoria, evento, uf, municipio, dia_semana, trimestre, sexo]
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
 *         name: mes
 *         schema: { type: string }
 *       - in: query
 *         name: nome_dia_semana
 *         schema: { type: string }
 *       - in: query
 *         name: categoria_crime
 *         schema: { type: string }
 *       - in: query
 *         name: evento
 *         schema: { type: string }
 *       - in: query
 *         name: trimestre
 *         schema: { type: string }
 *       - in: query
 *         name: data_inicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: data_fim
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Estrutura de indicadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IndicadoresOcorrenciasResponse'
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/ocorrencias/export:
 *   get:
 *     summary: Exporta ocorrências em CSV (stream)
 *     tags: [Ocorrencias]
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
 *         name: mes
 *         schema: { type: string }
 *       - in: query
 *         name: nome_dia_semana
 *         schema: { type: string }
 *       - in: query
 *         name: flag_fim_de_semana
 *         schema: { type: string }
 *       - in: query
 *         name: categoria_crime
 *         schema: { type: string }
 *       - in: query
 *         name: evento
 *         schema: { type: string }
 *       - in: query
 *         name: trimestre
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
 *     summary: Exporta ocorrências em CSV via POST
 *     tags: [Ocorrencias]
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