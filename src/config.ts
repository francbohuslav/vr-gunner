import AFRAME from "aframe";

export default {
  debug: location.href.includes("localhost"),
  splash: false,
  isMobile: AFRAME.utils.device.isMobile(),
  //@ts-ignore
  isPC: !AFRAME.utils.device.isMobile() && !AFRAME.utils.device.isOculusBrowser(),
  //@ts-ignore
  isVR: AFRAME.utils.device.isOculusBrowser(),

  nextLevelSentence() {
    if (this.isMobile) {
      return "Tukni na obrazovku";
    } else if (this.isVR) {
      return "Zmackni (A)";
    } else {
      return "Zmackni Enter";
    }
  },

  shotSentence() {
    if (this.isMobile) {
      return "tukanim na obrazovku";
    } else if (this.isVR) {
      return "ovladacem";
    } else {
      return "mezernikem";
    }
  },
};

// VR, Browser, mobile
// AFRAME.utils.device.isOculusBrowser(); // true, false, false
// AFRAME.utils.device.isMobile(); // false, false, true
// AFRAME.utils.device.isMobileVR(); // true, false, false
// AFRAME.utils.device.checkARSupport(); // true, false, true
// AFRAME.utils.device.checkHeadsetConnected(); // true, false, true
// AFRAME.utils.device.checkVRSupport(); // true, false, true
