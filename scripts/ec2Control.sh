#!/bin/bash

INSTANCE_ID="i-0dc10b39da8b76391"

if [ "$1" == "start" ]; then
    echo "[INFO] Requesting Start for $INSTANCE_ID..."
    aws ec2 start-instances --instance-ids $INSTANCE_ID

elif [ "$1" == "stop" ]; then
    echo "[INFO] Requesting Stop for $INSTANCE_ID..."
    aws ec2 stop-instances --instance-ids $INSTANCE_ID

else
    echo "[ERROR] Usage: $0 {start|stop}"
fi