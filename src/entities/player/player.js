import Entity from '../entity.js';

/**
 * Player entity controlled by the user
 */
class Player extends Entity {
  constructor(x, y) {
    super(x, y, 32, 32);
    this.spriteId = 'player/player';
    this.speed = 200;
    this.health = 100;
    this.maxHealth = 100;
    this.lastStepTime = 0;
    this.stepSoundInterval = 0.3; // Seconds between step sounds
  }

  handleInput(input, deltaTime) {
    // Reset velocity
    this.velocityX = 0;
    this.velocityY = 0;
    
    // Set velocity based on arrow key input
    if (input.isUp) {
      this.velocityY = -this.speed;
      this.direction = 'up';
    } else if (input.isDown) {
      this.velocityY = this.speed;
      this.direction = 'down';
    }
    
    if (input.isLeft) {
      this.velocityX = -this.speed;
      this.direction = 'left';
    } else if (input.isRight) {
      this.velocityX = this.speed;
      this.direction = 'right';
    }
    
    // Normalize diagonal movement
    if (this.velocityX !== 0 && this.velocityY !== 0) {
      const normalizer = 1 / Math.sqrt(2);
      this.velocityX *= normalizer;
      this.velocityY *= normalizer;
    }
    
    // Update animation state
    this.animationState = (this.velocityX !== 0 || this.velocityY !== 0) ? 'walk' : 'idle';
    
    // Play step sound while moving
    if (this.animationState === 'walk') {
      this.lastStepTime += deltaTime;
      if (this.lastStepTime >= this.stepSoundInterval) {
        // Play step sound (would be called from Game class)
        this.lastStepTime = 0;
      }
    }
  }

  update(deltaTime, map) {
    super.update(deltaTime, map);
    
    // Additional player-specific update logic
  }

  render(renderer) {
    // Render the player sprite
    super.render(renderer);
    
    // Render health bar above player
    const healthBarWidth = this.width;
    const healthBarHeight = 5;
    const healthPercent = this.health / this.maxHealth;
    
    // Background of health bar
    renderer.renderRect(
      this.x, 
      this.y - healthBarHeight - 2, 
      healthBarWidth, 
      healthBarHeight, 
      'rgba(0, 0, 0, 0.5)', 
      `health-bg-${this.id}`
    );
    
    // Foreground of health bar
    renderer.renderRect(
      this.x, 
      this.y - healthBarHeight - 2, 
      healthBarWidth * healthPercent, 
      healthBarHeight, 
      healthPercent > 0.5 ? 'green' : healthPercent > 0.25 ? 'yellow' : 'red', 
      `health-fg-${this.id}`
    );
  }
  
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    if (this.health <= 0) {
      this.die();
    }
    
    return this.health > 0;
  }
  
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
  
  die() {
    console.log('Player died');
    this.active = false;
    // Game over logic would be handled by the Game class
  }
  
  onCollision(other) {
    // Handle collision with other entities
    if (other.type === 'enemy') {
      // Take damage from enemies
      // In a real game, this would have more sophisticated logic
    }
  }
}

export default Player;
