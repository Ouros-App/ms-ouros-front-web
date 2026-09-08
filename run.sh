#!/usr/bin/env bash
set -Eeuo pipefail

APP_PORT="${APP_PORT:-80}"
BUILD_LOG="${BUILD_LOG:-./docker-build.log}"

if docker info >/dev/null 2>&1; then
    DOCKER=(docker)
else
    DOCKER=(sudo docker)
fi

die() {
    echo "$*" >&2
    exit 1
}

source_env() {
    [[ -f .env ]] || die "Arquivo .env nao encontrado"
    set -a
    source .env
    set +a
    [[ -n "${APP_NAME:-}" ]] || die "APP_NAME nao definido no .env"
}

container_name() {
    echo "${APP_NAME}_$1"
}

image_name() {
    echo "${APP_NAME}:$1"
}

port_in_use() {
    local p="$1"
    if command -v ss >/dev/null 2>&1; then
        ss -ltn | awk '{print $4}' | grep -qE "[:.]${p}$"
    elif command -v lsof >/dev/null 2>&1; then
        lsof -i :"$p" >/dev/null 2>&1
    else
        "${DOCKER[@]}" ps --format '{{.Ports}}' | grep -q ":${p}->"
    fi
}

next_free_port() {
    local p
    for _ in {1..100}; do
        p=$((RANDOM % 50000 + 10000))
        if ! port_in_use "$p"; then
            echo "$p"
            return 0
        fi
    done
    die "Nao foi possivel encontrar porta livre"
}

container_port() {
    local n="$1"
    "${DOCKER[@]}" port "$n" "80/tcp" 2>/dev/null | head -n1 | sed -E 's/.*:([0-9]+)$/\1/'
}

next_number() {
    local n=1
    while "${DOCKER[@]}" ps -a --format '{{.Names}}' | grep -qx "${APP_NAME}_${n}"; do
        n=$((n + 1))
    done
    echo "$n"
}

container_exists() {
    local n="$1"
    "${DOCKER[@]}" ps -a --format '{{.Names}}' | grep -qx "$n"
}

build_image() {
    local img="$1"
    if ! "${DOCKER[@]}" build --pull --no-cache --build-arg APP_PORT=80 -t "$img" . > "$BUILD_LOG" 2>&1; then
        tail -40 "$BUILD_LOG"
        exit 1
    fi
}

remove_container() {
    local n="$1"
    if container_exists "$n"; then
        "${DOCKER[@]}" rm -f "$n" >/dev/null
    fi
}

run_container() {
    local n="$1"
    local img="$2"
    local hp="$3"
    "${DOCKER[@]}" run -d \
        --name "$n" \
        --restart unless-stopped \
        --env-file .env \
        -p "${hp}:80" \
        "$img" >/dev/null
    echo "http://localhost:$hp"
}

mode_new() {
    source_env
    local num name img hp
    num="$(next_number)"
    name="$(container_name "$num")"
    img="$(image_name "$num")"
    hp="$(next_free_port)"
    build_image "$img"
    run_container "$name" "$img" "$hp"
}

mode_reboot() {
    local num="$1"
    source_env
    local name img hp
    name="$(container_name "$num")"
    img="$(image_name "$num")"
    hp="$(container_port "$name" || true)"
    [[ -n "${hp:-}" ]] || hp="$(next_free_port)"
    remove_container "$name"
    "${DOCKER[@]}" rmi -f "$img" >/dev/null 2>&1 || true
    build_image "$img"
    run_container "$name" "$img" "$hp"
}

mode_remove() {
    local num="$1"
    source_env
    local name img
    name="$(container_name "$num")"
    img="$(image_name "$num")"
    remove_container "$name"
    "${DOCKER[@]}" rmi -f "$img" >/dev/null 2>&1 || true
}

mode_list() {
    source_env
    "${DOCKER[@]}" ps -a \
        --filter "name=^/${APP_NAME}_[0-9]+$" \
        --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}'
}

case "${1:-}" in
    "")
        mode_new
        ;;
    --reboot)
        [[ "${2:-}" =~ ^[0-9]+$ ]] || die "Uso: $0 --reboot NUMERO"
        mode_reboot "$2"
        ;;
    --remove)
        [[ "${2:-}" =~ ^[0-9]+$ ]] || die "Uso: $0 --remove NUMERO"
        mode_remove "$2"
        ;;
    --list)
        mode_list
        ;;
    *)
        die "Uso: $0 [--reboot N | --remove N | --list]"
        ;;
esac
