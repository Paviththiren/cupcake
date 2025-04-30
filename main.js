import "./style.css";
import Phaser from "phaser";
import bgImage from './assets/bg.png';
import basketImage from './assets/basket.png';
//import player_model_basic from './assets/player_model_basic.png'; // Not yet used

import flourImage from './assets/ingredients/flour.png';
import sugarImage from './assets/ingredients/sugar.png';
import eggImage from './assets/ingredients/eggs.png';
import QRCode from 'qrcode';

function generateQRCode(recipe) {
  const recipeText = `Flour: ${recipe.flour}, Sugar: ${recipe.sugar}, Egg: ${recipe.egg}`;
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);

  QRCode.toCanvas(canvas, recipeText, { width: 200 }, function (error) {
    if (error) console.error(error);
    console.log('QR code generated!');
  });
}
const sizes = {
  width: 1152,
  height: 768,
};

const speedDown = 50;
const playerMovementSpeed = 300;

const ingredientsList = [
  { key: "flour", image: flourImage },
  { key: "sugar", image: sugarImage },
  { key: "egg", image: eggImage },
];

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = playerMovementSpeed + 50;

    this.fallingIngredients;
    this.recipe = {
      flour: 0,
      sugar: 0,
      egg: 1,
    };
    this.recipeText;
  }

  preload() {
    this.load.image("bg", bgImage);
    this.load.image("basket", basketImage);
    this.load.image("scroll",)

    for (const ingredient of ingredientsList) {
      this.load.image(ingredient.key, ingredient.image);
    }
  }

  create() {
    this.add.image(0, 0, "bg").setOrigin(0, 0).setDisplaySize(sizes.width, sizes.height);

    this.player = this.physics.add.image(700, 600, "basket").setOrigin(0, 0);
    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);

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

  update() {
    const { left, right } = this.cursor;

    if (left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
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
      generateQRCode(this.recipe);
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
