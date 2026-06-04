$gitignore = Get-Content 'e:\ConvertPDF\.gitignore' -Raw
Write-Host '--- .gitignore ---'
Write-Host $gitignore

Write-Host ''
Write-Host '--- newsletter.html ---'
if (Test-Path 'e:\ConvertPDF\newsletter.html') {
    Write-Host 'EXISTS - OK' -ForegroundColor Green
} else {
    Write-Host 'MISSING' -ForegroundColor Red
}

Write-Host ''
Write-Host '--- BreadcrumbList schema in a tool page ---'
$mergepdf = Get-Content 'e:\ConvertPDF\pages\mergepdf.html' -Raw
if ($mergepdf -match 'BreadcrumbList') {
    Write-Host 'BreadcrumbList EXISTS in mergepdf.html - OK' -ForegroundColor Green
} else {
    Write-Host 'BreadcrumbList MISSING from tool pages' -ForegroundColor Red
}

Write-Host ''
Write-Host '--- HowTo schema in a tool page ---'
if ($mergepdf -match 'HowTo') {
    Write-Host 'HowTo schema EXISTS in mergepdf.html - OK' -ForegroundColor Green
} else {
    Write-Host 'HowTo schema MISSING from tool pages' -ForegroundColor Red
}

Write-Host ''
Write-Host '--- DataTransfer fallback check in mergepdf ---'
$mergetool = ''
Get-ChildItem 'e:\ConvertPDF\tools' | Select-Object Name | Format-Table
if (Test-Path 'e:\ConvertPDF\tools\mergepdf.js') {
    $mergetool = Get-Content 'e:\ConvertPDF\tools\mergepdf.js' -Raw
    if ($mergetool -match 'DataTransfer') {
        Write-Host 'DataTransfer guard EXISTS' -ForegroundColor Green
        if ($mergetool -match 'reorder.*not supported|not supported.*reorder') {
            Write-Host 'Fallback toast EXISTS - OK' -ForegroundColor Green
        } else {
            Write-Host 'Fallback toast/info MISSING' -ForegroundColor Yellow
        }
    } else {
        Write-Host 'DataTransfer not found in mergepdf.js' -ForegroundColor Yellow
    }
}

Write-Host ''
Write-Host '--- package-lock.json in .gitignore ---'
if ($gitignore -match 'package-lock') {
    Write-Host 'package-lock.json IS in .gitignore - OK' -ForegroundColor Green
} else {
    Write-Host 'package-lock.json NOT in .gitignore - ISSUE' -ForegroundColor Red
}

Write-Host ''
Write-Host '--- /privacy redirect ---'
$redirects = Get-Content 'e:\ConvertPDF\_redirects' -Raw
if ($redirects -match '/privacy\s+/privacy\.html') {
    Write-Host '/privacy redirect EXISTS - OK' -ForegroundColor Green
} else {
    Write-Host '/privacy redirect MISSING' -ForegroundColor Red
}

Write-Host ''
Write-Host '--- Checking blog nav links (clean URLs) ---'
$index = Get-Content 'e:\ConvertPDF\index.html' -Raw
if ($index -match '/blog/blog_index\.html') {
    Write-Host 'index.html still uses /blog/blog_index.html (not clean /blog/)' -ForegroundColor Yellow
}
