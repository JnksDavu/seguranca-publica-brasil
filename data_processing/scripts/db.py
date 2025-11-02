from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

def get_engine():
    # Carregar variáveis de ambiente
    load_dotenv()

    USER = os.getenv("USER_DB")
    PASSWORD = os.getenv("PASSWORD_DB")
    HOST = os.getenv("HOST_DB")
    PORT = os.getenv("PORT_DB")
    DB = os.getenv("DB")
    engine = create_engine(f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB}", future=True)

    return engine
