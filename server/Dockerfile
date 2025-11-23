# Multi-stage build for Spring Boot application
# x86_64 플랫폼으로 빌드
FROM --platform=linux/amd64 gradle:8.5-jdk17-alpine AS builder

WORKDIR /app

# Gradle wrapper와 설정 파일 복사 (레이어 캐싱 최적화)
COPY gradle gradle
COPY gradlew .
COPY settings.gradle .
COPY build.gradle .

# gradlew 실행 권한 부여 및 줄바꿈 정리
RUN chmod +x gradlew && \
    sed -i 's/\r$//' gradlew || true

# 의존성 다운로드 (build.gradle이 변경될 때만 재실행)
RUN ./gradlew dependencies --no-daemon || true

# 소스 코드 복사
COPY src src

# 빌드 수행 (테스트 제외)
RUN ./gradlew clean bootJar -x test --no-daemon

# 런타임 이미지
# x86_64 플랫폼으로 빌드
FROM --platform=linux/amd64 eclipse-temurin:17-jre-alpine AS production

WORKDIR /app

# 타임존 설정 및 curl 설치 (헬스체크용)
RUN apk add --no-cache tzdata curl && \
    cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    apk del tzdata

# 빌드된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 애플리케이션 포트 노출
EXPOSE 8080

# JVM 옵션 설정
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 애플리케이션 실행
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

