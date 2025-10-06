# Stop all services for ecommerce monitoring stack
Write-Host "Stopping all services..." -ForegroundColor Cyan
# Stop main stack
if (Test-Path .\docker-compose.yml) {
    docker-compose down
}
# Stop monitoring stack
if (Test-Path .\docker-compose.monitoring.yml) {
    docker-compose -f docker-compose.monitoring.yml down
}
Write-Host "All services stopped." -ForegroundColor Green
