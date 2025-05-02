import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('scene-gameover');
  }

  create() {
    this.add.text(576, 384, 'Game Over', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('scene-game'); // Restart the main game
    });
  }
}
