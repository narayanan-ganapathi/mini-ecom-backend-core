# Cleanup all containers, volumes, and networks
Write-Host "This will remove all containers, volumes, and networks. Continue? (Y/N)" -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -eq "Y") {
    docker-compose down -v
    docker-compose -f docker-compose.monitoring.yml down -v
    docker system prune -a -f
    Write-Host "Cleanup complete." -ForegroundColor Green
} else {
    Write-Host "Cleanup aborted." -ForegroundColor Red
}
