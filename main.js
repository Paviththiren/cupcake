import "./style.css";
import Phaser from "phaser";

const sizes = {
  width: 1000,
  height: 1000,
};

const speedDown = 300

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
  }

  preload() {
    this.load.image("bg","/assets/bg.png")
  }

  create() {
    this.add.image(0,0,"bg").setOrigin(0,)
  }

  update() {
  }

}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: true,
    },
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);
