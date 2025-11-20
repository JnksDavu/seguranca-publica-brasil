CREATE TABLE gold.analytics_rodovias_new AS
WITH marcas AS (
    SELECT DISTINCT marca_normalizada, UPPER(marca) AS marca
    FROM silver.dim_veiculos
  ),

  fato_expandido AS (
    SELECT
      f.id_acidente_bronze,
      trim(mn.marca_raw) AS marca_raw
    FROM silver.fato_rodovias f
    CROSS JOIN LATERAL unnest(string_to_array(f.marca_normalizada_prf, ', ')) AS mn(marca_raw)
  ),

  fato_validado AS (
    SELECT
      fe.id_acidente_bronze,
      CASE
        WHEN marca_raw IN ('chev','gm') THEN 'chevrolet'
        WHEN marca_raw IN ('mbenz','mercedes') THEN 'mercedesbenz'
        WHEN marca_raw IN ('lr','lrover') THEN 'landrover'
        WHEN marca_raw IN ('vw','volks') THEN 'volkswagen'
        WHEN marca_raw = 'hyunda' THEN 'hyundai'
        WHEN marca_raw = 'mmc' THEN 'mitsubishi'
        WHEN marca_raw IN ('renalt','reanault','reanaut') THEN 'renault'
        WHEN marca_raw = 'ivecofiat' THEN 'iveco'
        WHEN marca_raw LIKE 'harleydavidson%' THEN 'harleydavidson'
        WHEN marca_raw IN ('hd','hdavidson') THEN 'harleydavidson'
        WHEN marca_raw LIKE 'mototraxx%' THEN 'traxx'
        WHEN marca_raw = 'monark' THEN 'monark'
        WHEN marca_raw = 'mvagusta' THEN 'mvagusta'
        WHEN marca_raw = 'lavrale' THEN 'lavrale'
        WHEN marca_raw = 'miura' THEN 'miura'
        WHEN marca_raw = 'troller' THEN 'troller'
        ELSE marca_raw
      END AS marca_normalizada_corrigida
    FROM fato_expandido fe
  ),

  marcas_unificadas AS (
    SELECT
      fv.id_acidente_bronze,
      STRING_AGG(DISTINCT m.marca, ',') AS marcas_validadas
    FROM fato_validado fv
    LEFT JOIN marcas m ON m.marca_normalizada = fv.marca_normalizada_corrigida
    GROUP BY fv.id_acidente_bronze
  )

  SELECT
    f.id_acidente_bronze,
    f.total_mortos,
    f.total_feridos,
    f.total_feridos_graves,
    f.total_feridos_leves,
    f.total_veiculos,

    to_char(c.data_completa, 'DD/MM/YYYY') AS data_completa,
    c.ano,
    c.nome_mes,
    c.nome_dia_semana,
    c.flag_fim_de_semana,

    l.municipio,
    l.uf_abrev,
    l.localidade,

    STRING_AGG(DISTINCT ta.tipo_acidente, ',') AS tipo_acidente,
    STRING_AGG(DISTINCT ta.causa_acidente, ',') AS causa_acidente,
    STRING_AGG(DISTINCT ta.categoria_acidente, ',') AS categoria_acidente,

    f.modelo_veiculo,
    f.tipo_veiculo,
    mu.marcas_validadas AS marcas,

    f.idade,
    f.sexo,
    f.km,
    f.br,
    f.delegacia,
    f.condicao_metereologica,
    f.longitude,
    f.latitude,
    f.tipo_pista,
    f.fase_dia
  FROM Silver.fato_rodovias AS f
  LEFT JOIN marcas_unificadas mu ON mu.id_acidente_bronze = f.id_acidente_bronze
  LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
  LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
  LEFT JOIN Silver.Dim_Tipo_Acidente AS ta ON f.fk_tipo_acidente = ta.id_acidente_tipo

  GROUP BY
    f.id_acidente_bronze, f.total_mortos, f.total_feridos, f.total_feridos_graves,
    f.total_feridos_leves, f.total_veiculos, f.modelo_veiculo, f.tipo_veiculo,
    f.idade, f.sexo, f.km, f.br, f.delegacia, f.condicao_metereologica,
    f.longitude, f.latitude, f.tipo_pista, f.fase_dia,
    c.data_completa, c.ano, c.nome_mes, c.nome_dia_semana, c.flag_fim_de_semana,
    l.municipio, l.uf_abrev, l.localidade, mu.marcas_validadas

  ORDER BY c.data_completa DESC;

  DROP TABLE IF EXISTS gold.analytics_rodovias;

  ALTER TABLE gold.analytics_rodovias_new 
  RENAME TO analytics_rodovias;

  CREATE INDEX idx_rodovias_id               ON gold.analytics_rodovias (id_acidente_bronze);

  CREATE INDEX idx_rodovias_ano              ON gold.analytics_rodovias (ano);
  CREATE INDEX idx_rodovias_data_completa    ON gold.analytics_rodovias (data_completa);
  CREATE INDEX idx_rodovias_nome_mes         ON gold.analytics_rodovias (nome_mes);
  CREATE INDEX idx_rodovias_nome_dia_semana  ON gold.analytics_rodovias (nome_dia_semana);
  CREATE INDEX idx_rodovias_flag_fds         ON gold.analytics_rodovias (flag_fim_de_semana);

  CREATE INDEX idx_rodovias_uf               ON gold.analytics_rodovias (uf_abrev);
  CREATE INDEX idx_rodovias_municipio        ON gold.analytics_rodovias (municipio);

  CREATE INDEX idx_rodovias_tipo_acidente    ON gold.analytics_rodovias (tipo_acidente);
  CREATE INDEX idx_rodovias_causa_acidente   ON gold.analytics_rodovias (causa_acidente);
  CREATE INDEX idx_rodovias_categoria_acidente ON gold.analytics_rodovias (categoria_acidente);

  -- Índices compostos
  CREATE INDEX idx_rodovias_uf_municipio     ON gold.analytics_rodovias (uf_abrev, municipio);
  CREATE INDEX idx_rodovias_ano_mes          ON gold.analytics_rodovias (ano, nome_mes);
  CREATE INDEX idx_rodovias_ano_tipo         ON gold.analytics_rodovias (ano, tipo_acidente);

  -- Índice BRIN para filtros por range
  CREATE INDEX idx_rodovias_data_brin 
  ON gold.analytics_rodovias USING BRIN (data_completa);
