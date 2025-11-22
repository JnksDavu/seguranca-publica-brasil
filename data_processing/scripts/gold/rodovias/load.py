import os
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from scripts.db import get_engine

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
SQL_PATH = os.path.join(BASE_DIR, "queries", "gold", "analytics_rodovias.sql")

with open(SQL_PATH, "r", encoding="utf-8") as f:
    sql_script = f.read()

engine = get_engine()

# Lock para evitar execuções simultâneas
try:
    with engine.begin() as conn:
        conn.execute(
            text("LOCK TABLE gold.analytics_rodovias IN ACCESS EXCLUSIVE MODE NOWAIT;")
        )
except OperationalError:
    print("Já existe pipeline rodando. Abortando.")
    exit(1)

print("Lock obtido. Executando pipeline...")

# Executa SQL via psycopg2 raw connection (aceita múltiplos statements)
raw_conn = engine.raw_connection()
cur = raw_conn.cursor()

try:
    cur.execute(sql_script)
    raw_conn.commit()
finally:
    cur.close()
    raw_conn.close()

print("Tabela gold.analytics_rodovias atualizada com sucesso!")
