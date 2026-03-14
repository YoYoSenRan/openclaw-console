#!/bin/bash

# 数据库同步脚本
# 用途：快速同步数据库架构并填充初始数据
# 用法: ./scripts/db-sync.sh [options]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认选项
MODE="reset-seed"
VERBOSE=0

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    -m|--mode)
      MODE="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE=1
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

show_help() {
  cat << EOF
${BLUE}数据库同步脚本${NC}

用法: ./scripts/db-sync.sh [选项]

选项:
  -m, --mode MODE       同步模式 (默认: reset-seed)
                        - migrate:    生成新迁移
                        - reset:      清空并重建数据库
                        - reset-seed: 清空、重建、填充初始数据 (推荐开发用)
                        - deploy:     应用所有未执行的迁移 (生产用)

  -v, --verbose         详细输出
  -h, --help           显示此帮助信息

示例:
  ./scripts/db-sync.sh                           # 默认: 清空 + 重建 + 初始数据
  ./scripts/db-sync.sh -m migrate                # 创建新迁移
  ./scripts/db-sync.sh -m deploy                 # 部署迁移 (生产)
EOF
}

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# 验证环境
check_env() {
  if [ ! -f ".env" ]; then
    log_error "未找到 .env 文件（在项目根目录）"
    exit 1
  fi

  if ! command -v pnpm &> /dev/null; then
    log_error "未找到 pnpm，请先安装 pnpm"
    exit 1
  fi

  log_success "环境检查通过"
}

# 执行同步
sync_migrate() {
  log_info "创建新迁移..."
  pnpm db:migrate
  log_success "迁移创建完成"
}

sync_reset() {
  log_warn "即将清空数据库并重新构建所有表..."
  read -p "确认继续? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warn "已取消"
    exit 0
  fi

  log_info "清空数据库并重建..."
  pnpm db:reset
  log_success "数据库重建完成"
}

sync_reset_seed() {
  log_warn "即将清空数据库、重建表、填充初始数据..."
  read -p "确认继续? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warn "已取消"
    exit 0
  fi

  log_info "清空、重建、初始化数据库..."
  pnpm db:reset:seed
  log_success "数据库初始化完成！"
}

sync_deploy() {
  log_info "部署迁移到生产环境..."
  pnpm db:migrate:deploy
  log_success "迁移部署完成"
}

# 主流程
main() {
  log_info "数据库同步脚本 [模式: $MODE]"
  echo

  check_env
  echo

  case $MODE in
    migrate)
      sync_migrate
      ;;
    reset)
      sync_reset
      ;;
    reset-seed)
      sync_reset_seed
      ;;
    deploy)
      sync_deploy
      ;;
    *)
      log_error "未知的模式: $MODE"
      show_help
      exit 1
      ;;
  esac

  echo
  log_success "所有操作完成！"
}

main
