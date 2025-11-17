with marcas as (
	    select distinct marca_normalizada 
	    from silver.dim_veiculos dv 
    )
    
SELECT
      f.total_mortos,
      f.total_mortos,
      case 
      	when f.total_mortos > total_feridos
      		then f.total_mortos
      	else total_feridos
      end as total_feridos,
      case 
      	when f.total_mortos > total_feridos_graves
      		then f.total_mortos
      	else total_feridos_graves
      end as total_feridos_graves,
      f.total_feridos_leves
      f.total_veiculos,
      to_char(data_completa, 'DD/MM/YYYY') as data_completa,
      c.ano,
      c.nome_mes,
      c.nome_dia_semana,
      c.flag_fim_de_semana,
      l.municipio,
      l.uf_abrev,
      l.localidade,
      ta.tipo_acidente,
      ta.causa_acidente,
      ta.categoria_acidente,
      f.tipo_veiculo,
      f.modelo_veiculo,
      upper(m.marca_normalizada)  as marca_normalizada
    FROM Silver.fato_rodovias AS f
    LEFT JOIN Silver.Dim_Calendario AS c ON f.fk_data = c.id_data
    LEFT JOIN Silver.Dim_Localidade AS l ON f.fk_localidade = l.id_localidade
    LEFT JOIN Silver.Dim_Tipo_Acidente AS ta ON f.fk_tipo_acidente = ta.id_acidente_tipo
    left join marcas m 
    on m.marca_normalizada = 
    case 
     WHEN marca_normalizada_prf IN ('chev','gm') THEN 'chevrolet'

    WHEN marca_normalizada_prf IN ('mbenz','mercedes','mbenz') THEN 'mercedesbenz'

    WHEN marca_normalizada_prf IN ('lr','lrover') THEN 'landrover'

    WHEN marca_normalizada_prf IN ('vw','volks') THEN 'volkswagen'

    WHEN marca_normalizada_prf = 'hyunda' THEN 'hyundai'

    WHEN marca_normalizada_prf = 'mmc' THEN 'mitsubishi'

    WHEN marca_normalizada_prf IN ('renalt','reanault','reanaut') THEN 'renault'

    WHEN marca_normalizada_prf = 'ivecofiat' THEN 'iveco'

    WHEN marca_normalizada_prf LIKE 'harleydavidson%' THEN 'harleydavidson'
    
    WHEN marca_normalizada_prf IN ('hd','hdavidson') THEN 'harleydavidson'

    WHEN marca_normalizada_prf LIKE 'mototraxx%' THEN 'traxx'

    WHEN marca_normalizada_prf = 'monark' THEN 'monark'

    WHEN marca_normalizada_prf IN ('mvagusta') THEN 'mvagusta'

    WHEN marca_normalizada_prf = 'lavrale' THEN 'lavrale'

    WHEN marca_normalizada_prf = 'miura' THEN 'miura'

    WHEN marca_normalizada_prf = 'troller' THEN 'troller'
    	else marca_normalizada_prf 
    end
    WHERE 1=1