-- DROP TABLE IF EXISTS Silver.Fato_Presidios;

-- CREATE TABLE Silver.Fato_Presidios (
--     id_fato_presidio SERIAL PRIMARY KEY,
    
--     fk_data INT NOT NULL,
--     fk_localidade INT NOT NULL,
--     fk_estabelecimento INT NOT NULL,
    
--     ciclo TEXT,
    
--     cap_provisorios_masc INT DEFAULT 0,
--     cap_provisorios_fem INT DEFAULT 0,
--     cap_provisorios_total INT DEFAULT 0,
    
--     cap_fechado_masc INT DEFAULT 0,
--     cap_fechado_fem INT DEFAULT 0,
--     cap_fechado_total INT DEFAULT 0,
    
--     cap_semiaberto_masc INT DEFAULT 0,
--     cap_semiaberto_fem INT DEFAULT 0,
--     cap_semiaberto_total INT DEFAULT 0,
    
--     cap_aberto_masc INT DEFAULT 0,
--     cap_aberto_fem INT DEFAULT 0,
--     cap_aberto_total INT DEFAULT 0,
    
--     cap_total_geral INT DEFAULT 0, 
    
--     FOREIGN KEY (fk_data) REFERENCES Silver.Dim_Calendario(id_data),
--     FOREIGN KEY (fk_localidade) REFERENCES Silver.Dim_Localidade(id_localidade),
--     FOREIGN KEY (fk_estabelecimento) REFERENCES Silver.Dim_Estabelecimento(id_estabelecimento)
-- );

-- CREATE INDEX idx_fato_presidio_data ON Silver.Fato_Presidios(fk_data);
-- CREATE INDEX idx_fato_presidio_local ON Silver.Fato_Presidios(fk_localidade);

INSERT INTO Silver.Fato_Presidios (
    fk_data,
    fk_localidade,
    fk_estabelecimento,
    ciclo,
    cap_provisorios_masc, cap_provisorios_fem, cap_provisorios_total,
    cap_fechado_masc, cap_fechado_fem, cap_fechado_total,
    cap_semiaberto_masc, cap_semiaberto_fem, cap_semiaberto_total,
    cap_aberto_masc, cap_aberto_fem, cap_aberto_total,
    cap_total_geral
)
SELECT

    to_char(
        CASE 
            WHEN lower(b.referencia) LIKE '%jun%' OR lower(b.ciclo) LIKE '%jun%' THEN (b.ano || '-06-30')::DATE
            ELSE (b.ano || '-12-31')::DATE
        END, 
    'YYYYMMDD')::INT AS fk_data,

    COALESCE(l.id_localidade, 0) AS fk_localidade,

    e.id_estabelecimento AS fk_estabelecimento,
    
    b.ciclo,

    COALESCE(b.cap_provisorios_masc, 0), COALESCE(b.cap_provisorios_fem, 0), COALESCE(b.cap_provisorios_total, 0),
    COALESCE(b.cap_fechado_masc, 0), COALESCE(b.cap_fechado_fem, 0), COALESCE(b.cap_fechado_total, 0),
    COALESCE(b.cap_semiaberto_masc, 0), COALESCE(b.cap_semiaberto_fem, 0), COALESCE(b.cap_semiaberto_total, 0),
    COALESCE(b.cap_aberto_masc, 0), COALESCE(b.cap_aberto_fem, 0), COALESCE(b.cap_aberto_total, 0),
    
    (COALESCE(b.cap_provisorios_total, 0) + COALESCE(b.cap_fechado_total, 0) + 
     COALESCE(b.cap_semiaberto_total, 0) + COALESCE(b.cap_aberto_total, 0)) as cap_total_geral

FROM bronze.senappen AS b

LEFT JOIN Silver.Dim_Localidade AS l 
    ON REGEXP_REPLACE(TRANSLATE(LOWER(b.municipio),'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc'),'[^a-z0-9]', '', 'g') = l.municipio_normalizado
   AND b.uf = l.uf_abrev

LEFT JOIN Silver.Dim_Estabelecimento AS e
    ON b.nome_estabelecimento = e.nome_estabelecimento
    AND b.tipo_estabelecimento = e.tipo_estabelecimento;