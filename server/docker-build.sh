#!/bin/bash

# 로컬 Docker 빌드 및 실행 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🐳 WAG Backend Docker 빌드 & 실행${NC}"
echo -e "${GREEN}========================================${NC}"

# 이미지 이름 및 태그
IMAGE_NAME="wag-server"
IMAGE_TAG="local"

# 기존 컨테이너 중지 및 제거
echo -e "\n${YELLOW}🧹 기존 컨테이너 정리...${NC}"
docker stop ${IMAGE_NAME}-local 2>/dev/null || true
docker rm ${IMAGE_NAME}-local 2>/dev/null || true

# Docker 이미지 빌드 (x86_64 플랫폼)
echo -e "\n${YELLOW}🔨 Docker 이미지 빌드 중 (x86_64)...${NC}"
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${IMAGE_TAG} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 이미지 빌드 성공!${NC}"
else
    echo -e "${RED}❌ 이미지 빌드 실패!${NC}"
    exit 1
fi

# Docker 컨테이너 실행
echo -e "\n${YELLOW}🚀 컨테이너 실행 중...${NC}"
docker run -d \
    --name ${IMAGE_NAME}-local \
    -p 8080:8080 \
    --restart unless-stopped \
    ${IMAGE_NAME}:${IMAGE_TAG}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 컨테이너 실행 성공!${NC}"
    echo -e "\n${GREEN}📋 컨테이너 정보:${NC}"
    docker ps | grep ${IMAGE_NAME}-local
    
    echo -e "\n${GREEN}🌐 애플리케이션 접속:${NC}"
    echo "   http://localhost:8080"
    echo "   Health Check: http://localhost:8080/actuator/health"
    
    echo -e "\n${YELLOW}📜 로그 확인:${NC}"
    echo "   docker logs -f ${IMAGE_NAME}-local"
    
    echo -e "\n${YELLOW}🛑 컨테이너 중지:${NC}"
    echo "   docker stop ${IMAGE_NAME}-local"
else
    echo -e "${RED}❌ 컨테이너 실행 실패!${NC}"
    exit 1
fi

