# 1. 빌드 스테이지
FROM gradle:8-jdk21 AS builder
WORKDIR /app

# 소스 복사 및 빌드 (테스트 제외)
COPY . .
RUN chmod +x gradlew
RUN ./gradlew bootJar -x test

# 2. 실행 스테이지
FROM eclipse-temurin:21-jre
WORKDIR /app

# 빌드 스테이지에서 생성된 jar 파일만 복사
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]