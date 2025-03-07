"use client";

import { useRouter } from "next/navigation";

export default function Index() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col md:flex-row h-screen bg-gray-900 text-white">
      {/* Partie gauche avec l'image */}
      <div className="md:w-1/2 w-full h-1/2 md:h-full flex items-center justify-center p-5">
        <img
          className="w-full h-auto object-cover rounded-lg shadow-xl"
          src="/servers.jpg"
          alt="Servers"
        />
      </div>

      {/* Partie droite avec le texte */}
      <div className="absolute inset-0 md:w-1/2 flex flex-col justify-center items-center text-center p-8 space-y-6 bg-black bg-opacity-50">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 shadow-lg">
            Linux via <span className="text-blue-400">AiScaler</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed shadow-lg">
            Connect to and command your remote servers effortlessly with{" "}
            <span className="font-bold">AISCALER</span>, a web-based{" "}
            <span className="font-bold">terminal emulator</span>. Master your
            systems directly from your browser!
          </p>
        </div>

        {/* Bouton pour accéder au terminal */}
        <button
          onClick={() => router.push("/terminal")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg transition duration-300 ease-in-out text-xl shadow-lg transform hover:scale-105"
        >
          Go to Connection
        </button>
      </div>
    </div>
  );
}
