INSERT INTO Silver.fato_rodovias (
    id_acidente_bronze,
    
    -- FKs
    fk_data,
    fk_localidade,
    fk_tipo_acidente,
    
    -- Colunas Degeneradas (Veículo)
    marca_veiculo,
    ano_fabricacao_veiculo,
    tipo_veiculo,
    
    -- Métricas
    total_pessoas,
    total_veiculos,
    total_ilesos,
    total_feridos_leves,
    total_feridos_graves,
    total_mortos,
    total_feridos,
    total_ignorados
)
SELECT
    b.id,
    d.id_data,
    l.id_localidade, 
    ta.id_acidente_tipo,
    
    -- Colunas Degeneradas (Veículo)
    b.marca,
    b.ano_fabricacao_veiculo,
    b.tipo_veiculo,
    
    -- Métricas
    cast(b.pessoas as int),
    b.veiculos,
    b.ilesos,
    b.feridos_leves,
    b.feridos_graves,
    b.mortos,
    b.feridos,
    b.ignorados
FROM
    Bronze.prf AS b

LEFT JOIN Silver.Dim_Calendario AS d 
    ON b.data_inversa = d.data_completa

LEFT JOIN Silver.Dim_Localidade AS l 
    ON REGEXP_REPLACE(
           TRANSLATE(
               LOWER(b.municipio),
               'áàâãäéèêëíìîïóòôõöúùûüç', 
               'aaaaaeeeeiiiiooooouuuuc'
           ),
           '[^a-z0-9]', 
           '', 
           'g'
       ) = l.municipio_normalizado
   AND b.uf = l.uf_abrev

LEFT JOIN Silver.Dim_Tipo_Acidente AS ta 
    ON COALESCE(b.tipo_acidente, '') = COALESCE(ta.tipo_acidente, '')
   AND COALESCE(b.causa_acidente, '') = COALESCE(ta.causa_acidente, '')
   AND COALESCE(b.classificacao_acidente, '') = COALESCE(ta.classificacao_acidente, '')
   AND COALESCE(b.causa_principal, '') = COALESCE(ta.causa_principal, '');
   