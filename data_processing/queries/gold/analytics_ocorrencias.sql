CREATE TABLE gold.analytics_ocorrencias_new AS
WITH dist AS (
    SELECT 
        ano,
        COUNT(*) AS total_ano,
        CEIL(COUNT(*) * 0.08) AS qtd_amostra
    FROM Silver.Fato_ocorrencias f
    JOIN Silver.Dim_Calendario c ON f.fk_data = c.id_data
    WHERE c.ano IN (2023, 2024, 2025)
    GROUP BY ano
),
amostra AS (
    SELECT *
    FROM (
        SELECT 
            f.id_fato_sinesp AS id_ocorrencia,

		    case 
		    	when f.quantidade_ocorrencias = 0
		    	then 1
		    	else f.quantidade_ocorrencias
		    end 				as quantidade_ocorrencias,
		    f.quantidade_vitimas,
            case 
                when categoria_crime in ('Suicídio','Crimes Violentos Letais','Mortes Envolvendo Agentes','Trânsito') or cr.nome_crime = 'Mortes a esclarecer (sem indício de crime)'
                then quantidade_vitimas
            end as quantidade_mortos,
		    f.peso_apreendido,
		    
		    f.total_feminino,
		    f.total_masculino,
		    f.total_nao_informado,
		
		    to_char(c.data_completa, 'DD/MM/YYYY') AS data_formatada,
		    c.data_completa,
		    c.nome_mes,
		    c.nome_dia_semana,
		    c.flag_fim_de_semana,
		    c.trimestre_nome,
		    c.ano as ano_calendario,
		    l.municipio,
		    l.uf_abrev,
		
		    l.cod_municipio, 
		
		    cr.nome_crime AS evento,     
		    cr.categoria_crime,
            ROW_NUMBER() OVER (PARTITION BY c.ano ORDER BY RANDOM()) AS rnum
        FROM Silver.Fato_ocorrencias f
        JOIN Silver.Dim_Calendario c ON f.fk_data = c.id_data
        JOIN Silver.Dim_Localidade l ON f.fk_localidade = l.id_localidade
        JOIN Silver.Dim_Crime cr ON f.fk_crime = cr.id_crime
        WHERE c.ano IN (2023, 2024, 2025)
    ) x
    JOIN dist d ON x.ano_calendario = d.ano
    WHERE rnum <= d.qtd_amostra
)
SELECT 
			id_ocorrencia,

		    quantidade_ocorrencias,
		    quantidade_vitimas,
            quantidade_mortos,
		    concat(peso_apreendido,' kg') as peso_apreendido,
		    
		    total_feminino,
		    total_masculino,
		    total_nao_informado,
		
		    data_formatada,
		    data_completa,
		    nome_mes,
		    nome_dia_semana,
		    flag_fim_de_semana,
		    trimestre_nome,
		    ano,
		    
		    municipio,
		    uf_abrev,
		
		    cod_municipio, 
		
		    evento, 
		    categoria_crime
FROM amostra
ORDER BY data_completa DESC;

DROP TABLE IF EXISTS gold.analytics_ocorrencias;

ALTER TABLE gold.analytics_ocorrencias_new 
RENAME TO analytics_ocorrencias;


-- Índices simples
CREATE INDEX idx_ocorrencias_id               ON gold.analytics_ocorrencias (id_ocorrencia);
CREATE INDEX idx_ocorrencias_ano              ON gold.analytics_ocorrencias (ano);
CREATE INDEX idx_ocorrencias_uf               ON gold.analytics_ocorrencias (uf_abrev);
CREATE INDEX idx_ocorrencias_municipio        ON gold.analytics_ocorrencias (municipio);
CREATE INDEX idx_ocorrencias_categoria        ON gold.analytics_ocorrencias (categoria_crime);
CREATE INDEX idx_ocorrencias_evento           ON gold.analytics_ocorrencias (evento);

-- Índices Compostos (Para otimizar filtros combinados do Front)
CREATE INDEX idx_ocorrencias_uf_municipio     ON gold.analytics_ocorrencias (uf_abrev, municipio);
CREATE INDEX idx_ocorrencias_ano_uf           ON gold.analytics_ocorrencias (ano, uf_abrev);
CREATE INDEX idx_ocorrencias_ano_categoria    ON gold.analytics_ocorrencias (ano, categoria_crime);

-- Índice BRIN para datas (Melhor performance para ranges de data em tabelas grandes)
CREATE INDEX idx_ocorrencias_data_brin 
ON gold.analytics_ocorrencias USING BRIN (data_completa);
