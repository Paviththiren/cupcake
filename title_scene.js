import Phaser from "phaser";
import bgImage from './assets/title-screen-background.png';
import startButtonImage from './assets/start-button.png';
import clickSound from './assets/sounds/title-click.mp3';


export default class TitleScene extends Phaser.Scene {
  constructor() {
    super("scene-title");
  }

  preload() {
    this.load.image("title_bg", bgImage); // Change to your background image
    this.load.image("start_button", startButtonImage); // Change to your start button image
    this.load.audio("click_sound", clickSound); // Load the click sound
  }

  create() {
    this.add.image(this.scale.width / 2, this.scale.height / 2, "title_bg")
      .setOrigin(0.5)
      .setDisplaySize(this.scale.width, this.scale.height);


    const startButton = this.add.image(325, 480, 'start_button').setScale(1.0)
  .setInteractive({cursor: 'pointer' })
  .on("pointerdown", () => {
    this.sound.play("click_sound"); // Play the click sound
    this.time.delayedCall(500, () => {
      this.scene.stop("scene-title"); // Stop TitleScene
      this.scene.start("scene-story"); // Go to StoryScene
    });
    
  })
  .on("pointerover", () => {
    startButton.setScale(0.95); // Slight zoom effect on hover
  })
  .on("pointerout", () => {
    startButton.setScale(1); // Reset scale
  });

  }
}
