INSERT INTO Silver.fato_populacao (
    fk_localidade,
    ano,
    populacao_total
)
SELECT
    dim.id_localidade,
    b.ano,
    b.populacao_total
FROM
    bronze.ibge_populacao AS b
JOIN
    Silver.Dim_Localidade AS dim ON b.cod_municipio = dim.cod_municipio
WHERE
    b.ano IS NOT NULL
    AND b.populacao_total IS NOT NULL;