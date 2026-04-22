FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgmp-dev libnettle-dev libgnutls28-dev libpcre3-dev zlib1g-dev \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Build and install Pike from source (cached in this layer)
RUN cd /tmp && \
    curl -fsSL https://pike.lysator.liu.se/pub/pike/all/8.0.1116/Pike-v8.0.1116.tar.gz | tar xz && \
    cd Pike-v8.0.1116 && \
    make -j$(nproc) && \
    make install && \
    cd / && \
    rm -rf /tmp/Pike-v8.0.1116

# Verify Pike installation
RUN pike --version
