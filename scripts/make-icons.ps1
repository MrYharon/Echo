Add-Type -AssemblyName System.Drawing

function New-Icon($size, $path) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $bmp.SetResolution(96, 96)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
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

  # Light blue gradient (Sky blue #38bdf8 to #0284c7)
  $c1 = [System.Drawing.Color]::FromArgb(255, 56, 189, 248)
  $c2 = [System.Drawing.Color]::FromArgb(255, 2, 132, 199)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 60)
  $g.FillPath($brush, $pathObj)

  # Draw concentric echo rings / waves in the background
  $penWave = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 255, 255, 255), [float]($size * 0.05))
  $waveRect1 = New-Object System.Drawing.RectangleF([float]($size * 0.15), [float]($size * 0.15), [float]($size * 0.7), [float]($size * 0.7))
  $g.DrawArc($penWave, $waveRect1, -40, 80)
  $penWave.Dispose()

  # Clean bold 'E'
  $fontFamily = New-Object System.Drawing.FontFamily("Segoe UI")
  $fontStyle = [System.Drawing.FontStyle]::Bold
  $font = New-Object System.Drawing.Font($fontFamily, [float]($size * 0.54), $fontStyle, [System.Drawing.GraphicsUnit]::Pixel)
  $white = [System.Drawing.Brushes]::White
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textRect = New-Object System.Drawing.RectangleF(0, [float](-$size * 0.02), $size, $size)
  $g.DrawString("E", $font, $white, $textRect, $sf)

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

New-Item -ItemType Directory -Force -Path "icons" | Out-Null
New-Icon 16 "icons/icon16.png"
New-Icon 48 "icons/icon48.png"
New-Icon 128 "icons/icon128.png"
Write-Output "Light blue icons generated."
