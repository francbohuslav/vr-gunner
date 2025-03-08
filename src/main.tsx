import { MouseEvent, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./components/bullet.ts";
import "./components/gun.ts";
import "./components/make-gun-visible-debug.ts";
import "./components/meta-thumbstick-controls.ts";
import "./components/target.ts";
import "./components/player.ts";
import "./index.css";
import { Scene } from "aframe";
import "aframe-environment-component";

const root = document.getElementById("react-root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

function App() {
  function handleEnterVr(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    const scene = document.querySelector("a-scene") as Scene;
    scene.enterVR();
  }

  return (
    <div className="splash-screen">
      <h1>vrGunner</h1>
      <img width="512" height="512" src="./images/splash.jpg" alt="vrGunner" />
      <button type="button" onClick={handleEnterVr}>
        Start
      </button>
    </div>
  );
}
