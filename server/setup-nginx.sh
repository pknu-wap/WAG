#!/bin/bash
# Nginx 백엔드 프록시 설정 스크립트

set -e

echo "🔧 Setting up Nginx backend proxy..."

# 1. Nginx 설치 확인
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# 2. 설정 파일 복사
echo "📝 Copying configuration file..."
sudo cp nginx-backend.conf /etc/nginx/sites-available/wag-backend

# 3. 심볼릭 링크 생성
echo "🔗 Creating symbolic link..."
sudo ln -sf /etc/nginx/sites-available/wag-backend /etc/nginx/sites-enabled/wag-backend

# 4. 기본 설정 비활성화 (선택사항)
if [ -L /etc/nginx/sites-enabled/default ]; then
    echo "🗑️  Removing default site..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# 5. Nginx 설정 테스트
echo "✅ Testing Nginx configuration..."
sudo nginx -t

# 6. Nginx 재시작
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# 7. Jenkins 사용자에게 sudo 권한 부여
echo "🔐 Setting up Jenkins sudo permissions..."
JENKINS_SUDOERS="/etc/sudoers.d/jenkins-nginx"

# Jenkins 사용자 확인
if id "jenkins" &>/dev/null; then
    JENKINS_USER="jenkins"
elif id "ubuntu" &>/dev/null; then
    JENKINS_USER="ubuntu"
else
    echo "⚠️  Warning: Jenkins user not found. Please manually configure sudo permissions."
    echo "   Add the following to /etc/sudoers.d/jenkins-nginx:"
    echo "   <jenkins-user> ALL=(ALL) NOPASSWD: /usr/sbin/nginx, /bin/sed"
    exit 1
fi

# sudoers 파일 생성
sudo tee "$JENKINS_SUDOERS" > /dev/null <<EOF
# Allow Jenkins to manage Nginx without password
$JENKINS_USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx
$JENKINS_USER ALL=(ALL) NOPASSWD: /bin/sed
EOF

# 파일 권한 설정
sudo chmod 0440 "$JENKINS_SUDOERS"

# sudoers 설정 검증
sudo visudo -c -f "$JENKINS_SUDOERS"

echo ""
echo "✅ Nginx setup completed successfully!"
echo ""
echo "📊 Configuration summary:"
echo "   - Nginx config: /etc/nginx/sites-available/wag-backend"
echo "   - Listening on: 0.0.0.0:5000"
echo "   - Proxying to: localhost:18080 (default)"
echo "   - Jenkins user: $JENKINS_USER"
echo ""
echo "🔍 To check status:"
echo "   sudo systemctl status nginx"
echo "   curl http://localhost:5000/actuator/health"
echo ""
echo "📝 Next steps:"
echo "   1. Ensure your backend is running on port 18080 or 18081"
echo "   2. Run Jenkins pipeline to test automatic port switching"
echo ""

