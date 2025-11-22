import os
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from scripts.db import get_engine

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
SQL_PATH = os.path.join(BASE_DIR, "queries", "gold", "analytics_rodovias.sql")

with open(SQL_PATH, "r", encoding="utf-8") as f:
    sql_script = f.read()

engine = get_engine()

try:
    with engine.begin() as conn:
        conn.execute(text(
            "LOCK TABLE gold.analytics_rodovias IN ACCESS EXCLUSIVE MODE NOWAIT;"
        ))
except OperationalError:
    print("Já existe uma pipeline rodando. Abortando.")
    exit(1)

print("Lock obtido. Executando pipeline...")

with engine.connect() as conn:
    conn.exec_driver_sql(sql_script)

print("✅ Tabela gold.analytics_rodovias atualizada com sucesso!")
