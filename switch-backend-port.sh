#!/bin/bash

# WAG Backend 포트 전환 스크립트
# Usage: ./switch-backend-port.sh [18080|18081]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NGINX_CONFIG="/etc/nginx/sites-available/default"

# 매개변수 확인
if [ -z "$1" ]; then
    echo -e "${RED}❌ 오류: 포트 번호를 지정해주세요.${NC}"
    echo "Usage: $0 [18080|18081]"
    exit 1
fi

PORT=$1

if [ "$PORT" != "18080" ] && [ "$PORT" != "18081" ]; then
    echo -e "${RED}❌ 오류: 포트는 18080 또는 18081만 가능합니다.${NC}"
    echo "Usage: $0 [18080|18081]"
    exit 1
fi

# 현재 포트 확인
CURRENT_PORT=$(grep -B 5 -A 15 "server_name wwwag-backend.co.kr" "$NGINX_CONFIG" | grep "proxy_pass" | grep -oP "localhost:\K[0-9]+" | head -1 || echo "")

echo -e "${YELLOW}현재 백엔드 포트: ${CURRENT_PORT:-알 수 없음}${NC}"
echo -e "${YELLOW}변경할 백엔드 포트: $PORT${NC}"

if [ "$CURRENT_PORT" = "$PORT" ]; then
    echo -e "${GREEN}✅ 이미 포트 $PORT로 설정되어 있습니다.${NC}"
    exit 0
fi

# 백업 생성
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}📋 설정 파일 백업 중: $BACKUP_FILE${NC}"
cp "$NGINX_CONFIG" "$BACKUP_FILE"

# 포트 변경 (wwwag-backend.co.kr 서버 블록 내의 proxy_pass만 변경)
echo -e "${YELLOW}🔧 포트 변경 중...${NC}"
# 기존 포트(18080 또는 18081)를 새 포트($PORT)로 변경
# wwwag-backend.co.kr 서버 블록 내의 모든 proxy_pass 변경
sed -i "/server_name wwwag-backend\.co\.kr/,/^\s*listen 443 ssl/s|proxy_pass http://localhost:18080|proxy_pass http://localhost:$PORT|g" "$NGINX_CONFIG"
sed -i "/server_name wwwag-backend\.co\.kr/,/^\s*listen 443 ssl/s|proxy_pass http://localhost:18081|proxy_pass http://localhost:$PORT|g" "$NGINX_CONFIG"

# 변경 확인
UPDATED_PORT=$(grep -B 5 -A 15 "server_name wwwag-backend.co.kr" "$NGINX_CONFIG" | grep "proxy_pass" | grep -oP "localhost:\K[0-9]+" | head -1 || echo "")

if [ "$UPDATED_PORT" != "$PORT" ]; then
    echo -e "${RED}❌ 포트 변경 실패!${NC}"
    echo -e "${YELLOW}백업에서 복원: cp $BACKUP_FILE $NGINX_CONFIG${NC}"
    exit 1
fi

# Nginx 설정 테스트
echo -e "${YELLOW}🔍 Nginx 설정 테스트 중...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx 설정이 올바릅니다.${NC}"
    
    # Nginx reload
    echo -e "${YELLOW}🔄 Nginx 재시작 중...${NC}"
    # Jenkins 컨테이너에서 실행 중인 경우 호스트의 systemctl 사용
    if [ -f "/.dockerenv" ]; then
        # Docker 컨테이너 내부인 경우 - 호스트 systemd 접근
        if nsenter --target 1 --mount --uts --ipc --net --pid -- systemctl reload nginx 2>/dev/null; then
            echo "Reloaded via nsenter"
        elif systemctl reload nginx 2>/dev/null; then
            echo "Reloaded via systemctl"
        elif nginx -s reload 2>/dev/null; then
            echo "Reloaded via nginx -s reload"
        else
            false
        fi
    else
        # 호스트에서 직접 실행인 경우
        systemctl reload nginx || nginx -s reload
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 성공적으로 포트를 $PORT로 변경했습니다!${NC}"
        echo ""
        echo -e "${GREEN}📋 변경 사항:${NC}"
        echo "   Backend 포트: $CURRENT_PORT → $PORT"
        echo "   백업 파일: $BACKUP_FILE"
        echo ""
        echo -e "${YELLOW}💡 참고:${NC}"
        echo "   현재 실행 중인 컨테이너를 확인하세요:"
        echo "   docker ps | grep wag-server"
    else
        echo -e "${RED}❌ Nginx reload 실패!${NC}"
        echo -e "${YELLOW}백업에서 복원: cp $BACKUP_FILE $NGINX_CONFIG${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Nginx 설정 오류!${NC}"
    echo -e "${YELLOW}백업에서 복원: cp $BACKUP_FILE $NGINX_CONFIG${NC}"
    exit 1
fi

