import pandas as pd
import os
import glob
import json
import unicodedata
import re
from sqlalchemy import text
from scripts.db import get_engine

# Configuração
engine = get_engine()
DATASET_DIR = "/home/tcc/seguranca-publica-brasil/data_processing/dataset/senappen" 
def clean_col_name(col):
    if not isinstance(col, str): return str(col)
    
    # 1. Remove acentos
    nfkd_form = unicodedata.normalize('NFKD', col)
    col = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    
    # 2. Lowercase e troca caracteres especiais por _
    col = re.sub(r'[^a-z0-9]', '_', col.lower())
    
    # 3. CORREÇÃO: Remove duplicidade de underscores (___ vira _)
    col = re.sub(r'_+', '_', col)
    
    # 4. Remove _ do começo e fim
    return col.strip('_')

COL_MAPPING = {
    # Metadados
    'ciclo': 'ciclo',
    'ano': 'ano',
    'referencia': 'referencia',
    'nome_do_estabelecimento': 'nome_estabelecimento',
    'tipo_do_estabelecimento': 'tipo_estabelecimento',
    'situacao_do_estabelecimento': 'situacao_estabelecimento',
    'ambito': 'ambito',
    'uf': 'uf',
    'municipio': 'municipio',
    'codigo_ibge': 'cod_municipio_ibge',
    'endereco': 'endereco',
    'bairro': 'bairro',
    'cep': 'cep',

    # Capacidade - Provisórios
    '1_3_capacidade_do_estabelecimento_presos_provisorios_masculino': 'cap_provisorios_masc',
    '1_3_capacidade_do_estabelecimento_presos_provisorios_feminino': 'cap_provisorios_fem',
    '1_3_capacidade_do_estabelecimento_presos_provisorios_total': 'cap_provisorios_total',

    # Capacidade - Regime Fechado
    '1_3_capacidade_do_estabelecimento_regime_fechado_masculino': 'cap_fechado_masc',
    '1_3_capacidade_do_estabelecimento_regime_fechado_feminino': 'cap_fechado_fem',
    '1_3_capacidade_do_estabelecimento_regime_fechado_total': 'cap_fechado_total',

    # Capacidade - Regime Semiaberto
    '1_3_capacidade_do_estabelecimento_regime_semiaberto_masculino': 'cap_semiaberto_masc',
    '1_3_capacidade_do_estabelecimento_regime_semiaberto_feminino': 'cap_semiaberto_fem',
    '1_3_capacidade_do_estabelecimento_regime_semiaberto_total': 'cap_semiaberto_total',

    # Capacidade - Regime Aberto
    '1_3_capacidade_do_estabelecimento_regime_aberto_masculino': 'cap_aberto_masc',
    '1_3_capacidade_do_estabelecimento_regime_aberto_feminino': 'cap_aberto_fem',
    '1_3_capacidade_do_estabelecimento_regime_aberto_total': 'cap_aberto_total',

    # Outros Regimes
    '1_3_capacidade_do_estabelecimento_regime_disciplinar_diferenciado_rdd_total': 'cap_rdd_total',
    '1_3_capacidade_do_estabelecimento_medidas_de_seguranca_de_internacao_total': 'cap_internacao_total'
}

csv_files = sorted(glob.glob(os.path.join(DATASET_DIR, "*.csv")))

if not csv_files:
    print(f"Nenhum arquivo CSV encontrado em {DATASET_DIR}")
    exit(1)

print(f"{len(csv_files)} arquivos encontrados. Iniciando processo...")

# 1. TRUNCATE E RESTART IDENTITY (Zera tudo para não duplicar)
print("Limpando tabela bronze.senappen...")
with engine.connect() as conn:
    conn.execute(text("TRUNCATE TABLE bronze.senappen RESTART IDENTITY;"))
    conn.commit()
print("Tabela limpa.")

# 2. Processa os arquivos
chunksize = 20000 

for csv_file in csv_files:
    print(f"\nIniciando importação de: {os.path.basename(csv_file)}")

    # Tenta UTF-8, se falhar tenta latin1 (fallback padrão)
    try:
        encoding_type = "utf-8"
        pd.read_csv(csv_file, sep=";", encoding=encoding_type, nrows=1)
    except:
        encoding_type = "latin1"
    
    print(f"Usando encoding: {encoding_type}")

    try:
        # Lê o CSV em chunks
        for i, chunk in enumerate(pd.read_csv(
                csv_file,
                sep=";", 
                encoding=encoding_type,
                chunksize=chunksize,
                dtype=str, 
                on_bad_lines='skip'
            )):

            # -----------------------------------------------------------
            # 1. Normaliza TODOS os nomes das colunas do Chunk
            # -----------------------------------------------------------
            chunk.columns = [clean_col_name(c) for c in chunk.columns]

            # 2. Separa colunas principais das métricas JSON
            cols_to_db = {}
            metrics_cols = []

            for col in chunk.columns:
                if col in COL_MAPPING:
                    cols_to_db[col] = COL_MAPPING[col]
                else:
                    metrics_cols.append(col)

            # 3. Cria o DataFrame final renomeando as colunas mapeadas
            # O .copy() é importante para não dar warning de SettingWithCopy
            df_final = chunk[list(cols_to_db.keys())].rename(columns=cols_to_db).copy()

            # 4. Conversão de Tipos (Métricas devem ser numéricas para o PostgreSQL não reclamar)
            numeric_cols = [
                'cap_provisorios_masc', 'cap_provisorios_fem', 'cap_provisorios_total',
                'cap_fechado_masc', 'cap_fechado_fem', 'cap_fechado_total',
                'cap_semiaberto_masc', 'cap_semiaberto_fem', 'cap_semiaberto_total',
                'cap_aberto_masc', 'cap_aberto_fem', 'cap_aberto_total',
                'cap_rdd_total', 'cap_internacao_total',
                'ano'
            ]
            
            for col in numeric_cols:
                if col in df_final.columns:
                    # Converte, transformando erros/vazios em NaN
                    df_final[col] = pd.to_numeric(df_final[col], errors='coerce')
                    # Preenche NaN com None (NULL no banco) ou 0 se preferir, mas NULL é mais seguro estatisticamente
                    df_final[col] = df_final[col].where(pd.notnull(df_final[col]), None)

            # 5. Cria o JSONB com as colunas SOBRANTES (metrics_cols)
            if metrics_cols:
                df_final['dados_adicionais'] = chunk[metrics_cols].apply(
                    lambda x: json.dumps({k: v for k, v in x.to_dict().items() if pd.notnull(v) and v != ''}), 
                    axis=1
                )
            else:
                df_final['dados_adicionais'] = '{}'

            # 6. Inserção no Banco
            with engine.connect() as conn:
                df_final.to_sql(
                    "senappen",
                    con=conn,
                    schema="bronze",
                    if_exists="append",
                    index=False,
                    method="multi",
                    chunksize=1000
                )

            print(f"Chunk {i} inserido ({len(chunk)} linhas).")

    except Exception as e:
        print(f"❌ Erro crítico ao processar {csv_file}: {e}")
        continue

    print(f"Arquivo {os.path.basename(csv_file)} importado.")

print("Importação concluída!")