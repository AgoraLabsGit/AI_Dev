# AVCA-DIAS Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the AVCA-DIAS system in various environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Configuration](#configuration)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: 18.x or 20.x
- **npm**: 8.x or higher
- **PostgreSQL**: 14.x or higher (for production)
- **Redis**: 6.x or higher (optional, for caching)
- **Memory**: Minimum 4GB RAM
- **Storage**: Minimum 10GB available space

### Required API Keys
```bash
# Create .env file in vibe-lab-product/
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key  # Optional
DATABASE_URL=postgresql://user:password@localhost:5432/vibelab
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/vibe-lab.git
cd vibe-lab
```

### 2. Install Dependencies
```bash
cd vibe-lab-product
npm install
```

### 3. Database Setup
```bash
# Create database
createdb vibelab

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### 4. Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

---

## Local Development

### Starting Development Server
```bash
# Development mode with hot reload
npm run dev

# The application will be available at:
# - Frontend: http://localhost:3000
# - API: http://localhost:3000/api
```

### Running Tests
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:microservices
npm run test:ai-client
npm run test:dias-events
npm run test:integration

# Run load tests
npm run test:load 50 30 5  # 50 users, 30s duration, 5s ramp-up
```

### Building for Production
```bash
# Build production bundle
npm run build

# Start production server
npm start
```

---

## Docker Deployment

### 1. Create Dockerfile
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Install production dependencies only
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### 2. Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/vibelab
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    
  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=vibelab
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    
volumes:
  postgres_data:
```

### 3. Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## Cloud Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables
vercel env add ANTHROPIC_API_KEY production
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
```

### AWS Deployment (EC2)
```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 5. Clone and setup application
git clone https://github.com/yourusername/vibe-lab.git
cd vibe-lab/vibe-lab-product
npm install
npm run build

# 6. Install PM2 for process management
sudo npm install -g pm2

# 7. Start application
pm2 start npm --name "vibe-lab" -- start
pm2 save
pm2 startup
```

### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vibe-lab
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vibe-lab
  template:
    metadata:
      labels:
        app: vibe-lab
    spec:
      containers:
      - name: vibe-lab
        image: your-registry/vibe-lab:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: vibe-lab-secrets
              key: database-url
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: vibe-lab-secrets
              key: anthropic-api-key
---
apiVersion: v1
kind: Service
metadata:
  name: vibe-lab-service
spec:
  selector:
    app: vibe-lab
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

---

## Configuration

### Application Configuration
```javascript
// config/production.js
module.exports = {
  // API Configuration
  api: {
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 1000 // requests per window
    },
    timeout: 30000 // 30 seconds
  },
  
  // AI Configuration
  ai: {
    models: {
      router: 'claude-3-haiku',
      developer: 'claude-3-sonnet',
      auditor: 'claude-3-opus'
    },
    maxTokens: {
      router: 5000,
      developer: 50000,
      auditor: 150000
    }
  },
  
  // Worker Configuration
  workers: {
    pools: {
      ai: { min: 2, max: 10 },
      script: { min: 1, max: 5 },
      hybrid: { min: 1, max: 5 }
    }
  },
  
  // Cache Configuration
  cache: {
    ttl: 300, // 5 minutes
    maxSize: 1000 // entries
  }
};
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/vibe-lab
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### SSL Configuration
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Monitoring

### Health Checks
```bash
# Check application health
curl http://localhost:3000/api/health

# Check service status
curl http://localhost:3000/api/v1/agents/status
```

### Logging
```javascript
// Configure logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Metrics Collection
```bash
# Prometheus metrics endpoint
curl http://localhost:3000/metrics

# Example metrics
vibe_lab_requests_total{method="GET",endpoint="/api/v1/projects",status="200"} 1234
vibe_lab_ai_tokens_used{model="claude-3-sonnet"} 567890
vibe_lab_pipeline_duration_seconds{stage="component-generation"} 2.5
```

### Alerts
```yaml
# prometheus/alerts.yml
groups:
  - name: vibe-lab
    rules:
      - alert: HighErrorRate
        expr: rate(vibe_lab_errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High error rate detected
          
      - alert: AIQuotaExceeded
        expr: vibe_lab_ai_tokens_used > 900000
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: AI token quota nearly exceeded
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U postgres -d vibelab -c "SELECT 1"

# Reset database
npx prisma migrate reset
```

#### 2. API Key Issues
```bash
# Verify environment variables
echo $ANTHROPIC_API_KEY

# Test API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

#### 3. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### 4. Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Monitor memory usage
pm2 monit
```

#### 5. Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable specific debug namespaces
DEBUG=vibe-lab:* npm run dev
```

### Performance Optimization
```bash
# Enable production optimizations
NODE_ENV=production npm run build
NODE_ENV=production npm start

# Enable clustering
pm2 start npm --name "vibe-lab" -i max -- start
```

---

## Backup and Recovery

### Database Backup
```bash
# Backup database
pg_dump -U postgres vibelab > backup_$(date +%Y%m%d).sql

# Restore database
psql -U postgres vibelab < backup_20250128.sql
```

### Application Backup
```bash
# Backup application files
tar -czf vibe-lab-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  vibe-lab/

# Restore application
tar -xzf vibe-lab-backup-20250128.tar.gz
```

---

## Security Checklist

- [ ] Environment variables secured
- [ ] API keys rotated regularly
- [ ] SSL/TLS enabled
- [ ] Database encrypted at rest
- [ ] Regular security updates applied
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] SQL injection prevention
- [ ] XSS protection enabled

---

## Support

For deployment support:
- Documentation: https://docs.vibe-lab.com
- Issues: https://github.com/yourusername/vibe-lab/issues
- Email: support@vibe-lab.com 