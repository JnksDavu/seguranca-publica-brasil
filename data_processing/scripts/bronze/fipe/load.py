import requests
import pandas as pd
import time
import random
from scripts.db import get_engine
from sqlalchemy import text

engine = get_engine()

# Criação da tabela, se necessário
create_table_sql = """
delete from bronze.fipe_veiculos;

CREATE TABLE IF NOT EXISTS bronze.fipe_veiculos (
    tipo_veiculo VARCHAR(20),
    codigo_marca VARCHAR(10),
    marca VARCHAR(100),
    codigo_modelo VARCHAR(10),
    modelo VARCHAR(200),
    codigo_ano VARCHAR(20),
    ano_modelo INT,
    combustivel VARCHAR(50),
    sigla_combustivel VARCHAR(5),
    valor NUMERIC(12,2),
    mes_referencia VARCHAR(50),
    codigo_fipe VARCHAR(20)
);
"""

with engine.connect() as conn:
    conn.execute(text(create_table_sql))
    conn.commit()

# Token de autenticação (Bearer)
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZmQxMmYzNC1lYjliLTQ1MjgtYTFjMi1jOGI0MmUwYjZkYzYiLCJlbWFpbCI6ImRhdmlhbmRyZS5qdW5rZXNAZ21haWwuY29tIiwic3RyaXBlU3Vic2NyaXB0aW9uSWQiOiJzdWJfMVNQNDhDQ1N2SXMwOHRJRTRsdWp4eDc1IiwiaWF0IjoxNzYyMTAwODc4fQ.FgQroq71jpmv481l5n3bRWZqzAlI5m35TC3qfbNQAXI"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}"
}

# Função auxiliar para converter valor monetário
def parse_valor(valor_str):
    return float(valor_str.replace("R$", "").replace(".", "").replace(",", ".").strip())

base_url = "https://parallelum.com.br/fipe/api/v1"
tipos = ["carros", "motos", "caminhoes"]
batch = []

for tipo in tipos:
    url_marcas = f"{base_url}/{tipo}/marcas"
    resp_marcas = requests.get(url_marcas, headers=HEADERS)
    try:
        marcas = resp_marcas.json()
    except Exception:
        print(f"[ERRO] Falha ao decodificar JSON de {url_marcas}: {resp_marcas.text[:200]}")
        continue

    if not isinstance(marcas, list):
        print(f"[ERRO] Resposta inesperada em {url_marcas}: {marcas}")
        continue

    for marca in marcas:
        if not isinstance(marca, dict) or "codigo" not in marca:
            print(f"[AVISO] Formato inesperado de marca em {tipo}: {marca}")
            continue

        cod_marca = marca["codigo"]
        nome_marca = marca["nome"]

        url_modelos = f"{base_url}/{tipo}/marcas/{cod_marca}/modelos"
        resp_modelos = requests.get(url_modelos, headers=HEADERS)
        modelos_resp = resp_modelos.json()

        modelos = modelos_resp.get("modelos", [])
        if not isinstance(modelos, list):
            print(f"[AVISO] Nenhum modelo válido para {nome_marca}")
            continue

        for modelo in modelos:
            cod_modelo = modelo.get("codigo")
            nome_modelo = modelo.get("nome")

            url_anos = f"{base_url}/{tipo}/marcas/{cod_marca}/modelos/{cod_modelo}/anos"
            resp_anos = requests.get(url_anos, headers=HEADERS)
            anos = resp_anos.json()

            if not isinstance(anos, list):
                print(f"[AVISO] Nenhum ano válido para {nome_modelo} ({nome_marca})")
                continue

            for ano in anos:
                if not isinstance(ano, dict) or "codigo" not in ano:
                    continue

                cod_ano = ano["codigo"]

                url_valor = f"{base_url}/{tipo}/marcas/{cod_marca}/modelos/{cod_modelo}/anos/{cod_ano}"
                resp_valor = requests.get(url_valor, headers=HEADERS)
                valor_resp = resp_valor.json()

                try:
                    valor = parse_valor(valor_resp["Valor"])
                except Exception:
                    valor = None

                batch.append({
                    "tipo_veiculo": tipo,
                    "codigo_marca": cod_marca,
                    "marca": valor_resp.get("Marca"),
                    "codigo_modelo": cod_modelo,
                    "modelo": valor_resp.get("Modelo"),
                    "codigo_ano": cod_ano,
                    "ano_modelo": valor_resp.get("AnoModelo"),
                    "combustivel": valor_resp.get("Combustivel"),
                    "sigla_combustivel": valor_resp.get("SiglaCombustivel"),
                    "valor": valor,
                    "mes_referencia": valor_resp.get("MesReferencia"),
                    "codigo_fipe": valor_resp.get("CodigoFipe")
                })

                if len(batch) >= 100:
                    df = pd.DataFrame(batch)
                    with engine.connect() as conn:
                        df.to_sql(
                            "fipe_veiculos",
                            con=conn,
                            schema="bronze",
                            if_exists="append",
                            index=False,
                            method="multi"
                        )
                    print(f"[INFO] Inseridos {len(df)} registros em bronze.fipe_veiculos")
                    batch.clear()

                time.sleep(random.uniform(0.2, 0.5))

# Inserir restante do batch
if batch:
    df = pd.DataFrame(batch)
    with engine.connect() as conn:
        df.to_sql(
            "fipe_veiculos",
            con=conn,
            schema="bronze",
            if_exists="append",
            index=False,
            method="multi"
        )
    print(f"[INFO] Inseridos {len(df)} registros finais em bronze.fipe_veiculos")

print("✅ Extração e carga concluídas com sucesso.")
