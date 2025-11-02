#!/usr/bin/env bash
set -Eeuo pipefail

# DEBUG (comente se ficar verboso)
# set -x

SCRIPT_DIR="$(dirname "$(realpath "$0")")"
PROJECT_ROOT="$(realpath "$SCRIPT_DIR/../../../")"
VENV_DIR="$PROJECT_ROOT/venv"
REQUIREMENTS_PATH="$PROJECT_ROOT/requirements.txt"
PY_MODULE="scripts.bronze.prf.load"   # ajuste aqui para o seu módulo real

echo "[pipeline] root: $PROJECT_ROOT"
echo "[pipeline] venv: $VENV_DIR"
echo "[pipeline] module: $PY_MODULE"

# (Opcional) Exigir variáveis de ambiente críticas para a conexão
REQUIRED_VARS=(DB_HOST DB_PORT DB_USER DB_NAME)  # ajuste a sua lista
for v in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "[erro] Variável de ambiente '$v' não definida." >&2
    exit 2
  fi
done

# Log rápido do alvo (sem segredos)
echo "[check] Destino de conexão: ${DB_HOST}:${DB_PORT}"

# Criar/atualizar venv
if [[ ! -d "$VENV_DIR" ]]; then
  python3 -m venv "$VENV_DIR"
  source "$VENV_DIR/bin/activate"
  python -m pip install --upgrade pip wheel setuptools
  python -m pip install -r "$REQUIREMENTS_PATH"
  deactivate
else
  source "$VENV_DIR/bin/activate"
  python -m pip install -r "$REQUIREMENTS_PATH" --upgrade --quiet
  deactivate
fi

# Sanity check de rede (se tiver nc/curl disponíveis no contêiner)
if command -v nc >/dev/null 2>&1; then
  echo "[net] Testando TCP ${DB_HOST}:${DB_PORT} ..."
  if ! nc -z -w 5 "$DB_HOST" "$DB_PORT"; then
    echo "[erro] Não consegui alcançar ${DB_HOST}:${DB_PORT} a partir deste ambiente." >&2
    exit 3
  fi
fi

# Executa o módulo
set +e
source "$VENV_DIR/bin/activate"
export PYTHONPATH="$PROJECT_ROOT:${PYTHONPATH:-}"
cd "$PROJECT_ROOT"

echo "[run] python -m $PY_MODULE $*"
python -m "$PY_MODULE" "$@"
PY_EXIT=$?
deactivate
set -e

if [[ $PY_EXIT -ne 0 ]]; then
  echo "[erro] Execução Python retornou código $PY_EXIT." >&2
  exit $PY_EXIT
fi

echo "[ok] Pipeline finalizado com sucesso."
