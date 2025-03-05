import AFRAME from "aframe";

AFRAME.registerComponent("test", {
  init: function () {
    console.log("test");
  },
});

console.log("xxx test");
