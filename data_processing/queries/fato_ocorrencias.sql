-- DROP TABLE IF EXISTS Silver.Fact_Ocorrencias_Sinesp;

-- CREATE TABLE Silver.fato_ocorrencias (
--     id_fato_sinesp SERIAL PRIMARY KEY,
    

--     fk_data INT NOT NULL,
--     fk_localidade INT NOT NULL,
--     fk_crime INT NOT NULL, 




--     quantidade_ocorrencias INT DEFAULT 0, 
--     quantidade_vitimas INT DEFAULT 0,   
--     peso_apreendido NUMERIC(15, 3) DEFAULT 0,


--     total_feminino INT DEFAULT 0,
--     total_masculino INT DEFAULT 0,
--     total_nao_informado INT DEFAULT 0,

--     FOREIGN KEY (fk_data) REFERENCES Silver.Dim_Calendario(id_data),
--     FOREIGN KEY (fk_localidade) REFERENCES Silver.Dim_Localidade(id_localidade),
--     FOREIGN KEY (fk_crime) REFERENCES Silver.Dim_Crime(id_crime)
-- );


-- CREATE INDEX idx_fato_ocorrencias_data ON Silver.fato_ocorrencias(fk_data);
-- CREATE INDEX idx_fato_ocorrencias_local ON Silver.fato_ocorrencias(fk_localidade);
-- CREATE INDEX idx_fato_ocorrencias_crime ON Silver.fato_ocorrencias(fk_crime); 


INSERT INTO Silver.Fato_ocorrencias (
    fk_data,
    fk_localidade,
    fk_crime,
    quantidade_ocorrencias,
    quantidade_vitimas,
    peso_apreendido,
    total_feminino,
    total_masculino,
    total_nao_informado
)
SELECT
    d.id_data AS fk_data,

    COALESCE(l.id_localidade, 0) AS fk_localidade,

    c.id_crime AS fk_crime,

    SUM(COALESCE(b.total, 0)) AS quantidade_ocorrencias,
    SUM(COALESCE(b.total_vitima, 0)) AS quantidade_vitimas,
    SUM(COALESCE(b.total_peso, 0)) AS peso_apreendido,
    
    SUM(COALESCE(b.feminino, 0)) AS total_feminino,
    SUM(COALESCE(b.masculino, 0)) AS total_masculino,
    SUM(COALESCE(b.nao_informado, 0)) AS total_nao_informado

FROM bronze.sinesp AS b

LEFT JOIN Silver.Dim_Calendario AS d 
    ON b.data_referencia = d.data_completa

LEFT JOIN Silver.Dim_Localidade AS l 
    ON REGEXP_REPLACE(
           TRANSLATE(LOWER(b.municipio),
               'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc'),
           '[^a-z0-9]', '', 'g'
       ) = l.municipio_normalizado
   AND b.uf = l.uf_abrev

LEFT JOIN Silver.Dim_Crime AS c
    ON b.evento = c.nome_crime

GROUP BY 
    d.id_data,
    l.id_localidade,
    c.id_crime;