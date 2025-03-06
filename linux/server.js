 // websocket aiscaler
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Docker = require("dockerode");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const docker = new Docker();

wss.on("connection", async (ws) => {
    console.log("Nouvelle connexion WebSocket");

    try {
        // Création du conteneur Ubuntu pour chaque utilisateur aiscaler
        const container = await docker.createContainer({
            Image: "ubuntu",
            Cmd: ["/bin/bash"],
            Tty: true,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            OpenStdin: true,
            StdinOnce: false,
        });

        await container.start();
        console.log("Conteneur Ubuntu démarré");

        // Exécution d'un shell interactif dans le conteneur
        const exec = await container.exec({
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ["/bin/bash"],
        });

        // Utiliser 'hijack: true' pour assurer le bon fonctionnement du mode TTY
        const stream = await exec.start({ hijack: true, stdin: true });

        // Rediriger la sortie du conteneur vers le client via WebSocket
        stream.on("data", (data) => {
            ws.send(data.toString());
        });

        // Transmettre l'entrée du client vers le conteneur sur gcp
        ws.on("message", (message) => {
            stream.write(message);
        });

        // Lors de la déconnexion, arrêter et supprimer le conteneur
        ws.on("close", async () => {
            console.log("Client déconnecté, arrêt du conteneur...");
            await container.stop();
            await container.remove();
            console.log("Conteneur supprimé.");
        });

    } catch (error) {
        console.error("Erreur lors de la création du conteneur :", error);
        ws.close();
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Serveur WebSocket lancé sur http://localhost:${PORT}`);
});
