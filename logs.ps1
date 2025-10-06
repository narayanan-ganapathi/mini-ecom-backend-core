param(
    [string]$Service = "all"
)
if ($Service -eq "all") {
    Write-Host "Showing logs for all containers..." -ForegroundColor Cyan
    docker-compose logs --tail=100
    docker-compose -f docker-compose.monitoring.yml logs --tail=100
} elseif ($Service -eq "monitoring") {
    Write-Host "Showing logs for monitoring stack..." -ForegroundColor Cyan
    docker-compose -f docker-compose.monitoring.yml logs --tail=100
} else {
    Write-Host "Showing logs for $Service..." -ForegroundColor Cyan
    docker logs -f $Service
}
