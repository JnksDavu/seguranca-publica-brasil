SELECT
    -- Fatos (Métricas)
    f.total_mortos,
    f.total_feridos_graves,
    f.total_veiculos,
    
    -- Dimensão Calendário
    c.data_completa,
    c.ano,
    c.nome_mes,
    c.nome_dia_semana,
    c.flag_fim_de_semana,
    
    -- Dimensão Localidade
    l.municipio,
    l.uf_abrev,
    
    -- Dimensão Tipo de Acidente
    ta.tipo_acidente,
    ta.causa_acidente,
    ta.categoria_acidente -- A categoria que você criou!

FROM
    Silver.fato_rodovias AS f

-- Juntando as Dimensões
LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
LEFT JOIN Silver.Dim_Tipo_Acidente AS ta ON f.fk_tipo_acidente = ta.id_acidente_tipo -- (Confirme o PK)
