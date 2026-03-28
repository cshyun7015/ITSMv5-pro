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
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
