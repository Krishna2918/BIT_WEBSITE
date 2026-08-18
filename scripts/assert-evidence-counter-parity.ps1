param(
  [Parameter(Mandatory = $true)]
  [string]$ManifestPath,

  [Parameter(Mandatory = $true)]
  [string]$ReceiptPath
)

$manifest = Get-Content -LiteralPath (Resolve-Path -LiteralPath $ManifestPath).Path -Raw | ConvertFrom-Json
$receipt = Get-Content -LiteralPath (Resolve-Path -LiteralPath $ReceiptPath).Path -Raw | ConvertFrom-Json

if ($null -eq $manifest.external_effects -or $null -eq $receipt.external_effects) {
  throw "Both evidence files must contain an external_effects object."
}

$manifestKeys = @($manifest.external_effects.PSObject.Properties.Name | Sort-Object)
$receiptKeys = @($receipt.external_effects.PSObject.Properties.Name | Sort-Object)
$manifestKeyJson = ConvertTo-Json $manifestKeys -Compress
$receiptKeyJson = ConvertTo-Json $receiptKeys -Compress

if ($manifestKeyJson -cne $receiptKeyJson) {
  throw "external_effects key-set mismatch: manifest=$manifestKeyJson receipt=$receiptKeyJson"
}

$mismatchedValues = @()
foreach ($key in $manifestKeys) {
  $manifestValue = $manifest.external_effects.$key
  $receiptValue = $receipt.external_effects.$key
  if ($manifestValue -isnot [int] -and $manifestValue -isnot [long]) {
    $mismatchedValues += "$key manifest value is not an integer"
    continue
  }
  if ($receiptValue -isnot [int] -and $receiptValue -isnot [long]) {
    $mismatchedValues += "$key receipt value is not an integer"
    continue
  }
  if ($manifestValue -ne $receiptValue) {
    $mismatchedValues += "$key differs: manifest=$manifestValue receipt=$receiptValue"
  }
  if ($manifestValue -ne 0) {
    $mismatchedValues += "$key is nonzero: $manifestValue"
  }
}

if ($mismatchedValues.Count -gt 0) {
  throw "external_effects value mismatch: $($mismatchedValues -join '; ')"
}

[pscustomobject]@{
  status = "PASS"
  canonical_key = "form_or_tracking_activations"
  key_count = $manifestKeys.Count
  keys = $manifestKeys
  value_mismatches = 0
  nonzero_values = 0
} | ConvertTo-Json -Compress
