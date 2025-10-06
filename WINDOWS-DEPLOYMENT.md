# 🪟 Windows Docker Desktop - Complete Deployment Guide

## 📋 Prerequisites

### 1. Install Docker Desktop for Windows

1. **Download Docker Desktop**
   - Visit: https://www.docker.com/products/docker-desktop
   - Download the Windows installer
   - Run the installer and follow the setup wizard

2. **Configure Docker Desktop**
   - Open Docker Desktop
   - Go to **Settings** → **Resources**
   - Allocate at least:
     - **4 GB RAM** (8 GB recommended)
     - **2 CPUs** (4 CPUs recommended)
     - **60 GB Disk space**
   - Enable **WSL 2** backend (recommended)
   - Click **Apply & Restart**

3. **Verify Installation**
   ```powershell
   docker --version
   docker-compose --version
   ```

### 2. Enable Execution Policy (First Time Only)

Open **PowerShell as Administrator** and run:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Type `Y` and press Enter to confirm.

---

## 📁 Project Structure

Create your project folder and navigate to it:

```powershell
# Create project directory
mkdir C:\ecommerce-monitor
cd C:\ecommerce-monitor

# Your files should be organized like this:
# ecommerce-monitor/
# ├── .env
# ├── docker-compose.yml
# ├── docker-compose.monitoring.yml
# ├── Dockerfile
# ├── mongo-init.js
# ├── setup-monitoring.ps1
# ├── start-all.ps1
# ├── stop-all.ps1
# ├── restart.ps1
# ├── logs.ps1
# ├── health-check.ps1
# ├── cleanup.ps1
# ├── src/
# │   └── (your application code)
# ├── grafana/
# ├── prometheus/
# └── package.json
```

---

## 🚀 Quick Start Deployment

### **Step 1: Setup Everything**

Open **PowerShell** (normal, not admin) in your project directory:

```powershell
# Navigate to project directory
cd C:\ecommerce-monitor

# Run the setup script
.\setup-monitoring.ps1
```

This will:
- ✅ Create all required directories
- ✅ Generate Grafana configuration files
- ✅ Generate Prometheus configuration files
- ✅ Create Docker network

### **Step 2: Start All Services**

```powershell
.\start-all.ps1
```

This will:
- ✅ Start MongoDB, PostgreSQL, Redis
- ✅ Start your Node.js application
- ✅ Start Prometheus
- ✅ Start Grafana with auto-loaded dashboards
- ✅ Start all exporters

**Wait 1-2 minutes** for all services to initialize.

### **Step 3: Verify Everything is Running**

```powershell
.\health-check.ps1
```

Expected output:
```
✅ Node.js API is healthy
✅ Metrics Endpoint is healthy
✅ Prometheus is healthy
✅ Grafana is healthy
```

---

## 🔗 Access Your Services

Open your browser and visit:

| Service | URL | Credentials |
|---------|-----|-------------|
| **API** | http://localhost:5000 | - |
| **Metrics** | http://localhost:5000/metrics | - |
| **GraphQL** | http://localhost:5000/graphql | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | `admin` / `admin` |

### First-Time Grafana Access:

1. Go to http://localhost:3000
2. Login with `admin` / `admin`
3. **Skip** password change (or set a new one)
4. Navigate to **Dashboards** → **Ecommerce** folder
5. You'll see:
   - 📊 **System Overview** - CPU, Memory, HTTP metrics
   - 🗄️ **Database Monitoring** - MongoDB, PostgreSQL, Redis

---

## 📝 Common Commands

### View Logs

```powershell
# View all logs
.\logs.ps1

# View only monitoring logs
.\logs.ps1 -Service monitoring

# View specific container logs
docker logs -f node-api
docker logs -f grafana
docker logs -f prometheus
```

### Restart Services

```powershell
# Restart everything
.\restart.ps1

# Restart only main stack
.\restart.ps1 -Stack main

# Restart only monitoring stack
.\restart.ps1 -Stack monitoring
```

### Stop Services

```powershell
# Stop all services
.\stop-all.ps1

# Stop only main stack
docker-compose down

# Stop only monitoring stack
docker-compose -f docker-compose.monitoring.yml down
```

### Database Access

```powershell
# MongoDB Shell
docker exec -it mongodb mongosh -u admin -p secret --authenticationDatabase admin

# PostgreSQL Shell
docker exec -it postgres psql -U postgres -d ecommerce

# Redis CLI
docker exec -it redis redis-cli
```

---

## 🔧 Troubleshooting

### ❌ Docker Desktop Not Running

**Error**: `error during connect: this error may indicate that the docker daemon is not running`

**Solution**:
1. Open Docker Desktop from Start Menu
2. Wait for it to fully start (whale icon in system tray should be stable)
3. Try your command again

### ❌ Port Already in Use

**Error**: `Bind for 0.0.0.0:5000 failed: port is already allocated`

**Solution**:
```powershell
# Find what's using the port
netstat -ano | findstr :5000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F

# Or change the port in .env file
# PORT=5001
```

### ❌ MongoDB Connection Failed

**Error**: `MongoServerError: Authentication failed`

**Solution**:
```powershell
# Remove volumes and restart
docker-compose down -v
docker-compose up -d

# Wait 30 seconds for MongoDB to initialize
Start-Sleep -Seconds 30

# Verify MongoDB is running
docker logs mongodb
```

### ❌ Grafana Dashboards Not Loading

**Solution**:
```powershell
# Check if provisioning files exist
dir grafana\provisioning\datasources\
dir grafana\provisioning\dashboards\
dir grafana\dashboards\

# If missing, run setup again
.\setup-monitoring.ps1

# Restart Grafana
docker restart grafana

# Check Grafana logs
docker logs grafana
```

### ❌ PowerShell Script Won't Run

**Error**: `cannot be loaded because running scripts is disabled`

**Solution**:
```powershell
# Run as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass
powershell -ExecutionPolicy Bypass -File .\start-all.ps1
```

### ❌ Network Error

**Error**: `network app-network not found`

**Solution**:
```powershell
# Create network manually
docker network create app-network

# Or run setup again
.\setup-monitoring.ps1
```

---

## 🧹 Complete Cleanup

To remove everything and start fresh:

```powershell
.\cleanup.ps1
```

This will ask for confirmation and then:
- 🗑️ Remove all containers
- 🗑️ Remove all volumes
- 🗑️ Remove networks
- 🗑️ Optionally prune Docker resources

---

## 📊 Monitoring Your Application

### View Prometheus Targets

1. Go to http://localhost:9090/targets
2. All targets should show **"UP"** status:
   - node-api
   - node-exporter
   - mongodb
   - redis
   - postgres
   - prometheus

### View Metrics in Grafana

1. Go to http://localhost:3000
2. Click **Dashboards** (left sidebar)
3. Click **Ecommerce** folder
4. Select a dashboard:
   - **System Overview** - Application performance
   - **Database Monitoring** - Database health

### Create Custom Dashboards

1. In Grafana, click **+** → **Dashboard**
2. Click **Add visualization**
3. Select **Prometheus** as data source
4. Write your query (e.g., `rate(http_request_duration_ms_count[5m])`)
5. Click **Save**

---

## 🔄 Daily Operations

### Morning Startup

```powershell
# Start Docker Desktop (if not already running)
# Then:
cd C:\ecommerce-monitor
.\start-all.ps1
.\health-check.ps1
```

### Check Service Health

```powershell
# Quick health check
.\health-check.ps1

# View resource usage
docker stats

# Check Prometheus targets
start http://localhost:9090/targets
```

### View Live Logs

```powershell
# All services
.\logs.ps1

# Specific service
docker logs -f node-api
```

### Evening Shutdown

```powershell
.\stop-all.ps1
```

---

## 🎯 Performance Tips for Windows

### 1. **Use WSL 2 Backend**
   - Docker Desktop → Settings → General
   - Enable "Use WSL 2 based engine"
   - Much faster than Hyper-V backend

### 2. **Increase Resources**
   - Settings → Resources → Advanced
   - Increase CPUs to 4
   - Increase Memory to 8 GB
   - Increase Disk size to 100 GB

### 3. **File Sharing Performance**
   - Avoid placing project on network drives
   - Use local drives (C:\ or D:\)
   - Consider using WSL 2 file system: `\\wsl$\Ubuntu\home\user\project`

### 4. **Docker Desktop Settings**
   - Enable "Use Docker Compose V2"
   - Disable "Send usage statistics"
   - Enable "Expose daemon on tcp://localhost:2375"

---

## 🔐 Security for Production

Before deploying to production:

```powershell
# 1. Change passwords in .env file
notepad .env

# Update these:
# GRAFANA_PASSWORD=your-secure-password
# MONGO_INITDB_ROOT_PASSWORD=your-secure-password
# POSTGRES_PASSWORD=your-secure-password
# JWT_SECRET=your-random-secret-key

# 2. Restart services
.\restart.ps1
```

---

## 📚 Additional Resources

- **Docker Desktop Docs**: https://docs.docker.com/desktop/windows/
- **PowerShell Basics**: https://docs.microsoft.com/powershell/
- **Grafana Docs**: https://grafana.com/docs/
- **Prometheus Docs**: https://prometheus.io/docs/

---

## 🆘 Getting Help

### Check Logs
```powershell
# All services
.\logs.ps1

# Specific service
docker logs node-api
docker logs grafana
docker logs prometheus
```

### Check Container Status
```powershell
docker ps -a
```

### Check Resource Usage
```powershell
docker stats
```

### Restart Everything
```powershell
.\cleanup.ps1
.\start-all.ps1
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Docker Desktop is running
- [ ] All containers are up: `docker ps`
- [ ] API responds: http://localhost:5000
- [ ] Metrics available: http://localhost:5000/metrics
- [ ] Prometheus targets UP: http://localhost:9090/targets
- [ ] Grafana accessible: http://localhost:3000
- [ ] Dashboards loaded in Grafana
- [ ] Alerts configured in Prometheus

---

**🎉 You're all set! Happy monitoring!**

For issues, check troubleshooting section or run `.\health-check.ps1`