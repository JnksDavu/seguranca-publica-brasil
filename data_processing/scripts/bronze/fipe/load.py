import pandas as pd
import os
import glob
from scripts.db import get_engine

engine = get_engine()

DATASET_DIR = "/home/tcc/seguranca-publica-brasil/data_processing/dataset/fipe"

csv_files = sorted(glob.glob(os.path.join(DATASET_DIR, "*.csv")))

if not csv_files:
    print(f"Nenhum arquivo CSV encontrado em {DATASET_DIR}")
    exit(1)

print(f"{len(csv_files)} arquivo(s) encontrado(s) em {DATASET_DIR}:")
for f in csv_files:
    print(f"  - {os.path.basename(f)}")

chunksize = 100_000

for csv_file in csv_files:
    print(f"\nIniciando importação de: {os.path.basename(csv_file)}")

    for i, chunk in enumerate(pd.read_csv(
        csv_file,
        sep=",",
        encoding="utf-8",
        quotechar='"',
        chunksize=chunksize,
        dtype=str
    )):
        # Limpeza e conversões
        if "Price" in chunk.columns:
            chunk["Price"] = (
                chunk["Price"]
                .str.replace("R$", "", regex=False)
                .str.replace(".", "", regex=False)
                .str.replace(",", ".", regex=False)
            )
            chunk["Price"] = pd.to_numeric(chunk["Price"], errors="coerce")

        # Conversões numéricas simples
        num_cols = ["Brand Code", "Model Code", "Year Code"]
        for col in num_cols:
            if col in chunk.columns:
                chunk[col] = pd.to_numeric(chunk[col], errors="coerce")

        with engine.connect() as conn:
            chunk.to_sql(
                "fipe",
                con=conn,
                schema="bronze",
                if_exists="append",
                index=False,
                method="multi"
            )

        print(f"Chunk {i} inserido com sucesso ({len(chunk)} linhas).")

    print(f"Arquivo {os.path.basename(csv_file)} importado com sucesso.")

print("Importação concluída com sucesso!")
