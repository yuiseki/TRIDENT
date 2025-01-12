#!/bin/bash

# Check if GYAZO_ACCESS_TOKEN is set
if [ -z "${GYAZO_ACCESS_TOKEN}" ]; then
    echo "Error: GYAZO_ACCESS_TOKEN environment variable is not set"
    exit 1
fi

# Get current timestamp for unique filename
timestamp=$(date +%Y%m%d_%H%M%S)
screenshot_path="/home/ubuntu/screenshots/browser_${timestamp}.png"

# Ensure screenshots directory exists
mkdir -p /home/ubuntu/screenshots

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required commands
for cmd in jq curl; do
    if ! command_exists "$cmd"; then
        echo "Error: Required command '$cmd' is not installed"
        exit 1
    fi
done

# Find the most recent screenshot
echo "Looking for recent screenshot..."
latest_screenshot=$(ls -t /home/ubuntu/screenshots/localhost_*.png 2>/dev/null | head -n1)

if [ -z "$latest_screenshot" ]; then
    echo "Error: No screenshot found in /home/ubuntu/screenshots/"
    exit 1
fi

echo "Found screenshot: $latest_screenshot"
cp "$latest_screenshot" "${screenshot_path}"

# Ensure the screenshot exists and is readable
if [ ! -f "${screenshot_path}" ]; then
    echo "Error: Screenshot file not found at ${screenshot_path}"
    exit 1
fi

# Upload to Gyazo and extract permalink URL
if [ -f "${screenshot_path}" ]; then
    echo "Uploading screenshot to Gyazo..."
    curl -s -X POST \
         -H "Authorization: Bearer ${GYAZO_ACCESS_TOKEN}" \
         -F "imagedata=@${screenshot_path}" \
         https://upload.gyazo.com/api/upload | jq -r '.permalink_url'
    
    # Clean up screenshot file after successful upload
    rm -f "${screenshot_path}"
else
    echo "Error: Screenshot file not found"
    exit 1
fi
