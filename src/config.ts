import AFRAME from "aframe";

export default {
  debug: location.href.includes("localhost"),
  splash: false,
  isMobile: AFRAME.utils.device.isMobile(),
  //@ts-expect-error isOculusBrowser is not supported by types unfortunately
  isPC: !AFRAME.utils.device.isMobile() && !AFRAME.utils.device.isOculusBrowser(),
  //@ts-expect-error isOculusBrowser is not supported by types unfortunately
  isVR: AFRAME.utils.device.isOculusBrowser(),

  nextLevelSentence() {
    if (this.isMobile) {
      return "Ťukni na obrazovku";
    } else if (this.isVR) {
      return "Zmáčkni (A)";
    } else {
      return "Zmáčkni Enter";
    }
  },

  shotSentence() {
    if (this.isMobile) {
      return "ťukáním na obrazovku";
    } else if (this.isVR) {
      return "ovladačem";
    } else {
      return "mezerníkem";
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
