import re
import requests
import pandas as pd
from scripts.db import get_engine
from sqlalchemy import text

engine = get_engine()

DDL = """
delete from bronze.ibge_populacao;

CREATE TABLE IF NOT EXISTS bronze.ibge_populacao (
    ano INT,
    cod_municipio VARCHAR(10),
    municipio VARCHAR(150),
    cod_uf VARCHAR(2),
    uf VARCHAR(100),
    populacao_total BIGINT
);

ALTER TABLE bronze.ibge_populacao
    ADD COLUMN IF NOT EXISTS ano INT,
    ADD COLUMN IF NOT EXISTS cod_municipio VARCHAR(10),
    ADD COLUMN IF NOT EXISTS municipio VARCHAR(150),
    ADD COLUMN IF NOT EXISTS cod_uf VARCHAR(2),
    ADD COLUMN IF NOT EXISTS uf VARCHAR(100),
    ADD COLUMN IF NOT EXISTS populacao_total BIGINT;
"""
with engine.connect() as conn:
    conn.execute(text(DDL))
    conn.commit()

UF_NOME = {
    "11": "Rondônia", "12": "Acre", "13": "Amazonas", "14": "Roraima",
    "15": "Pará", "16": "Amapá", "17": "Tocantins", "21": "Maranhão",
    "22": "Piauí", "23": "Ceará", "24": "Rio Grande do Norte", "25": "Paraíba",
    "26": "Pernambuco", "27": "Alagoas", "28": "Sergipe", "29": "Bahia",
    "31": "Minas Gerais", "32": "Espírito Santo", "33": "Rio de Janeiro",
    "35": "São Paulo", "41": "Paraná", "42": "Santa Catarina",
    "43": "Rio Grande do Sul", "50": "Mato Grosso do Sul",
    "51": "Mato Grosso", "52": "Goiás", "53": "Distrito Federal"
}

SUFIXO_UF_REGEX = re.compile(r"\s*-\s*[A-Z]{2}$")

def sanitize_municipio(nome: str) -> str:
    return SUFIXO_UF_REGEX.sub("", nome).strip()

BASE = "https://apisidra.ibge.gov.br/values"
TAB_EST = "6579"   # Estimativas de População
VAR_EST = "9324"   # População residente estimada (Pessoas)
TAB_CENSO = "9514" # População residente - Censo 2022
VAR_CENSO = "93"

def fetch_estimada_municipio(anos):
    periodos = ",".join(anos)
    url = f"{BASE}/t/{TAB_EST}/n6/all/v/{VAR_EST}/p/{periodos}?format=json"
    r = requests.get(url, timeout=180)
    r.raise_for_status()
    data = r.json()

    rows = []
    for row in data[1:]:
        cod_mun = str(row["D1C"])
        nome_mun = sanitize_municipio(row["D1N"])
        ano = int(row["D3C"])
        v = row["V"]
        if not v or v == "...":
            continue
        pop = int(float(v.replace(",", ".")))
        cod_uf = cod_mun[:2]
        rows.append({
            "ano": ano,
            "cod_municipio": cod_mun,
            "municipio": nome_mun,
            "cod_uf": cod_uf,
            "uf": UF_NOME.get(cod_uf),
            "populacao_total": pop
        })
    df = pd.DataFrame(rows)
    if not df.empty:
        df["cod_municipio"] = df["cod_municipio"].astype(str)
        df["cod_uf"] = df["cod_uf"].astype(str)
    return df

def fetch_censo_2022():
    url = f"{BASE}/t/{TAB_CENSO}/n6/all/v/{VAR_CENSO}/p/2022?format=json"
    r = requests.get(url, timeout=180)
    r.raise_for_status()
    data = r.json()

    rows = []
    for row in data[1:]:
        cod_mun = str(row["D1C"])
        nome_mun = sanitize_municipio(row["D1N"])
        v = row["V"]
        if not v or v == "...":
            continue
        pop = int(v)
        cod_uf = cod_mun[:2]
        rows.append({
            "ano": 2022,
            "cod_municipio": cod_mun,
            "municipio": nome_mun,
            "cod_uf": cod_uf,
            "uf": UF_NOME.get(cod_uf),
            "populacao_total": pop
        })
    df = pd.DataFrame(rows)
    if not df.empty:
        df["cod_municipio"] = df["cod_municipio"].astype(str)
        df["cod_uf"] = df["cod_uf"].astype(str)
    return df

def build_with_fallback():
    # 1) tenta pegar 2023–2025
    print("[INFO] Coletando estimativas (6579/9324) 2023–2025...")
    df_23_25 = fetch_estimada_municipio(["2023","2024","2025"])

    tem_2023 = (not df_23_25.empty) and (df_23_25["ano"].eq(2023).any())

    if tem_2023:
        return df_23_25

    # 2) sem 2023: pega 2024 e 2025 + Censo 2022 e interpola 2023
    df_24_25 = fetch_estimada_municipio(["2024","2025"])
    df_22 = fetch_censo_2022()

    # Índices para juntar por município
    df_22_key = df_22[["cod_municipio","municipio","cod_uf","uf","populacao_total"]].rename(
        columns={"populacao_total":"pop_2022"}
    )
    df_24 = df_24_25[df_24_25["ano"]==2024][["cod_municipio","populacao_total"]].rename(
        columns={"populacao_total":"pop_2024"}
    )

    base = df_22_key.merge(df_24, on="cod_municipio", how="left")

    # Interpola 2023 quando houver 2024; senão, carrega 2022
    def calc_2023(row):
        if pd.notnull(row.get("pop_2024")):
            return int(round(row["pop_2022"] + (row["pop_2024"] - row["pop_2022"]) / 2.0))
        return int(row["pop_2022"])

    base["pop_2023"] = base.apply(calc_2023, axis=1)

    df_2023 = base[["cod_municipio","municipio","cod_uf","uf","pop_2023"]].rename(
        columns={"pop_2023":"populacao_total"}
    )
    df_2023["ano"] = 2023

    # Junta: 2023 interpolado + 2024/2025 oficiais
    df = pd.concat([df_2023, df_24_25], ignore_index=True)
    df["cod_municipio"] = df["cod_municipio"].astype(str)
    df["cod_uf"] = df["cod_uf"].astype(str)

    df = df[["ano","cod_municipio","municipio","cod_uf","uf","populacao_total"]].drop_duplicates()
    return df

def save_to_db(df: pd.DataFrame):
    if df.empty:
        print("[AVISO] DataFrame vazio — nada a inserir.")
        return
    with engine.connect() as conn:
        df.to_sql(
            "ibge_populacao",
            con=conn,
            schema="bronze",
            if_exists="append",
            index=False,
            method="multi",
            chunksize=5000,
        )
    print(f"[INFO] Inseridos {len(df)} registros em bronze.ibge_populacao")

if __name__ == "__main__":
    df = build_with_fallback()
    df = df[["ano","cod_municipio","municipio","cod_uf","uf","populacao_total"]].drop_duplicates()
    df = df.sort_values(["ano","cod_municipio"])
    save_to_db(df)
    print("✅ Extração e carga concluídas (2023 interpolado se ausente; 2024–2025 oficiais).")
