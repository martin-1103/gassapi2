# GASSAPI MCP Server v2 - Production Deployment Guide

## 🚀 Production Deployment Guide

Guide lengkap untuk deploy GASSAPI MCP Server v2 ke environment produksi dengan aman dan efisien.

---

## 📋 **Prerequisites**

### System Requirements
- **Node.js**: v18.0+ (LTS recommended)
- **Memory**: Minimum 512MB, Recommended 1GB+
- **Storage**: Minimum 100MB free space
- **Network**: Internet connection untuk GASSAPI API access

### Security Requirements
- **API Token**: GASSAPI API token yang valid
- **Environment Isolation**: Separate environment untuk production
- **Access Control**: Proper file permissions dan access controls
- **SSL/TLS**: HTTPS untuk semua komunikasi eksternal

---

## 🔧 **Installation & Setup**

### 1. Download & Extract
```bash
# Download production bundle
curl -L https://github.com/your-org/gassapi-mcp/releases/latest/download/gassapi-mcp-v2.tar.gz -o gassapi-mcp.tar.gz

# Extract
tar -xzf gassapi-mcp.tar.gz
cd gassapi-mcp-v2

# Verify structure
ls -la
# Should see: dist/, config/, docs/, scripts/
```

### 2. Install Dependencies
```bash
# Install production dependencies only
npm ci --production

# Verify installation
npm list --depth=0
```

### 3. Configuration Setup
```bash
# Copy template configuration
cp config/template.json config/production.json

# Edit configuration
nano config/production.json
```

**Production Configuration Template:**
```json
{
  "server": {
    "name": "GASSAPI MCP Production",
    "version": "2.0.0",
    "log_level": "warn"
  },
  "gassapi": {
    "api_url": "https://api.gassapi.com",
    "token": "your-production-token-here",
    "timeout": 30000,
    "retry_attempts": 3
  },
  "environments": {
    "default": "prod",
    "production": {
      "id": "env_prod_123",
      "name": "Production Environment",
      "auto_load": true
    }
  },
  "security": {
    "token_refresh_enabled": true,
    "mask_secrets": true,
    "validate_ssl": true
  },
  "performance": {
    "cache_enabled": true,
    "cache_ttl": 300,
    "max_concurrent_requests": 10
  }
}
```

---

## 🔐 **Security Configuration**

### 1. Token Management
```bash
# Set secure file permissions
chmod 600 config/production.json
chmod 700 dist/

# Verify permissions
ls -la config/
```

### 2. Environment Variables
```bash
# Create environment file
cat > .env.production << EOF
NODE_ENV=production
GASSAPI_CONFIG_PATH=config/production.json
LOG_LEVEL=warn
MAX_MEMORY=1024
EOF

# Secure environment file
chmod 600 .env.production
```

### 3. Systemd Service (Linux)
```bash
# Create service file
sudo nano /etc/systemd/system/gassapi-mcp.service
```

**Service Configuration:**
```ini
[Unit]
Description=GASSAPI MCP Server v2
After=network.target

[Service]
Type=simple
User=gassapi
Group=gassapi
WorkingDirectory=/opt/gassapi-mcp
Environment=NODE_ENV=production
EnvironmentFile=/opt/gassapi-mcp/.env.production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/gassapi-mcp/logs

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable gassapi-mcp
sudo systemctl start gassapi-mcp
sudo systemctl status gassapi-mcp
```

---

## 🚀 **Deployment Methods**

### Method 1: Standalone Server
```bash
# Direct execution
NODE_ENV=production node dist/index.js --config config/production.json

# With PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

**PM2 Configuration (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: 'gassapi-mcp',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      GASSAPI_CONFIG_PATH: 'config/production.json'
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### Method 2: Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy production files
COPY dist/ ./dist/
COPY config/ ./config/
COPY package*.json ./

# Install production dependencies
RUN npm ci --production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S gassapi && \
    adduser -S gassapi -u 1001

# Set permissions
RUN chown -R gassapi:gassapi /app
USER gassapi

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/index.js --health-check

EXPOSE 3000

CMD ["node", "dist/index.js", "--config", "config/production.json"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  gassapi-mcp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./config:/app/config:ro
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "dist/index.js", "--health-check"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Method 3: Cloud Deployment

#### AWS ECS Task Definition
```json
{
  "family": "gassapi-mcp",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "gassapi-mcp",
      "image": "your-account.dkr.ecr.region.amazonaws.com/gassapi-mcp:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "GASSAPI_TOKEN",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:gassapi-token"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/gassapi-mcp",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "node dist/index.js --health-check"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

---

## 📊 **Monitoring & Logging**

### 1. Application Monitoring
```bash
# Enable detailed logging
export LOG_LEVEL=info

# Log rotation setup
cat > /etc/logrotate.d/gassapi-mcp << EOF
/opt/gassapi-mcp/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 gassapi gassapi
    postrotate
        systemctl reload gassapi-mcp
    endscript
}
EOF
```

### 2. Health Checks
```bash
# Automated health check script
#!/bin/bash
# /opt/gassapi-mcp/scripts/health-check.sh

HEALTH_URL="http://localhost:3000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ GASSAPI MCP Server is healthy"
    exit 0
else
    echo "❌ GASSAPI MCP Server is unhealthy (HTTP $RESPONSE)"
    systemctl restart gassapi-mcp
    exit 1
fi
```

### 3. Performance Monitoring
```bash
# Resource usage monitoring
#!/bin/bash
# /opt/gassapi-mcp/scripts/monitor.sh

MEMORY=$(ps -o pid,ppid,cmd,%mem,%cpu --sort=-%mem -C node | head -2 | tail -1 | awk '{print $4}')
CPU=$(ps -o pid,ppid,cmd,%mem,%cpu --sort=-%cpu -C node | head -2 | tail -1 | awk '{print $5}')

echo "Memory Usage: ${MEMORY}%"
echo "CPU Usage: ${CPU}%"

if (( $(echo "$MEMORY > 80" | bc -l) )); then
    echo "⚠️ High memory usage detected"
    systemctl restart gassapi-mcp
fi
```

---

## 🛡️ **Security Best Practices**

### 1. Network Security
```bash
# Firewall configuration
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw enable

# Rate limiting with nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}

# Rate limit zone definition
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

### 2. Token Rotation
```bash
# Token rotation script
#!/bin/bash
# /opt/gassapi-mcp/scripts/rotate-token.sh

NEW_TOKEN="$1"
CONFIG_FILE="/opt/gassapi-mcp/config/production.json"

if [ -z "$NEW_TOKEN" ]; then
    echo "Usage: $0 <new-token>"
    exit 1
fi

# Backup current config
cp $CONFIG_FILE $CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)

# Update token
jq --arg token "$NEW_TOKEN" '.gassapi.token = $token' $CONFIG_FILE > tmp.json && mv tmp.json $CONFIG_FILE

# Restart service
systemctl restart gassapi-mcp

echo "✅ Token rotated successfully"
```

### 3. Access Control
```bash
# File permissions
find /opt/gassapi-mcp -type f -exec chmod 644 {} \;
find /opt/gassapi-mcp -type d -exec chmod 755 {} \;
chmod 600 /opt/gassapi-mcp/config/production.json
chmod 600 /opt/gassapi-mcp/.env.production

# User permissions
useradd -r -s /bin/false gassapi
chown -R gassapi:gassapi /opt/gassapi-mcp
```

---

## 🔄 **Maintenance & Updates**

### 1. Backup Strategy
```bash
# Backup script
#!/bin/bash
# /opt/gassapi-mcp/scripts/backup.sh

BACKUP_DIR="/backup/gassapi-mcp"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/gassapi-mcp-$DATE.tar.gz \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='.git' \
    /opt/gassapi-mcp/

# Backup configuration
cp /opt/gassapi-mcp/config/production.json $BACKUP_DIR/config-$DATE.json

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.json" -mtime +30 -delete

echo "✅ Backup completed: $BACKUP_DIR/gassapi-mcp-$DATE.tar.gz"
```

### 2. Update Procedure
```bash
# Update script
#!/bin/bash
# /opt/gassapi-mcp/scripts/update.sh

NEW_VERSION="$1"

if [ -z "$NEW_VERSION" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

# Create backup
./scripts/backup.sh

# Download new version
curl -L "https://github.com/your-org/gassapi-mcp/releases/download/v$NEW_VERSION/gassapi-mcp-v2.tar.gz" -o gassapi-mcp-new.tar.gz

# Extract to temporary directory
mkdir -p /tmp/gassapi-mcp-update
tar -xzf gassapi-mcp-new.tar.gz -C /tmp/gassapi-mcp-update

# Stop service
systemctl stop gassapi-mcp

# Update files
rsync -av --exclude='config/' --exclude='logs/' /tmp/gassapi-mcp-update/gassapi-mcp-v2/ /opt/gassapi-mcp/

# Install dependencies
cd /opt/gassapi-mcp && npm ci --production

# Start service
systemctl start gassapi-mcp

# Cleanup
rm -rf /tmp/gassapi-mcp-update gassapi-mcp-new.tar.gz

echo "✅ Update to v$NEW_VERSION completed"
```

### 3. Health Monitoring Setup
```bash
# Cron job for health checks
# Add to crontab: crontab -e
*/5 * * * * /opt/gassapi-mcp/scripts/health-check.sh
*/10 * * * * /opt/gassapi-mcp/scripts/monitor.sh
0 2 * * * /opt/gassapi-mcp/scripts/backup.sh
```

---

## 📈 **Scaling & Performance**

### 1. Horizontal Scaling
```yaml
# Docker Compose scaling
version: '3.8'
services:
  gassapi-mcp:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
    volumes:
      - ./config:/app/config:ro
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

### 2. Load Balancing (Nginx)
```nginx
upstream gassapi_mcp {
    server gassapi-mcp-1:3000;
    server gassapi-mcp-2:3000;
    server gassapi-mcp-3:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://gassapi_mcp;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Health checks
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
    }
}
```

### 3. Caching Strategy
```javascript
// Redis caching integration
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache middleware
const cache = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.method}:${req.originalUrl}`;
    const cached = await redis.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      redis.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };

    next();
  };
};
```

---

## 🚨 **Troubleshooting**

### Common Issues & Solutions

#### 1. Server Won't Start
```bash
# Check configuration
node dist/index.js --validate-config

# Check logs
journalctl -u gassapi-mcp -f

# Check dependencies
npm ls --depth=0
```

#### 2. Authentication Issues
```bash
# Validate token
node dist/index.js --validate-token YOUR_TOKEN

# Check API connectivity
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.gassapi.com/health
```

#### 3. Performance Issues
```bash
# Monitor resources
htop
iotop

# Check memory leaks
node --inspect dist/index.js
```

#### 4. Network Issues
```bash
# Check connectivity
curl -v http://localhost:3000/health

# Check firewall
sudo ufw status
sudo iptables -L
```

---

## 📞 **Support & Emergency**

### Emergency Contacts
- **Technical Support**: support@gassapi.com
- **Documentation**: https://docs.gassapi.com/mcp
- **GitHub Issues**: https://github.com/your-org/gassapi-mcp/issues

### Emergency Procedures
```bash
# Emergency stop
sudo systemctl stop gassapi-mcp

# Emergency rollback
./scripts/rollback.sh

# Emergency restart
sudo systemctl restart gassapi-mcp
```

### Monitoring Alerts
Set up monitoring alerts for:
- **Memory usage > 80%**
- **CPU usage > 90%**
- **Response time > 5s**
- **Error rate > 5%**
- **Service downtime**

---

## ✅ **Deployment Checklist**

### Pre-Deployment
- [ ] Review security configuration
- [ ] Validate API token
- [ ] Test configuration file
- [ ] Set up monitoring
- [ ] Prepare backup strategy

### Deployment
- [ ] Stop existing service
- [ ] Backup current version
- [ ] Deploy new version
- [ ] Update configuration
- [ ] Start service
- [ ] Verify health

### Post-Deployment
- [ ] Monitor performance
- [ ] Check logs for errors
- [ ] Validate all tools working
- [ ] Update documentation
- [ ] Notify stakeholders

---

**🎉 Production deployment selesai! GASSAPI MCP Server v2 siap digunakan di environment produksi dengan monitoring dan security yang lengkap.**