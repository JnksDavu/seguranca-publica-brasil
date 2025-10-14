#!/usr/bin/env bash
set -e

# Caminho base do projeto (pasta onde o script está)
PROJECT_DIR="$(dirname "$(realpath "$0")")"

# Caminho do venv três pastas acima
VENV_DIR="$(realpath "$PROJECT_DIR/../../../venv")"

# Caminhos dos scripts e requirements
PYTHON_SCRIPT_PATH="$PROJECT_DIR/load.py"
REQUIREMENTS_PATH="$(realpath "$PROJECT_DIR/../../../requirements.txt")"

echo "Iniciando pipeline de dados..."
echo "Diretório do projeto: $PROJECT_DIR"
echo "Diretório do ambiente virtual: $VENV_DIR"

# --- Criação do ambiente virtual ---
if [ ! -d "$VENV_DIR" ]; then
    echo "Ambiente virtual '$VENV_DIR' não encontrado. Criando..."
    python3 -m venv "$VENV_DIR"

    # Garante que o pip esteja atualizado
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

# --- Execução do Script Python ---
echo "Ativando ambiente virtual para execução..."
source "$VENV_DIR/bin/activate"

echo "Executando script Python: $PYTHON_SCRIPT_PATH"
python "$PYTHON_SCRIPT_PATH" "$@"

deactivate

echo "Execução do pipeline finalizada com sucesso!"

