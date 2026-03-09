import React from "react";
import LoginForm from "./components/LoginForm";
import BackgroundPanel from "./components/BackgroundPanel";

export default function App() {
  const bgUrl =
    "https://png.pngtree.com/background/20210711/original/pngtree-blue-business-technology-information-security-banner-background-picture-image_1100472.jpg";

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('${bgUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* content wrapper - z-10 so it sits above overlay */}
      <div className="relative z-10 w-full max-w-[1100px] px-6">
        <div className="flex rounded-2xl overflow-hidden shadow-2xl">
          {/* Left: Login white card */}
          <div className="w-[420px] flex items-center justify-center bg-transparent p-8">
            <div className="w-full max-w-[360px]">
              <LoginForm />
            </div>
          </div>

          {/* Right: translucent info panel */}
          <div className="flex-1">
            <BackgroundPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
