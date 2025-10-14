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

DATASET_DIR = "/home/tcc/seguranca-publica-brasil/data_processing/dataset/sinesp"
xlsx_files = sorted(glob.glob(os.path.join(DATASET_DIR, "*.xlsx")))

if not xlsx_files:
    print(f"Nenhum arquivo XLSX encontrado em {DATASET_DIR}")
    exit(1)

print(f"{len(xlsx_files)} arquivos encontrados em {DATASET_DIR}:")

for f in xlsx_files:
    print(f"\nIniciando importação de: {os.path.basename(f)}")
    df = pd.read_excel(f, sheet_name="in", dtype=str)

    df["data_referencia"] = pd.to_datetime(df["data_referencia"], errors="coerce").dt.date
    df["feminino"] = pd.to_numeric(df["feminino"], errors="coerce")
    df["masculino"] = pd.to_numeric(df["masculino"], errors="coerce")
    df["nao_informado"] = pd.to_numeric(df["nao_informado"], errors="coerce")
    df["total_vitima"] = pd.to_numeric(df["total_vitima"], errors="coerce")
    df["total"] = pd.to_numeric(df["total"], errors="coerce")
    df["total_peso"] = pd.to_numeric(df["total_peso"], errors="coerce")

    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].fillna("").astype(str).str.strip()

    print(f"Total de linhas carregadas: {len(df)}")

    with engine.connect() as conn:
        df.to_sql(
            "sinesp",
            con=conn,
            schema="bronze",
            if_exists="append",
            index=False,
            method="multi",
            chunksize=10_000
        )

    print(f"Arquivo {os.path.basename(f)} importado com sucesso.")

print("Importação concluída!")
