# Run Playwright tests and send one email with a matching PDF attachment.
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "`nRunning Playwright tests...`n" -ForegroundColor Cyan

# The Playwright config sends email automatically for direct/IDE runs.
# Disable that hook here so this wrapper can send once after PDF generation.
$previousEmailReport = $env:EMAIL_REPORT
$env:EMAIL_REPORT = "false"
npx playwright test
$testExitCode = $LASTEXITCODE
$env:EMAIL_REPORT = $previousEmailReport

Write-Host "`nTest execution completed (Exit Code: $testExitCode)." -ForegroundColor Green

Write-Host "`nSending Email Report..." -ForegroundColor Cyan
# email-reporter.js generates test-results/report.pdf from the exact same HTML
# used in the email body, so the PDF and email template always match.
node reporters/email-reporter.js
$emailExitCode = $LASTEXITCODE

if ($emailExitCode -eq 0) {
    Write-Host "Email sent successfully." -ForegroundColor Green
} else {
    Write-Host "Email sending failed (Exit Code: $emailExitCode). Run 'node scripts/test-email-config.js' to diagnose." -ForegroundColor Yellow
}

Write-Host "`nTest execution pipeline complete." -ForegroundColor Cyan

if ($testExitCode -ne 0) {
    exit $testExitCode
}

if ($emailExitCode -ne 0) {
    exit $emailExitCode
}
