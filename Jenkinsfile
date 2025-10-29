pipeline {
    agent any
    
    parameters {
        string(
            name: 'BUILD_BRANCH',
            defaultValue: 'develop',
            description: '빌드할 브랜치 이름을 입력하세요.'
        )
        choice(
            name: 'BUILD_TARGET',
            choices: ['auto', 'client', 'server', 'both'],
            description: '빌드할 대상을 선택하세요.\n- auto: 변경사항 자동 감지\n- client: 프론트엔드만 빌드\n- server: 백엔드만 빌드\n- both: 프론트엔드와 백엔드 모두 빌드'
        )
    }
    
    environment {
        // 이미지 이름 설정
        CLIENT_IMAGE_NAME = 'wag-client'
        SERVER_IMAGE_NAME = 'wag-server'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        
        // 경로 설정
        CLIENT_DIR = 'client'
        SERVER_DIR = 'server'
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "=========================================="
                    echo "🔍 Checking out code"
                    echo "=========================================="
                    
                    // BUILD_BRANCH가 'develop'이 아니면 수동 빌드로 간주
                    def isManualBuild = params.BUILD_BRANCH && params.BUILD_BRANCH != 'develop'
                    
                    if (isManualBuild) {
                        // 수동 빌드: BUILD_BRANCH 파라미터로 지정한 브랜치 사용
                        echo "Manual build - Branch: ${params.BUILD_BRANCH}"
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: "*/${params.BUILD_BRANCH}"]],
                            userRemoteConfigs: [[
                                url: 'https://github.com/pknu-wap/WAG.git',
                                credentialsId: 'gd10080008@gmail.com/******'
                            ]]
                        ])
                        
                        def currentBranch = sh(
                            script: 'git rev-parse --abbrev-ref HEAD',
                            returnStdout: true
                        ).trim()
                        echo "Current branch: ${currentBranch}"
                        echo "✅ Manual build - any branch allowed"
                    } else {
                        // Webhook 트리거 또는 develop 브랜치 빌드: SCM 브랜치 사용
                        echo "Webhook triggered build - Using SCM branch"
                        checkout scm
                        
                        // 현재 브랜치 확인 (Jenkins 환경 변수 우선 사용)
                        def currentBranch = ""
                        if (env.GIT_BRANCH) {
                            // Jenkins가 자동으로 설정한 GIT_BRANCH 환경 변수 사용
                            currentBranch = env.GIT_BRANCH
                        } else {
                            // 대체 방법: git 명령어로 확인
                            currentBranch = sh(
                                script: 'git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --abbrev-ref HEAD',
                                returnStdout: true
                            ).trim()
                        }
                        
                        // 브랜치 이름 정규화
                        // origin/develop -> develop, remotes/origin/develop -> develop, develop -> develop
                        def normalizedBranch = currentBranch
                            .replaceAll('origin/', '')
                            .replaceAll('remotes/origin/', '')
                            .replaceAll('refs/heads/', '')
                        
                        echo "Current branch (raw): ${currentBranch}"
                        echo "Current branch (normalized): ${normalizedBranch}"
                        echo "Commit: ${env.GIT_COMMIT}"
                        
                        // develop 브랜치만 빌드 (webhook 트리거 시)
                        if (normalizedBranch != 'develop') {
                            echo "⏭️  Branch '${normalizedBranch}' is not 'develop'. Skipping build."
                            echo "💡 Only 'develop' branch triggers automatic builds from webhook."
                            echo "💡 Use 'Build with Parameters' and set BUILD_BRANCH to build other branches manually."
                            currentBuild.result = 'SUCCESS'
                            error("Branch '${normalizedBranch}' is not 'develop'. Build skipped.")
                        }
                        echo "✅ Branch check passed: ${normalizedBranch}"
                    }
                }
            }
        }
        
        stage('Check Changes') {
            steps {
                script {
                    echo "=========================================="
                    echo "🔎 Checking for changes"
                    echo "=========================================="
                    
                    // 변경된 파일 목록 가져오기
                    def changes = sh(
                        script: 'git diff --name-only HEAD~1 HEAD || echo "FIRST_BUILD"',
                        returnStdout: true
                    ).trim()
                    
                    echo "Changed files:\n${changes}"
                    
                    // 각 폴더별 변경사항 확인 (자동 감지)
                    // 변경 파일 목록을 줄 단위로 확인
                    def clientChanged = false
                    def serverChanged = false
                    
                    if (changes == 'FIRST_BUILD') {
                        clientChanged = true
                        serverChanged = true
                    } else {
                        // 각 줄을 확인하여 client/ 또는 server/로 시작하는지 체크
                        changes.split('\n').each { file ->
                            if (file.startsWith('client/')) {
                                clientChanged = true
                            }
                            if (file.startsWith('server/')) {
                                serverChanged = true
                            }
                        }
                    }
                    
                    def autoClientChanged = clientChanged
                    def autoServerChanged = serverChanged
                    
                    // 파라미터에 따라 빌드 타겟 결정
                    def buildTarget = params.BUILD_TARGET ?: 'auto'
                    echo "📋 buildTarget parameter: ${buildTarget}"
                    echo "📋 autoClientChanged: ${autoClientChanged}"
                    echo "📋 autoServerChanged: ${autoServerChanged}"
                    
                    // 빌드 타겟에 따라 CLIENT_CHANGED와 SERVER_CHANGED 설정
                    if (buildTarget == 'client') {
                        env.CLIENT_CHANGED = 'true'
                        env.SERVER_CHANGED = 'false'
                        echo "📋 Build target: Client only (manual)"
                    } else if (buildTarget == 'server') {
                        env.CLIENT_CHANGED = 'false'
                        env.SERVER_CHANGED = 'true'
                        echo "📋 Build target: Server only (manual)"
                    } else if (buildTarget == 'both') {
                        env.CLIENT_CHANGED = 'true'
                        env.SERVER_CHANGED = 'true'
                        echo "📋 Build target: Both Client and Server (manual)"
                    } else {
                        // auto 또는 기본값
                        env.CLIENT_CHANGED = autoClientChanged ? 'true' : 'false'
                        env.SERVER_CHANGED = autoServerChanged ? 'true' : 'false'
                        echo "📋 Build target: Auto (detected from changes)"
                        echo "   - Client changes detected: ${autoClientChanged}"
                        echo "   - Server changes detected: ${autoServerChanged}"
                    }
                    
                    echo "Client directory changed: ${env.CLIENT_CHANGED}"
                    echo "Server directory changed: ${env.SERVER_CHANGED}"
                    
                    if (env.CLIENT_CHANGED == 'false' && env.SERVER_CHANGED == 'false') {
                        echo "⏭️  No build target selected. Skipping build."
                        currentBuild.result = 'SUCCESS'
                        error('No build target selected. Pipeline stopped.')
                    }
                }
            }
        }
        
        stage('Parallel Build') {
            parallel {
                stage('Build Client') {
                    when {
                        expression { env.CLIENT_CHANGED == 'true' }
                    }
                    stages {
                        stage('Client: Environment Info') {
                            steps {
                                echo "=========================================="
                                echo "📦 Client Build Information"
                                echo "=========================================="
                                sh '''
                                    echo "Build Number: ${BUILD_NUMBER}"
                                    echo "Node Version: $(node --version || echo 'Node not installed')"
                                    echo "Docker Version: $(docker --version || echo 'Docker not installed')"
                                '''
                            }
                        }
                        
                        stage('Client: Prepare Environment') {
                            steps {
                                echo "=========================================="
                                echo "🔐 Setting up .env file"
                                echo "=========================================="
                                dir("${CLIENT_DIR}") {
                                    script {
                                        try {
                                            withCredentials([
                                                file(credentialsId: '.env', variable: 'ENV_FILE')
                                            ]) {
                                                sh """
                                                    set +e
                                                    echo "📍 Current directory: \$(pwd)"
                                                    echo "📁 Listing current directory:"
                                                    ls -la
                                                    echo ""
                                                    echo "Copying .env file from Jenkins credentials..."
                                                    echo "ENV_FILE path: \${ENV_FILE}"
                                                    if [ -z "\${ENV_FILE}" ]; then
                                                        echo "⚠️  ENV_FILE is empty"
                                                    elif [ ! -f "\${ENV_FILE}" ]; then
                                                        echo "⚠️  ENV_FILE does not exist: \${ENV_FILE}"
                                                    else
                                                        cp "\${ENV_FILE}" .env
                                                        if [ \$? -eq 0 ]; then
                                                            echo "✅ .env file copied successfully"
                                                            ls -la .env
                                                        else
                                                            echo "⚠️  Could not copy .env file"
                                                        fi
                                                    fi
                                                    set -e
                                                """
                                            }
                                        } catch (Exception e) {
                                            echo "⚠️  Credential access warning: ${e.message}"
                                            echo "💡 Continuing without .env file..."
                                        }
                                    }
                                }
                            }
                        }
                        
                        stage('Client: Build Docker Image') {
                            steps {
                                echo "=========================================="
                                echo "🐳 Building Client Docker Image"
                                echo "=========================================="
                                dir("${CLIENT_DIR}") {
                                    script {
                                        sh """
                                            docker build -t ${CLIENT_IMAGE_NAME}:${IMAGE_TAG} .
                                            docker tag ${CLIENT_IMAGE_NAME}:${IMAGE_TAG} ${CLIENT_IMAGE_NAME}:latest
                                        """
                                    }
                                }
                            }
                        }
                        
                        stage('Client: Test Image') {
                            steps {
                                echo "=========================================="
                                echo "✅ Testing Client Docker Image"
                                echo "=========================================="
                                script {
                                    def imageExists = sh(
                                        script: "docker images -q ${CLIENT_IMAGE_NAME}:${IMAGE_TAG}",
                                        returnStdout: true
                                    ).trim()
                                    
                                    if (imageExists) {
                                        echo "✅ Client image ${CLIENT_IMAGE_NAME}:${IMAGE_TAG} exists!"
                                    } else {
                                        error("❌ Client image ${CLIENT_IMAGE_NAME}:${IMAGE_TAG} not found!")
                                    }
                                }
                            }
                        }
                        
                        stage('Client: Deploy') {
                            when {
                                expression { 
                                    def currentBranch = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                                    return currentBranch == 'develop' || currentBranch == 'main'
                                }
                            }
                            steps {
                                echo "=========================================="
                                echo "🚀 Deploying Client"
                                echo "=========================================="
                                script {
                                    sh """
                                        docker stop wag-client-container || true
                                        docker rm wag-client-container || true
                                        docker run -d \\
                                            --name wag-client-container \\
                                            -p 3000:80 \\
                                            --restart unless-stopped \\
                                            ${CLIENT_IMAGE_NAME}:${IMAGE_TAG}
                                    """
                                    echo "✅ Client deployment completed!"
                                }
                            }
                        }
                    }
                }
                
                stage('Build Server') {
                    when {
                        expression { env.SERVER_CHANGED == 'true' }
                    }
                    stages {
                        stage('Server: Environment Info') {
                            steps {
                                echo "=========================================="
                                echo "📦 Server Build Information"
                                echo "=========================================="
                                sh '''
                                    echo "Build Number: ${BUILD_NUMBER}"
                                    echo "Java Version: $(java -version 2>&1 | head -n 1)"
                                    echo "Docker Version: $(docker --version || echo 'Docker not installed')"
                                '''
                            }
                        }
                        
                        stage('Server: Prepare Application Properties') {
                            steps {
                                echo "=========================================="
                                echo "🔐 Setting up application.properties"
                                echo "=========================================="
                                dir("${SERVER_DIR}") {
                                    script {
                                        try {
                                            withCredentials([
                                                file(credentialsId: 'application.properties', variable: 'APP_PROPS')
                                            ]) {
                                                sh """
                                                    set +e
                                                    echo "📍 Current directory: \$(pwd)"
                                                    echo "📁 Checking src/main/resources directory:"
                                                    if [ -d "src/main/resources" ]; then
                                                        echo "✅ src/main/resources exists"
                                                        ls -la src/main/resources
                                                    else
                                                        echo "⚠️  src/main/resources does NOT exist, creating it..."
                                                        mkdir -p src/main/resources
                                                        echo "✅ Created src/main/resources"
                                                    fi
                                                    echo ""
                                                    echo "Copying application.properties from Jenkins credentials..."
                                                    echo "APP_PROPS path: \${APP_PROPS}"
                                                    if [ -z "\${APP_PROPS}" ]; then
                                                        echo "⚠️  APP_PROPS is empty"
                                                    elif [ ! -f "\${APP_PROPS}" ]; then
                                                        echo "⚠️  APP_PROPS does not exist: \${APP_PROPS}"
                                                    else
                                                        cp "\${APP_PROPS}" src/main/resources/application.properties
                                                        if [ \$? -eq 0 ]; then
                                                            echo "✅ application.properties copied successfully"
                                                            ls -la src/main/resources/application.properties
                                                        else
                                                            echo "⚠️  Could not copy application.properties"
                                                        fi
                                                    fi
                                                    set -e
                                                """
                                            }
                                        } catch (Exception e) {
                                            echo "⚠️  Credential access warning: ${e.message}"
                                            echo "💡 Continuing without application.properties..."
                                        }
                                    }
                                }
                            }
                        }
                        
                        stage('Server: Build Docker Image') {
                            steps {
                                echo "=========================================="
                                echo "🐳 Building Server Docker Image"
                                echo "=========================================="
                                dir("${SERVER_DIR}") {
                                    script {
                                        sh """
                                            docker build -t ${SERVER_IMAGE_NAME}:${IMAGE_TAG} .
                                            docker tag ${SERVER_IMAGE_NAME}:${IMAGE_TAG} ${SERVER_IMAGE_NAME}:latest
                                        """
                                    }
                                }
                            }
                        }
                        
                        stage('Server: Test Image') {
                            steps {
                                echo "=========================================="
                                echo "✅ Testing Server Docker Image"
                                echo "=========================================="
                                script {
                                    def imageExists = sh(
                                        script: "docker images -q ${SERVER_IMAGE_NAME}:${IMAGE_TAG}",
                                        returnStdout: true
                                    ).trim()
                                    
                                    if (imageExists) {
                                        echo "✅ Server image ${SERVER_IMAGE_NAME}:${IMAGE_TAG} exists!"
                                    } else {
                                        error("❌ Server image ${SERVER_IMAGE_NAME}:${IMAGE_TAG} not found!")
                                    }
                                }
                            }
                        }
                        
                        stage('Server: Deploy (Blue-Green)') {
                            when {
                                expression { 
                                    def currentBranch = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                                    return currentBranch == 'develop' || currentBranch == 'main'
                                }
                            }
                            steps {
                                echo "=========================================="
                                echo "🚀 Blue-Green Deployment"
                                echo "=========================================="
                                script {
                                    def BLUE_PORT = 8080
                                    def GREEN_PORT = 8081
                                    
                                    def blueRunning = sh(
                                        script: "docker ps -q -f name=wag-server-blue",
                                        returnStdout: true
                                    ).trim()
                                    
                                    def greenRunning = sh(
                                        script: "docker ps -q -f name=wag-server-green",
                                        returnStdout: true
                                    ).trim()
                                    
                                    def targetColor = ""
                                    def targetPort = 0
                                    def oldColor = ""
                                    
                                    if (blueRunning) {
                                        targetColor = "green"
                                        targetPort = GREEN_PORT
                                        oldColor = "blue"
                                    } else {
                                        targetColor = "blue"
                                        targetPort = BLUE_PORT
                                        oldColor = "green"
                                    }
                                    
                                    echo "Deploying to ${targetColor} (Port: ${targetPort})"
                                    
                                    // 새 컨테이너 시작
                                    sh """
                                        docker run -d \\
                                            --name wag-server-${targetColor} \\
                                            -p ${targetPort}:8080 \\
                                            -e SPRING_PROFILES_ACTIVE=prod \\
                                            --restart unless-stopped \\
                                            ${SERVER_IMAGE_NAME}:${IMAGE_TAG}
                                    """
                                    
                                    // 헬스체크
                                    def healthCheckPassed = false
                                    for (int i = 0; i < 60; i++) {
                                        sleep(3)
                                        def healthStatus = sh(
                                            script: "curl -sf http://localhost:${targetPort}/actuator/health > /dev/null && echo 'OK' || echo 'FAIL'",
                                            returnStdout: true
                                        ).trim()
                                        
                                        if (healthStatus == 'OK') {
                                            healthCheckPassed = true
                                            break
                                        }
                                        echo "⏳ Waiting... (${i+1}/60)"
                                    }
                                    
                                    if (!healthCheckPassed) {
                                        sh "docker stop wag-server-${targetColor} || true"
                                        sh "docker rm wag-server-${targetColor} || true"
                                        error("❌ Health check failed!")
                                    }
                                    
                                    // 이전 컨테이너 종료
                                    if (oldColor == "blue" && blueRunning) {
                                        sh """
                                            sleep 5
                                            docker stop -t 30 wag-server-blue || true
                                            docker rm wag-server-blue || true
                                        """
                                    } else if (oldColor == "green" && greenRunning) {
                                        sh """
                                            sleep 5
                                            docker stop -t 30 wag-server-green || true
                                            docker rm wag-server-green || true
                                        """
                                    }
                                    
                                    echo "✅ Blue-Green deployment completed!"
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Clean Up') {
            steps {
                echo "=========================================="
                echo "🧹 Cleaning up old Docker images"
                echo "=========================================="
                script {
                    // Client 이미지 정리
                    if (env.CLIENT_CHANGED == 'true') {
                        sh """
                            docker images ${CLIENT_IMAGE_NAME} --format "{{.Tag}}" | \
                            grep -E '^[0-9]+\$' | \
                            sort -rn | \
                            tail -n +4 | \
                            xargs -I {} docker rmi ${CLIENT_IMAGE_NAME}:{} || true
                        """
                    }
                    
                    // Server 이미지 정리
                    if (env.SERVER_CHANGED == 'true') {
                        sh """
                            docker images ${SERVER_IMAGE_NAME} --format "{{.Tag}}" | \
                            grep -E '^[0-9]+\$' | \
                            sort -rn | \
                            tail -n +4 | \
                            xargs -I {} docker rmi ${SERVER_IMAGE_NAME}:{} || true
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "=========================================="
            echo "✅ BUILD SUCCESS!"
            echo "=========================================="
            echo "Build Number: ${env.BUILD_NUMBER}"
        }
        
        failure {
            echo "=========================================="
            echo "❌ BUILD FAILED!"
            echo "=========================================="
            echo "Build Number: ${env.BUILD_NUMBER}"
        }
        
        always {
            echo "=========================================="
            echo "🏁 Pipeline Finished"
            echo "=========================================="
        }
    }
}

