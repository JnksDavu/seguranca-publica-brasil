CREATE TABLE gold.analytics_ocorrencias_new AS
WITH dist AS (
    SELECT 
        ano,
        COUNT(*) AS total_ano,
        CEIL(COUNT(*) * 0.08) AS qtd_amostra
    FROM Silver.Fato_ocorrencias f
    JOIN Silver.Dim_Calendario c ON f.fk_data = c.id_data
    WHERE c.ano IN (2023, 2024, 2025)
    GROUP BY ano
),
amostra AS (
    SELECT *
    FROM (
        SELECT 
            f.*, c.*, l.*, cr.*,
            ROW_NUMBER() OVER (PARTITION BY c.ano ORDER BY RANDOM()) AS rnum
        FROM Silver.Fato_ocorrencias f
        JOIN Silver.Dim_Calendario c ON f.fk_data = c.id_data
        JOIN Silver.Dim_Localidade l ON f.fk_localidade = l.id_localidade
        JOIN Silver.Dim_Crime cr ON f.fk_crime = cr.id_crime
        WHERE c.ano IN (2023, 2024, 2025)
    ) x
    JOIN dist d ON x.ano = d.ano
    WHERE rnum <= d.qtd_amostra
)
SELECT *
FROM amostra
ORDER BY data_completa DESC;


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