# Start all services for ecommerce monitoring stack
Write-Host "Starting all services..." -ForegroundColor Cyan
# Start main stack
if (Test-Path .\docker-compose.yml) {
    docker-compose up -d
}
# Start monitoring stack
if (Test-Path .\docker-compose.monitoring.yml) {
    docker-compose -f docker-compose.monitoring.yml up -d
}
Write-Host "All services started. Wait 1-2 minutes for initialization." -ForegroundColor Green
