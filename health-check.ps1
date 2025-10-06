# Health check for all major services
Write-Host "Checking service health..." -ForegroundColor Cyan
function Test-Endpoint($url) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}
if (Test-Endpoint "http://localhost:5000") {
    Write-Host "✅ Node.js API is healthy" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js API is NOT healthy" -ForegroundColor Red
}
if (Test-Endpoint "http://localhost:5000/metrics") {
    Write-Host "✅ Metrics Endpoint is healthy" -ForegroundColor Green
} else {
    Write-Host "❌ Metrics Endpoint is NOT healthy" -ForegroundColor Red
}
if (Test-Endpoint "http://localhost:9090") {
    Write-Host "✅ Prometheus is healthy" -ForegroundColor Green
} else {
    Write-Host "❌ Prometheus is NOT healthy" -ForegroundColor Red
}
if (Test-Endpoint "http://localhost:3000") {
    Write-Host "✅ Grafana is healthy" -ForegroundColor Green
} else {
    Write-Host "❌ Grafana is NOT healthy" -ForegroundColor Red
}
