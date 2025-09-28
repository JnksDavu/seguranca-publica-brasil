import pandas as pd
from sqlalchemy import create_engine

# Configurações do banco
USER = "davi_junkes"
PASSWORD = "Da.1596753258"
HOST = "168.138.126.135"
PORT = "5432"
DB = "dw_seguranca_brasil"
TABLE = "prf"
SCHEMA = "bronze"

# Conexão com Postgres via SQLAlchemy
engine = create_engine(f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB}", future=True)

# Caminho do CSV
csv_file = "acidentes2024_todas_causas_tipos.csv"

# Tamanho do chunk
chunksize = 100_000  

# Leitura em pedaços e inserção no banco
for i, chunk in enumerate(pd.read_csv(
        csv_file,
        sep=";",            # separador ;
        encoding="latin1",  # encoding latin1
        chunksize=chunksize,
        dtype=str           # mantém tudo como string inicialmente
    )):

    # Conversões de tipos
    if "pesid" in chunk.columns:
        chunk["pesid"] = pd.to_numeric(chunk["pesid"], errors="coerce")
    if "idade" in chunk.columns:
        chunk["idade"] = pd.to_numeric(chunk["idade"], errors="coerce")
    if "ano_fabricacao_veiculo" in chunk.columns:
        chunk["ano_fabricacao_veiculo"] = pd.to_numeric(chunk["ano_fabricacao_veiculo"], errors="coerce")
    if "data_inversa" in chunk.columns:
        chunk["data_inversa"] = pd.to_datetime(chunk["data_inversa"], errors="coerce").dt.date
    if "horario" in chunk.columns:
        chunk["horario"] = pd.to_datetime(
            chunk["horario"], format="%H:%M:%S", errors="coerce"
        ).dt.time

    # Inserindo no banco com conexão explícita
    with engine.connect() as conn:
        chunk.to_sql(
            TABLE,
            con=conn,
            schema=SCHEMA,
            if_exists="append",
            index=False,
            method="multi"
        )

    print(f"Chunk {i} inserido com sucesso ({len(chunk)} linhas).")

print("Importação concluída!")
