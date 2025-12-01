-- CREATE TABLE Silver.Dim_Crime(
--     id_crime SERIAL PRIMARY KEY,
--     nome_crime VARCHAR(255) NOT NULL,
--     categoria_crime VARCHAR(100) 
-- );
-- CREATE INDEX idx_dim_crime_nome ON Silver.Dim_Crime(nome_crime);
--CREATE INDEX idx_dim_crime_nome ON Silver.Dim_Crime(nome_crime);

INSERT INTO Silver.Dim_Crime (nome_crime, categoria_crime)
SELECT DISTINCT 
    evento,
    CASE 
        WHEN evento IN ('Apreensão de Cocaína', 'Apreensão de Maconha', 'Tráfico de drogas') 
            THEN 'Drogas'
        WHEN evento = 'Arma de Fogo Apreendida' 
            THEN 'Armas'

        WHEN evento IN ('Homicídio doloso', 'Feminicídio', 'Lesão corporal seguida de morte', 'Roubo seguido de morte (latrocínio)') 
            THEN 'Crimes Violentos Letais'
            
        WHEN evento IN ('Tentativa de feminicídio', 'Tentativa de homicídio') 
            THEN 'Tentativas de Homicídio'

        WHEN evento IN ('Estupro', 'Estupro de vulnerável') 
            THEN 'Crimes Sexuais'

        WHEN evento IN ('Furto de veículo', 'Roubo a instituição financeira', 'Roubo de carga', 'Roubo de veículo') 
            THEN 'Crimes Patrimoniais'

        WHEN evento = 'Morte no trânsito ou em decorrência dele (exceto homicídio doloso)' 
            THEN 'Trânsito'

        WHEN evento IN ('Pessoa Desaparecida', 'Pessoa Localizada') 
            THEN 'Desaparecidos'
        WHEN evento IN ('Suicídio', 'Suicídio de Agente do Estado') 
            THEN 'Suicídio'

        WHEN evento = 'Mandado de prisão cumprido' 
            THEN 'Atividade Policial'
        WHEN evento IN ('Morte de Agente do Estado', 'Morte por intervenção de Agente do Estado') 
            THEN 'Mortes Envolvendo Agentes'

        WHEN evento IN ('Atendimento pré-hospitalar', 'Busca e salvamento', 'Combate a incêndios') 
            THEN 'Bombeiros - Operacional'
        WHEN evento IN ('Emissão de Alvarás de licença', 'Realização de vistorias') 
            THEN 'Bombeiros - Preventivo'

        ELSE 'Outros'
    END AS categoria_crime

FROM bronze.sinesp
WHERE evento IS NOT NULL;