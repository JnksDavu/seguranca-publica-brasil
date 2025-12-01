-- DROP TABLE IF EXISTS Silver.Dim_Estabelecimento;

-- CREATE TABLE Silver.Dim_Estabelecimento (
--     id_estabelecimento SERIAL PRIMARY KEY,
--     nome_estabelecimento VARCHAR(255),
--     tipo_estabelecimento VARCHAR(100), 
--     situacao_estabelecimento VARCHAR(100), 
--     ambito VARCHAR(50),
    
--     nome_normalizado VARCHAR(255)
-- );

-- CREATE INDEX idx_dim_estab_nome ON Silver.Dim_Estabelecimento(nome_normalizado);

INSERT INTO Silver.Dim_Estabelecimento (
    nome_estabelecimento,
    tipo_estabelecimento,
    situacao_estabelecimento,
    ambito,
    nome_normalizado
)
SELECT DISTINCT
    nome_estabelecimento,
    tipo_estabelecimento,
    situacao_estabelecimento,
    ambito,
    
    -- Normalização padrão do projeto
    REGEXP_REPLACE(
        TRANSLATE(LOWER(nome_estabelecimento), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'),
        '[^a-z0-9]', '', 'g'
    ) as nome_normalizado
FROM bronze.senappen
WHERE nome_estabelecimento IS NOT NULL;