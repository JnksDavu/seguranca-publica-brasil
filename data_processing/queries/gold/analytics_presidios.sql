DROP TABLE IF EXISTS gold.analytics_presidios;

CREATE TABLE gold.analytics_presidios AS
SELECT
    f.id_fato_presidio,
    
    c.ano,
    c.semestre_nome, 
    to_char(c.data_completa, 'DD/MM/YYYY') AS data_referencia_formatada,
    c.data_completa,

    l.municipio,
    l.uf_abrev,
    l.cod_municipio,
    
    e.nome_estabelecimento,
    e.tipo_estabelecimento,
    e.situacao_estabelecimento,
    e.ambito,

    f.cap_provisorios_total,
    f.cap_fechado_total,
    f.cap_semiaberto_total,
    f.cap_aberto_total,
    f.cap_total_geral,

    (f.cap_provisorios_masc + f.cap_fechado_masc + f.cap_semiaberto_masc + f.cap_aberto_masc) as cap_total_masc,
    (f.cap_provisorios_fem + f.cap_fechado_fem + f.cap_semiaberto_fem + f.cap_aberto_fem) as cap_total_fem

FROM Silver.Fato_Presidios AS f
LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
LEFT JOIN Silver.Dim_Estabelecimento AS e ON f.fk_estabelecimento = e.id_estabelecimento

ORDER BY c.data_completa DESC, l.uf_abrev, f.cap_total_geral DESC;

CREATE INDEX idx_presidio_ano ON gold.analytics_presidios(ano);
CREATE INDEX idx_presidio_uf ON gold.analytics_presidios(uf_abrev);
CREATE INDEX idx_presidio_municipio ON gold.analytics_presidios(municipio);
CREATE INDEX idx_presidio_tipo ON gold.analytics_presidios(tipo_estabelecimento);