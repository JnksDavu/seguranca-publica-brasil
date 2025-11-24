CREATE TABLE gold.analytics_ocorrencias_new AS
SELECT

    f.id_fato_sinesp AS id_ocorrencia,

    f.quantidade_ocorrencias,
    f.quantidade_vitimas,
    f.peso_apreendido,
    
    f.total_feminino,
    f.total_masculino,
    f.total_nao_informado,

    to_char(c.data_completa, 'DD/MM/YYYY') AS data_formatada,
    c.data_completa,
    c.ano,
    c.nome_mes,
    c.nome_dia_semana,
    c.flag_fim_de_semana,
    c.trimestre_nome,
    
    l.municipio,
    l.uf_abrev,

    l.cod_municipio, 

    cr.nome_crime AS evento,     
    cr.categoria_crime

FROM Silver.Fato_ocorrencias AS f

LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
LEFT JOIN Silver.Dim_Crime AS cr ON f.fk_crime = cr.id_crime

ORDER BY c.data_completa DESC;

DROP TABLE IF EXISTS gold.analytics_ocorrencias;

ALTER TABLE gold.analytics_ocorrencias_new 
RENAME TO analytics_ocorrencias;


-- Índices simples
CREATE INDEX idx_ocorrencias_id               ON gold.analytics_ocorrencias (id_ocorrencia);
CREATE INDEX idx_ocorrencias_ano              ON gold.analytics_ocorrencias (ano);
CREATE INDEX idx_ocorrencias_uf               ON gold.analytics_ocorrencias (uf_abrev);
CREATE INDEX idx_ocorrencias_municipio        ON gold.analytics_ocorrencias (municipio);
CREATE INDEX idx_ocorrencias_categoria        ON gold.analytics_ocorrencias (categoria_crime);
CREATE INDEX idx_ocorrencias_evento           ON gold.analytics_ocorrencias (evento);

-- Índices Compostos (Para otimizar filtros combinados do Front)
CREATE INDEX idx_ocorrencias_uf_municipio     ON gold.analytics_ocorrencias (uf_abrev, municipio);
CREATE INDEX idx_ocorrencias_ano_uf           ON gold.analytics_ocorrencias (ano, uf_abrev);
CREATE INDEX idx_ocorrencias_ano_categoria    ON gold.analytics_ocorrencias (ano, categoria_crime);

-- Índice BRIN para datas (Melhor performance para ranges de data em tabelas grandes)
CREATE INDEX idx_ocorrencias_data_brin 
ON gold.analytics_ocorrencias USING BRIN (data_completa);