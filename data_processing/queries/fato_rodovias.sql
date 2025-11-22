INSERT INTO Silver.fato_rodovias (
    id_acidente_bronze,
    
    fk_data,
    fk_localidade,
    fk_tipo_acidente,

    -- Colunas Degeneradas (Veículo)
    marca_veiculo,
    modelo_veiculo,
    marca_normalizada_prf,
    modelo_normalizada_prf,
    ano_fabricacao_veiculo,
    tipo_veiculo,
    tipo_veiculo_normalizado,

    -- Métricas
    total_pessoas,
    total_ilesos,
    total_feridos_leves,
    total_feridos_graves,
    total_mortos,
    total_feridos,
    total_ignorados,
    
    -- dimensoes
    sentido_via,
    fase_dia,
    condicao_metereologica,
    tipo_pista,
    idade,
    sexo,
    km,
    br,
    delegacia,
    longitude,
    latitude
)
SELECT
    b.id AS id_acidente_bronze,

    MAX(d.id_data) AS fk_data,
    MAX(l.id_localidade) AS fk_localidade,

    ta.id_acidente_tipo AS fk_tipo_acidente,

    ------------------------------------------------------------------------
    -- Veículos
    ------------------------------------------------------------------------

    STRING_AGG(DISTINCT SPLIT_PART(b.marca, '/', 1), ', ') AS marca_veiculo,
    STRING_AGG(DISTINCT SPLIT_PART(b.marca, '/', 2), ', ') AS modelo_veiculo,

    STRING_AGG(
        DISTINCT REGEXP_REPLACE(
            TRANSLATE(LOWER(SPLIT_PART(b.marca, '/', 1)),
            'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc'),
            '[^a-z0-9]', '', 'g'
        ),
        ', '
    ) AS marca_normalizada_prf,

    STRING_AGG(
        DISTINCT REGEXP_REPLACE(
            TRANSLATE(LOWER(SPLIT_PART(b.marca, '/', 2)),
            'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc'),
            '[^a-z0-9]', '', 'g'
        ),
        ', '
    ) AS modelo_normalizado_prf,

    STRING_AGG(DISTINCT b.ano_fabricacao_veiculo::TEXT, ', ') AS ano_fabricacao_veiculo,
    STRING_AGG(DISTINCT b.tipo_veiculo, ', ') AS tipo_veiculo,

    STRING_AGG(
        DISTINCT 
        CASE 
            WHEN b.tipo_veiculo IN (
                'Caminhonete','Caminhão','Caminhão-trator','Camioneta','Chassi-plataforma',
                'Micro-ônibus','Motor-casa','Quadriciclo','Reboque','Semireboque',
                'Trator de esteira','Trator de rodas','Trator misto','Utilitário','Ônibus'
            ) THEN 'TRUCK'
            WHEN b.tipo_veiculo IN (
                'Motocicleta','Motoneta','Ciclomotor','Triciclo'
            ) THEN 'MOTORCYCLE'
            WHEN b.tipo_veiculo IN (
                'Automóvel','Bicicleta','Carro de mão','Carroça-charrete',
                'Trem-bonde','Outros'
            ) THEN 'CAR'
            ELSE 'CAR'
        END,
        ', '
    ) AS tipo_veiculo_normalizado,


    ------------------------------------------------------------------------
    -- MÉTRICAS:
    ------------------------------------------------------------------------
    
    COUNT(DISTINCT CASE
        WHEN b.pesid IS NOT NULL
        THEN b.pesid
    END) AS total_pessoas,

    sum(b.ilesos) AS total_ilesos,

    sum(b.feridos_leves) AS total_feridos_leves,

    sum(b.feridos_graves) AS total_feridos_graves,
    
    sum(b.mortos) AS total_mortos,
    
	sum(b.feridos_leves) + sum(b.feridos_graves) AS total_feridos,

    sum(b.ignorados) AS total_ignorados,
    b.sentido_via,
    b.fase_dia,
    b.condicao_metereologica,
    b.tipo_pista,
    STRING_AGG(DISTINCT b.idade::TEXT, ', ') as idade,
    STRING_AGG(DISTINCT b.sexo::TEXT, ', ') as sexo,
    b.km,
    b.br,
    b.delegacia,
    b.longitude,
    b.latitude
    
FROM Bronze.prf AS b
LEFT JOIN Silver.Dim_Calendario AS d 
    ON b.data_inversa = d.data_completa

LEFT JOIN Silver.Dim_Localidade AS l 
    ON REGEXP_REPLACE(
           TRANSLATE(LOWER(b.municipio),
               'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc'),
           '[^a-z0-9]', '', 'g'
       ) = l.municipio_normalizado
   AND b.uf = l.uf_abrev

LEFT JOIN Silver.Dim_Tipo_Acidente AS ta 
    ON COALESCE(b.tipo_acidente, '') = COALESCE(ta.tipo_acidente, '')
   AND COALESCE(b.causa_acidente, '') = COALESCE(ta.causa_acidente, '')
   AND COALESCE(b.classificacao_acidente, '') = COALESCE(ta.classificacao_acidente, '')
   AND COALESCE(b.causa_principal, '') = COALESCE(ta.causa_principal, '')

GROUP BY b.id,sentido_via,b.fase_dia,b.condicao_metereologica,b.tipo_pista,b.km,b.br,b.delegacia,b.longitude,
    b.latitude,ta.id_acidente_tipo;
