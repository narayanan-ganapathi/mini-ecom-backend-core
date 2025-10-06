#!/bin/bash

set -e

echo "🚀 Setting up Monitoring Stack..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p grafana/provisioning/datasources
mkdir -p grafana/provisioning/dashboards
mkdir -p grafana/dashboards
mkdir -p prometheus

echo "✅ Directory structure created"

# Create Grafana datasource configuration
echo "📊 Creating Grafana datasource configuration..."
cat > grafana/provisioning/datasources/prometheus.yml << 'EOF'
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
EOF

# Create Grafana dashboard provider configuration
echo "📈 Creating Grafana dashboard provider..."
cat > grafana/provisioning/dashboards/dashboard.yml << 'EOF'
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
EOF

# Create Prometheus alerts
echo "⚠️  Creating Prometheus alert rules..."
cat > prometheus/alerts.yml << 'EOF'
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
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.instance }} has been down for more than 1 minute"
EOF

echo "✅ Configuration files created"

# Set proper permissions
echo "🔒 Setting permissions..."
chmod -R 755 grafana
chmod -R 755 prometheus

# Create network if it doesn't exist
echo "🌐 Creating Docker network..."
docker network create app-network 2>/dev/null || echo "Network already exists"

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start the main stack:     docker-compose up -d"
echo "   2. Start monitoring stack:    docker-compose -f docker-compose.monitoring.yml up -d"
echo ""
echo "🔗 Access URLs:"
echo "   API:        http://localhost:5000"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana:    http://localhost:3000 (admin/admin)"
echo ""
echo "📊 Grafana dashboards will be auto-loaded on first start!"
echo ""