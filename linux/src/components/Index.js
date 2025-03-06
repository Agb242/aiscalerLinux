"use client"; // Assure-toi que le composant est un Client Component

import { useRouter } from "next/navigation";
import "@/styles/globals.css";

const Index = () => {
  const router = useRouter();

  return (
    <html>
     <body>
        <div className="landing-main"> 
        <div className="landing-left">
            <img className="landing-image" src="/servers.jpg" alt="Servers" />
        </div>
        <div className="landing-right">
            <h1 className="landing-title">Linux via AiScaler  </h1>
            <p className="landing-descr">
            Connect to and command your remote servers effortlessly with AISCALER, 
            a web-based <strong>terminal emulator</strong>. 
            Master your systems directly from your browser!
            </p>

            <div className="landing-buttons">
            <button onClick={() => router.push("/terminal")}>
                Go to Connection
            </button>
            </div>
        </div>
        </div>
     </body>
    </html>
  );
};

export default Index;
