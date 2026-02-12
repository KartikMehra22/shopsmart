#!/bin/bash

INSTANCE_ID="i-0dc10b39da8b76391"

CURRENT_STATE=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query "Reservations.Instances.State.Name" \
  --output text)

echo "[INFO] Current State: $CURRENT_STATE"

if [ "$1" == "start" ]; then
    if [ "$CURRENT_STATE" == "running" ]; then
        echo "[SKIP] Instance is already running."
    else
        echo "[INFO] Starting instance..."
        aws ec2 start-instances --instance-ids $INSTANCE_ID
    fi

elif [ "$1" == "stop" ]; then
    if [ "$CURRENT_STATE" == "stopped" ]; then
        echo "[SKIP] Instance is already stopped."
    else
        echo "[INFO] Stopping instance..."
        aws ec2 stop-instances --instance-ids $INSTANCE_ID
    fi

else
    echo "[ERROR] Usage: $0 {start|stop}"
fi