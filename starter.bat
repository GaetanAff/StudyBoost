@echo off
title Démarrage du Serveur - Projet NPM

color 0A
echo.
echo ========================================
echo   Démarrage de votre serveur NPM...
echo   Exécution de la commande: npm run dev
echo ========================================
echo.

npm run dev

color 07
echo.
echo ========================================
echo   Le serveur a été arrêté.
echo   Appuyez sur une touche pour quitter...
echo ========================================
echo.
pause > nul
exit