import "./style.css";
import Phaser from "phaser";
import bgImage from './assets/bg.png';

//import playerSpriteSheet from './assets/player_spritesheet.png';
import playerSpriteSheet from './assets/test.png';

import happyClock from './assets/clock.png';
import handle from './assets/handle.png';
import sadClock from './assets/sad_clock.png';
import standardClock from './assets/clock.png';

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




import QRCode from 'qrcode';

const sizes = {
  width: 1152,
  height: 768,
};

const speedDown = 50;
const playerMovementSpeed = 200;

const ingredientsList = [
  { key: "flour", image: flourImage },
  { key: "sugar", image: sugarImage },
  { key: "egg", image: eggImage },
  { key: "blueberrys", image: blueberrysImage },
  { key: "boots", image: bootsImage },
  { key: "butter", image: butterImage },
  { key: "caramel", image: caramelImage },
  { key: "chocolate", image: chocolateImage },
  { key: "honey", image: honeyImage },
  { key: "milk", image: milkImage },
  { key: "nails", image: nailsImage },
  { key: "nuts", image: nutsImage },
  { key: "philadelphia", image: philadelphiaImage },
  { key: "soap", image: soapImage },
  { key: "socks", image: socksImage },
  { key: "strawberry", image: strawberryImage },
  { key: "vanilla", image: vanillaImage },
  { key: "worms", image: wormsImage },

];

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = playerMovementSpeed + 50;
    this.lastMove = 0;
    this.fallingIngredients;
    this.recipe = {
      flour: 0,
      sugar: 0,
      egg: 0,
    };
    this.recipeText;
  }

  preload() {
    this.load.image("bg", bgImage);
    //this.load.image("basket", basketImage);
    this.load.image("scroll",)

    for (const ingredient of ingredientsList) {
      this.load.image(ingredient.key, ingredient.image);
    }
    this.load.spritesheet('player', playerSpriteSheet, {
      frameWidth: 516,
      frameHeight: 1024,
    });
    this.load.image("clock", standardClock);
    this.load.image("happyClock", happyClock);
    this.load.image("sadClock", sadClock);
    this.load.image("handle", handle);
  }

create() {
    this.add.image(0, 0, "bg").setOrigin(0, 0).setDisplaySize(sizes.width, sizes.height);

    this.player = this.physics.add.sprite(700, 800, 'player', 0).setOrigin(0, 0);
    this.player.setScale(0.3);  // Adjust size to fit game screen
    this.player.setCollideWorldBounds(true);
    this.player.body.allowGravity = false;
    
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
      frames: [{ key: 'player', frame: this.lastMove }],
      frameRate: 1
    });
    const clockX = 860
    const clockY = 150;

    this.add.image(clockX, clockY, 'happyClock').setScale(0.9);
    this.hourHand = this.add.image(clockX, clockY, 'handle').setScale(0.04);
    this.hourHand.setOrigin(0.49, 0.67); // Rotate around base of the hand
    
    
    //GAME TIME
    this.totalGameTime = 60;
    this.timeLeft = this.totalGameTime;
    this.cursor = this.input.keyboard.createCursorKeys();

    // Create a group for falling ingredients
    this.fallingIngredients = this.physics.add.group();

    // Spawn new ingredients every second
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnIngredient,
      callbackScope: this,
      loop: true,
    });

    // Check collision between player and ingredients
    this.physics.add.overlap(this.player, this.fallingIngredients, this.catchIngredient, null, this);

    // Create text to show recipe status
    this.recipeText = this.add.text(sizes.width - 300, 20, "", { fontSize: "24px", fill: "#000" });
    this.updateRecipeText();
  }

// replaced below
    const { left, right } = this.cursor;


    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      this.player.anims.play('left', true);
      this.lastMove = 4;
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      this.player.anims.play('right', true);
      this.lastMove = 4;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('idle', true);
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
      }
    });

    this.timeLeft -= this.game.loop.delta / 1000;
    const rotation = 2 * Math.PI * (1 - this.timeLeft / this.totalGameTime);
    this.hourHand.setRotation(rotation);
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.endGame(); // Your game over logic here
    
}
  }

  spawnIngredient() {
    const randomIngredient = Phaser.Utils.Array.GetRandom(ingredientsList);
    const x = Phaser.Math.Between(50, sizes.width - 50);

    const ingredient = this.fallingIngredients.create(x, 0, randomIngredient.key);
    ingredient.setData("type", randomIngredient.key); // Attach the type for tracking

    ingredient.setScale(0.3); // Scale down to 30%
    ingredient.setCollideWorldBounds(true);
    ingredient.setBounce(0.5);

    // Juicy extras
    ingredient.setData('rotationSpeed', Phaser.Math.FloatBetween(0.000, 0.00)); // slow spin
    ingredient.setData('wobbleSpeed', Phaser.Math.FloatBetween(0.000, 0.000)); // small side wobble

  }

  catchIngredient(player, ingredient) {
    const type = ingredient.getData("type");
    if (this.recipe[type] !== undefined) {
      this.recipe[type]++;
      this.updateRecipeText();
    }
    ingredient.destroy(); // Remove the caught ingredient
    if (this.recipe.flour >= 2 && this.recipe.sugar >= 2 && this.recipe.egg >= 2) {
      generateQRCode("Test")
    }
  }

  updateRecipeText() {
    const text = `Recipe:<br>Flour: ${this.recipe.flour}<br>Sugar: ${this.recipe.sugar}<br>Egg: ${this.recipe.egg}`;
    document.getElementById("recipeText").innerHTML = text;
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
  scene: [GameScene],
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
  const phoneNumber = "41764353610";
  const message = createMessage(recipe)
  const encodedMessage = encodeURIComponent(message);
  return `${baseURL}${phoneNumber}?text=${encodedMessage}`;
}

function createMessage(recipe){
  const message = `Flour: ${recipe.flour}, Sugar: ${recipe.sugar}, Egg: ${recipe.egg}`;
  return message
}

  create() {
    this.add.image(0, 0, "bg").setOrigin(0, 0).setDisplaySize(sizes.width, sizes.height);

    this.player = this.physics.add.sprite(700, 800, 'player', 0).setOrigin(0, 0);
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.body.allowGravity = false;

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 6 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player', frame: this.lastMove }],
      frameRate: 1
    });

    const clockX = 860;
    const clockY = 150;
    this.add.image(clockX, clockY, 'happyClock').setScale(0.9);
    this.hourHand = this.add.image(clockX, clockY, 'handle').setScale(0.04);
    this.hourHand.setOrigin(0.49, 0.67);

    this.totalGameTime = 60;
    this.timeLeft = this.totalGameTime;
    this.cursor = this.input.keyboard.createCursorKeys();
    this.fallingIngredients = this.physics.add.group();

    this.physics.add.overlap(this.player, this.fallingIngredients, this.catchIngredient, null, this);

    this.recipeText = this.add.text(sizes.width - 300, 20, "", { fontSize: "24px", fill: "#000" });
    this.updateRecipeText();

    // Disable controls during intro
    this.input.keyboard.enabled = false;
    this.introComplete = false;

    // Step 1: Show talking bubble
    this.talkingBubble = this.add.text(950, 300,
      "I found some ingredients
in the storage room!
Pick the ones you like!", {
        fontSize: "22px",
        backgroundColor: "#000",
        color: "#fff",
        padding: { x: 10, y: 10 }
      }).setOrigin(0.5);

    // Step 2: After delay, show instructions
    this.time.delayedCall(2500, () => {
      this.talkingBubble.destroy();
      this.instructionText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
        "← → Move with Arrow Keys
🕒 Watch the timer

Press SPACE to continue", {
          fontSize: "24px",
          color: "#fff",
          backgroundColor: "#000",
          padding: { x: 20, y: 20 },
          align: "center"
        }).setOrigin(0.5);

      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    });
  }

  update() {
    if (!this.introComplete && this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.introComplete = true;
      this.instructionText.destroy();

      // Step 3: Throw intro ingredients
      const introCount = 5;
      for (let i = 0; i < introCount; i++) {
        this.time.delayedCall(i * 500, () => this.spawnIngredient());
      }

      // Step 4: Show "Go!" then start game
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

          // Start spawner
          this.spawner = this.time.addEvent({
            delay: 1000,
            callback: this.spawnIngredient,
            callbackScope: this,
            loop: true
          });
        }
      });
    }

    if (!this.introComplete) return;

    const { left, right } = this.cursor;
    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      this.player.anims.play('left', true);
      this.lastMove = 4;
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      this.player.anims.play('right', true);
      this.lastMove = 4;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('idle', true);
    }

    this.fallingIngredients.getChildren().forEach((ingredient) => {
      const wobbleSpeed = ingredient.getData('wobbleSpeed');
      ingredient.x += Math.sin(this.time.now * wobbleSpeed) * 0.5;
      const rotationSpeed = ingredient.getData('rotationSpeed');
      ingredient.rotation += rotationSpeed;
      if (ingredient.y > 650) ingredient.destroy();
    });

    this.timeLeft -= this.game.loop.delta / 1000;
    const rotation = 2 * Math.PI * (1 - this.timeLeft / this.totalGameTime);
    this.hourHand.setRotation(rotation);
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.endGame();
    }
  }
