// 📌 src/app/layout.tsx
import "../styles/globals.css"; // Assure-toi que le chemin est correct

export const metadata = {
  title: "Ai scaler Linux",
  description: "Slinuxvia Web",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
