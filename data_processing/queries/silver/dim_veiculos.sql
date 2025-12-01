INSERT INTO Silver.Dim_Veiculos (
    fipe_code,
    tipo_veiculo,
    marca,
    modelo,
    ano_modelo,
    tipo_combustivel,
    marca_normalizada,
    modelo_normalizado,
    valor_atual
)
SELECT DISTINCT
    "Fipe Code",
    "Type",
    "Brand Value",
    "Model Value",
    
    CAST(SPLIT_PART("Year Value", ' ', 1) AS INTEGER),
    
    "Fuel Type",
    
    REGEXP_REPLACE(
        TRANSLATE(
            LOWER("Brand Value"),
            'áàâãäéèêëíìîïóòôõöúùûüç', 
            'aaaaaeeeeiiiiooooouuuuc'
        ),
        '[^a-z0-9]', 
        '', 
        'g'
    ),
    
    REGEXP_REPLACE(
        TRANSLATE(
            LOWER("Model Value"),
            'áàâãäéèêëíìîïóòôõöúùûüç', 
            'aaaaaeeeeiiiiooooouuuuc'
        ),
        '[^a-z0-9]', 
        '', 
        'g'
    ),
    "Price"
FROM 
    bronze.fipe
WHERE
    "Brand Value" IS NOT NULL
    AND "Model Value" IS NOT NULL
    AND "Year Value" IS NOT NULL
    AND "Year Value" NOT LIKE '%Zero KM%';