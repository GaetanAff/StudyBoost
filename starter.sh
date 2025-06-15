trap '
echo ""
echo "========================================"
echo "  Le serveur a été arrêté.              "
echo "  Appuyez sur une touche pour quitter..."
echo "========================================"
echo ""
read -p "" > /dev/null;
exit
' SIGINT



echo ""
echo "========================================"
echo "  Démarrage de votre serveur NPM...     "
echo "  Exécution de la commande: npm run dev "
echo "          Ctrl+C pour arrêter           "
echo "========================================"
echo ""
npm run dev
