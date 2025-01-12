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

# Install required tools if not present
if ! command -v xdotool >/dev/null 2>&1; then
    echo "Installing xdotool for window management..."
    sudo apt-get update && sudo apt-get install -y xdotool
fi

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

# Navigate to URL if provided
if [ -n "$1" ]; then
    echo "Navigating to URL: $1"
    # The browser navigation and screenshot commands would typically be handled by the browser automation system
    # For this script, we assume the browser is already at the desired page
fi

# Take screenshot using browser
echo "Taking screenshot..."
# Function to take screenshot
take_screenshot() {
    local url="$1"
    local output_path="$2"
    
    # If URL is provided, navigate to it
    if [ -n "$url" ]; then
        echo "Navigating to $url..."
        # Browser navigation would happen here
        sleep 2  # Wait for page load
    fi
    
    # Take screenshot using browser automation
    echo "Taking screenshot..."
    
    # Use browser automation to capture screenshot
    echo "Capturing browser screenshot..."
    
    # Check if required tools are available
    if ! command -v import >/dev/null 2>&1; then
        echo "Installing ImageMagick for screenshot capture..."
        sudo apt-get update && sudo apt-get install -y imagemagick
    fi
    
    # Take screenshot of the active window
    if command -v import >/dev/null 2>&1; then
        # Get the active window ID
        active_window=$(xdotool getactivewindow)
        if [ -n "$active_window" ]; then
            import -window "$active_window" "$output_path"
            echo "Screenshot saved to: $output_path"
        else
            echo "Error: Could not find active browser window"
            exit 1
        fi
    else
        echo "Error: Screenshot tools not available"
        exit 1
    fi
}

# Take the screenshot
take_screenshot "$1" "${screenshot_path}"

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
