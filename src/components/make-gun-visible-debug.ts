import AFRAME from "aframe";

AFRAME.registerComponent("make-gun-visible-debug", {
  schema: {
    leftGun: { type: "boolean" },
  },
  init: function () {
    if (!AFRAME.utils.device.isOculusBrowser()) {
      if (this.data.leftGun) {
        this.el.setAttribute("position", "-0.1 1.5 -0.3");
      } else {
        this.el.setAttribute("position", "0.1 1.5 -0.3");
      }
      this.el.setAttribute("rotation", "45 0 0");
    }
  },
});
