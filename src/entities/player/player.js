import Entity from '../entity.js';

/**
 * Player entity controlled by the user with improved movement
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
    
    // Movement smoothing
    this.targetVelocityX = 0;
    this.targetVelocityY = 0;
    this.accelerationRate = 15;   // How quickly to reach target velocity
    this.decelerationRate = 20;   // How quickly to slow down
    
    // Animation state tracking
    this.movementTime = 0;        // Time spent moving in current direction
    this.stepCycle = 0;           // For footstep timing
  }

  handleInput(input, deltaTime) {
    // Get movement input as -1 to 1 values
    const horizontalInput = input.horizontalAxis;
    const verticalInput = input.verticalAxis;
    
    // Set target velocity based on input
    this.targetVelocityX = horizontalInput * this.speed;
    this.targetVelocityY = verticalInput * this.speed;
    
    // Normalize diagonal movement for target velocity
    if (this.targetVelocityX !== 0 && this.targetVelocityY !== 0) {
      const normalizer = 1 / Math.sqrt(2);
      this.targetVelocityX *= normalizer;
      this.targetVelocityY *= normalizer;
    }
    
    // Smoothly adjust actual velocity toward target velocity
    this.smoothVelocity(deltaTime);
    
    // Update facing direction based on movement
    this.updateDirection(horizontalInput, verticalInput);
    
    // Update animation state
    this.updateAnimationState(deltaTime);
    
    // Handle footstep sounds
    this.handleFootsteps(deltaTime);
  }
  
  smoothVelocity(deltaTime) {
    // Calculate the difference between current and target velocity
    const diffX = this.targetVelocityX - this.velocityX;
    const diffY = this.targetVelocityY - this.velocityY;
    
    // Determine if we're accelerating or decelerating
    const rate = (this.targetVelocityX === 0 && this.targetVelocityY === 0) ? 
                 this.decelerationRate : this.accelerationRate;
    
    // Apply smooth acceleration/deceleration
    this.velocityX += diffX * rate * deltaTime;
    this.velocityY += diffY * rate * deltaTime;
    
    // Apply a small deadzone to prevent micro-movements
    if (Math.abs(this.velocityX) < 1) this.velocityX = 0;
    if (Math.abs(this.velocityY) < 1) this.velocityY = 0;
  }
  
  updateDirection(horizontalInput, verticalInput) {
    // Only update direction when there's actual input
    if (horizontalInput !== 0 || verticalInput !== 0) {
      // Determine primary direction based on strongest input
      if (Math.abs(horizontalInput) > Math.abs(verticalInput)) {
        this.direction = horizontalInput > 0 ? 'right' : 'left';
      } else {
        this.direction = verticalInput > 0 ? 'down' : 'up';
      }
    }
  }
  
  updateAnimationState(deltaTime) {
    // Check if the player is moving
    const isMoving = Math.abs(this.velocityX) > 5 || Math.abs(this.velocityY) > 5;
    
    if (isMoving) {
      this.animationState = 'walk';
      this.movementTime += deltaTime;
    } else {
      this.animationState = 'idle';
      this.movementTime = 0;
    }
  }
  
  handleFootsteps(deltaTime) {
    // Only play step sounds when actually moving
    if (this.animationState === 'walk') {
      this.lastStepTime += deltaTime;
      this.stepCycle += deltaTime * Math.sqrt(this.velocityX * this.velocityX + 
                                             this.velocityY * this.velocityY) / this.speed;
      
      // Use step cycle to determine when to play sound
      if (this.stepCycle >= this.stepSoundInterval) {
        // This would trigger the sound in the game class
        this.stepCycle = 0;
        return true; // Signal to play step sound
      }
    } else {
      // Reset step timing when not walking
      this.lastStepTime = 0;
      this.stepCycle = 0;
    }
    return false;
  }

  update(deltaTime, map) {
    super.update(deltaTime, map);
    
    // Additional player-specific update logic can go here
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