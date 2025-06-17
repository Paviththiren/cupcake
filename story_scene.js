import Phaser from "phaser";
import bgImage from './assets/story_scene/story_bg.png';
import bgImage2 from './assets/story_scene/story_bg_2.png';
import rocketSheet from './assets/Euler_Asset_1.png';
import warningImage from './assets/story_scene/warn_final.png';
import recipebookImage from './assets/story_scene/recipe_6.png';
import explosionImage from './assets/story_scene/expo.png';
import ashesImage from './assets/story_scene/ashes_2.png';

import pavibuttonImage from './assets/story_scene/Pavi_Button17.png';
import pavibuttonpressedImage from './assets/story_scene/Pavi_Button6.png';
import pavisadImage from './assets/story_scene/Pavi_Sad7.png';
import pavisadImage2 from './assets/story_scene/Pavi_Sad5.png';


import clickImage from './assets/story_scene/Click_Sound.png';

import alarmAudio from './assets/sounds/alarm.mp3';
import announceAudio from './assets/sounds/announce.mp3';
import explosionAudio from './assets/sounds/explosion.mp3';
import rocketAudio from './assets/sounds/rocket.mp3';
import clickAudio from './assets/sounds/click.mp3';

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
    this.load.image("storyBg2", bgImage2);
    this.load.image("warning", warningImage);
    this.load.image("recipebook", recipebookImage);
    this.load.spritesheet('explosion', explosionImage, {
  frameWidth: 222,  // Adjust according to your sheet
  frameHeight: 225  // Adjust accordingly
});
    this.load.image("ashes", ashesImage);

    this.load.audio("alarm", alarmAudio);
    this.load.audio("announce", announceAudio);
    this.load.audio("explosion", explosionAudio);
    this.load.audio("rocket", rocketAudio);
    this.load.audio("click", clickAudio);

    this.load.image("pavibutton", pavibuttonImage);
    this.load.image("pavisad", pavisadImage);
    this.load.image("pavibuttonpressed", pavibuttonpressedImage);
    this.load.image("pavisad2", pavisadImage2);
    

    this.load.image("click", clickImage);

  }
  create() {
    this.fadeOverlay = this.add.rectangle(0, 0, 1152, 768, 0x000000)
      .setOrigin(0)
      .setAlpha(1)
      .setDepth(100);

  // Tween to fade out the black screen 
    this.tweens.add({
      targets: this.fadeOverlay,
      alpha: 0,
      duration: 3500, // 2 seconds fade-in
      onComplete: () => {
      this.fadeOverlay.destroy(); // optional cleanup
    }
    });

    // Background and story text
    this.add.image(0, 0, "storyBg").setOrigin(0).setDisplaySize(1152, 768);
    this.pavibutton = this.add.image(395, 430, "pavibutton").setOrigin(0).setDisplaySize(1152, 768).setScale(0.6);
    this.recipebook = this.add.image(715, 367, "recipebook").setOrigin(0).setDisplaySize(1024, 1024).setScale(0.5);
    

    this.anims.create({
      key: 'explode',
      frames: [
    { key: 'explosion', frame: 0 },
    { key: 'explosion', frame: 1 },
    { key: 'explosion', frame: 4 },
    { key: 'explosion', frame: 2 },
    { key: 'explosion', frame: 3 },
    { key: 'explosion', frame: 5 },
    { key: 'explosion', frame: 6 },
    { key: 'explosion', frame: 7 },
    { key: 'explosion', frame: 8 },
    { key: 'explosion', frame: 9 },
    { key: 'explosion', frame: 10 },
    { key: 'explosion', frame: 11 },
    { key: 'explosion', frame: 12 },
    { key: 'explosion', frame: 13 },
    { key: 'explosion', frame: 14 },
    { key: 'explosion', frame: 15 }
  ],
      frameRate: 18,
      hideOnComplete: true
    });




    this.add.text(576, 700, "Press [Space] to Launch", {
      font: "20px IM Fell English",
      fill: "#fceabb"
    }).setOrigin(0.5);

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // === Rocket setup ===
    this.rocket = this.physics.add.sprite(300, 600, 'rocket').setScale(0.22 );
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

    this.rocketAscentSound = this.sound.add('rocket');
    this.explosionSound = this.sound.add('explosion');
    this.alarmSound = this.sound.add('alarm');
    this.announceSound = this.sound.add('announce');
    this.clickSound = this.sound.add('click');

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
    this.ballisticStart = { x: 820, y: -200 };
    this.vx = 0;
    this.vy = 500;
    this.gravity = 500; 
    this.rotationProgress = 0;
    this.explosionplayed = false;

    this.liftoffmultiplier = 1.004; // Speed multiplier for liftoff



  }

  update(time, delta) {
    const dt = delta / 1000;

    // === PHASE: idle ===
    if (this.phase === 'static') {
      this.rocket.setVelocity(0, 0);
      this.rocket.setRotation(0);
      this.rocket.setPosition(275, 580);
      this.rocket.setVisible(true);
    
      // Start liftoff on space key press
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {

        this.pavibutton.setVisible(false);
        this.pavibuttonpressed = this.add.image(395, 430, "pavibuttonpressed").setOrigin(0).setDisplaySize(1152, 768).setScale(0.6);
        this.clickImage = this.add.image(340,520, "click").setOrigin(0).setScale(0.1);
        this.clickSound.play({ loop: false, volume: 0.2 });
        this.time.delayedCall(200, () => {
          this.pavibuttonpressed.destroy();
          this.pavibutton.setVisible(true);});
        this.time.delayedCall(1000, () => {
          this.clickImage.destroy();
          this.phase = 'liftoff';
          this.rocket.play('fly');
          this.rocketAscentSound.play({ loop: true,volume: 0.2 });
          this.tweens.add({
            targets: this.rocketAscentSound,
            volume: 0.05,
            duration: 3000, // 1 second fade-out
          });
        });
        

        
      }
  }

    // === PHASE: liftoff ===
    if (this.phase === 'liftoff') {
      
      this.liftoffSpeed *= this.liftoffmultiplier;
      this.liftoffmultiplier += 0.0002;
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
        this.time.delayedCall(3000,() => {
          this.add.image(0, 0, "storyBg2").setOrigin(0).setDisplaySize(1152, 768);
          this.showWarningSignal();
          this.alarmSound.play({ loop: false,volume: 0.1 });
          this.announceSound.play({ loop: false,volume: 0.15 });
          this.pavibutton.destroy();
          this.pavisad = this.add.image(395, 430, "pavisad").setOrigin(0).setDisplaySize(1152, 768).setScale(0.6);
          this.children.bringToTop(this.recipebook);
          this.pavi
      });
        
        this.rocket.play('fly');
        

        
        this.time.delayedCall(3000, () => this.startDescent());
      }
    }

    // === PHASE: descent ===
    if (this.phase === 'descent') {
     if (!this.explosionplayed) {
      const rocketBounds = this.rocket.getBounds();
      const bookBounds = this.recipebook.getBounds();
      this.tweens.add({
          targets: this.alarmSoundSound,
          volume: 0.001,
          duration: 200, // 1 second fade-out
          onComplete: () => {
            this.alarmSound.stop();
          }
        });

      if (Phaser.Geom.Intersects.RectangleToRectangle(rocketBounds, bookBounds)) {
        this.explosionplayed = true;
        this.explosionSound.play({ loop: false,volume: 0.2,rate: 3 });
        this.time.delayedCall(50, () => {
          this.showExplosion(820, 430);
          this.rocket.setVisible(false);
          this.recipebook.setVisible(false);
          this.phase = 'done';
          this.tweens.add({
          targets: this.rocketAscentSound,
          volume: 0.01,
          duration: 400, // 1 second fade-out
          onComplete: () => {
            this.rocketAscentSound.stop();
          }
        });
        
        }
        );
        this.time.delayedCall(650, () => {
          this.add.image(813, 512, "ashes").setOrigin(0.5).setScale(0.35);
          this.pavisad.destroy();
          this.pavisad2 = this.add.image(395, 430, "pavisad2").setOrigin(0).setDisplaySize(1152, 768).setScale(0.6);
          
        }
        );
        }
      }

      this.descentStartTime += dt;
      const t = this.descentStartTime;

      const x = this.ballisticStart.x + this.vx * t;
      const y = this.ballisticStart.y + this.vy * t + 0.5 * this.gravity * t * t;
      this.rocket.setPosition(x, y);

      // Clockwise 180° rotation over ~3.5s
      this.rotationProgress += 0.075;
      this.rocket.setRotation(this.rotationProgress * Math.PI);
    }

    // === GAME START ===
    if (this.phase === 'done' && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.scene.start("scene-game");
    }
  }

  startDescent() {
    this.time.delayedCall(3000, () => {
      this.children.bringToTop(this.rocket);
    this.tweens.add({
          targets: this.rocketAscentSound,
          volume: 0.4,
          duration: 800, // 1 second fade-out
        });
    this.rocket.setOrigin(0.5, 0.5);
    this.rocket.setVisible(true);
    this.rocket.setPosition(this.ballisticStart.x, this.ballisticStart.y);
  
    this.descentStartTime = 0;
    this.phase = 'descent';
    });
    
  }
  showExplosion(x, y) {
  const explosion = this.add.sprite(x, y, 'explosion');
  explosion.play('explode');
  this.tweens.add({
  targets: explosion,
  scale: { from: 1.0, to: 2.4 },
  ease: 'Cubic.easeOut',
  duration: 1800
});

}
  // inside your Phaser.Scene
  showWarningSignal() {
    const monitorX = 335; // Adjust as needed
    const monitorY = 270; // Adjust as needed
    const warning = this.add.image(monitorX, monitorY, 'warning')
      .setOrigin(0.5)
      .setScale(0)
      .setDepth(10);

    
  // Tween sequence manually chained
  this.tweens.add({
    targets: warning,
    scale: 0.6 ,
    duration: 200,
    ease: 'Power2',
    onComplete: () => {
      this.tweens.add({
        targets: warning,
        scale: 0.4,
        duration: 100,
        ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: warning,
            scale: 0.5,
            duration: 100,
            ease: 'Power2'
          });
        }
      });
    }
  });
}
    


}
