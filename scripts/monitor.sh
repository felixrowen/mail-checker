#!/bin/bash

# Mail Checker Monitoring Script
echo "=== Mail Checker Status ==="
date

echo -e "\n📊 System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')%"
echo "Memory Usage: $(free | grep Mem | awk '{printf("%.1f%", $3/$2 * 100.0)}')"
echo "Disk Usage: $(df / | tail -1 | awk '{print $5}')"

echo -e "\n🐳 Docker Status:"
docker-compose -f docker-compose.prod.yml ps

echo -e "\n📋 Container Logs (last 10 lines):"
echo "--- Frontend ---"
docker-compose -f docker-compose.prod.yml logs --tail=10 frontend

echo "--- Backend ---"
docker-compose -f docker-compose.prod.yml logs --tail=10 backend

echo -e "\n🌐 Service Health:"
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)"
echo "Backend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)"

echo -e "\n📈 Nginx Status:"
sudo systemctl is-active nginx

echo -e "\n🔒 SSL Certificate Status:"
sudo certbot certificates 2>/dev/null | grep "Expiry Date" || echo "No SSL certificates found" 