FROM openjdk:17-slim

WORKDIR /app

# Install required dependencies
RUN apt-get update && apt-get install -y wget unzip

# Download and extract JPlag
RUN wget https://github.com/jplag/JPlag/releases/download/v3.0.0/jplag-3.0.0.jar

# Create entry point script
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]
