# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build backend
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./static

# Railway uses dynamic PORT
ENV PORT=8000

# Start command (shell form to expand $PORT)
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --limit-concurrency 200 --timeout-keep-alive 30
