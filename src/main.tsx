import { MouseEvent, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./components/bullet.ts";
import "./components/gun.ts";
// import "./components/meta-thumbstick-controls.ts";
import "./components/target.ts";
import "./components/player.ts";
import "./components/game.ts";
import "./components/bonuser.ts";
import "./components/guns.ts";
import "./index.css";
import AFRAME, { Scene } from "aframe";
import "aframe-environment-component";
import config from "./config.ts";

//@ts-ignore
AFRAME.THREE.Vector3.prototype.toDebug = function () {
  return `[${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}]`;
};

const root = document.getElementById("react-root");
if (root && config.splash) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

const scene = document.querySelector("a-scene");
if (config.debug) {
  scene?.setAttribute("stats", "");
  scene?.setAttribute("inspector", "url: https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js");
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
