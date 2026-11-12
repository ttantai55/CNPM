# Giai đoạn 1: Build ứng dụng với Maven
FROM eclipse-temurin:17-jdk-noble AS builder
WORKDIR /app

# Copy cấu hình Maven trước để tận dụng Docker cache khi tải thư viện
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' ./mvnw && chmod +x ./mvnw && ./mvnw dependency:go-offline

# Copy mã nguồn và đóng gói file .jar
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Giai đoạn 2: Chạy ứng dụng với JRE gọn nhẹ và quyền user hạn chế
FROM eclipse-temurin:17-jre-noble
WORKDIR /app

RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]