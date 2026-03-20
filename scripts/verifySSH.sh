# Local verification script to check SSH accessibility

TARGET_IP="35.172.233.164"

echo "=> Checking if SSH (Port 22) is reachable at $TARGET_IP..."

if nc -zv -w 5 $TARGET_IP 22 2>&1 | grep -q 'succeeded'; then
    echo "✅ SSH port is OPEN! GitHub Actions should be able to connect."
else
    echo "❌ SSH port is CLOSED or TIMED OUT."
    echo "   Troubleshooting steps:"
    echo "   1. Ensure EC2 instance i-08561cce64f1ce0db is 'Running' and '2/2 checks passed'."
    echo "   2. Ensure Security Group has an inbound rule for Port 22 from 0.0.0.0/0."
    echo "   3. Double-check if the Public IP has changed (current: $TARGET_IP)."
fi