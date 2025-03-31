FROM container-registry.oracle.com/graalvm/native-image:21 AS builder

WORKDIR /app

RUN microdnf install -y maven

# Copy Maven files and source
COPY pom.xml .
COPY src ./src

# Install Maven
RUN microdnf install maven

# Build native image
RUN mvn -Pnative native:compile \
    -DskipTests 
    # -Dnative-image.xmx=4g \
    # -Dnative-image.build-time-report=true \
    # -Dnative-image.debug-build-process=true
    
# Runtime stage
FROM ubuntu:22.04

WORKDIR /app

# Copy the native executable from builder
COPY --from=builder /app/target/DataAnalyzer .

# Expose the port the app runs on
EXPOSE 8080

# Run the native executable
ENTRYPOINT ["./DataAnalyzer"]