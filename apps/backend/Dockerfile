# Giai đoạn 1: Build ứng dụng với Maven
FROM eclipse-temurin:17-jdk-noble AS builder
WORKDIR /app

# Copy cấu hình Maven trước để tận dụng Docker cache khi tải thư viện
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' ./mvnw && chmod +x ./mvnw && ./mvnw dependency:go-offline

# Copy mã nguồn và đóng gói file .jar
COPY src ./src
RUN ./mvnw -B clean package -DskipTests

# Giai đoạn 2: Chạy ứng dụng với JRE gọn nhẹ và quyền user hạn chế
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/target/doan-cnpm-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-Xmx350m", "-Xms256m", "-jar", "app.jar"]