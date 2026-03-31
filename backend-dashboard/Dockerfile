# Build Stage
FROM gradle:8-jdk17 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
RUN gradle build --no-daemon > /dev/null 2>&1 || true
COPY src ./src
RUN gradle build -x test --no-daemon

# Run Stage
FROM amazoncorretto:17-alpine
WORKDIR /app
# OTel Agent 다운로드 (또는 로컬에서 복사)
ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar /app/opentelemetry-javaagent.jar
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
