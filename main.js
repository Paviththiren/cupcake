import "./style.css";
import Phaser from "phaser";

import StoryScene from './story_scene.js'; 

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
import currypowderImage from './assets/ingredients/suriya_curry_powder_350x350.png';
import tangerineImage from './assets/ingredients/tangerine.png';

import throwLinesImage from './assets/throw_lines.png';


import introBubbleImage from './assets/intro/Intro_Bubble.png';
import arrowInstructionsImage from './assets/intro/arrow_ref.png';
import watchClockImage from './assets/intro/time_ref.png';
import clockArrowImage from './assets/intro/Clock_Arrow_resized.png';
import pressSpaceImage from './assets/intro/press_ref.png';
import endBubbleImage from './assets/intro/End_Bubble.png';

import CatchTimeImage from './assets/intro/Catch_Time_2.png';

import QRCode, { create } from 'qrcode';

const sizes = {
  width: 1152,
  height: 768,
};

const speedDown = 50;
const playerMovementSpeed = 250;

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
  { key: "Suriya Curry Powder", image: currypowderImage },
  { key: "Tangerines", image: tangerineImage },
];

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = playerMovementSpeed;
    this.fallingIngredients;
    this.recipe = {};
    this.recipeText;
    this.lastDirection = "right";
    this.game_over = false;
    this.game_finished = false;
    this.specialIngredient = false;
    this.specialIngredientTime = Math.floor(Math.random() * 21) + 15;
    this.game_stop = true;
    this.gpt_output = false;
    this.endBubbleShown = false;

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


    this.load.image('introBubble', introBubbleImage);
    this.load.image('arrowInstructions', arrowInstructionsImage);
    this.load.image('watchClock', watchClockImage);
    this.load.image('clockArrow', clockArrowImage);
    this.load.image('pressSpace', pressSpaceImage);
    this.load.image('endBubble', endBubbleImage);
    this.load.image('Catch Time', CatchTimeImage);


  }

  create() {
    document.getElementById('recipeScroll').style.display = 'flex';
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
      frameRate: 3,
      repeat: -1
    });
    
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2}),
      frameRate: 3,
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
    this.totalGameTime = 40;
    this.timeLeft = this.totalGameTime;

    // Input Defintions
    this.cursor = this.input.keyboard.createCursorKeys();

    // Create a group for falling ingredients
    this.fallingIngredients = this.physics.add.group();

    // Run intro throw sequence before starting the game
    // Step 1: Talking bubble near storage shelf
    this.player.setVelocityX(0);
    this.input.keyboard.enabled = true;           // Keep input globally active
    this.controlsEnabled = true;          
    this.introComplete = false;

    this.talkingBubble = this.add.image(900, 250, 'introBubble').setOrigin(0.5).setScale(0.45);

    // Step 2: Show instructions after a delay
    this.time.delayedCall(6000, () => {
      this.talkingBubble.destroy();
    
      const centerX = this.cameras.main.centerX;
      const centerY = this.cameras.main.centerY;
      
      const intro_images = [
        this.add.image(centerX -85, centerY - 260, 'watchClock').setScale(0.5),
        this.add.image(centerX + 180, centerY - 250, 'clockArrow').setScale(0.45).setRotation(Phaser.Math.DegToRad(65)),
        this.add.image(centerX+180, centerY + 40, 'arrowInstructions').setScale(0.45),
        this.add.image(centerX-250, centerY+300, 'pressSpace').setScale(0.5)
      ];
      
      // Set initial alpha to 0 (invisible)
      intro_images.forEach(img => {
        img.setAlpha(0);
        img.setOrigin(0.5);
      });
      
      // Fade them in sequentially
      intro_images.forEach((img, i) => {
        img.setAlpha(0);
        img.setScale(img.scale * 0.8); // Start smaller for bounce
        img.setOrigin(0.5);
      
        // Sync index 0 and 1 (arrow + clock) to appear at same time
        const delay = (i === 0 || i === 1) ? 0 : (i - 1) * 1500;
      
        this.time.delayedCall(delay, () => {
          this.tweens.add({
            targets: img,
            alpha: 1,
            scale: img.scale / 0.8,
            ease: 'Bounce.easeOut',
            duration: 600
          });
        });
      });

      this.instructionGroup = this.add.group(intro_images);
      
    
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    });

    // Check collision between player and ingredients
    this.physics.add.overlap(this.player, this.fallingIngredients, this.catchIngredient, null, this);

    // Create text to show recipe status
    //this.recipeText = this.add.text(sizes.width - 300, 20, "", { fontSize: "24px", fill: "#000" });
    this.updateRecipeText();
    this.game_stop = true;

    document.getElementById("restartButton").addEventListener("click", () => {
      document.getElementById("gameOverPopup").style.display = "none";
      document.getElementById("gameOverButtonWrapper").style.display = "none";
      
      this.game_stop = false;
      this.game_over = false;
      this.game_finished = false;
      this.introComplete = false;
      this.gpt_output = false;
      this.recipe = {};
      this.updateRecipeText();
      this.scene.restart("scene-game");
      this.gme_time = 0;

    });
    
  }

  update() {
    
    if (!this.introComplete && this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.introComplete = true;
      this.instructionGroup.clear(true, true);

      this.startBubble = this.add.image(900, 220, 'Catch Time').setOrigin(0.5).setScale(0.45);
      this.time.delayedCall(2000, () => {
        this.startBubble.destroy();
      });

      const introCount = 2;
      for (let i = 0; i < introCount; i++) {
        this.time.delayedCall(i * 500, () => this.throwIngredientFromStorage());
      }
      this.input.keyboard.enabled = true;
      this.controlsEnabled = true;
      this.spawner = this.time.addEvent({
        delay: 1000,
        callback: this.throwIngredientFromStorage,
        callbackScope: this,
        loop: true
      });
    }

    //if (!this.introComplete) return;  // skip game logic if intro isn't done

    //if (!this.controlsEnabled) return;  // skip movement if locked

    const { left, right } = this.cursor;

    // Check if we're past halftime and haven't started ramping speeds
    if (this.timeLeft < this.totalGameTime + 8000  ) {
      
      const maxRotSpeed = 0.03;
      const maxWobbleSpeed = 0.03;
      const rot_step = 0.00005;
      const wobble_step = 0.0005;
    
      this.time.addEvent({
        delay: 1000,
        repeat: 50,
        callback: () => {
          this.fallingIngredients.getChildren().forEach((ingredient) => {
            const currentRot = ingredient.getData('rotationSpeed');
            const currentWobble = ingredient.getData('wobbleSpeed');
    
            const newRot = Math.min(currentRot + rot_step, maxRotSpeed);
            const newWobble = Math.min(currentWobble + wobble_step*10, maxWobbleSpeed);
    
            ingredient.setData('rotationSpeed', newRot);
            ingredient.setData('wobbleSpeed', newWobble);
          });
        }
      });
    }
    
    

    if (!this.game_finished) {
      if(this.controlsEnabled){
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
    }};
    

      
    // Add juicy movement to falling ingredients
    this.fallingIngredients.getChildren().forEach((ingredient) => {

      if (this.timeLeft > this.totalGameTime / 2){
        ingredient.x += 0;
        ingredient.rotation += 0;
      }
      else {
        const amplitude = this.totalGameTime - 2*this.timeLeft;
        if(this.timeLeft <= this.totalGameTime / 4){
          const amplitude = this.totalGameTime - 1.5*this.timeLeft;
        }
        // Wobble left-right
        const wobbleSpeed = ingredient.getData('wobbleSpeed');
        ingredient.x += (Math.sin(this.time.now/10 * wobbleSpeed)*amplitude) * this.game.loop.delta / 150 ;

        // Rotate slowly
        const rotationSpeed = ingredient.getData('rotationSpeed');
        ingredient.rotation += rotationSpeed;
      }


    if (ingredient.y > 650){
      ingredient.destroy();  
    }

    });

    
    if (this.game_finished && this.game_stop) {
      this.game_stop = false;
      this.endBubble = this.add.image(900, 220, 'endBubble').setOrigin(0.5).setScale(0.45);
      this.time.delayedCall(2000, () => {
        this.endBubble.destroy();
        
      });

      this.endGame();
      this.time.delayedCall(3000, () => {
        const gameOverText = document.getElementById('gameOverText');
        gameOverText.innerText = "Loading..."; // ⏳ optional emoji

        setTimeout(() => {
          getChatGPTFeedback(this.recipeMessage).then(feedback => {
            feedback = "\"" + feedback + "\"\n− Chibi-Pavi";
            gameOverText.innerText = feedback; 
          });  
        }, 200);
        document.getElementById("gameOverPopup").style.display = "block";
        generateQRCode(this.recipe);
        document.getElementById('gameOverButtonWrapper').style.display = 'block';
        
      });
    }
    if (this.game_over){
        this.spawner.remove();
        if (this.fallingIngredients.getChildren().length == 0)
          this.game_finished = true;
      }
    if(this.introComplete){
      this.timeLeft -= this.game.loop.delta / 1000;
      const rotation = 2 * Math.PI * (1 - this.timeLeft / this.totalGameTime);
      this.hourHand.setRotation(rotation);
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.game_over = true;
    }



    }
    
  }

  endGame() {
    this.fallingIngredients.clear(true, true);
    this.player.setVelocityX(0);
    this.player.anims.play('idle', true);
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
    let randomIngredient = Phaser.Utils.Array.GetRandom(ingredientsList);
    while (randomIngredient.key === "Suriya Curry Powder" ) {
      randomIngredient = Phaser.Utils.Array.GetRandom(ingredientsList);
    }
    
    if (this.totalGameTime - this.timeLeft > this.specialIngredientTime && !this.specialIngredient)
    {
      this.specialIngredient = true;
      randomIngredient = Phaser.Utils.Array.GetRandom(ingredientsList.filter(i => i.key === "Suriya Curry Powder"));
    }

    const ingredient = this.fallingIngredients.create(x, y, randomIngredient.key);
    ingredient.setData("type", randomIngredient.key);
    if (ingredient.getData("type") == "Vanilla"){
      ingredient.setScale(0.4);}
    else if (ingredient.getData("type") == "Tangerines"){
      ingredient.setScale(0.35);}
    else if (ingredient.getData("type") == "Suriya Curry Powder"){
      ingredient.setScale(0.35);}
    else if (ingredient.getData("type") == "Philadelphia"){
      ingredient.setScale(0.34);}
    else{
      ingredient.setScale(0.3);
    }
    ingredient.setCollideWorldBounds(true);
    ingredient.setBounce(0.5);
    ingredient.setData('rotationSpeed', 0);
    ingredient.setData('wobbleSpeed', 0);

  }
  
  catchIngredient(player, ingredient) {
    if (this.game_finished) return;
    const type = ingredient.getData("type");
  
    const goodIngredients = ["Tangerines","Suriya Curry Powder","Flour", "Sugar", "Egg", "Butter", "Milk", "Strawberry", "Blueberry", "Caramel", "Honey", "Chocolate", "Nuts", "Vanilla", "Philadelphia"];
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
    this.time.delayedCall(300, () => {
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
    const mid = 10;
  
    let col1 = "";
    let col2 = "";
    let secretLine = "";
  
    const formattedRecipe = [];
    let recipeLines = [];
  
    const normalEntries = entries.filter(([ingredient]) => ingredient !== "Suriya Curry Powder");
    const secretEntry = entries.find(([ingredient]) => ingredient === "Suriya Curry Powder");
  
    normalEntries.forEach(([ingredient, count], index) => {
      const line = `${count}x ${ingredient}`;
      formattedRecipe.push({ ingredient, count });
      recipeLines.push(line);
  
      if (index < mid) {
        col1 += `${line}<br>`;
      } else {
        col2 += `${line}<br>`;
      }
    });
  
    if (secretEntry) {
      const [ingredient, count] = secretEntry;
      secretLine = `
        <div style="width: 100%; text-align: center; margin-top: 8px;">
          <span style="color: red; font-weight: bold;">Secret: ${ingredient}</span>
        </div>
      `;
      formattedRecipe.push({ ingredient, count, secret: true });
      recipeLines.push(`Secret Ingredient: ${ingredient}`);
    }
  
    // Update UI
    document.getElementById("recipeText").innerHTML = `
      <div style="display: flex; gap: 16px; width: 100%;">
        <div class="recipe-col">${col1}</div>
        <div class="recipe-col">${col2}</div>
      </div>
      ${secretLine}
    `;
  
    // Save in exportable forms
    this.recipeForChatGPT = formattedRecipe;
    this.recipeMessage = `Here is the current recipe:\n\n` + recipeLines.map(line => `- ${line}`).join("\n");
    //console.log(this.recipeMessage);
    //console.log(this.recipeForChatGPT);
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
  const container = document.getElementById('qrCodeContainer');

  if (!container) return;
  container.innerHTML = ''; // Clear any previous QR

  const canvas = document.createElement('canvas');
  canvas.style.width = '180px';
  canvas.style.height = '180px';
  canvas.style.objectFit = 'contain';
  canvas.style.margin = '0 auto';
  canvas.style.display = 'block';

  container.appendChild(canvas);

  QRCode.toCanvas(canvas, recipeText, {
    errorCorrectionLevel: 'L',
    width: 180,
    margin: 0,
    color: {
      dark: '#4b2d0f',   // Dot color: deep brown
      light: '#f0deb6'   // Background color: warm beige
    }
  }, function (error) {
    if (error) console.error('QR Code error:', error);
  });
}



function createURL(recipe){
  const baseURL = "https://wa.me/";
  const phoneNumber = "41764353610";
  const message = createMessage(recipe);
  const encodedMessage = encodeURIComponent(message);
  return `${baseURL}${phoneNumber}?text=${encodedMessage}`;
}

function createMessage(recipe) {
  
  const emojiMap = {
    Flour: '🌾',
    Sugar: '🍬',
    Egg: '🥚',
    Butter: '🧈',
    Milk: '🥛',
    Strawberry: '🍓',
    Blueberry: '🫐',
    Caramel: '🍮',
    Honey: '🍯',
    Chocolate: '🍫',
    Nuts: '🥜',
    Vanilla: '🌼',
    Philadelphia: '🧀',
    Tangerines: '🍊',
    "Suriya Curry Powder": '🌶️',
    Boots: '👢',
    Nails: '🔩',
    Soap: '🧼' ,
    Socks: '🧦',
    Worms: '🐛',
  };

  let message = "Hi Pavi! 😊\nHere is a recipe for some lovely cupcakes!😋🧁\n\n*RECIPE*\n";
  if (Object.keys(recipe).length < 20) {
    message += Object.entries(recipe)
      .map(([ingredient, count]) => {
        const emoji = emojiMap[ingredient] || ''; // default emoji
        return `${count}x ${ingredient} ${emoji}`;
      })
      .join("\n");}
  else {
    message += Object.entries(recipe)
      .map(([ingredient, count]) => {
        const emoji = emojiMap[ingredient] || '🧂'; // default emoji
        return `${count}x ${ingredient}`;
      })
      .join("\n");
  }

  message += "\n\nNow that you have a recipe... When do I get MY cupcakes???"

  return message;
}

async function getChatGPTFeedback(recipeText) {
  try {
    const response = await fetch('/.netlify/functions/chatgpt', {
      method: 'POST',
      body: JSON.stringify({ recipeText })
    });

    const data = await response.json();
    if (response.ok) {
      return data.message;
    } else {
      console.error("Function error:", data.detail);
      return "Error fetching feedback.";
    }
  } catch (err) {
    console.error("Fetch failed:", err);
    return "Error connecting to feedback server.";
  }
}
