#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(dirname "$(realpath "$0")")"

PROJECT_ROOT="$(realpath "$SCRIPT_DIR/../../../")"
VENV_DIR="$PROJECT_ROOT/venv"
REQUIREMENTS_PATH="$PROJECT_ROOT/requirements.txt"

PY_MODULE="scripts.bronze.fipe.load"

echo "Iniciando pipeline de dados..."
echo "Project root: $PROJECT_ROOT"
echo "Ambiente virtual: $VENV_DIR"
echo "Módulo Python: $PY_MODULE"

if [ ! -f "$PROJECT_ROOT/scripts/bronze/fipe/load.py" ]; then
  echo "ERRO: arquivo '$PROJECT_ROOT/scripts/bronze/fipe/load.py' não encontrado."
  echo "Verifique a estrutura de pacotes (scripts/bronze/fipe/load.py) e tente novamente."
  exit 1
fi

if [ ! -d "$VENV_DIR" ]; then
  echo "Ambiente virtual não encontrado. Criando em '$VENV_DIR'..."
  python3 -m venv "$VENV_DIR"
  source "$VENV_DIR/bin/activate"
  python -m pip install --upgrade pip wheel setuptools
  python -m pip install -r "$REQUIREMENTS_PATH"
  deactivate
  echo "Ambiente virtual criado e dependências instaladas."
else
  echo "Ambiente virtual existente. Verificando/atualizando dependências..."
  source "$VENV_DIR/bin/activate"
  python -m pip install -r "$REQUIREMENTS_PATH" --upgrade --quiet
  deactivate
fi

echo "Ativando ambiente virtual para execução..."
source "$VENV_DIR/bin/activate"

export PYTHONPATH="$PROJECT_ROOT:${PYTHONPATH:-}"

cd "$PROJECT_ROOT"

echo "Executando módulo: python -m $PY_MODULE $*"
python -m "$PY_MODULE" "$@"

deactivate
echo "Execução do pipeline finalizada com sucesso!"
