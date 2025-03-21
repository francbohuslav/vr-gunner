import { Scene } from "aframe";
import { MouseEvent } from "react";

export function App() {
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
