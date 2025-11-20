import os
from scripts.db import get_engine
from sqlalchemy import text

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
SQL_PATH = os.path.join(BASE_DIR, "queries", "gold", "analytics_rodovias.sql")

with open(SQL_PATH, "r", encoding="utf-8") as f:
    sql_script = f.read()

engine = get_engine()

with engine.begin() as conn:
    statements = [s.strip() for s in sql_script.split(";") if s.strip()]
    for s in statements:
        conn.execute(text(s + ";"))

print("Tabela gold.analytics_rodovias atualizada com sucesso!")
