set -e

PROJECT_DIR=$(dirname "$0") 
VENV_DIR="$PROJECT_DIR/venv"
PYTHON_SCRIPT_PATH="$PROJECT_DIR/data_processing/scripts/bronze/prf/load.py"
REQUIREMENTS_PATH="$PROJECT_DIR/data_processing/requirements.txt"

cd "$PROJECT_DIR"

echo "Iniciando pipeline de dados..."

# --- Lógica do Ambiente Virtual ---
if [ ! -d "$VENV_DIR" ]; then
    echo "Ambiente virtual '$VENV_DIR' não encontrado. Criando..."
    python3 -m venv "$VENV_DIR"
    echo "Ambiente criado. Instalando dependências de '$REQUIREMENTS_PATH'..."
    
    # Ativa o venv temporariamente para instalar as dependências
    source "$VENV_DIR/bin/activate"
    pip install -r "$REQUIREMENTS_PATH"
    deactivate
    echo "Dependências instaladas."
else
    echo "Ambiente virtual já existente."
fi

# --- Execução do Script Python ---
echo "Ativando ambiente virtual para execução..."
source "$VENV_DIR/bin/activate"

echo "Executando script Python: $PYTHON_SCRIPT_PATH"
python "$PYTHON_SCRIPT_PATH" "$@"

deactivate

echo "Execução do pipeline finalizada com sucesso!"