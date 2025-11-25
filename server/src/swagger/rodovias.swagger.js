/**
 * @swagger
 * tags:
 *   name: Rodovias
 *   description: Consulta de acidentes, indicadores e exportação
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Rodovia:
 *       type: object
 *       properties:
 *         id_acidente_bronze: { type: integer }
 *         total_mortos: { type: integer }
 *         total_feridos: { type: integer }
 *         total_feridos_graves: { type: integer }
 *         total_feridos_leves: { type: integer }
 *         total_veiculos: { type: integer }
 *         data_completa: { type: string, format: date }
 *         ano: { type: integer }
 *         nome_mes: { type: string }
 *         nome_dia_semana: { type: string }
 *         flag_fim_de_semana: { type: boolean }
 *         municipio: { type: string }
 *         uf_abrev: { type: string }
 *         localidade: { type: string }
 *         tipo_acidente: { type: string }
 *         causa_acidente: { type: string }
 *         categoria_acidente: { type: string }
 *         modelo_veiculo: { type: string }
 *         tipo_veiculo: { type: string }
 *         marcas: { type: string, description: "Lista separada por vírgulas" }
 *         idade: { type: string, description: "Lista separada por vírgulas" }
 *         sexo: { type: string, description: "Lista separada por vírgulas" }
 *         km: { type: number }
 *         br: { type: string }
 *         delegacia: { type: string }
 *         condicao_metereologica: { type: string }
 *         longitude: { type: number }
 *         latitude: { type: number }
 *         tipo_pista: { type: string }
 *         fase_dia: { type: string }
 *
 *     IndicadoresGerais:
 *       type: object
 *       properties:
 *         total_acidentes: { type: integer }
 *         total_mortos: { type: integer }
 *         total_feridos: { type: integer }
 *         total_feridos_graves: { type: integer }
 *         total_feridos_leves: { type: integer }
 *         rodovias_monitoradas: { type: integer }
 *         municipios_monitorados: { type: integer }
 *
 *     IndicadoresPorMesItem:
 *       type: object
 *       properties:
 *         nome_mes: { type: string }
 *         total: { type: integer }
 *         mortos: { type: integer }
 *
 *     IndicadoresIdadeSexo:
 *       type: object
 *       properties:
 *         mulheres_envolvidas: { type: integer }
 *         homens_envolvidos: { type: integer }
 *         media_idade_feridos: { type: integer }
 *
 *     IndicadoresResponse:
 *       type: object
 *       properties:
 *         indicadores_gerais:
 *           $ref: '#/components/schemas/IndicadoresGerais'
 *         acidentes_por_mes:
 *           type: array
 *           items: { $ref: '#/components/schemas/IndicadoresPorMesItem' }
 *         acidentes_por_causa:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               causa_acidente: { type: string }
 *               total: { type: integer }
 *         acidentes_por_tipo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tipo_acidente: { type: string }
 *               total: { type: integer }
 *         acidentes_por_categoria:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               categoria_acidente: { type: string }
 *               total: { type: integer }
 *         acidentes_por_uf:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               uf_abrev: { type: string }
 *               total: { type: integer }
 *               mortos: { type: integer }
 *         acidentes_por_dia_semana:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome_dia_semana: { type: string }
 *               total: { type: integer }
 *         acidentes_por_condicao_metereologica:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               condicao_metereologica: { type: string }
 *               total: { type: integer }
 *         acidentes_por_marcas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               marcas: { type: string }
 *               total: { type: integer }
 *         acidentes_por_modelo_veiculo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               modelo_veiculo: { type: string }
 *               total: { type: integer }
 *         acidentes_por_tipo_pista:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tipo_pista: { type: string }
 *               total: { type: integer }
 *         acidentes_por_tipo_veiculo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tipo_veiculo: { type: string }
 *               total: { type: integer }
 *         acidentes_por_br:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               br: { type: string }
 *               total: { type: integer }
 *         acidentes_por_localizacao:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               longitude: { type: number }
 *               latitude: { type: number }
 *               total_acidentes: { type: integer }
 *               total_mortos: { type: integer }
 *               total_feridos: { type: integer }
 *               total_feridos_graves: { type: integer }
 *               total_feridos_leves: { type: integer }
 *         acidentes_por_percapita:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               uf: { type: string }
 *               municipio: { type: string }
 *               ano: { type: integer }
 *               populacao: { type: integer }
 *               mortos_per_capita_100k: { type: number }
 *               feridos_graves_per_capita_100k: { type: number }
 *               feridos_per_capita_100k: { type: number }
 *               severidade_per_capita_100k: { type: number }
 *         acidentes_por_idade_sexo:
 *           $ref: '#/components/schemas/IndicadoresIdadeSexo'
 */

/**
 * @swagger
 * /api/rodovias:
 *   get:
 *     summary: Lista acidentes em rodovias (paginado)
 *     tags: [Rodovias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ano
 *         schema: { type: string }
 *         description: Pode receber múltiplos separados por vírgula
 *       - in: query
 *         name: uf
 *         schema: { type: string }
 *         description: UF(s) separados por vírgula (ILIKE)
 *       - in: query
 *         name: categoria_acidente
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
 *         description: "true ou false"
 *       - in: query
 *         name: tipo_acidente
 *         schema: { type: string }
 *       - in: query
 *         name: causa_acidente
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
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema: { type: string, example: "Bearer <token>" }
 *     responses:
 *       200:
 *         description: Lista de acidentes (header X-Total-Count inclui total)
 *         headers:
 *           X-Total-Count:
 *             schema: { type: integer }
 *             description: Total de registros sem paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Rodovia' }
 *             example:
 *               - id_acidente_bronze: 123
 *                 total_mortos: 0
 *                 total_feridos: 2
 *                 total_feridos_graves: 1
 *                 total_feridos_leves: 1
 *                 total_veiculos: 2
 *                 data_completa: "2024-05-10"
 *                 ano: 2024
 *                 nome_mes: "Maio"
 *                 nome_dia_semana: "Sexta-feira"
 *                 flag_fim_de_semana: false
 *                 municipio: "Curitiba"
 *                 uf_abrev: "PR"
 *                 tipo_acidente: "Colisão frontal"
 *                 causa_acidente: "Ultrapassagem indevida"
 *                 categoria_acidente: "Grave"
 *                 br: "BR-277"
 *                 longitude: -49.1234
 *                 latitude: -25.4321
 *       401:
 *         description: Token ausente ou inválido
 */


/**
 * @swagger
 * /api/rodovias/indicadores:
 *   get:
 *     summary: Indicadores agregados para dashboards
 *     tags: [Rodovias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: indicador
 *         schema:
 *           type: string
 *           enum: [all, gerais, mes, causa, tipo, categoria, uf, dia_semana, condicao_metereologica, marcas, modelo_veiculo, tipo_pista, tipo_veiculo, br, localizacao, percapita, idade_sexo]
 *         description: Filtra execução para um único grupo (para otimizar). Padrão all.
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
 *         name: tipo_acidente
 *         schema: { type: string }
 *       - in: query
 *         name: causa_acidente
 *         schema: { type: string }
 *       - in: query
 *         name: categoria_acidente
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
 *               $ref: '#/components/schemas/IndicadoresResponse'
 *             example:
 *               indicadores_gerais:
 *                 total_acidentes: 1500
 *                 total_mortos: 30
 *                 total_feridos: 400
 *                 total_feridos_graves: 50
 *                 total_feridos_leves: 350
 *                 rodovias_monitoradas: 40
 *                 municipios_monitorados: 120
 *               acidentes_por_mes:
 *                 - nome_mes: "Janeiro"
 *                   total: 120
 *                   mortos: 3
 *               acidentes_por_tipo:
 *                 - tipo_acidente: "Colisão traseira"
 *                   total: 200
 *               acidentes_por_uf:
 *                 - uf_abrev: "SP"
 *                   total: 500
 *                   mortos: 10
 *               acidentes_por_idade_sexo:
 *                 mulheres_envolvidas: 600
 *                 homens_envolvidos: 900
 *                 media_idade_feridos: 34
 */

/**
 * @swagger
 * /api/rodovias/export:
 *   get:
 *     summary: Exporta acidentes em CSV (stream)
 *     tags: [Rodovias]
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
 *         name: tipo_acidente
 *         schema: { type: string }
 *       - in: query
 *         name: causa_acidente
 *         schema: { type: string }
 *       - in: query
 *         name: categoria_acidente
 *         schema: { type: string }
 *       - in: query
 *         name: data_inicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: data_fim
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Arquivo CSV (stream)
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *             example: "id_acidente_bronze,total_mortos,total_feridos,..."
 *       401:
 *         description: Token ausente
 *   post:
 *     summary: Exporta acidentes em CSV (POST permitindo body)
 *     tags: [Rodovias]
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
 *           example:
 *             ano: "2024"
 *             uf: "PR,SC"
 *             data_inicio: "2024-01-01"
 *             data_fim: "2024-06-30"
 *     responses:
 *       200:
 *         description: Arquivo CSV (stream)
 *         content:
 *           text/csv:
 *             schema: { type: string }
 *       401:
 *         description: Token ausente
 */