import Phaser from 'phaser';

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('scene-intro');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Step 1: Talking bubble
    const bubble = this.add.text(centerX, centerY - 100, 
      'I found some ingredients in the storage room!\nPick the ones you like!', {
        fontSize: '28px',
        color: '#fff',
        backgroundColor: '#000',
        padding: { x: 20, y: 20 },
        align: 'center'
      }).setOrigin(0.5);

    // Step 2: After 2.5s show instructions
    this.time.delayedCall(2500, () => {
      bubble.destroy();

      this.instructions = this.add.text(centerX, centerY, 
        '← →  Move with Arrow Keys\n🕒 Watch the timer\n\nPress SPACE to continue', {
          fontSize: '26px',
          color: '#fff',
          align: 'center',
          backgroundColor: '#000',
          padding: { x: 20, y: 20 }
        }).setOrigin(0.5);

      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    });

    // Step 3: Wait for space press to begin pre-throws
    this.spacePressed = false;
  }

  update() {
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.spacePressed) {
      this.spacePressed = true;
      this.instructions.destroy();

      // Step 3: fake throw animation (in real gameScene)
      const goText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Go!', {
        fontSize: '48px',
        color: '#ff0',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: goText,
        alpha: 0,
        duration: 1000,
        ease: 'Power1',
        onComplete: () => {
          this.scene.start('scene-game');  // Transition to game scene
        }
      });
    }
  }
}
