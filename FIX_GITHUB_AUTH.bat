@echo off
echo ========================================
echo  GitHub Authentication Fix
echo ========================================
echo.
echo GitHub blocked the upload because it needs a Personal Access Token.
echo.
echo FOLLOW THESE STEPS:
echo.
echo 1. Open your browser and go to:
echo    https://github.com/settings/tokens/new
echo.
echo 2. You'll see "New personal access token"
echo    - Note: Type "BetaX Upload"
echo    - Expiration: Choose "90 days"
echo    - Check the box: "repo" (Full control of private repositories)
echo .
echo 3. Scroll down and click "Generate token"
echo.
echo 4. COPY the token (it looks like: ghp_xxxxxxxxxxxx)
echo.
echo 5. Come back here and paste it when git asks for password
echo.
pause
echo.
echo Now pushing to GitHub...
echo When it asks for password, PASTE THE TOKEN (not your password)
echo.

cd /d "C:\Users\USER\BetaX"
git push origin main

if errorlevel 1 (
    echo.
    echo Still failed? Try:
    git push origin master
    pause
) else (
    echo.
    echo ========================================
    echo  SUCCESS! Files uploaded to GitHub!
    echo ========================================
    echo.
    echo Your website will update in 30 seconds.
    echo Visit: https://betax-website.vercel.app
    echo.
    pause
)
