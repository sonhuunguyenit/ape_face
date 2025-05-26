# Use official Ubuntu base
FROM ubuntu:20.04

# Set environment to avoid tzdata prompts
ENV DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# Copy all files to /app
COPY . /app

# Install dependencies
RUN apt update && \
    apt install -y curl gnupg tzdata && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs && \
    ln -fs /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    chmod +x /app/ZKCropServer/cropserver /app/ZKCropServer/start /app/ZKCropServer/stop

# Expose the cropserver port
EXPOSE 16001 8080

# Start both cropserver binary and Node.js app
CMD bash -c "node index.js"
