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

  // Fonction pour basculer en plein écran
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
        terminal.current.writeln("\r\n✅ Connecté au serveur Aiscaler !");
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
        terminal.current.writeln("\r\n🔴 Déconnecté du serveur Aiscaler!");
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
      {/* Barre de personnalisation */}
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

      {/* Conteneur du terminal */}
      <div
        ref={termRef}
        style={{
          flex: 1,
          width: "100%",
          backgroundColor: theme.background,
          border: "1px solid #ccc",
          height: "100%", // Assurer que le terminal occupe toute la hauteur
          display: "flex",
          flexDirection: "column",
        }}
      />
    </div>
  );
}
