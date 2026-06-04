Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-Docx {
    param([string]$path)
    $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
    $entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $zip.Dispose()
    $text = $xml -replace '<[^>]+>', ' '
    $text = $text -replace '\s+', ' '
    return $text.Trim()
}

Write-Host "=== ConvertPDF_Code_Audit.docx ===" -ForegroundColor Cyan
Read-Docx "e:\ConvertPDF\ConvertPDF_Code_Audit.docx"
