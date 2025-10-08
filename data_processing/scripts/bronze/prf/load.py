import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os
import glob

load_dotenv()

USER = os.getenv("USER_DB")
PASSWORD = os.getenv("PASSWORD_DB")
HOST = os.getenv("HOST_DB")
PORT = os.getenv("PORT_DB")
DB = os.getenv("DB")

engine = create_engine(f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB}", future=True)

DATASET_DIR = "/home/tcc/seguranca-publica-brasil/data_processing/dataset/prf"
csv_files = sorted(glob.glob(os.path.join(DATASET_DIR, "*.csv")))

if not csv_files:
    print(f"Nenhum arquivo CSV encontrado em {DATASET_DIR}")
    exit(1)

print(f"{len(csv_files)} arquivos encontrados em {DATASET_DIR}:")
for f in csv_files:
    print(f"  - {os.path.basename(f)}")

chunksize = 100_000  

for csv_file in csv_files:
    print(f"\nIniciando importação de: {os.path.basename(csv_file)}")

    for i, chunk in enumerate(pd.read_csv(
            csv_file,
            sep=";",  
            encoding="latin1",
            chunksize=chunksize,
            dtype=str
        )):
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

        with engine.connect() as conn:
            chunk.to_sql(
                "prf",
                con=conn,
                schema="bronze",
                if_exists="append",
                index=False,
                method="multi"
            )

        print(f"Chunk {i} inserido com sucesso ({len(chunk)} linhas).")

    print(f"Arquivo {os.path.basename(csv_file)} importado com sucesso.")

print("Importação concluída!")
