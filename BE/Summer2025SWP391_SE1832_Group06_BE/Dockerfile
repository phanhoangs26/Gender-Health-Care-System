# Use an official OpenJDK base image
FROM eclipse-temurin:21-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the built JAR file into the container
COPY target/Gender_Healthcare_System-0.0.1-SNAPSHOT.jar Gender_Healthcare_System_App.jar

# Expose the port your app runs on (default is 8080)
EXPOSE 8080

# Command to run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]