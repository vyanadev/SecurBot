# 🛡️ SecurBot - Votre Gardien Discord Ultime

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![Licence](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Node](https://img.shields.io/badge/Node.js-18.20.0.-green.svg)

> SecurBot est un bot de sécurité avancé pour Discord, conçu pour protéger votre serveur contre les raids, le spam et d'autres menaces tout en offrant une gestion flexible et intuitive.

## ✨ Fonctionnalités Principales

- 🛡️ **Système Anti-Raid** : Protection automatique contre les raids avec paramètres personnalisables
- 🔒 **Vérification des Membres** : Système de vérification configurable avec options multiples
- 👮 **Modération Avancée** : Outils de modération puissants avec système de logs détaillé
- 🌐 **Support Multilingue** : Prise en charge du français et de l'anglais
- 🎛️ **Configuration Flexible** : Interface intuitive via commandes slash pour personnaliser chaque aspect

## 🚀 Installation

1. Clonez ce dépôt
   ```sh
   git clone https://github.com/Henelio/SecurBot.git
   ```
2. Installez les dépendances NPM
   ```sh
   npm install
   ```
3. Configurez vos variables d'environnement dans un fichier `.env`
   ```
   TOKEN=votre_token_discord
   DB_HOST=votre_host_mysql
   DB_USER=votre_utilisateur_mysql
   DB_PASSWORD=votre_mot_de_passe_mysql
   DB_NAME=votre_nom_de_base_de_donnees
   DB_PORT=votre_port,
   ```
4. Lancez le bot
   ```sh
   npm start
   ```

## 🛠️ Configuration et Utilisation

- Retrouver dans le dossier `/database` le fichier `sql` pour le bon fonctionnement du bot.
- Personnalisez le système de vérification avec `!verify`
- Accédez à l'aide complète avec `!help`

## 📚 Commandes Principales

- `!antiraid` : Configure les paramètres de protection anti-raid
- `!whitelist` : Gère la liste blanche des utilisateurs de confiance

## 🌐 Support Multilangue Pour toute aide.

SecurBot prend en charge le français. La langue est automatiquement détectée pour chaque serveur.

## 📝 Licence

Copyright © 2024 [Henelio](https://github.com/henelio-dev).

Ce projet est sous licence [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html). Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Discord.js](https://discord.js.org/) pour leur excellente bibliothèque
- Tous nos contributeurs et utilisateurs pour leur soutien et leurs retours précieux

---

_Ce README a été créé avec ❤️ par [Henelio](https://github.com/Henelio)_
