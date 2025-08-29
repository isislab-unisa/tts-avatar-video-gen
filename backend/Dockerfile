# ---- Build stage
FROM golang:1.24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache ca-certificates && update-ca-certificates

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64
RUN go build -o /dubme-api ./main.go

FROM alpine:3.20
WORKDIR /app
RUN adduser -D -g '' appuser

COPY --from=builder /dubme-api /app/dubme-api
COPY backend/assets ./assets

EXPOSE 4000
USER appuser
CMD ["/app/dubme-api"]
