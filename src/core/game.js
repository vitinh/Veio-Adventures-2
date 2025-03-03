import Renderer from './renderer.js';
import InputHandler from './input.js';
import AssetLoader from './assetLoader.js';
import AudioManager from './audioManager.js';
import Player from '../entities/player/player.js';
import SimpleEnemy from '../entities/enemies/simpleEnemy.js';
import Level1 from '../maps/level1.js';

/**
 * Main game class that handles game loop and state
 */
class Game {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.entities = [];
    this.player = null;
    this.map = null;
    this.renderer = null;
    this.input = null;
    this.assetLoader = null;
    this.audioManager = null;
    this.running = false;
    this.lastTimestamp = 0;
    this.frameCount = 0;
    this.frameTime = 0;
    this.fps = 0;
  }

  init() {
    // Initialize core systems
    this.renderer = new Renderer(this.container);
    this.input = new InputHandler();
    this.assetLoader = new AssetLoader();
    this.audioManager = new AudioManager();

    // Load assets
    console.log('Loading assets...');
    this.assetLoader.loadAssets().then(() => {
      this.setupGame();
    }).catch(error => {
      console.error('Error loading assets:', error);
    });
  }

  setupGame() {
    console.log('Setting up game...');
    
    // Create map
    this.map = new Level1();
    
    // Create player
    this.player = new Player(400, 300);
    this.entities.push(this.player);

    // Create enemies
    const enemy = new SimpleEnemy(600, 200);
    this.entities.push(enemy);
    
    // Set targets for enemies
    enemy.setTarget(this.player);

    // Initialize audio
    this.audioManager.init(this.assetLoader);

    // Start game loop
    this.start();
    
    console.log('Game initialized successfully');
  }

  start() {
    if (!this.running) {
      this.running = true;
      this.lastTimestamp = performance.now();
      requestAnimationFrame(this.gameLoop.bind(this));
      console.log('Game loop started');
    }
  }

  stop() {
    this.running = false;
    console.log('Game loop stopped');
  }

  gameLoop(timestamp) {
    if (!this.running) return;

    // Calculate delta time in seconds with a maximum value to prevent large jumps
    let deltaTime = (timestamp - this.lastTimestamp) / 1000;
    
    // Cap maximum delta time to prevent "spiral of death" with slow frames
    const maxDeltaTime = 0.1; // 100ms maximum delta
    if (deltaTime > maxDeltaTime) {
      deltaTime = maxDeltaTime;
    }
    
    this.lastTimestamp = timestamp;
    
    // FPS calculation
    this.frameCount++;
    this.frameTime += deltaTime;
    if (this.frameTime >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.frameTime = 0;
    }

    // Update game state with fixed time step for consistent physics
    this.accumulatedTime += deltaTime;
    const fixedTimeStep = 1 / 60; // 60 updates per second
    
    // Process all accumulated time in fixed chunks
    while (this.accumulatedTime >= fixedTimeStep) {
      this.update(fixedTimeStep);
      this.accumulatedTime -= fixedTimeStep;
    }

    // Render the game
    this.render();

    // Request next frame
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update(deltaTime) {
    // Update input state
    this.input.update(deltaTime);

    // Update player with input
    if (this.player) {
      const playStepSound = this.player.handleInput(this.input, deltaTime);
      
      // Play step sound if the player's movement indicates we should
      if (playStepSound) {
        this.audioManager.play('step', { volume: 0.4 });
      }
    }

    // Update all entities
    for (const entity of this.entities) {
      entity.update(deltaTime, this.map);
    }

    // Update map
    if (this.map) {
      this.map.update(deltaTime);
    }
    
    // Check collisions
    this.checkCollisions();
  }
  
  checkCollisions() {
    // Basic collision detection between entities
    for (let i = 0; i < this.entities.length; i++) {
      const entityA = this.entities[i];
      
      for (let j = i + 1; j < this.entities.length; j++) {
        const entityB = this.entities[j];
        
        if (entityA.collidesWith(entityB)) {
          entityA.onCollision(entityB);
          entityB.onCollision(entityA);
        }
      }
    }
  }

  render() {
    // Clear renderer
    this.renderer.clear();

    // Render map
    if (this.map) {
      this.map.render(this.renderer);
    }

    // Render all entities
    for (const entity of this.entities) {
      entity.render(this.renderer);
    }
    
    // Render FPS counter
    this.renderer.renderText(10, 20, `FPS: ${this.fps}`, '#FFF');
  }
}

export default Game;
