INSERT INTO Silver.Dim_Localidade (
    cod_municipio,
    municipio,
    uf,
    uf_abrev,
    municipio_normalizado
)
SELECT DISTINCT
    cod_municipio,
    municipio,
    uf,
    uf_abrev,
    
    REGEXP_REPLACE(
        TRANSLATE(
            LOWER(municipio),
            'áàâãäéèêëíìîïóòôõöúùûüç', 
            'aaaaaeeeeiiiiooooouuuuc'
        ),
        '[^a-z0-9]', 
        '', 
        'g'
    )
FROM
    bronze.ibge_populacao
WHERE
    cod_municipio IS NOT NULL;