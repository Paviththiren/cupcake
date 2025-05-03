import "./style.css";
import Phaser from "phaser";

import bgImage from './assets/bg.png';

import GameOverScene from './GameOverScene.js';

import playerSpriteSheet from './assets/test_7.png';

import WallClock from './assets/wallclock.png';
import handle from './assets/handle.png';

import flourImage from './assets/ingredients/flour.png';
import sugarImage from './assets/ingredients/sugar.png';
import eggImage from './assets/ingredients/eggs.png';
import blueberrysImage from './assets/ingredients/blueberrys.png';
import bootsImage from './assets/ingredients/boots.png';
import butterImage from './assets/ingredients/butter.png';
import caramelImage from './assets/ingredients/caramel.png';
import chocolateImage from './assets/ingredients/chocolate.png';
import honeyImage from './assets/ingredients/honey.png';
import milkImage from './assets/ingredients/milk.png';
import nailsImage from './assets/ingredients/nails.png';
import nutsImage from './assets/ingredients/nuts.png';
import philadelphiaImage from './assets/ingredients/philadelphia.png';
import soapImage from './assets/ingredients/soap.png';
import socksImage from './assets/ingredients/socks.png';
import strawberryImage from './assets/ingredients/strawberry.png';
import vanillaImage from './assets/ingredients/vanilla.png';
import wormsImage from './assets/ingredients/worms.png';

import throwLinesImage from './assets/throw_lines.png';

//import QRCode from 'qrcode';

const sizes = {
  width: 1152,
  height: 768,
};

const speedDown = 50;
const playerMovementSpeed = 200;

const ingredientsList = [
  { key: "Flour", image: flourImage },
  { key: "Sugar", image: sugarImage },
  { key: "Egg", image: eggImage },
  { key: "Blueberry", image: blueberrysImage },
  { key: "Boots", image: bootsImage },
  { key: "Butter", image: butterImage },
  { key: "Caramel", image: caramelImage },
  { key: "Chocolate", image: chocolateImage },
  { key: "Honey", image: honeyImage },
  { key: "Milk", image: milkImage },
  { key: "Nails", image: nailsImage },
  { key: "Nuts", image: nutsImage },
  { key: "Philadelphia", image: philadelphiaImage },
  { key: "Soap", image: soapImage },
  { key: "Socks", image: socksImage },
  { key: "Strawberry", image: strawberryImage },
  { key: "Vanilla", image: vanillaImage },
  { key: "Worms", image: wormsImage },

];

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = playerMovementSpeed + 50;
    this.fallingIngredients;
    this.recipe = {};
    this.recipeText;
    this.lastDirection = "right";
    this.game_over = false;
    this.game_finished = false;
  }

  preload() {

    // Load the background image
    this.load.image("bg", bgImage);

    // Load all ingredient images
    for (const ingredient of ingredientsList) {
      this.load.image(ingredient.key, ingredient.image);
    }

    // Load the player sprite sheet
    this.load.spritesheet('player', playerSpriteSheet, {
      frameWidth: 511,
      frameHeight: 1024,
    });
    
    //TIMER
    this.load.image("WallClock", WallClock);
    this.load.image("handle", handle);

    this.load.image('throwLines', throwLinesImage);

  }

  create() {

    this.add.image(0, 0, "bg").setOrigin(0, 0).setDisplaySize(sizes.width, sizes.height);

    //Initialize player model
    this.player = this.physics.add.sprite(700, 800, 'player', 0).setOrigin(0, 0);
    this.player.setScale(0.3);  // Adjust size to fit game screen
    this.player.setCollideWorldBounds(true);
    this.player.body.allowGravity = false;
    
    //Player animations
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 6 }),
      frameRate: 4,
      repeat: -1
    });
    
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2}),
      frameRate: 4,
      repeat: -1
    });
    
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1
    });


    //Create Clock
    const clockX = 860
    const clockY = 150;

    this.add.image(clockX, clockY, 'WallClock').setScale(0.9);
    this.hourHand = this.add.image(clockX, clockY, 'handle').setScale(0.04);
    this.hourHand.setOrigin(0.49, 0.67); // Rotate around base of the hand
    
    
    //GAME TIME
    this.totalGameTime = 45;
    this.timeLeft = this.totalGameTime;

    // Input Defintions
    this.cursor = this.input.keyboard.createCursorKeys();

    // Create a group for falling ingredients
    this.fallingIngredients = this.physics.add.group();

    // Run intro throw sequence before starting the game
    // Step 1: Talking bubble near storage shelf
    this.player.setVelocityX(0);
    this.input.keyboard.enabled = true;           // Keep input globally active
    this.controlsEnabled = false;          
    this.introComplete = false;

    const bubbleX = 950;
    const bubbleY = 300;

    this.talkingBubble = this.add.text(bubbleX, bubbleY,
      "I found some ingredients\nin the storage room!\nPick the ones you like!", {
        fontSize: "22px",
        backgroundColor: "#000",
        color: "#fff",
        padding: { x: 10, y: 10 }
      }).setOrigin(0.5);

    // Step 2: Show instructions after a delay
    this.time.delayedCall(2500, () => {
      this.talkingBubble.destroy();
      this.instructionText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
        "← → Move with Arrow Keys\n🕒 Watch the timer\n\nPress SPACE to continue", {
          fontSize: "24px",
          color: "#fff",
          backgroundColor: "#000",
          padding: { x: 20, y: 20 },
          align: "center"
        }).setOrigin(0.5);

      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    });

    // Check collision between player and ingredients
    this.physics.add.overlap(this.player, this.fallingIngredients, this.catchIngredient, null, this);

    // Create text to show recipe status
    this.recipeText = this.add.text(sizes.width - 300, 20, "", { fontSize: "24px", fill: "#000" });
    this.updateRecipeText();
  }

  update() {
    if (!this.introComplete && this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.introComplete = true;
      this.instructionText.destroy();

      const introCount = 2;
      for (let i = 0; i < introCount; i++) {
        this.time.delayedCall(i * 500, () => this.throwIngredientFromStorage());
      }

      const goText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Go!', {
        fontSize: '48px',
        color: '#ff0',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: goText,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          goText.destroy();
          this.input.keyboard.enabled = true;
          this.controlsEnabled = true;

          this.spawner = this.time.addEvent({
            delay: 1000,
            callback: this.throwIngredientFromStorage,
            callbackScope: this,
            loop: true
          });
        }
      });
    }

    if (!this.introComplete) return;  // skip game logic if intro isn't done

    if (!this.controlsEnabled) return;  // skip movement if locked

    const { left, right } = this.cursor;

    // Check if we're past halftime and haven't started ramping speeds
    if (!this.hasStartedSpinup && this.timeLeft < this.totalGameTime / 2) {
      this.hasStartedSpinup = true;
    
      const maxRotSpeed = 0.005;
      const maxWobbleSpeed = 0.005;
      const step = 0.0001;
    
      this.time.addEvent({
        delay: 1000,
        repeat: 50,
        callback: () => {
          this.fallingIngredients.getChildren().forEach((ingredient) => {
            const currentRot = ingredient.getData('rotationSpeed');
            const currentWobble = ingredient.getData('wobbleSpeed');
    
            const newRot = Math.min(currentRot + step, maxRotSpeed);
            const newWobble = Math.min(currentWobble + step, maxWobbleSpeed);
    
            ingredient.setData('rotationSpeed', newRot);
            ingredient.setData('wobbleSpeed', newWobble);
          });
        }
      });
    }
    
    

    if (!this.game_over) {
      if (this.cursor.left.isDown) {
        this.player.setVelocityX(-this.playerSpeed);
        this.player.anims.play('left', true);
        this.lastDirection = "left";
      } else if (this.cursor.right.isDown) {
        this.player.setVelocityX(this.playerSpeed);
        this.player.anims.play('right', true);
        this.lastDirection = "right";
      } else {
        this.player.setVelocityX(0);
        const idleFrame = this.lastDirection === "left" ? 7 : 0;
        this.player.setFrame(idleFrame); // no animation, just a static pose
      }
    }
    

      
      // Add juicy movement to falling ingredients
      this.fallingIngredients.getChildren().forEach((ingredient) => {
        // Wobble left-right
        const wobbleSpeed = ingredient.getData('wobbleSpeed');
        ingredient.x += Math.sin(this.time.now * wobbleSpeed) * 0.5;

        // Rotate slowly
        const rotationSpeed = ingredient.getData('rotationSpeed');
        ingredient.rotation += rotationSpeed;

      if (ingredient.y > 650){
        ingredient.destroy();
        if (this.fallingIngredients.getChildren().length == 0)
            this.game_finished = true;
        
          
      }
      
      });
    if (this.game_finished){
      this.endGame();
      this.scene.start('scene-gameover');
    }
    if (this.game_over){
        this.player.setVelocityX(0);
        this.player.anims.play('idle', true);
        this.spawner.remove();
      }

    this.timeLeft -= this.game.loop.delta / 1000;
    const rotation = 2 * Math.PI * (1 - this.timeLeft / this.totalGameTime);
    this.hourHand.setRotation(rotation);
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.game_over = true;
      //this.endGame(); // Your game over logic her
    }
  }

  endGame() {
    this.fallingIngredients.clear(true, true);
    this.player.setVelocityX(0);
    this.player.anims.play('idle', true);
    console.log("Game Over! Your recipe is ready!");
  }
  throwIngredientFromStorage() {
    const startX = 1030;
    const startY = 100;
    const peakX = Phaser.Math.Between(0, 1000);
    const peakY = -100;
  
    // Add throw lines sprite
    if (this.introComplete){
      const lines = this.add.image(startX - 30, startY - 30, 'throwLines')
        .setAlpha(0.8)
        .setScale(0.3)
        .setRotation(Phaser.Math.FloatBetween(-0.2, 0.2)); // subtle angle variation
        // Remove throw lines after a short delay
      this.time.delayedCall(300, () => lines.destroy());
    }
  
    
  
    // After the visual throw, drop the real ingredient
    this.time.delayedCall(500, () => {
      this.spawnIngredientAt(peakX, -50);
    });
  }
  
  

  spawnIngredientAt(x, y) {
    const randomIngredient = Phaser.Utils.Array.GetRandom(ingredientsList);
    const ingredient = this.fallingIngredients.create(x, y, randomIngredient.key);
    ingredient.setData("type", randomIngredient.key);
    ingredient.setScale(0.3);
    ingredient.setCollideWorldBounds(true);
    ingredient.setBounce(0.5);
    ingredient.setData('rotationSpeed', 0);
    ingredient.setData('wobbleSpeed', 0);

  }
  
  catchIngredient(player, ingredient) {
    if (this.game_over || this.game_finished) return;
    const type = ingredient.getData("type");
  
    const goodIngredients = ["Flour", "Sugar", "Egg", "Butter", "Milk", "Strawberry", "Blueberry", "Caramel", "Honey", "Chocolate", "Nuts", "Vanilla", "Philadelphia"];
    const isGood = goodIngredients.includes(type);
  
    // Emotion frame based on last movement direction
    const emotionFrame = isGood
      ? (this.lastDirection === "left" ? 8 : 3)
      : (this.lastDirection === "left" ? 9 : 4);
  
    this.controlsEnabled = false;
    this.player.setVelocityX(0);
    this.player.anims.stop();
    this.player.setFrame(emotionFrame);
  
    // Restore movement after short lock
    this.time.delayedCall(250, () => {
      this.controlsEnabled = true;
    });
  
    // Restore idle look
    this.time.delayedCall(700, () => {
      const idleFrame = this.lastDirection === "left" ? 7 : 0;
      this.player.setFrame(idleFrame);
    });
  
    // Recipe logic
    if (!this.recipe[type]) {
      this.recipe[type] = 1;
    } else {
      this.recipe[type]++;
    }
  
    this.updateRecipeText();
    ingredient.destroy();
  
    if (this.recipe.flour >= 2 && this.recipe.sugar >= 2 && this.recipe.egg >= 2) {
      generateQRCode("Test");
    }
  }
  
  
  
  
  introThrowSequence() {
    const introCount = 100; // how many fake throws before the game starts
    const interval = 100;
  
    this.player.setVelocityX(0);
    this.input.keyboard.enabled = false;
  
    for (let i = 0; i < introCount; i++) {
      this.time.delayedCall(i * interval, () => {
        this.throwIngredientFromStorage();
      });
    }
  
    // Enable player + start real game after intro
    this.time.delayedCall(introCount * interval + 200, () => {
      this.input.keyboard.enabled = true;
  
      // Start regular spawner after intro
      this.spawner = this.time.addEvent({
        delay: 1000,
        callback: this.throwIngredientFromStorage,
        callbackScope: this,
        loop: true,
      });
    });
  }
  
  updateRecipeText() {
    const entries = Object.entries(this.recipe);
    const mid = 9;
  
    let col1 = "";
    let col2 = "";

    entries.forEach(([ingredient, count], index) => {
      const line = `${count}x ${ingredient}`;
      if (index < mid) {
        col1 += `${line}<br>`;
      } else {
        col2 += `${line}<br>`;
      }
    });
  
    document.getElementById("recipeText").innerHTML = `
      <div class="recipe-col">${col1}</div>
      <div class="recipe-col">${col2}</div>
  `;
  
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
      //debug: true,
    },
  },
  scene: [GameScene,GameOverScene],
};

const game = new Phaser.Game(config);


function generateQRCode(recipe) {
  const recipeText = createURL(recipe);
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);

  QRCode.toCanvas(canvas, recipeText, { width: 200 }, function (error) {
    if (error) console.error(error);
  });
}

function createURL(recipe){
  const baseURL = "https://wa.me/";
  const phoneNumber = "XXXX";
  const message = createMessage(recipe)
  const encodedMessage = encodeURIComponent(message);
  return `${baseURL}${phoneNumber}?text=${encodedMessage}`;
}

function createMessage(recipe){
  const message = `Flour: ${recipe.flour}, Sugar: ${recipe.sugar}, Egg: ${recipe.egg}`;
  return message
}