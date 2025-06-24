FROM golang:1.24.4-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go app (static binary)
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix nocgo -o app .

# Use a minimal base image for running
FROM alpine:latest

# Set up working directory
WORKDIR /app
COPY --from=builder /app/app .

# Cloud Run expects the app to listen on $PORT
EXPOSE 8080

# Run executable
CMD ["./app"]

