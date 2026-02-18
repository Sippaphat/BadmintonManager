# 🚀 Deployment Readiness Checklist

## ✅ Completed

- [x] Backend refactored to production-grade MVC architecture
- [x] Frontend integrated with new API endpoints (/api prefix)
- [x] Docker configuration updated (pnpm support)
- [x] Environment variables structure created
- [x] ID field transformation (MongoDB _id → id)
- [x] Express-validator added
- [x] Security middleware implemented (JWT, error handling, file upload)
- [x] Database models optimized with indexes
- [x] Port configuration fixed in Dockerfiles
- [x] .gitignore created for server directory
- [x] Deployment documentation created

---

## ⚠️ CRITICAL: Before Deployment

### 1. Security (MUST DO!)

- [ ] **Generate new JWT_SECRET**
  ```bash
  openssl rand -base64 64
  # Copy output to server/.env JWT_SECRET
  ```

- [ ] **Review and update server/.env** with production values:
  - `MONGO_URI` - Verify MongoDB Atlas connection
  - `JWT_SECRET` - Use generated secret (NOT "your-super-secret-jwt-key...")
  - `API_BASE_URL` - Set to your production domain
  - `GOOGLE_CLIENT_ID` - Verify correct for production

- [ ] **NEVER commit sensitive files:**
  - `server/.env` should be in .gitignore ✓
  - Remove credentials from git history if accidentally committed

### 2. Database Configuration

- [ ] MongoDB Atlas IP Whitelist
  - Add your server's public IP
  - Or use 0.0.0.0/0 (less secure, but works)

- [ ] Test database connection from server:
  ```bash
  # SSH to your server, then:
  curl -X POST https://your-domain.com/api/auth/google \
    -H "Content-Type: application/json" \
    -d '{"credential":"test"}'
  # Should get validation error, not connection error
  ```

### 3. Domain & SSL Setup

- [ ] Configure DNS A records:
  - `badminton-api.xenocer.com` → Server IP
  - `badminton.xenocer.com` → Server IP (or frontend domain)

- [ ] Install SSL certificates (Certbot + Let's Encrypt):
  ```bash
  sudo certbot --nginx -d badminton-api.xenocer.com -d badminton.xenocer.com
  ```

- [ ] Configure nginx reverse proxy (see DEPLOYMENT.md)

### 4. Frontend Configuration

- [ ] Update production API URL:
  - In docker-compose.yml build args: `VITE_API_BASE=https://badminton-api.xenocer.com`
  - Or in .env.production: `VITE_API_BASE=https://badminton-api.xenocer.com`

- [ ] Verify Google OAuth authorized origins:
  - https://badminton.xenocer.com
  - https://badminton-api.xenocer.com

### 5. Server Preparation

- [ ] Install Docker & Docker Compose on server:
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo apt install docker-compose-plugin
  ```

- [ ] Create uploads directory:
  ```bash
  mkdir -p server/uploads
  chmod 755 server/uploads
  ```

- [ ] Set up firewall:
  ```bash
  sudo ufw allow 22/tcp    # SSH
  sudo ufw allow 80/tcp    # HTTP
  sudo ufw allow 443/tcp   # HTTPS
  sudo ufw enable
  ```

---

## 🚀 Deployment Steps

### Step 1: Prepare Server

```bash
# SSH to your server
ssh user@your-server-ip

# Clone repository
git clone https://github.com/yourusername/BadmintonManager.git
cd BadmintonManager

# Create server/.env with production values
cp server/.env.example server/.env
nano server/.env  # Edit with real values
```

### Step 2: Deploy with Docker

```bash
# Build and start services
docker compose up -d --build

# Check if containers are running
docker ps

# View logs
docker compose logs -f
```

### Step 3: Configure Nginx

```bash
# Install nginx
sudo apt update
sudo apt install nginx

# Create config (see DEPLOYMENT.md for full config)
sudo nano /etc/nginx/sites-available/badminton

# Enable site
sudo ln -s /etc/nginx/sites-available/badminton /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Setup SSL

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d badminton-api.xenocer.com -d badminton.xenocer.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 5: Verify Deployment

```bash
# Check API health
curl https://badminton-api.xenocer.com/api/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"..."}

# Access frontend
# Open browser: https://badminton.xenocer.com
```

---

## 📊 Post-Deployment Checklist

- [ ] Test Google OAuth login
- [ ] Create a test group
- [ ] Add test players
- [ ] Upload player photo (test file upload)
- [ ] Test matchmaking functionality
- [ ] Verify ELO calculations
- [ ] Check responsive design on mobile
- [ ] Test all CRUD operations
- [ ] Monitor server logs for errors
- [ ] Set up automated backups
- [ ] Configure monitoring (optional: UptimeRobot, DataDog)

---

## 🔄 Update Process

```bash
# On server
cd BadmintonManager
git pull origin main
docker compose down
docker compose up -d --build
```

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Fix:** Check MongoDB Atlas IP whitelist, verify MONGO_URI in server/.env

### Issue: "CORS error" in browser
**Fix:** Verify VITE_API_BASE matches actual API URL, check backend CORS settings

### Issue: "JWT token invalid"
**Fix:** Ensure JWT_SECRET is consistent, check token expiration (7 days)

### Issue: "403 Forbidden" on API calls
**Fix:** Check JWT authentication, verify token in localStorage

### Issue: Player photos not loading
**Fix:** Verify uploads volume mount, check file permissions, ensure API_BASE_URL is correct

---

## 📞 Quick Commands Reference

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart services
docker compose restart backend
docker compose restart frontend

# Check container status
docker ps
docker stats

# Access container shell
docker exec -it badminton-api sh

# Backup database
docker exec badminton-api sh -c 'mongodump --uri="$MONGO_URI"'

# Backup uploads
tar -czf uploads-backup.tar.gz server/uploads/
```

---

## ✅ You're Ready When...

- [ ] All items in "CRITICAL: Before Deployment" are completed
- [ ] JWT_SECRET is a secure random 64-character string
- [ ] server/.env has real production values (no placeholders)
- [ ] MongoDB Atlas IP whitelist includes server IP
- [ ] Domain DNS is configured
- [ ] Docker is installed on server
- [ ] You've tested deployment in a staging environment (optional but recommended)

---

## 🎉 Once Deployed Successfully

1. Monitor logs for 24 hours
2. Test all features thoroughly
3. Set up automated backups (daily)
4. Configure monitoring/alerts
5. Document any custom configurations
6. Share app with users!

**Good luck with your deployment! 🚀**
