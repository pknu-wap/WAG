# WAG Backend Deployment Guide

## 📋 Overview

이 가이드는 Blue-Green 무중단 배포 시스템의 Nginx 프록시 설정 방법을 설명합니다.

## 🏗️ Architecture

```
사용자 요청
    ↓
Nginx (Port 5000)
    ↓ proxy_pass
Blue (18080) 또는 Green (18081)
```

## 🚀 Quick Start

### 1. Nginx 설정 및 권한 설정

서버에서 다음 명령어를 실행합니다:

```bash
cd /path/to/WAG/server
chmod +x setup-nginx.sh
./setup-nginx.sh
```

이 스크립트는 다음을 자동으로 수행합니다:
- Nginx 설치 (필요한 경우)
- 백엔드 프록시 설정 파일 복사
- Jenkins 사용자에게 Nginx 제어 권한 부여
- Nginx 시작 및 활성화

### 2. 수동 설정 (선택사항)

자동 스크립트를 사용하지 않는 경우:

#### Step 1: Nginx 설정 파일 복사

```bash
sudo cp nginx-backend.conf /etc/nginx/sites-available/wag-backend
sudo ln -s /etc/nginx/sites-available/wag-backend /etc/nginx/sites-enabled/wag-backend
```

#### Step 2: Jenkins 사용자 sudo 권한 부여

`/etc/sudoers.d/jenkins-nginx` 파일 생성:

```bash
sudo visudo -f /etc/sudoers.d/jenkins-nginx
```

다음 내용 추가:

```
jenkins ALL=(ALL) NOPASSWD: /usr/sbin/nginx
jenkins ALL=(ALL) NOPASSWD: /bin/sed
```

#### Step 3: Nginx 재시작

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 3. 설정 확인

```bash
# Nginx 상태 확인
sudo systemctl status nginx

# 프록시 동작 확인
curl http://localhost:5000/actuator/health

# Nginx 로그 확인
sudo tail -f /var/log/nginx/wag-backend-access.log
```

## 🔄 Blue-Green Deployment Flow

### 배포 프로세스

1. **현재 활성 컨테이너 확인**
   - Blue (18080) 또는 Green (18081) 중 실행 중인 컨테이너 감지

2. **새 컨테이너 배포**
   - 비활성 포트에 새 버전 컨테이너 실행

3. **헬스체크**
   - `/actuator/health` 엔드포인트로 새 컨테이너 상태 확인
   - 최대 60회 시도 (3초 간격)

4. **Nginx 프록시 전환**
   ```bash
   # Jenkins가 자동으로 실행
   sudo sed -i 's/server localhost:[0-9]\+;/server localhost:18081;/g' /etc/nginx/sites-available/wag-backend
   sudo nginx -s reload
   ```

5. **기존 컨테이너 중지**
   - 5초 대기 후 graceful shutdown (30초 timeout)

### 롤백 프로세스

배포 실패 시 자동으로 이전 버전으로 롤백:

1. 이전 컨테이너 재시작
2. 헬스체크 수행
3. Nginx 프록시를 이전 포트로 복원
4. 실패한 컨테이너 중지

## 📊 Monitoring

### Nginx 상태 확인

```bash
# 현재 프록시 설정 확인
grep "server localhost" /etc/nginx/sites-available/wag-backend

# 실시간 액세스 로그
sudo tail -f /var/log/nginx/wag-backend-access.log

# 에러 로그
sudo tail -f /var/log/nginx/wag-backend-error.log
```

### 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너
docker ps | grep wag-server

# 컨테이너 로그
docker logs -f wag-server-blue
docker logs -f wag-server-green
```

## 🛠️ Troubleshooting

### Nginx가 시작되지 않는 경우

```bash
# 설정 파일 문법 검사
sudo nginx -t

# 포트 사용 확인
sudo netstat -tlnp | grep :5000

# SELinux 확인 (CentOS/RHEL)
sudo getenforce
sudo setenforce 0  # 임시 비활성화
```

### Jenkins가 Nginx를 제어할 수 없는 경우

```bash
# Jenkins 사용자 확인
id jenkins

# sudoers 파일 확인
sudo cat /etc/sudoers.d/jenkins-nginx

# 수동 테스트
sudo -u jenkins sudo nginx -t
```

### 헬스체크가 실패하는 경우

```bash
# 컨테이너 내부에서 헬스체크
docker exec wag-server-blue curl http://localhost:8080/actuator/health

# 호스트에서 헬스체크
curl http://localhost:18080/actuator/health

# 애플리케이션 로그 확인
docker logs wag-server-blue
```

### 프록시가 전환되지 않는 경우

```bash
# 현재 upstream 설정 확인
grep "server localhost" /etc/nginx/sites-available/wag-backend

# Nginx reload 테스트
sudo nginx -s reload

# Nginx 프로세스 확인
ps aux | grep nginx
```

## 🔐 Security Considerations

### Nginx 보안 설정

프로덕션 환경에서는 다음 설정을 추가하세요:

```nginx
# HTTP/2 활성화
listen 5000 ssl http2;
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;

# 보안 헤더
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20;
```

### Jenkins 권한 최소화

필요한 명령어만 허용:

```
jenkins ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t, /usr/sbin/nginx -s reload
jenkins ALL=(ALL) NOPASSWD: /bin/sed -i * /etc/nginx/sites-available/wag-backend
```

## 📚 References

- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Networking](https://docs.docker.com/network/)
- [Blue-Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)

## 🆘 Support

문제가 발생하면 다음을 확인하세요:

1. Jenkins 빌드 로그
2. Nginx 에러 로그 (`/var/log/nginx/wag-backend-error.log`)
3. Docker 컨테이너 로그 (`docker logs <container-name>`)
4. 시스템 로그 (`journalctl -xe`)

