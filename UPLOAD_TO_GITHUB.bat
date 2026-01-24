@echo off
echo ========================================
echo  BetaX GitHub Auto-Upload Script
echo ========================================
echo.
echo This script will upload all your fixes to GitHub.
echo.

REM Navigate to BetaX folder
cd /d "C:\Users\USER\BetaX"

echo Checking if Git is installed...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)
echo Git is installed! ✓
echo.

echo Adding all modified files to Git...
git add _data/products/irrigate-smart.md
git add _data/products/solar-plant.md
git add _data/products/ignite-home.md
git add index.html
git add solutions.html
git add team.html
git add css/pages.css
git add js/forms.js
git add js/cms-loader.js
git add contact.html
git add book-consultation.html
echo Files staged ✓
echo.

echo Removing deleted files from Git...
git rm netlify.toml >nul 2>&1
git rm _redirects >nul 2>&1
git rm -r sanity-studio >nul 2>&1
echo Deleted files removed ✓
echo.

echo Creating commit...
git commit -m "Fix all website issues: products, team grid, performance optimizations"
if errorlevel 1 (
    echo.
    echo WARNING: No changes to commit, or commit failed.
    echo This might mean files are already uploaded.
    echo.
    pause
    exit /b 1
)
echo Commit created ✓
echo.

echo Pushing to GitHub...
echo (You may need to enter your GitHub username and password)
echo.
git push origin main
if errorlevel 1 (
    echo.
    echo ERROR: Push failed!
    echo.
    echo Possible reasons:
    echo - Wrong username/password
    echo - No internet connection  
    echo - Branch name is not 'main' (try 'master')
    echo.
    echo Try this command manually:
    echo   git push origin master
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS! All files uploaded! ✓
echo ========================================
echo.
echo Your website will update in 30 seconds.
echo Visit: https://betax-website.vercel.app
echo.
pause
