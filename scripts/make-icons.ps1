Add-Type -AssemblyName System.Drawing

function Add-RoundedRect($pathObj, $x, $y, $w, $h, $r) {
  $d = $r * 2
  $pathObj.AddArc($x, $y, $d, $d, 180, 90)
  $pathObj.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $pathObj.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $pathObj.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $pathObj.CloseFigure()
}

function New-Icon($size, $path) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $bmp.SetResolution(96, 96)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  # Flat light blue container
  $bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $r = [float]($size * 0.22)
  Add-RoundedRect $bgPath 0 0 $size $size $r
  $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
  $g.FillPath($bgBrush, $bgPath)
  $bgBrush.Dispose()
  $bgPath.Dispose()

  # Minimal geometric E bars
  $whiteBrush = [System.Drawing.Brushes]::White
  $barRadius = [float]([Math]::Max(1.0, $size * 0.04))

  # Vertical stem
  $stemPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-RoundedRect $stemPath ($size * 0.25) ($size * 0.23) ($size * 0.13) ($size * 0.54) $barRadius
  $g.FillPath($whiteBrush, $stemPath)
  $stemPath.Dispose()

  # Top bar
  $topPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-RoundedRect $topPath ($size * 0.25) ($size * 0.23) ($size * 0.50) ($size * 0.12) $barRadius
  $g.FillPath($whiteBrush, $topPath)
  $topPath.Dispose()

  # Middle bar
  $midPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-RoundedRect $midPath ($size * 0.25) ($size * 0.44) ($size * 0.38) ($size * 0.12) $barRadius
  $g.FillPath($whiteBrush, $midPath)
  $midPath.Dispose()

  # Bottom bar
  $botPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-RoundedRect $botPath ($size * 0.25) ($size * 0.65) ($size * 0.50) ($size * 0.12) $barRadius
  $g.FillPath($whiteBrush, $botPath)
  $botPath.Dispose()

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

New-Item -ItemType Directory -Force -Path "icons" | Out-Null
New-Icon 16 "icons/icon16.png"
New-Icon 48 "icons/icon48.png"
New-Icon 128 "icons/icon128.png"
Write-Output "Minimalist light blue icons generated successfully."
