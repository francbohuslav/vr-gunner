import AFRAME from "aframe";
import config from "../config";

AFRAME.registerComponent("guns", {
  schema: {
    vr: { type: "boolean" },
  },

  init() {
    const gunScale = 0.012;
    if (config.isVR) {
      if (this.data.vr) {
        this.el.innerHTML = `
          <a-entity meta-touch-controls="hand: right; model: false" gun="gunPosition: #right-gun-position">
            <a-entity rotation="-52 0 0">
              <a-entity rotation="0 0 -5">
                <a-entity id="right-gun-position" rotation="0 -6 0">
                  <!-- <a-box id="right-gun-placeholder" width="0.003" height="0.003" depth="0.6" color="red"></a-box> -->
                  <a-entity position="0 -0.054 0.05">
                    <a-entity id="right-gun" rotation="0 -90 0" gltf-model="#gun-model" material="src: #gun-texture" scale="${gunScale} ${gunScale} ${gunScale}"></a-entity>
                  </a-entity>
                </a-entity>
              </a-entity>
            </a-entity>
          </a-entity>
          <a-entity meta-touch-controls="hand: left; model: false" gun="gunPosition: #left-gun-position">
            <a-entity rotation="-52 0 0">
              <a-entity rotation="0 0 -5">
                <a-entity id="left-gun-position" rotation="0 6 0">
                  <a-entity position="0 -0.054 0.05">
                    <a-entity id="left-gun" rotation="0 -90 0" gltf-model="#gun-model" material="src: #gun-texture" scale="${gunScale} ${gunScale} ${gunScale}"></a-entity>
                  </a-entity>
                </a-entity>
              </a-entity>
            </a-entity>
          </a-entity>`;
      }
    } else {
      if (!this.data.vr) {
        this.el.innerHTML = `
          <a-entity visible="true" position="0 -0.03 -0.5" rotation="50.5 -6 0" gun="gunPosition: #center-gun-position">
            <a-entity rotation="-52 0 0">
              <a-entity rotation="0 0 -5">
                <a-entity id="center-gun-position" rotation="0 6 0">
                  <a-entity position="0 -0.02 0.1">
                    <a-entity id="center-gun" rotation="0 -90 0" gltf-model="#gun-model" material="src: #gun-texture" scale="0.004 0.004 0.004">
                    </a-entity>
                  </a-entity>
                </a-entity>
              </a-entity>
            </a-entity>
          </a-entity>`;
      }
    }
  },
});
