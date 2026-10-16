# Build echo-extension.zip for direct download from the landing page
$destZip = "landing\assets\echo-extension.zip"
$stageDir = "$env:TEMP\echo-build-stage"

if (Test-Path $destZip) {
    Remove-Item $destZip -Force
}

if (Test-Path $stageDir) {
    Remove-Item $stageDir -Recurse -Force
}

New-Item -ItemType Directory -Path $stageDir -Force | Out-Null

# Copy distribution files to staging, explicitly excluding local secrets
Copy-Item "manifest.json" "$stageDir\" -Force
Copy-Item "background.js" "$stageDir\" -Force
Copy-Item "icons" "$stageDir\icons" -Recurse -Force
Copy-Item "popup" "$stageDir\popup" -Recurse -Force

New-Item -ItemType Directory -Path "$stageDir\src" -Force | Out-Null
Get-ChildItem "src" -File | Where-Object { $_.Name -notlike "*local.js" -and $_.Name -notlike ".env*" } | ForEach-Object {
    Copy-Item $_.FullName "$stageDir\src\" -Force
}

Compress-Archive -Path "$stageDir\*" -DestinationPath $destZip -Force
Remove-Item $stageDir -Recurse -Force

Write-Host "Extension zip packaged successfully at $destZip (secrets excluded)"

