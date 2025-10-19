# Documentation Cleanup Script
# Moves old/duplicate documentation files to archive folders

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           DOCUMENTATION CLEANUP SCRIPT                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$moved = 0
$errors = 0

# Function to move file safely
function Move-Safely {
    param($file, $destination)
    
    if (Test-Path $file) {
        try {
            Move-Item $file -Destination $destination -ErrorAction Stop
            Write-Host "  ✓ Moved: $file" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "  ✗ Error moving $file : $_" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "  - Skipped (not found): $file" -ForegroundColor Yellow
        return $null
    }
}

Write-Host "📦 Archiving Phase Documents..." -ForegroundColor Yellow

$phaseFiles = @(
    "PHASE1-COMPLETE.md",
    "PHASE2-COMPLETE.md",
    "PHASE2-BSC-SUCCESS.md",
    "PHASE2-FINAL-SUMMARY.md",
    "PHASE3-COMPLETE.md",
    "PHASE4-COMPLETE.md",
    "BSC-FINAL-OPTIMIZED.md",
    "BSC-REVISED-CONFIG.md"
)

foreach ($file in $phaseFiles) {
    $result = Move-Safely $file "archive/old-phases/"
    if ($result -eq $true) { $moved++ }
    elseif ($result -eq $false) { $errors++ }
}

Write-Host "`n📦 Archiving Duplicate Quickstarts..." -ForegroundColor Yellow

$quickstartFiles = @(
    "QUICKSTART.md",
    "QUICK_START.md",
    "QUICK_REFERENCE.md",
    "QUICK-REFERENCE.md",
    "QUICK_START_POLYGON.md",
    "QUICK_START_FORK.md",
    "QUICK_START_EXPANDED_PAIRS.md",
    "START_HERE.md",
    "SUMMARY.md",
    "PROJECT_STATUS.md",
    "BOT_GUIDE.md",
    "BOT_WORKING_SUMMARY.md"
)

foreach ($file in $quickstartFiles) {
    $result = Move-Safely $file "archive/old-quickstarts/"
    if ($result -eq $true) { $moved++ }
    elseif ($result -eq $false) { $errors++ }
}

Write-Host "`n📦 Archiving Old Config Guides..." -ForegroundColor Yellow

$configFiles = @(
    "VERIFIED-CONFIG.md",
    "FINAL-CONFIG.md",
    "BUILD_STATUS.md",
    "BUILD_FIXED.md",
    "INSTALLATION_COMPLETE.md",
    "DEPLOYMENT_SUCCESS.md",
    "POLYGON_DEPLOYMENT_GUIDE.md",
    "IMPLEMENTATION_COMPLETE.md"
)

foreach ($file in $configFiles) {
    $result = Move-Safely $file "archive/old-guides/"
    if ($result -eq $true) { $moved++ }
    elseif ($result -eq $false) { $errors++ }
}

Write-Host "`n📦 Archiving Old Pair Guides..." -ForegroundColor Yellow

$pairFiles = @(
    "PAIR-DETECTION-COMPLETE.md",
    "PAIR_GENERATION_GUIDE.md",
    "TRADING_PAIRS_GUIDE.md",
    "DYNAMIC-PAIRS.md",
    "DYNAMIC-PAIRS-GUIDE.md",
    "EXPANDED_PAIRS_GUIDE.md",
    "REALISTIC_PAIRS.md",
    "TOKEN_EXPANSION_COMPLETE.md",
    "TOP-15-EXCLUSION.md",
    "WMATIC-EXCLUSION-UPDATE.md"
)

foreach ($file in $pairFiles) {
    $result = Move-Safely $file "archive/old-guides/"
    if ($result -eq $true) { $moved++ }
    elseif ($result -eq $false) { $errors++ }
}

Write-Host "`n📦 Archiving WebSocket Guides..." -ForegroundColor Yellow

$websocketFiles = @(
    "WEBSOCKET-GUIDE.md",
    "WEBSOCKET-IMPLEMENTATION.md",
    "WEBSOCKET-QUICKSTART.md",
    "WEBSOCKET-WORKING.md"
)

foreach ($file in $websocketFiles) {
    $result = Move-Safely $file "archive/old-guides/"
    if ($result -eq $true) { $moved++ }
    elseif ($result -eq $false) { $errors++ }
}

Write-Host "`n📦 Archiving Data Collection Duplicates..." -ForegroundColor Yellow

$dataFiles = @(
    "DATA_COLLECTION_GUIDE.md",
    "DATA-COLLECTION-STARTED.md",
    "DATA_LOGGING_COMPLETE.md"
)

foreach ($file in $dataFiles) {
    $result = Move-Safely $file "archive/old-guides/"
    if ($result -eq $true) { $moved++ }
    elseif ($result -eq $false) { $errors++ }
}

Write-Host "`n📦 Archiving Technical Docs..." -ForegroundColor Yellow

$techFiles = @(
    "ARCHITECTURE.md",
    "CONTRACT_EXPLANATION.md",
    "FLASH_LOAN_MECHANICS.md",
    "ARBITRAGE_WITHOUT_FLASH_LOANS.md",
    "ARBITRAGE_FIXES.md",
    "PROBLEM_ANALYSIS_AND_FIXES.md",
    "DEX_IMPLEMENTATION.md",
    "NETWORK_RESEARCH.md"
)

foreach ($file in $techFiles) {
    $result = Move-Safely $file "archive/old-guides/"
    if ($result -eq $true) { $moved++ }
    elseif ($result -eq $false) { $errors++ }
}

Write-Host "`n📦 Archiving Multi-chain Docs..." -ForegroundColor Yellow

$multichainFiles = @(
    "MULTICHAIN-SUMMARY.md",
    "MULTICHAIN-DEXES.md",
    "SCALING-SUCCESS.md"
)

foreach ($file in $multichainFiles) {
    $result = Move-Safely $file "archive/old-guides/"
    if ($result -eq $true) { $moved++ }
    elseif ($result -eq $false) { $errors++ }
}

Write-Host "`n📦 Archiving Misc Docs..." -ForegroundColor Yellow

$miscFiles = @(
    "LIQUIDITY_PROVIDER_GUIDE.md",
    "LOW_GAS_TRADING.md",
    "SEPOLIA_LIQUIDITY_GUIDE.md",
    "FAUCETS_GUIDE.md",
    "TESTING_ROADMAP.md",
    "RESEARCH_SUMMARY.md",
    "DOCUMENTATION_CLEANUP.md",
    "CONTRIBUTING.md",
    "list100.md"
)

foreach ($file in $miscFiles) {
    $result = Move-Safely $file "archive/old-guides/"
    if ($result -eq $true) { $moved++ }
    elseif ($result -eq $false) { $errors++ }
}

# Summary
Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    CLEANUP COMPLETE                           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📊 SUMMARY:" -ForegroundColor Yellow
Write-Host "  ✓ Files moved: $moved" -ForegroundColor Green
Write-Host "  ✗ Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "✅ REMAINING DOCS (Root):" -ForegroundColor Green
Write-Host "  1. README.md" -ForegroundColor White
Write-Host "  2. QUICK-START.md" -ForegroundColor White
Write-Host "  3. FINAL-PAIR-DETECTION.md" -ForegroundColor White
Write-Host "  4. DATA-COLLECTION-GUIDE.md" -ForegroundColor White
Write-Host "  5. PROJECT-COMPLETE.md" -ForegroundColor White
Write-Host ""
Write-Host "📦 ARCHIVED DOCS:" -ForegroundColor Yellow
Write-Host "  • archive/old-phases/ - Phase completion docs" -ForegroundColor White
Write-Host "  • archive/old-quickstarts/ - Duplicate quickstart files" -ForegroundColor White
Write-Host "  • archive/old-guides/ - All other superseded docs" -ForegroundColor White
Write-Host ""
