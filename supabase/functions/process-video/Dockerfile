FROM denoland/deno:1.37.0

# Install FFmpeg and FFprobe
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the function code
COPY . .

# Start the function
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "index.ts"] 