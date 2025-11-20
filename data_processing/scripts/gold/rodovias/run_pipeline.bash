set -e

PROJECT_DIR="$(dirname "$(realpath "$0")")"

VENV_DIR="$(realpath "$PROJECT_DIR/../../../venv")"

MODULE="rodovias"
PYTHON_SCRIPT_PATH="scripts.gold."$MODULE".load"
REQUIREMENTS_PATH="$(realpath "$PROJECT_DIR/../../../requirements.txt")"


echo "Iniciando pipeline de dados..."
echo "Diretório do projeto: $PROJECT_DIR"
echo "Diretório do ambiente virtual: $VENV_DIR"

if [ ! -d "$VENV_DIR" ]; then
    echo "Ambiente virtual '$VENV_DIR' não encontrado. Criando..."
    python3 -m venv "$VENV_DIR"

    source "$VENV_DIR/bin/activate"
    python -m pip install --upgrade pip wheel setuptools
    pip install -r "$REQUIREMENTS_PATH"
    deactivate
    echo "Ambiente virtual criado e dependências instaladas."
else
    echo "Ambiente virtual já existente. Verificando dependências..."
    source "$VENV_DIR/bin/activate"
    pip install -r "$REQUIREMENTS_PATH" --upgrade --quiet
    deactivate
fi

echo "Ativando ambiente virtual para execução..."
source "$VENV_DIR/bin/activate"

echo "Executando script Python: $PYTHON_SCRIPT_PATH"
cd "$PROJECT_DIR/../../.."
python -m "$PYTHON_SCRIPT_PATH" "$@"

deactivate

echo "Execução do pipeline finalizada com sucesso!"