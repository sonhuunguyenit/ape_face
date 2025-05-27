FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    iproute2 \
    curl \
    psmisc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the whole project into the container
COPY ZKCropServer/ ./ZKCropServer/

# Make sure all files are executable if needed
RUN chmod -R +x ./ZKCropServer

# Set LD_LIBRARY_PATH to the correct directory containing libsimage.so
ENV LD_LIBRARY_PATH=/app/ZKCropServer/lib:$LD_LIBRARY_PATH

# Register the library path for dynamic linker
RUN echo "/app/ZKCropServer/lib" > /etc/ld.so.conf.d/zkcrop.conf && ldconfig

# Set working directory where the binary lives
WORKDIR /app/ZKCropServer

# Expose any needed ports
EXPOSE 16001 25002

# Entry point to run the server
ENTRYPOINT ["bash", "-c"]
CMD ["./cropserver]"]

# docker build -t zk-crop .
# docker run -it --rm -p 16001:16001 -p 25002:25002 -v "$(pwd)/ZKCropServer/images:/app/ZKCropServer/images" zk-crop
