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
DATASET_DIR = "/home/tcc/seguranca-publica-brasil/data_processing/dataset/senappen" # Confirme se o caminho é esse ou 'senappen'

# Função de limpeza de nomes (Crucial para bater com o mapeamento)
def clean_col_name(col):
    if not isinstance(col, str): return str(col)
    nfkd_form = unicodedata.normalize('NFKD', col)
    col = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    # Remove tudo que não é letra ou número e substitui por _
    return re.sub(r'[^a-z0-9]', '_', col.lower()).strip('_')

# ==============================================================================
# MAPEAMENTO ROBUSTO: CSV Sujo -> Coluna Bonita no Banco
# ==============================================================================
# As chaves aqui são como o 'clean_col_name' vai deixar o header do CSV.
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

# 1. TRUNCATE (Limpa a tabela antes de começar)
print("Limpando tabela bronze.senappen...")
with engine.connect() as conn:
    conn.execute(text("TRUNCATE TABLE bronze.senappen RESTART IDENTITY;"))
    conn.commit()
print("Tabela limpa.")

# 2. Processa os arquivos
chunksize = 20000 

for csv_file in csv_files:
    print(f"\nIniciando importação de: {os.path.basename(csv_file)}")

    # Tenta UTF-8, se falhar tenta latin1 (comum em arquivos do governo)
    try:
        encoding_type = "utf-8"
        # Teste rápido de leitura
        pd.read_csv(csv_file, sep=";", encoding=encoding_type, nrows=1)
    except:
        encoding_type = "latin1"
    
    print(f"Usando encoding: {encoding_type}")

    try:
        for i, chunk in enumerate(pd.read_csv(
                csv_file,
                sep=";", 
                encoding=encoding_type,
                chunksize=chunksize,
                dtype=str, # Lê tudo como string primeiro para não quebrar
                on_bad_lines='skip'
            )):

            # 1. Normaliza nomes das colunas (aplica a função clean_col_name em todas)
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
            df_final = chunk[list(cols_to_db.keys())].rename(columns=cols_to_db).copy()

            # 4. Conversão de Tipos (Métricas devem ser numéricas)
            numeric_cols = [
                'cap_provisorios_masc', 'cap_provisorios_fem', 'cap_provisorios_total',
                'cap_fechado_masc', 'cap_fechado_fem', 'cap_fechado_total',
                'cap_semiaberto_masc', 'cap_semiaberto_fem', 'cap_semiaberto_total',
                'cap_aberto_masc', 'cap_aberto_fem', 'cap_aberto_total',
                'ano'
            ]
            
            for col in numeric_cols:
                if col in df_final.columns:
                    # Converte para numérico, transformando erros/vazios em NaN (que vira NULL no SQL)
                    df_final[col] = pd.to_numeric(df_final[col], errors='coerce')

            # 5. Cria o JSONB com as colunas SOBRANTES (metrics_cols)
            # Remove nulos e vazios para economizar espaço
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