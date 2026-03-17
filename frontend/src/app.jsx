import React, { useEffect, useMemo, useState } from "react";
import LoginForm from "./components/LoginForm";
import BackgroundPanel from "./components/BackgroundPanel";

function WelcomePage({ onRestart }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          AdaptiveKeyShield
        </h1>
        <p className="mt-3 text-white/75">Secure session established</p>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-10">
          <div className="text-2xl sm:text-3xl font-semibold">
            Welcome to the app
          </div>
          <div className="mt-8 flex items-center justify-center">
            <button
              type="button"
              onClick={onRestart}
              className="px-5 py-2.5 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg hover:opacity-95"
            >
              Back to Login 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const bgUrl = useMemo(
    () =>
      "https://png.pngtree.com/background/20210711/original/pngtree-blue-business-technology-information-security-banner-background-picture-image_1100472.jpg",
    []
  );

  const [schema, setSchema] = useState(null);
  const [view, setView] = useState("login"); // login | welcome
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000",
    []
  );

  useEffect(() => {
    const loadSchema = async () => {
      try {
        const res = await fetch(`${apiBase}/schema`);
        if (!res.ok) throw new Error(`schema http ${res.status}`);
        const data = await res.json();
        setSchema(data);
      } catch (e) {
        console.warn("[UI] Could not load /schema, using fallbacks.", e);
      }
    };
    loadSchema();
  }, [apiBase]);

  if (view === "welcome") {
    return (
      <WelcomePage
        onRestart={() => {
          setView("login");
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('${bgUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 w-full max-w-[1100px] px-6">
        <div className="flex rounded-2xl overflow-hidden shadow-2xl">
          <div className="w-[420px] flex items-center justify-center bg-transparent p-8">
            <div className="w-full max-w-[360px]">
              <LoginForm schema={schema} onSuccess={() => setView("welcome")} />
            </div>
          </div>

          <div className="flex-1">
            <BackgroundPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
