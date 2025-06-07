import Phaser from "phaser";
import bgImage from './assets/story_scene/story_bg.png';
import rocketSheet from './assets/Euler_Asset.png';

export default class StoryScene extends Phaser.Scene {
  constructor() {
    super("scene-story");
  }

  preload() {
    this.load.image("storyBg", bgImage);
    this.load.spritesheet('rocket', rocketSheet, {
      frameWidth: 1024,
      frameHeight: 1536
    });
  }
  create() {
    // Background and story text
    this.add.image(0, 0, "storyBg").setOrigin(0).setDisplaySize(1152, 768);

    this.add.text(100, 100,
      "Once upon a time...\nChibi-Pavi needed help baking cupcakes.\nWill you help her pick the right ingredients?", {
        font: "28px Comic Neue",
        fill: "#fff",
        wordWrap: { width: 950 }
      });

    this.add.text(576, 700, "Press [Space] to launch", {
      font: "20px Comic Neue",
      fill: "#fceabb"
    }).setOrigin(0.5);

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // === Rocket setup ===
    this.rocket = this.physics.add.sprite(300, 600, 'rocket').setScale(0.2);
    this.rocket.setOrigin(0.5, 1); // Stand on launchpad
    this.rocket.setGravityY(0);
    this.rocket.setVelocityY(0);
    this.rocket.setCollideWorldBounds(false);

    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('rocket', { start: 2, end: 8}),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'static',
      frames: [{ key: 'rocket', frame: 0 }],
      frameRate: 1
    });
    this.rocket.play('static');

    // === States ===
    this.phase = 'static'; // 'idle' → 'liftoff' → 'wait' → 'descent' → 'done'
    this.m_start = 40; // Rocket mass in kg
    this.m_fuelrate = 10; // Fuel mass in kg
    this.m_total = this.m_start + this.m_fuel; // Total mass
    this.m_current = 50; // Current mass during descent
    this.v_exhaust = 1000; // Exhaust velocity in m/s
    
    this.liftoffSpeed = -100;
    this.liftoff_counter = 0;
    this.descentStartTime = 0;

    // Ballistic trajectory start point
    this.ballisticStart = { x: 1300, y: -200 };
    this.vx = -300;
    this.vy = 500;
    this.gravity = 1000;
  }

  update(time, delta) {
    const dt = delta / 1000;

    // === PHASE: idle ===
    if (this.phase === 'static') {
      this.rocket.setVelocity(0, 0);
      this.rocket.setRotation(0);
      this.rocket.setPosition(275, 575);
      this.rocket.setVisible(true);
    
      // Start liftoff on space key press
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.phase = 'liftoff';
        this.rocket.play('fly');
      }
  }

    // === PHASE: liftoff ===
    if (this.phase === 'liftoff') {
      this.liftoffSpeed *= 1.013;
      this.liftoff_counter += 1;
      if (this.liftoff_counter > 50) {
        this.rocket.rotation += 0.1 * dt;
        this.rocket.x += 0.1;
        if(this.liftoff_counter > 100) {
          this.rocket.x += 0.25;
        
        
        }}
      this.rocket.y += this.liftoffSpeed * dt;
      if (this.rocket.y < -100) {
        this.rocket.setVisible(false);
        this.phase = 'wait';
        this.time.delayedCall(1000, () => this.startDescent());
      }
    }

    // === PHASE: descent ===
    if (this.phase === 'descent') {
      this.descentStartTime += dt;
      const t = this.descentStartTime;

      const x = this.ballisticStart.x + this.vx * t;
      const y = this.ballisticStart.y + this.vy * t + 0.5 * this.gravity * t * t;
      this.rocket.setPosition(x, y);

      // Clockwise 180° rotation over ~3.5s
      const rotationProgress = Phaser.Math.Clamp(t / 3.5, 0, 1);
      this.rocket.setRotation(rotationProgress * Math.PI);

      if (x < -200 || y > 1000) {
        this.rocket.setVisible(false);
        this.phase = 'done';
      }
    }

    // === GAME START ===
    if (this.phase === 'done' && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.scene.start("scene-game");
    }
  }

  startDescent() {
    this.rocket.setOrigin(0.5, 0.5);
    this.rocket.setVisible(true);
    this.rocket.setPosition(this.ballisticStart.x, this.ballisticStart.y);
    this.descentStartTime = 0;
    this.phase = 'descent';
  }
}