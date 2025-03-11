# Application Web Shell avec Next.js et xterm.js

Cette application permet aux utilisateurs d'interagir avec un shell Linux via une interface web en utilisant **Next.js** et **xterm.js**. Le terminal est exécuté côté client grâce à un import dynamique, évitant ainsi les problèmes liés au rendu côté serveur (SSR) dans Next.js.

## Table des matières
- [Introduction](#introduction)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Architecture et fonctionnement](#architecture-et-fonctionnement)
- [Code du composant Terminal](#code-du-composant-terminal)
- [Explications détaillées](#explications-détaillées)
- [Utilisation et tests](#utilisation-et-tests)
- [Contribuer](#contribuer)
- [Licence](#licence)
- [Configurer un domaine et un reverse proxy](#configurer-un-domaine-et-un-reverse-proxy)

## Introduction

Cette application propose un terminal interactif intégré dans une page web. Elle utilise :

- **Next.js** pour le framework React côté serveur et client.
- **xterm.js** pour l'affichage et la gestion du terminal dans le navigateur.
- **WebSocket** pour communiquer en temps réel avec un serveur qui exécute des commandes shell (backend non documenté ici).

Le composant **Terminal** a été conçu pour être chargé uniquement côté client grâce à un import dynamique, évitant ainsi l'erreur `self is not defined` qui peut survenir lors du rendu côté serveur.

## Prérequis

Assure-toi d'avoir installé les éléments suivants :

- Node.js (version 14 ou plus récente)
- npm ou Yarn
- Next.js (créé via `npx create-next-app` par exemple)
- Docker (pour l'exécution du backend, si nécessaire)

## Installation

### Clone le dépôt sur ta machine :

```
git clone https://github.com/ton-compte/ton-depot.git
```
```
cd ton-depot 
```

#### Installe les dépendances :

```
npm install
```

Démarre l'application Next.js en mode développement :

```
npm run dev
```

Architecture et fonctionnement

L'application se compose principalement de :

- Un composant Terminal qui s'affiche dans la page d'accueil.

- Une connexion WebSocket qui permet d'envoyer et recevoir des données en temps réel depuis un serveur WebSocket sur ws://localhost:8080.

- Un import dynamique de xterm.js qui garantit que la librairie ne sera chargée qu'après le rendu côté client.

**Code du composant Terminal**

Voici le code complet du composant Terminal, avec des commentaires expliquant chaque partie :

```
"use client";

import { useEffect, useRef, useState } from "react";
import "xterm/css/xterm.css";
import "@/styles/globals.css";

export default function TerminalComponent() {
  const termRef = useRef(null);
  const wsRef = useRef(null);
  const terminal = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState({
    background: "#1e1e1e",
    foreground: "#ffffff",
    cursor: "#ffffff",
  });

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (termRef.current.requestFullscreen) {
        termRef.current.requestFullscreen();
      } else if (termRef.current.mozRequestFullScreen) { // Firefox
        termRef.current.mozRequestFullScreen();
      } else if (termRef.current.webkitRequestFullscreen) { // Chrome, Safari et Opera
        termRef.current.webkitRequestFullscreen();
      } else if (termRef.current.msRequestFullscreen) { // IE/Edge
        termRef.current.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari et Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    import("xterm").then(({ Terminal }) => {
      terminal.current = new Terminal({
        cursorBlink: true,
        rows: 25,
        cols: 80,
        fontSize: fontSize,
        theme: theme,
      });
      terminal.current.open(termRef.current);
      terminal.current.writeln("🔗 Connexion au serveur...");

      const ws = new WebSocket("ws://localhost:8080");

      ws.onopen = () => {
        terminal.current.writeln("\r\n✅ Connecté au serveur WebSocket !");
        console.log("Connecté au serveur WebSocket");
      };

      ws.onmessage = (event) => {
        terminal.current.write(event.data.replace(/\n/g, "\r\n"));
      };

      terminal.current.onData((data) => {
        console.log("Envoyé :", data);
        ws.send(data);
      });

      ws.onclose = () => {
        terminal.current.writeln("\r\n🔴 Déconnecté du serveur !");
      };

      ws.onerror = (error) => {
        terminal.current.writeln("\r\n⚠️ Erreur WebSocket !");
        console.error("Erreur WebSocket :", error);
      };

      wsRef.current = ws;
    });

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (terminal.current) terminal.current.dispose();
    };
  }, [fontSize, theme]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <label>
          Taille de police:
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
        <label>
          Couleur de fond:
          <input
            type="color"
            value={theme.background}
            onChange={(e) => setTheme({ ...theme, background: e.target.value })}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
        <label>
          Couleur de texte:
          <input
            type="color"
            value={theme.foreground}
            onChange={(e) => setTheme({ ...theme, foreground: e.target.value })}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
        <button onClick={toggleFullScreen} style={{ marginLeft: "auto" }}>
          {isFullScreen ? "Quitter le plein écran" : "Plein écran"}
        </button>
      </div>

      <div
        ref={termRef}
        style={{
          flex: 1,
          width: "100%",
          backgroundColor: theme.background,
          border: "1px solid #ccc",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      />
    </div>
  );
}
```
Explications détaillées

- Importation et Configuration

**use client** : Cette directive indique que le composant doit être rendu uniquement côté client. 
L'import de xterm se fait dans le hook useEffect afin d'éviter le rendu côté serveur, qui ne possède pas d'objet global window ou self.

- Utilisation des Références (useRef)

**termRef :** référence à l'élément DOM où le terminal sera affiché.

**wsRef :** référence à la connexion WebSocket afin de la fermer proprement lors du démontage.

**terminal :** référence à l'instance du terminal.

- Cycle de Vie du Composant
**Initialisation :** Crée une instance de Terminal avec les options souhaitées et l'attache à l'élément DOM via open(termRef.current).

**Connexion WebSocket :** Une connexion est établie avec le serveur WebSocket.

**Nettoyage :** Le retour de useEffect ferme la connexion WebSocket et libère les ressources du terminal lorsque le composant est démonté.

- Utilisation et tests

**Démarre le serveur WebSocket sur ws://localhost:8080 (voir la documentation backend si nécessaire).**

**Démarre l'application Next.js avec npm run dev.**

**Accède à la page qui contient le composant Terminal. Tu devrais voir le terminal s'afficher et les messages de connexion.**

**Teste l'interaction en tapant des commandes dans le terminal. Les données doivent être envoyées au serveur WebSocket et la réponse affichée dans le terminal.**


## Configurer un domaine et un reverse proxy 

Assure-toi que ton domaine pointe vers l'adresse IP du serveur qui héberge ton application Next.js.

Installation de Nginx :

```
sudo apt update
```
```
sudo apt install nginx
```

**Configuration de Nginx :**
Ouvre le fichier de configuration de Nginx pour ton site :

```
sudo nano /etc/nginx/sites-available/default
```

**Ajoute une configuration similaire :**



```
server {
  listen 80;
  server_name ton-domaine.com;

  location / {
    proxy_pass http://localhost:3000;  # Port de l'application Next.js
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
  location /ws/ {
    proxy_pass http://localhost:8080;  # Port de l'application Next.js
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```
**Redémarre Nginx pour appliquer les modifications :**


```
sudo systemctl restart nginx
```

Cela devrait permettre à ton application d'être accessible via un domaine personnalisé.


### ContribuerContribuer

Les contributions sont les bienvenues ! Pour proposer une amélioration ou corriger un bug, suis ces étapes :
```
Fork le dépôt

Crée une branche (git checkout -b feature-ma-nouvelle-fonction)

Fais tes modifications et commits (git commit -m 'Ajout d'une nouvelle fonctionnalité')

Pousse tes changements (git push origin feature-ma-nouvelle-fonction)

Crée une pull request
```
Licence

Ce projet est sous licence MIT. Cela signifie que tu peux l'utiliser, le modifier et le distribuer librement tant que tu inclus une copie de la licence originale.

MIT License
Licence
Distribué sous la licence MIT. Voir LICENSE.md pour plus de détails.
