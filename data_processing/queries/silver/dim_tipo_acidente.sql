INSERT INTO silver.dim_tipo_acidente (
    tipo_acidente, 
    causa_acidente, 
    classificacao_acidente, 
    causa_principal, 
    categoria_acidente
)
SELECT DISTINCT
    b.tipo_acidente,
    b.causa_acidente,
    b.classificacao_acidente,
    b.causa_principal,

case 
	when lower(tipo_acidente) like '%atropelamento%'
		then 'Atropelamento'
	when lower(tipo_acidente) like '%colisão%'
		then 'Colisão'
	when lower(tipo_acidente) like any (array['%capotamento%','%derramamento%','%tombamento%','%saída%','%queda%'])
		then 'Perda de controle'
	when lower(tipo_acidente) like '%sinistro%'
		then 'Sinistro'
	else tipo_acidente
	
end	as categoria_acidente
    
FROM 
    Bronze.prf AS b;