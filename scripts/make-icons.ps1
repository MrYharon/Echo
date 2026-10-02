Add-Type -AssemblyName System.Drawing

function New-Icon($size, $path) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $bmp.SetResolution(96, 96)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  # Background squircle
  $r = [float]($size * 0.22)
  $d = $r * 2
  $bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $bgPath.AddArc(0, 0, $d, $d, 180, 90)
  $bgPath.AddArc($size - $d, 0, $d, $d, 270, 90)
  $bgPath.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
  $bgPath.AddArc(0, $size - $d, $d, $d, 90, 90)
  $bgPath.CloseFigure()

  $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 22, 37, 68))
  $g.FillPath($bgBrush, $bgPath)
  $bgBrush.Dispose()
  $bgPath.Dispose()

  $white = [System.Drawing.Brushes]::White

  # Top Bar with inward stepped tooth
  $topPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $topPath.AddLine([float]($size * 28 / 128), [float]($size * 26 / 128), [float]($size * 100 / 128), [float]($size * 26 / 128))
  $topPath.AddLine([float]($size * 100 / 128), [float]($size * 26 / 128), [float]($size * 100 / 128), [float]($size * 40 / 128))
  $topPath.AddLine([float]($size * 100 / 128), [float]($size * 40 / 128), [float]($size * 49 / 128), [float]($size * 40 / 128))
  $topPath.AddLine([float]($size * 49 / 128), [float]($size * 40 / 128), [float]($size * 49 / 128), [float]($size * 45 / 128))
  $topPath.AddLine([float]($size * 49 / 128), [float]($size * 45 / 128), [float]($size * 28 / 128), [float]($size * 45 / 128))
  $topPath.CloseFigure()
  $g.FillPath($white, $topPath)
  $topPath.Dispose()

  # Middle Bar
  $midRect = New-Object System.Drawing.RectangleF([float]($size * 28 / 128), [float]($size * 57 / 128), [float]($size * 52 / 128), [float]($size * 14 / 128))
  $g.FillRectangle($white, $midRect)

  # Bottom Bar with upward stepped tooth
  $botPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $botPath.AddLine([float]($size * 28 / 128), [float]($size * 83 / 128), [float]($size * 49 / 128), [float]($size * 83 / 128))
  $botPath.AddLine([float]($size * 49 / 128), [float]($size * 83 / 128), [float]($size * 49 / 128), [float]($size * 88 / 128))
  $botPath.AddLine([float]($size * 49 / 128), [float]($size * 88 / 128), [float]($size * 100 / 128), [float]($size * 88 / 128))
  $botPath.AddLine([float]($size * 100 / 128), [float]($size * 88 / 128), [float]($size * 100 / 128), [float]($size * 102 / 128))
  $botPath.AddLine([float]($size * 100 / 128), [float]($size * 102 / 128), [float]($size * 28 / 128), [float]($size * 102 / 128))
  $botPath.CloseFigure()
  $g.FillPath($white, $botPath)
  $botPath.Dispose()

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

New-Item -ItemType Directory -Force -Path "icons" | Out-Null
New-Icon 16 "icons/icon16.png"
New-Icon 48 "icons/icon48.png"
New-Icon 128 "icons/icon128.png"
Write-Output "Exact glyph icons generated successfully."
