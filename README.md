# 📊 Monitoring Stack Setup Guide

Complete monitoring solution with **auto-configured Grafana dashboards** and Prometheus data source.

## 🎯 Features

- ✅ **Auto-provisioned Grafana dashboards** (no manual import needed)
- ✅ **Pre-configured Prometheus data source**
- ✅ **Real-time metrics** for Node.js, MongoDB, PostgreSQL, Redis
- ✅ **Alert rules** for critical events
- ✅ **Health checks** for all services
- ✅ **30-day metric retention**

## 📁 Directory Structure

```
.
├── docker-compose.yml              # Main application stack
├── docker-compose.monitoring.yml   # Monitoring stack
├── .env                            # Environment variables
├── Makefile                        # Easy commands
├── setup-monitoring.sh             # Setup script
├── mongo-init.js                   # MongoDB user creation
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml     # Auto-configured data source
│   │   └── dashboards/
│   │       └── dashboard.yml       # Dashboard provider
│   └── dashboards/
│       ├── system-overview.json    # System metrics dashboard
│       └── database-monitoring.json # Database metrics dashboard
└── prometheus/
    ├── prometheus.yml              # Prometheus config
    └── alerts.yml                  # Alert rules
```

## 🚀 Quick Start

### Option 1: Using Makefile (Recommended)

```bash
# Setup and start everything
make start-all

# Or step by step:
make setup              # Setup monitoring infrastructure
make start              # Start main application
make monitoring-start   # Start monitoring stack
```

### Option 2: Manual Setup

```bash
# 1. Setup monitoring
chmod +x setup-monitoring.sh
./setup-monitoring.sh

# 2. Start main application
docker-compose up -d

# 3. Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d
```

## 🔗 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:5000 | - |
| Metrics Endpoint | http://localhost:5000/metrics | - |
| GraphQL Playground | http://localhost:5000/graphql | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin / admin |
| MongoDB | mongodb://localhost:27017 | admin / secret |
| PostgreSQL | postgresql://localhost:5432 | postgres / example |
| Redis | redis://localhost:6379 | - |

## 📊 Pre-loaded Dashboards

Grafana automatically loads these dashboards on first start:

### 1. **System Overview**
- CPU Usage
- Memory Usage
- HTTP Request Duration (P95)
- Request Rate by Status Code

### 2. **Database Monitoring**
- MongoDB connections & operations
- PostgreSQL connections & transactions
- Redis memory usage & hit rate
- Real-time performance metrics

## ⚠️ Alert Rules

Pre-configured alerts for:

**System Alerts:**
- High CPU usage (>80% for 5 min)
- High memory usage (>85% for 5 min)
- Low disk space (>80% usage)

**Application Alerts:**
- High response time (P95 >1000ms)
- High error rate (>5% 5xx errors)
- Service down

**Database Alerts:**
- MongoDB/PostgreSQL/Redis down
- High connection counts
- Redis low hit rate (<70%)
- Redis high memory usage (>80%)

## 🛠️ Useful Commands

```bash
# View all available commands
make help

# Check service health
make health

# View logs
make logs                # Main stack logs
make monitoring-logs     # Monitoring stack logs

# Restart services
make restart             # Restart main stack
make monitoring-restart  # Restart monitoring

# Access database shells
make shell-mongo         # MongoDB shell
make shell-postgres      # PostgreSQL shell
make shell-redis         # Redis CLI

# Backup databases
make backup-db           # Creates timestamped backups

# Stop everything
make stop-all            # Stop all containers

# Clean up (removes volumes)
make clean               # Interactive cleanup
```

## 🔧 Troubleshooting

### Dashboards not showing?

1. Check Grafana logs:
```bash
docker logs grafana
```

2. Verify provisioning directory is mounted:
```bash
docker exec grafana ls -la /etc/grafana/provisioning/dashboards
docker exec grafana ls -la /etc/grafana/dashboards
```

3. Force reload:
```bash
make monitoring-restart
```

### Prometheus not scraping?

1. Check Prometheus targets:
   - Go to http://localhost:9090/targets
   - All targets should show "UP"

2. Verify network connectivity:
```bash
docker exec prometheus wget -O- http://node-api:5000/metrics
```

### MongoDB exporter failing?

The exporter user is created automatically via `mongo-init.js`. If it fails:

```bash
# Manually create the user
docker exec -it mongodb mongosh -u admin -p secret --authenticationDatabase admin

# In the MongoDB shell:
use admin
db.createUser({
  user: 'exporter',
  pwd: 'exporter123',
  roles: [
    { role: 'clusterMonitor', db: 'admin' },
    { role: 'read', db: 'local' }
  ]
})
```

## 📈 Adding Custom Dashboards

1. Create your dashboard in Grafana UI
2. Export it as JSON
3. Save to `grafana/dashboards/your-dashboard.json`
4. Wrap the dashboard content:
```json
{
  "dashboard": {
    // Your dashboard JSON here
  },
  "overwrite": true
}
```
5. Restart Grafana: `make monitoring-restart`

## 🔐 Security Recommendations

**Production Checklist:**
- [ ] Change default Grafana password
- [ ] Change MongoDB root password
- [ ] Change PostgreSQL password
- [ ] Set Redis password
- [ ] Create separate app users (not root)
- [ ] Enable TLS for database connections
- [ ] Restrict port exposure
- [ ] Enable authentication for Prometheus
- [ ] Set up alerting notifications (Slack, Email, PagerDuty)

## 📝 Customization

### Change Scrape Intervals

Edit `prometheus/prometheus.yml`:
```yaml
global:
  scrape_interval: 10s  # Change from 15s
```

### Add New Metrics

In your Node.js app (`index.js`):
```javascript
const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'status']
});

app.use((req, res, next) => {
  res.on('finish', () => {
    requestCounter.inc({ method: req.method, status: res.statusCode });
  });
  next();
});
```

### Configure Alert Notifications

Edit `docker-compose.monitoring.yml` to add Grafana environment variables:
```yaml
environment:
  - GF_SMTP_ENABLED=true
  - GF_SMTP_HOST=smtp.gmail.com:587
  - GF_SMTP_USER=your-email@gmail.com
  - GF_SMTP_PASSWORD=your-app-password
```

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [prom-client (Node.js)](https://github.com/siimon/prom-client)
- [MongoDB Exporter](https://github.com/percona/mongodb_exporter)
- [PostgreSQL Exporter](https://github.com/prometheus-community/postgres_exporter)
- [Redis Exporter](https://github.com/oliver006/redis_exporter)

## 🤝 Support

If you encounter issues:
1. Check the logs: `make logs` or `make monitoring-logs`
2. Verify all services are healthy: `make health`
3. Check Prometheus targets: http://localhost:9090/targets
4. Verify Grafana data source: http://localhost:3000/datasources

---

**Built with ❤️ for production-ready monitoring**
