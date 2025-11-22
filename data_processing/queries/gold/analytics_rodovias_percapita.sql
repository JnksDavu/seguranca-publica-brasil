CREATE TABLE gold.analytics_rodovias_percapita_new AS
SELECT
    l.uf_abrev AS uf,
    l.municipio AS municipio,
    c.ano AS ano,
    p.populacao_total AS populacao,

    (SUM(f.total_mortos)::numeric / p.populacao_total) * 100000 AS mortos_per_capita_100k,
    (SUM(f.total_feridos_graves)::numeric / p.populacao_total) * 100000 AS feridos_graves_per_capita_100k,
    (SUM(f.total_feridos)::numeric / p.populacao_total) * 100000 AS feridos_per_capita_100k,
    (SUM(f.total_mortos + f.total_feridos_graves)::numeric / p.populacao_total) * 100000 AS severidade_per_capita_100k
FROM silver.fato_rodovias f
LEFT JOIN silver.dim_localidade l ON f.fk_localidade = l.id_localidade
LEFT JOIN silver.dim_calendario c ON f.fk_data = c.id_data
LEFT JOIN silver.fato_populacao p ON p.fk_localidade = l.id_localidade AND p.ano = c.ano
GROUP BY l.uf_abrev, l.municipio, c.ano, p.populacao_total
ORDER BY c.ano DESC;


  DROP TABLE IF EXISTS gold.analytics_rodovias_percapita;

  ALTER TABLE gold.analytics_rodovias_percapita_new 
  RENAME TO analytics_rodovias_percapita;

  CREATE INDEX idx_mapa_rodovias_municipio ON gold.analytics_rodovias_percapita (municipio);
  CREATE INDEX idx_mapa_rodovias_ano       ON gold.analytics_rodovias_percapita (ano);
  CREATE INDEX idx_mapa_rodovias_uf        ON gold.analytics_rodovias_percapita (uf);