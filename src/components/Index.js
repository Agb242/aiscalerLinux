"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import "@/styles/globals.css";

const Index = () => {
  const router = useRouter();

  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1 className="landing-title">Linux via AiScaler</h1>
        <p className="landing-subtitle">
          Connect to and command your remote servers effortlessly.
        </p>
      </header>

      <main className="landing-main">
        <div className="landing-left">
          <Image
            className="landing-image"
            src="/servers.jpg"
            alt="Servers"
            width={500}
            height={300}
            priority
          />
        </div>

        <div className="landing-right">
          <h2 className="landing-headline">Control Your Servers Easily</h2>
          <p className="landing-description">
            With AiScaler, manage your Linux servers directly from your browser
            using a powerful web-based terminal emulator.
          </p>
          <div className="landing-buttons">
            <button onClick={() => router.push("/terminal")}>Go to Connection</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

