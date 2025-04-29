import "./style.css";
import Phaser from "phaser";
import bgImage from './assets/bg.png';
import basketImage from './assets/basket.png';
//import player_model_basic from './assets/player_model_basic.png'; // Not yet used

import flourImage from './assets/ingredients/flour.png';
import sugarImage from './assets/ingredients/sugar.png';
import eggImage from './assets/ingredients/eggs.png';

const sizes = {
  width: 1536,
  height: 1024,
};

const speedDown = 300;

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
    this.playerSpeed = speedDown + 50;

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
    this.load.image("basket", basketImage);

    for (const ingredient of ingredientsList) {
      this.load.image(ingredient.key, ingredient.image);
    }
  }

  create() {
    this.add.image(0, 0, "bg").setOrigin(0, 0);

    this.player = this.physics.add.image(700, 800, "basket").setOrigin(0, 0);
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
    ingredient.setData('rotationSpeed', Phaser.Math.FloatBetween(0.005, 0.01)); // slow spin
    ingredient.setData('wobbleSpeed', Phaser.Math.FloatBetween(0.002, 0.004)); // small side wobble
  }

  catchIngredient(player, ingredient) {
    const type = ingredient.getData("type");
    if (this.recipe[type] !== undefined) {
      this.recipe[type]++;
      this.updateRecipeText();
    }
    ingredient.destroy(); // Remove the caught ingredient
  }

  updateRecipeText() {
    this.recipeText.setText(
      `Recipe:\nFlour: ${this.recipe.flour}\nSugar: ${this.recipe.sugar}\nEgg: ${this.recipe.egg}`
    );
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
