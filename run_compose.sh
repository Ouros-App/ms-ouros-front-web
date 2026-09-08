#!/usr/bin/env bash
set -Eeuo pipefail

color_echo() {
    local c="$1"
    local m="$2"
    case "$c" in
        green) echo -e "\033[0;32m$m\033[0m" ;;
        red) echo -e "\033[0;31m$m\033[0m" ;;
        yellow) echo -e "\033[1;33m$m\033[0m" ;;
        blue) echo -e "\033[0;34m$m\033[0m" ;;
        *) echo "$m" ;;
    esac
}

detect_compose() {
    if docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD=(docker compose)
    elif command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_CMD=(docker-compose)
    else
        color_echo red "Docker Compose nao encontrado"
        exit 1
    fi
}

load_env() {
    [[ -f .env ]] || { color_echo red "Arquivo .env nao encontrado"; exit 1; }
    set -a
    source .env
    set +a
    [[ -n "${APP_NAME:-}" ]] || { color_echo red "APP_NAME nao definido"; exit 1; }
}

next_port() {
    local p=$((RANDOM % 50000 + 10000))
    while lsof -i :"$p" >/dev/null 2>&1; do
        p=$((RANDOM % 50000 + 10000))
    done
    echo "$p"
}

compose_file() {
    local n="$1"
    local p="$2"
    cat <<EOF
services:
  web:
    build:
      context: .
    image: ${APP_NAME}_${n}:latest
    container_name: ${APP_NAME}_${n}
    env_file:
      - .env
    ports:
      - "${p}:80"
    restart: unless-stopped
EOF
}

up_new() {
    load_env
    local n=1
    while docker ps -a --format '{{.Names}}' | grep -q "^${APP_NAME}_${n}$"; do
        n=$((n + 1))
    done
    local p
    p="$(next_port)"
    local f="docker-compose.${n}.yml"
    compose_file "$n" "$p" > "$f"
    "${COMPOSE_CMD[@]}" -f "$f" build --no-cache --pull
    "${COMPOSE_CMD[@]}" -f "$f" up -d
    color_echo green "Aplicacao disponivel em http://localhost:$p"
}

rebuild_one() {
    local n="$1"
    load_env
    local name="${APP_NAME}_${n}"
    local p
    p="$(docker port "$name" 80 2>/dev/null | sed -E 's/.*:([0-9]+)$/\1/' | head -n1)"
    [[ -n "${p:-}" ]] || p="$(next_port)"
    local f="docker-compose.${n}.yml"
    compose_file "$n" "$p" > "$f"
    "${COMPOSE_CMD[@]}" -f "$f" down --remove-orphans >/dev/null 2>&1 || true
    "${COMPOSE_CMD[@]}" -f "$f" build --no-cache --pull
    "${COMPOSE_CMD[@]}" -f "$f" up -d
    color_echo green "Aplicacao disponivel em http://localhost:$p"
}

detect_compose

case "${1:-}" in
    "")
        up_new
        ;;
    --rebuild|--reboot)
        [[ "${2:-}" =~ ^[0-9]+$ ]] || { color_echo red "Uso: $0 --rebuild NUMERO"; exit 1; }
        rebuild_one "$2"
        ;;
    *)
        color_echo red "Uso: $0 [--rebuild NUMERO]"
        exit 1
        ;;
esac
