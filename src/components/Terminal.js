"use client";

import { useEffect, useRef, useState } from "react";
import "xterm/css/xterm.css";
import "@/styles/globals.css";

export default function TerminalComponent() {
  const termRef = useRef(null);
  const wsRef = useRef(null);
  const terminal = useRef(null);

  // États pour personnalisation et plein écran
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState({
    background: "#1e1e1e",
    foreground: "#ffffff",
    cursor: "#ffffff",
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    import("xterm").then(({ Terminal }) => {
      terminal.current = new Terminal({
        cursorBlink: true,
        rows: 25,
        cols: 80,
        fontSize,
        theme, // Appliquer le thème dès le départ
      });
      terminal.current.open(termRef.current);
      terminal.current.writeln("🔗 Connexion au serveur...");

      // Création WebSocket
      const ws = new WebSocket("ws://localhost:8080");

      ws.onopen = () => {
        terminal.current.writeln("\r\n✅ Connecté au serveur WebSocket !");
      };

      ws.onmessage = (event) => {
        terminal.current.write(event.data.replace(/\n/g, "\r\n"));
      };

      terminal.current.onData((data) => {
        ws.send(data);
      });

      ws.onclose = () => {
        terminal.current.writeln("\r\n🔴 Déconnecté du serveur !");
      };

      ws.onerror = () => {
        terminal.current.writeln("\r\n⚠️ Erreur WebSocket !");
      };

      wsRef.current = ws;
    });

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (terminal.current) terminal.current.dispose();
    };
  }, [fontSize, theme]);

  // Basculer le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: isFullscreen ? "100vh" : "90vh",
        width: "100vw",
        backgroundColor: theme.background,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Barre d'outils */}
      <div
        style={{
          padding: "0.8rem",
          backgroundColor: "#333",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          <label>
            Taille de police:
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
              style={{ marginLeft: "0.5rem", width: "50px" }}
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
            Couleur du texte:
            <input
              type="color"
              value={theme.foreground}
              onChange={(e) => setTheme({ ...theme, foreground: e.target.value })}
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>

        <button
          onClick={toggleFullscreen}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isFullscreen ? "Quitter Plein Écran" : "Plein Écran"}
        </button>
      </div>

      {/* Terminal */}
      <div
        ref={termRef}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: theme.background,
        }}
      />
    </div>
  );
}
