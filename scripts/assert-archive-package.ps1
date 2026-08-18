param(
  [Parameter(Mandatory = $true)]
  [string]$ArchivePath
)

$resolvedArchive = (Resolve-Path -LiteralPath $ArchivePath).Path
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($resolvedArchive)

try {
  $forbiddenGitEntries = @(
    $archive.Entries | Where-Object {
      $_.FullName.Replace("\\", "/") -match "(^|/)\.git(?:/|$)"
    } | ForEach-Object FullName
  )

  $pointerEntries = @()
  foreach ($entry in $archive.Entries) {
    if ($entry.Length -gt 65536) { continue }
    $stream = $entry.Open()
    try {
      $reader = [System.IO.StreamReader]::new(
        $stream,
        [System.Text.UTF8Encoding]::new($false, $true),
        $true,
        1024,
        $true
      )
      try {
        $content = $reader.ReadToEnd()
        if ($content -match "(?im)^\s*gitdir:\s*(?:[A-Za-z]:[/\\]|/)") {
          $pointerEntries += $entry.FullName
        }
      } catch [System.Text.DecoderFallbackException] {
        # Binary entries are not Git pointer text.
      } finally {
        $reader.Dispose()
      }
    } finally {
      $stream.Dispose()
    }
  }

  $fetchSourceEntries = @(
    $archive.Entries | Where-Object {
      $_.FullName.Replace("\\", "/") -eq "scripts/fetch-src.mjs"
    } | ForEach-Object FullName
  )

  if ($forbiddenGitEntries.Count -gt 0) {
    throw "Forbidden Git metadata entries: $($forbiddenGitEntries -join ', ')"
  }
  if ($pointerEntries.Count -gt 0) {
    throw "Local absolute Git worktree pointers: $($pointerEntries -join ', ')"
  }
  if ($fetchSourceEntries.Count -gt 0) {
    throw "Mutable source-fetch script is present: $($fetchSourceEntries -join ', ')"
  }

  [pscustomobject]@{
    status = "PASS"
    archive = $resolvedArchive
    entries = $archive.Entries.Count
    forbidden_git_entries = 0
    local_absolute_git_pointers = 0
    fetch_src_entries = 0
    gitmodules_policy = "allowed unless separately prohibited"
  } | ConvertTo-Json -Compress
} finally {
  $archive.Dispose()
}
