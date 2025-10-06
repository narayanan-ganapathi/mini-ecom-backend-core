param(
    [string]$Stack = "all"
)
Write-Host "Restarting services..." -ForegroundColor Cyan
if ($Stack -eq "all") {
    .\stop-all.ps1
    .\start-all.ps1
} elseif ($Stack -eq "main") {
    if (Test-Path .\docker-compose.yml) {
        docker-compose restart
    }
} elseif ($Stack -eq "monitoring") {
    if (Test-Path .\docker-compose.monitoring.yml) {
        docker-compose -f docker-compose.monitoring.yml restart
    }
}
Write-Host "Restart complete." -ForegroundColor Green
