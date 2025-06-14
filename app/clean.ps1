# Stop any running Node.js processes
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force

# Remove node_modules and lock files
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules
Remove-Item -Force -ErrorAction SilentlyContinue yarn.lock
Remove-Item -Force -ErrorAction SilentlyContinue package-lock.json

# Clear yarn cache
yarn cache clean

# Install dependencies
yarn install

# Start the development server
yarn dev
