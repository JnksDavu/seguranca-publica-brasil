INSERT INTO Silver.Dim_Calendario (
    id_data,
    data_completa,
    ano,
    mes,
    dia_mes,
    nome_mes,
    nome_mes_abrev,
    dia_ano,
    dia_semana_num,
    nome_dia_semana,
    nome_dia_semana_abrev,
    semana_ano,
    trimestre_num,
    trimestre_nome,
    semestre_num,
    semestre_nome,
    flag_fim_de_semana,
    flag_feriado
)
WITH datas AS (
    SELECT 
        d::DATE AS data_completa
    FROM 
        generate_series(
            '2015-01-01'::DATE,
            '2030-12-31'::DATE,
            '1 day'::INTERVAL
        ) AS d
)
SELECT
    TO_CHAR(data_completa, 'YYYYMMDD')::INT AS id_data,
    
    data_completa,
    
    EXTRACT(YEAR FROM data_completa) AS ano,
    EXTRACT(MONTH FROM data_completa) AS mes,
    EXTRACT(DAY FROM data_completa) AS dia_mes,
    
    CASE EXTRACT(MONTH FROM data_completa)
        WHEN 1 THEN 'Janeiro'
        WHEN 2 THEN 'Fevereiro'
        WHEN 3 THEN 'Março'
        WHEN 4 THEN 'Abril'
        WHEN 5 THEN 'Maio'
        WHEN 6 THEN 'Junho'
        WHEN 7 THEN 'Julho'
        WHEN 8 THEN 'Agosto'
        WHEN 9 THEN 'Setembro'
        WHEN 10 THEN 'Outubro'
        WHEN 11 THEN 'Novembro'
        WHEN 12 THEN 'Dezembro'
    END AS nome_mes,
    
    CASE EXTRACT(MONTH FROM data_completa)
        WHEN 1 THEN 'Jan'
        WHEN 2 THEN 'Fev'
        WHEN 3 THEN 'Mar'
        WHEN 4 THEN 'Abr'
        WHEN 5 THEN 'Mai'
        WHEN 6 THEN 'Jun'
        WHEN 7 THEN 'Jul'
        WHEN 8 THEN 'Ago'
        WHEN 9 THEN 'Set'
        WHEN 10 THEN 'Out'
        WHEN 11 THEN 'Nov'
        WHEN 12 THEN 'Dez'
    END AS nome_mes_abrev,
    
    EXTRACT(DOY FROM data_completa) AS dia_ano,
    
    EXTRACT(DOW FROM data_completa) AS dia_semana_num,
    
    CASE EXTRACT(DOW FROM data_completa)
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda-feira'
        WHEN 2 THEN 'Terça-feira'
        WHEN 3 THEN 'Quarta-feira'
        WHEN 4 THEN 'Quinta-feira'
        WHEN 5 THEN 'Sexta-feira'
        WHEN 6 THEN 'Sábado'
    END AS nome_dia_semana,

    CASE EXTRACT(DOW FROM data_completa)
        WHEN 0 THEN 'Dom'
        WHEN 1 THEN 'Seg'
        WHEN 2 THEN 'Ter'
        WHEN 3 THEN 'Qua'
        WHEN 4 THEN 'Qui'
        WHEN 5 THEN 'Sex'
        WHEN 6 THEN 'Sáb'
    END AS nome_dia_semana_abrev,

    EXTRACT(WEEK FROM data_completa) AS semana_ano,
    
    EXTRACT(QUARTER FROM data_completa) AS trimestre_num,
    EXTRACT(QUARTER FROM data_completa) || 'º Trimestre' AS trimestre_nome,
    
    CASE WHEN EXTRACT(MONTH FROM data_completa) <= 6 THEN 1 ELSE 2 END AS semestre_num,
    CASE WHEN EXTRACT(MONTH FROM data_completa) <= 6 THEN '1º Semestre' ELSE '2º Semestre' END AS semestre_nome,
    
    EXTRACT(DOW FROM data_completa) IN (0, 6) AS flag_fim_de_semana,
    FALSE AS flag_feriado
FROM 
    datas;