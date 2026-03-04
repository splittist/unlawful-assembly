param(
  [string]$SourceDir = 'dist',
  [string]$OutputDir = 'artifacts',
  [string]$ZipName = ''
)

$ErrorActionPreference = 'Stop'

$sourcePath = Join-Path -Path (Get-Location) -ChildPath $SourceDir
$outputPath = Join-Path -Path (Get-Location) -ChildPath $OutputDir
$resolvedZipName = $ZipName

if ([string]::IsNullOrWhiteSpace($resolvedZipName)) {
  $timestamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
  $resolvedZipName = "sharepoint-dist-$timestamp.zip"
}

$zipPath = Join-Path -Path $outputPath -ChildPath $resolvedZipName

if (-not (Test-Path -Path $sourcePath -PathType Container)) {
  throw "Source directory '$SourceDir' was not found. Run npm run build:sharepoint first."
}

if (-not (Test-Path -Path $outputPath -PathType Container)) {
  New-Item -ItemType Directory -Path $outputPath | Out-Null
}

if (Test-Path -Path $zipPath -PathType Leaf) {
  Remove-Item -Path $zipPath -Force
}

Compress-Archive -Path (Join-Path -Path $sourcePath -ChildPath '*') -DestinationPath $zipPath -Force

Write-Host "Created SharePoint package: $zipPath"
