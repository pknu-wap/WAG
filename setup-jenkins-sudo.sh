#!/bin/bash
# Jenkins sudo 권한 설정 스크립트
# switch-backend-port.sh를 sudo로 실행할 수 있도록 설정

set -e

echo "🔐 Setting up Jenkins sudo permissions for switch-backend-port.sh..."

# Jenkins 사용자 확인
if id "jenkins" &>/dev/null; then
    JENKINS_USER="jenkins"
elif id "ubuntu" &>/dev/null; then
    JENKINS_USER="ubuntu"
else
    echo "⚠️  Warning: Jenkins user not found. Please manually configure sudo permissions."
    echo "Please specify Jenkins user:"
    read -p "Jenkins user: " JENKINS_USER
    if ! id "$JENKINS_USER" &>/dev/null; then
        echo "❌ User $JENKINS_USER not found!"
        exit 1
    fi
fi

echo "📝 Jenkins user: $JENKINS_USER"

# 현재 스크립트의 절대 경로 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SWITCH_SCRIPT="$SCRIPT_DIR/switch-backend-port.sh"

if [ ! -f "$SWITCH_SCRIPT" ]; then
    echo "❌ switch-backend-port.sh not found at: $SWITCH_SCRIPT"
    exit 1
fi

echo "📍 Script location: $SWITCH_SCRIPT"

# sudoers 파일 생성
SUDOERS_FILE="/etc/sudoers.d/jenkins-backend-switch"

echo "📄 Creating sudoers file: $SUDOERS_FILE"

sudo tee "$SUDOERS_FILE" > /dev/null <<EOF
# Allow Jenkins to run switch-backend-port.sh without password
# This enables Blue-Green deployment with automatic Nginx proxy switching

# Allow Jenkins to run the port switching script
$JENKINS_USER ALL=(ALL) NOPASSWD: $SWITCH_SCRIPT

# Required commands within switch-backend-port.sh
$JENKINS_USER ALL=(ALL) NOPASSWD: /bin/cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.*
$JENKINS_USER ALL=(ALL) NOPASSWD: /bin/sed -i * /etc/nginx/sites-available/default
$JENKINS_USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
$JENKINS_USER ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
EOF

# 파일 권한 설정
sudo chmod 0440 "$SUDOERS_FILE"

# sudoers 설정 검증
echo "🔍 Validating sudoers configuration..."
if sudo visudo -c -f "$SUDOERS_FILE"; then
    echo "✅ Sudoers configuration is valid"
else
    echo "❌ Sudoers configuration is invalid!"
    sudo rm "$SUDOERS_FILE"
    exit 1
fi

# 스크립트 실행 권한 확인
chmod +x "$SWITCH_SCRIPT"
echo "✅ Script execution permission granted"

# 테스트
echo ""
echo "🧪 Testing sudo access..."
if sudo -u "$JENKINS_USER" sudo -n "$SWITCH_SCRIPT" 2>&1 | grep -q "Usage"; then
    echo "✅ Jenkins can execute switch-backend-port.sh with sudo"
else
    echo "⚠️  Test result unclear - please verify manually:"
    echo "   sudo -u $JENKINS_USER sudo $SWITCH_SCRIPT"
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📊 Configuration summary:"
echo "   - Jenkins user: $JENKINS_USER"
echo "   - Script path: $SWITCH_SCRIPT"
echo "   - Sudoers file: $SUDOERS_FILE"
echo ""
echo "🔍 To verify:"
echo "   sudo -u $JENKINS_USER sudo $SWITCH_SCRIPT 18080"
echo ""
echo "📝 Next steps:"
echo "   1. Commit and push switch-backend-port.sh and Jenkinsfile"
echo "   2. Run Jenkins pipeline to test automatic port switching"
echo ""

