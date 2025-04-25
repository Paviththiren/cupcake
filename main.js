import "./style.css";
import Phaser from "phaser";
import bgImage from './assets/bg.png';
import basketImage from './assets/basket.png';

const sizes = {
  width: 1536,
  height: 1024,
};

const speedDown = 300

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game")
    this.player
    this.cursor
    this.playerSpeed = speedDown + 50
  }

  preload() {
    this.load.image("bg", bgImage);
    this.load.image("basket",basketImage);
    
  }

  create() {
    this.add.image(0,0,"bg").setOrigin(0,0)
    this.player = this.physics.add.image(0,400,"basket").setOrigin(0,0)
    this.player.body.allowGravity = false
    this.player.setCollideWorldBounds(true)

    this.cursor = this.input.keyboard.createCursorKeys()
  }

  update() {
    const {left,right} = this.cursor;

    if (left.isDown){
      this.player.setVelocityX(-this.playerSpeed);
    }
    else if (right.isDown){
      this.player.setVelocityX(this.playerSpeed);
    }
    else{
      this.player.setVelocityX(0);
    }
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
