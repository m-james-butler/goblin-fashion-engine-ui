$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem

$repoRoot = Split-Path -Parent $PSScriptRoot
$xlsxPath = Join-Path $repoRoot 'src/resources/Goblin Fashion Engine.xlsx'
$outPath = Join-Path $repoRoot 'src/resources/inventory.json'
$imagesRoot = Join-Path $repoRoot 'src/resources/images'

if (-not (Test-Path $xlsxPath)) {
  throw "Workbook not found at: $xlsxPath"
}

function Read-XmlFromZipEntry {
  param(
    [Parameter(Mandatory = $true)]
    [System.IO.Compression.ZipArchiveEntry] $Entry
  )

  $reader = New-Object IO.StreamReader($Entry.Open())
  try {
    return [xml]$reader.ReadToEnd()
  } finally {
    $reader.Close()
  }
}

function Convert-ToBool {
  param([AllowNull()][string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $false
  }

  switch ($Value.Trim().ToLowerInvariant()) {
    'yes' { return $true }
    'true' { return $true }
    '1' { return $true }
    'y' { return $true }
    default { return $false }
  }
}

function Convert-ToNullableNumber {
  param([AllowNull()][string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $null
  }
  return [double]$Value
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($xlsxPath)

try {
  $mainNs = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
  $imageLookup = @{}

  if (Test-Path $imagesRoot) {
    foreach ($file in Get-ChildItem -Path $imagesRoot -Recurse -File) {
      $relativePath = $file.FullName.Substring($imagesRoot.Length).TrimStart('\').Replace('\', '/')
      $publicPath = "/resources/images/$relativePath"
      $imageLookup[$file.Name.ToLowerInvariant()] = $publicPath
    }
  }

  $sharedStrings = @()
  $sharedStringsEntry = $zip.GetEntry('xl/sharedStrings.xml')

  if ($sharedStringsEntry) {
    $sharedStringsXml = Read-XmlFromZipEntry -Entry $sharedStringsEntry
    $sharedNsManager = New-Object System.Xml.XmlNamespaceManager($sharedStringsXml.NameTable)
    $sharedNsManager.AddNamespace('d', $mainNs)

    foreach ($si in $sharedStringsXml.SelectNodes('//d:si', $sharedNsManager)) {
      $textValue = ''
      foreach ($tNode in $si.SelectNodes('.//d:t', $sharedNsManager)) {
        $textValue += $tNode.'#text'
      }
      $sharedStrings += $textValue
    }
  }

  $sheetXml = Read-XmlFromZipEntry -Entry ($zip.GetEntry('xl/worksheets/sheet1.xml'))
  $sheetNsManager = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
  $sheetNsManager.AddNamespace('d', $mainNs)

  function Get-CellValue {
    param([Parameter(Mandatory = $true)]$Cell)

    $cellType = $Cell.t
    if ($cellType -eq 's') {
      return $sharedStrings[[int]$Cell.v]
    }
    if ($cellType -eq 'b') {
      return [bool]([int]$Cell.v)
    }
    if ($cellType -eq 'inlineStr') {
      return [string]$Cell.is.t
    }
    if ($null -ne $Cell.v) {
      return [string]$Cell.v
    }
    return $null
  }

  $rows = @()
  foreach ($row in $sheetXml.SelectNodes('//d:sheetData/d:row', $sheetNsManager)) {
    $rowMap = @{}
    foreach ($cell in $row.SelectNodes('./d:c', $sheetNsManager)) {
      $column = ([regex]::Match($cell.r, '[A-Z]+')).Value
      $rowMap[$column] = Get-CellValue -Cell $cell
    }
    $rows += $rowMap
  }

  if ($rows.Count -lt 2) {
    throw 'Inventory sheet does not contain data rows.'
  }

  $records = @()
  for ($i = 1; $i -lt $rows.Count; $i++) {
    $row = $rows[$i]
    $id = $row['A']

    if ([string]::IsNullOrWhiteSpace([string]$id)) {
      continue
    }

    $filename = $row['E']
    $rawImagePath = $row['R']
    $imageKey = $null

    if (-not [string]::IsNullOrWhiteSpace([string]$filename)) {
      $imageKey = ([string]$filename).Trim().ToLowerInvariant()
    } elseif (-not [string]::IsNullOrWhiteSpace([string]$rawImagePath)) {
      $imageKey = [System.IO.Path]::GetFileName(([string]$rawImagePath).Trim()).ToLowerInvariant()
    }

    $mappedImagePath = $null
    if ($imageKey -and $imageLookup.ContainsKey($imageKey)) {
      $mappedImagePath = $imageLookup[$imageKey]
    }

    $records += [pscustomobject][ordered]@{
      id = [string]$row['A']
      count = [int](Convert-ToNullableNumber $row['B'])
      category = $row['C']
      subcategory = $row['D']
      filename = $filename
      primaryContext = $row['F']
      secondaryContext = $row['G']
      formality = $row['H']
      warmth = [int](Convert-ToNullableNumber $row['I'])
      layer = $row['J']
      colorPrimary = $row['K']
      colorSecondary = $row['L']
      pattern = $row['M']
      fabric = $row['N']
      fit = $row['O']
      officeOk = Convert-ToBool $row['P']
      publicWear = Convert-ToBool $row['Q']
      imagePath = $mappedImagePath
      includeInEngine = Convert-ToBool $row['S']
      status = $row['T']
      notes = $row['U']
      attentionLevel = $row['V']
    }
  }

  $records | ConvertTo-Json -Depth 4 | Set-Content -Path $outPath -Encoding utf8
  Write-Output "Exported $($records.Count) inventory records to $outPath"
}
finally {
  $zip.Dispose()
}
