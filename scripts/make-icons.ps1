Add-Type -AssemblyName System.Drawing

function New-Icon($size, $path) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $bmp.SetResolution(96, 96)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
  $radius = [int]($size * 0.22)
  $pathObj = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $pathObj.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $pathObj.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $pathObj.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $pathObj.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $pathObj.CloseFigure()

  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 16, 185, 129),
    [System.Drawing.Color]::FromArgb(255, 13, 148, 136),
    45
  )
  $g.FillPath($brush, $pathObj)

  $font = New-Object System.Drawing.Font("Segoe UI", [float]($size * 0.55), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $white = [System.Drawing.Brushes]::White
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textRect = New-Object System.Drawing.RectangleF(0, [float](-$size * 0.03), $size, $size)
  $g.DrawString("E", $font, $white, $textRect, $sf)

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

New-Item -ItemType Directory -Force -Path "icons" | Out-Null
New-Icon 16 "icons/icon16.png"
New-Icon 48 "icons/icon48.png"
New-Icon 128 "icons/icon128.png"
Write-Output "Icons generated."
