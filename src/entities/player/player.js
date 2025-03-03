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
    
    // Collision handling - smaller collision buffer for more precise movement
    this.collisionBuffer = 0.05;
    
    // Add collision box properties - make hitbox smaller than visible sprite
    this.collisionBoxWidth = this.width - 8;  // 24px wide collision box (4px smaller on each side)
    this.collisionBoxHeight = this.height - 8; // 24px tall collision box (4px smaller on each side)
    this.collisionBoxOffsetX = 4;  // Center the collision box
    this.collisionBoxOffsetY = 4;  // Center the collision box
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
    return this.handleFootsteps(deltaTime);
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

  handleTileCollisionX(map, originalX, originalY) {
    const tileSize = map.tileSize;
    
    // Calculate entity bounds with smaller collision box
    const left = this.x + this.collisionBoxOffsetX;
    const right = this.x + this.collisionBoxOffsetX + this.collisionBoxWidth;
    const top = this.y + this.collisionBoxOffsetY;
    const bottom = this.y + this.collisionBoxOffsetY + this.collisionBoxHeight;
    
    // Convert to tile coordinates, being careful with edge cases
    const startTileX = Math.floor(left / tileSize);
    const endTileX = Math.floor((right - 0.001) / tileSize);
    const startTileY = Math.floor(top / tileSize);
    const endTileY = Math.floor((bottom - 0.001) / tileSize);
    
    // Ensure we don't check outside the map
    const minTileX = Math.max(0, startTileX);
    const maxTileX = Math.min(map.columns - 1, endTileX);
    const minTileY = Math.max(0, startTileY);
    const maxTileY = Math.min(map.rows - 1, endTileY);
    
    // Flag to track if a collision occurred
    let collisionOccurred = false;
    
    // Check for collisions in the X direction
    if (this.velocityX > 0) { // Moving right
      // Check the right edge
      const rightTileX = Math.floor(right / tileSize);
      
      // If we're entering a new tile
      if (rightTileX > Math.floor((originalX + this.collisionBoxOffsetX + this.collisionBoxWidth - 0.001) / tileSize)) {
        for (let y = minTileY; y <= maxTileY; y++) {
          const tile = map.getTile(rightTileX, y);
          if (tile && !tile.isWalkable()) {
            // Collision with right edge of entity
            this.x = rightTileX * tileSize - this.collisionBoxWidth - this.collisionBoxOffsetX - this.collisionBuffer;
            collisionOccurred = true;
            break;
          }
        }
      }
    } else if (this.velocityX < 0) { // Moving left
      // Check the left edge
      const leftTileX = Math.floor(left / tileSize);
      
      // If we're entering a new tile
      if (leftTileX < Math.floor((originalX + this.collisionBoxOffsetX) / tileSize)) {
        for (let y = minTileY; y <= maxTileY; y++) {
          const tile = map.getTile(leftTileX, y);
          if (tile && !tile.isWalkable()) {
            // Collision with left edge of entity
            this.x = (leftTileX + 1) * tileSize - this.collisionBoxOffsetX + this.collisionBuffer;
            collisionOccurred = true;
            break;
          }
        }
      }
    }
    
    return collisionOccurred;
  }
  
  handleTileCollisionY(map, originalX, originalY) {
    const tileSize = map.tileSize;
    
    // Calculate entity bounds with smaller collision box
    const left = this.x + this.collisionBoxOffsetX;
    const right = this.x + this.collisionBoxOffsetX + this.collisionBoxWidth;
    const top = this.y + this.collisionBoxOffsetY;
    const bottom = this.y + this.collisionBoxOffsetY + this.collisionBoxHeight;
    
    // Convert to tile coordinates, being careful with edge cases
    const startTileX = Math.floor(left / tileSize);
    const endTileX = Math.floor((right - 0.001) / tileSize);
    const startTileY = Math.floor(top / tileSize);
    const endTileY = Math.floor((bottom - 0.001) / tileSize);
    
    // Ensure we don't check outside the map
    const minTileX = Math.max(0, startTileX);
    const maxTileX = Math.min(map.columns - 1, endTileX);
    const minTileY = Math.max(0, startTileY);
    const maxTileY = Math.min(map.rows - 1, endTileY);
    
    // Flag to track if a collision occurred
    let collisionOccurred = false;
    
    // Check for collisions in the Y direction
    if (this.velocityY > 0) { // Moving down
      // Check the bottom edge
      const bottomTileY = Math.floor(bottom / tileSize);
      
      // If we're entering a new tile
      if (bottomTileY > Math.floor((originalY + this.collisionBoxOffsetY + this.collisionBoxHeight - 0.001) / tileSize)) {
        for (let x = minTileX; x <= maxTileX; x++) {
          const tile = map.getTile(x, bottomTileY);
          if (tile && !tile.isWalkable()) {
            // Collision with bottom edge of entity
            this.y = bottomTileY * tileSize - this.collisionBoxHeight - this.collisionBoxOffsetY - this.collisionBuffer;
            collisionOccurred = true;
            break;
          }
        }
      }
    } else if (this.velocityY < 0) { // Moving up
      // Check the top edge
      const topTileY = Math.floor(top / tileSize);
      
      // If we're entering a new tile
      if (topTileY < Math.floor((originalY + this.collisionBoxOffsetY) / tileSize)) {
        for (let x = minTileX; x <= maxTileX; x++) {
          const tile = map.getTile(x, topTileY);
          if (tile && !tile.isWalkable()) {
            // Collision with top edge of entity
            this.y = (topTileY + 1) * tileSize - this.collisionBoxOffsetY + this.collisionBuffer;
            collisionOccurred = true;
            break;
          }
        }
      }
    }
    
    return collisionOccurred;
  }

  collidesWith(entity) {
    // Use the smaller collision box for player
    const playerLeft = this.x + this.collisionBoxOffsetX;
    const playerRight = playerLeft + this.collisionBoxWidth;
    const playerTop = this.y + this.collisionBoxOffsetY;
    const playerBottom = playerTop + this.collisionBoxHeight;
    
    // Use regular bounds for the other entity
    const entityLeft = entity.x;
    const entityRight = entity.x + entity.width;
    const entityTop = entity.y;
    const entityBottom = entity.y + entity.height;
    
    return (
      playerLeft < entityRight &&
      playerRight > entityLeft &&
      playerTop < entityBottom &&
      playerBottom > entityTop
    );
  }

  render(renderer) {
    // Call parent render method for the sprite
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
    
    // Debug: Render collision box (uncomment for debugging)
    /*
    renderer.renderRect(
      this.x + this.collisionBoxOffsetX,
      this.y + this.collisionBoxOffsetY,
      this.collisionBoxWidth,
      this.collisionBoxHeight,
      'rgba(255, 0, 0, 0.3)',
      `collision-box-${this.id}`
    );
    */
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