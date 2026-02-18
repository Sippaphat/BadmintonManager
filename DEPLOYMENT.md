# Deployment Guide

## Pre-Deployment Checklist

### ✅ Required Actions

1. **⚠️ CRITICAL: Update JWT_SECRET**
   ```bash
   # Generate a secure random secret
   openssl rand -base64 64
   # Update in server/.env
   ```

2. **Configure Environment Variables**
   - Copy `server/.env.example` to `server/.env`
   - Update all values with production credentials
   - Never commit `.env` files to git

3. **Update API URLs**
   - Frontend: Update `VITE_API_BASE` in root `.env` or Docker build args
   - Backend: Update `API_BASE_URL` in `server/.env`

4. **Database Configuration**
   - Ensure MongoDB Atlas IP whitelist includes server IP
   - Update `MONGO_URI` in `server/.env`

5. **Domain/SSL Setup**
   - Configure nginx or reverse proxy
   - Set up SSL certificates (Let's Encrypt recommended)
   - Update CORS settings if needed

---

## Docker Deployment

### Option 1: Docker Compose (Recommended)

```bash
# 1. Build and start services
docker compose up -d --build

# 2. Check logs
docker compose logs -f

# 3. Stop services
docker compose down

# 4. Update and restart
docker compose pull
docker compose up -d --build
```

### Option 2: Individual Containers

**Backend:**
```bash
cd /path/to/BadmintonManager
docker build -f Dockerfile.backend -t badminton-api .
docker run -d \
  --name badminton-api \
  -p 5000:5000 \
  --env-file ./server/.env \
  -v $(pwd)/server/uploads:/app/server/uploads \
  --restart always \
  badminton-api
```

**Frontend:**
```bash
docker build \
  --build-arg VITE_API_BASE=https://badminton-api.xenocer.com \
  --build-arg VITE_GOOGLE_CLIENT_ID=your-client-id \
  -t badminton-web \
  -f Dockerfile .
  
docker run -d \
  --name badminton-web \
  -p 8000:8000 \
  --restart always \
  badminton-web
```

---

## Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=<64-char-random-string>
GOOGLE_CLIENT_ID=<your-client-id>
API_BASE_URL=https://your-api-domain.com
```

### Frontend (`.env` or Docker build args)
```env
VITE_API_BASE=https://your-api-domain.com
VITE_GOOGLE_CLIENT_ID=<your-client-id>
```

---

## Nginx Configuration Example

```nginx
# Backend API
server {
    listen 443 ssl http2;
    server_name badminton-api.xenocer.com;

    ssl_certificate /etc/letsencrypt/live/badminton-api.xenocer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/badminton-api.xenocer.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 443 ssl http2;
    server_name badminton.xenocer.com;

    ssl_certificate /etc/letsencrypt/live/badminton.xenocer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/badminton.xenocer.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name badminton-api.xenocer.com badminton.xenocer.com;
    return 301 https://$host$request_uri;
}
```

---

## Security Checklist

- [ ] Change JWT_SECRET to a secure random string
- [ ] Use HTTPS/SSL for all domains
- [ ] Enable firewall (UFW/iptables)
- [ ] Keep MongoDB credentials secure
- [ ] Restrict MongoDB Atlas IP whitelist
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting (optional)
- [ ] Configure CORS properly
- [ ] Keep dependencies updated
- [ ] Set up automated backups

---

## Monitoring Commands

```bash
# Check running containers
docker ps

# View logs
docker logs badminton-api -f
docker logs badminton-web -f

# Resource usage
docker stats

# Restart containers
docker restart badminton-api badminton-web

# Access container shell
docker exec -it badminton-api sh
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker logs badminton-api

# Common issues:
# 1. MongoDB connection failed - check MONGO_URI
# 2. Port already in use - check if another process uses port 5000
# 3. Missing .env file - ensure server/.env exists
```

### Frontend can't connect to API
```bash
# Verify API URL
curl https://badminton-api.xenocer.com/api/health

# Check CORS settings in backend
# Ensure VITE_API_BASE is correct in frontend build
```

### Database connection issues
```bash
# Test MongoDB connection
docker exec -it badminton-api sh
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected')).catch(err => console.error(err))"
```

---

## Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build

# Or individual services
docker compose up -d --build backend
docker compose up -d --build frontend
```

---

## Backup Strategy

### Database Backup
```bash
# MongoDB Atlas has automated backups
# Or use mongodump for manual backups
docker exec badminton-api mongodump --uri="$MONGO_URI" --out=/backup
```

### Uploaded Files Backup
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz server/uploads/
```

---

## Health Checks

```bash
# API health check
curl https://badminton-api.xenocer.com/api/health

# Expected response:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

---

## Production Performance Tips

1. **Enable gzip compression** in nginx
2. **Use CDN** for static assets
3. **Configure caching headers**
4. **Set up MongoDB indexes** (already done in models)
5. **Monitor server resources** (CPU, RAM, disk)
6. **Set up log rotation**
7. **Use PM2** if not using Docker (for process management)

---

## Support

For issues or questions:
- Check logs first: `docker logs <container-name>`
- Review error messages in browser console
- Verify environment variables are set correctly
- Check MongoDB Atlas connection from server IP
