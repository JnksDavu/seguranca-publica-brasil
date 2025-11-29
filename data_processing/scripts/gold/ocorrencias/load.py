import os
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from scripts.db import get_engine

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

SQL_FILES = [
    os.path.join(BASE_DIR, "queries", "gold", "analytics_ocorrencias.sql"),
]

engine = get_engine()

try:
    with engine.begin() as conn:
        conn.execute(text(
            "LOCK TABLE gold.analytics_ocorrencias IN ACCESS EXCLUSIVE MODE NOWAIT;"
        ))
except OperationalError:
    print("Já existe pipeline rodando. Abortando.")
    exit(1)

print("Lock obtido. Executando pipelines SQL...")

raw_conn = engine.raw_connection()
cur = raw_conn.cursor()

try:
    for sql_path in SQL_FILES:
        print(f"Executando script: {sql_path}")
        with open(sql_path, "r", encoding="utf-8") as f:
            sql_script = f.read()
        cur.execute(sql_script)

    raw_conn.commit()
    print("Todas as tabelas gold foram atualizadas com sucesso!")

finally:
    cur.close()
    raw_conn.close()
