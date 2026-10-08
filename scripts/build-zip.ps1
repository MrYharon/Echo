# Build echo-extension.zip for direct download from the landing page
$destZip = "landing\assets\echo-extension.zip"

if (Test-Path $destZip) {
    Remove-Item $destZip -Force
}

$filesToZip = @(
    "manifest.json",
    "background.js",
    "icons",
    "popup",
    "src"
)

Compress-Archive -Path $filesToZip -DestinationPath $destZip -Force
Write-Host "Extension zip packaged successfully at $destZip"
