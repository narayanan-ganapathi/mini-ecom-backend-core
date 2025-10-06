# PowerShell script for Windows setup
Write-Host "🚀 Setting up Monitoring Stack for Windows..." -ForegroundColor Cyan

# Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "grafana\provisioning\datasources" | Out-Null
New-Item -ItemType Directory -Force -Path "grafana\provisioning\dashboards" | Out-Null
New-Item -ItemType Directory -Force -Path "grafana\dashboards" | Out-Null
New-Item -ItemType Directory -Force -Path "prometheus" | Out-Null

Write-Host "✅ Directory structure created" -ForegroundColor Green

# Create Grafana datasource configuration
Write-Host "📊 Creating Grafana datasource configuration..." -ForegroundColor Yellow
$datasourceYaml = @"
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
    jsonData:
      httpMethod: POST
      timeInterval: 15s
    version: 1
"@
$datasourceYaml | Out-File -FilePath "grafana\provisioning\datasources\prometheus.yml" -Encoding UTF8

# Create Grafana dashboard provider configuration
Write-Host "📈 Creating Grafana dashboard provider..." -ForegroundColor Yellow
$dashboardYaml = @" 
apiVersion: 1
providers:
  - name: 'Default'
    orgId: 1
    folder: 'Ecommerce'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/dashboards
      foldersFromFilesStructure: true
"@

$dashboardYaml | Out-File -FilePath "grafana\provisioning\dashboards\dashboard.yml" -Encoding UTF8

# Create Prometheus alerts
Write-Host "⚠️  Creating Prometheus alert rules..." -ForegroundColor Yellow
$alertsYaml = @" 
groups:
  - name: critical_alerts
    interval: 30s
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ `$labels.job }} is down"
          description: "{{ `$labels.instance }} has been down for more than 1 minute"
      
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ `$labels.instance }}"
          description: "CPU usage is above 80% (current: {{ `$value }}%)"
"@

$alertsYaml | Out-File -FilePath "prometheus\alerts.yml" -Encoding UTF8

Write-Host "✅ Configuration files created" -ForegroundColor Green

# Create Docker network
Write-Host "🌐 Creating Docker network..." -ForegroundColor Yellow
docker network create app-network 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Network created successfully" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Network already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start all services:         .\start-all.ps1" -ForegroundColor White
Write-Host "   2. Check health:               .\health-check.ps1" -ForegroundColor White
Write-Host "   3. View logs:                  .\logs.ps1" -ForegroundColor White
Write-Host "   4. Stop all services:          .\stop-all.ps1" -ForegroundColor White
Write-Host "   5. Cleanup everything:         .\cleanup.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Access URLs:" -ForegroundColor Cyan
Write-Host "   API:        http://localhost:5000" -ForegroundColor White
Write-Host "   Metrics:    http://localhost:5000/metrics" -ForegroundColor White
Write-Host "   GraphQL:    http://localhost:5000/graphql" -ForegroundColor White
Write-Host "   Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "   Grafana:    http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host ""