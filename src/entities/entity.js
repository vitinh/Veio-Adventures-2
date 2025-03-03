/**
 * Base class for all game entities
 */
class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 0;
    this.spriteId = null;
    this.animationState = 'idle';
    this.direction = 'down';
    this.active = true;
    this.visible = true;
    
    // Unique ID for the entity
    this.id = Entity.nextId++;
    
    // Collision properties
    this.collisionBuffer = 0.1; // Small buffer to prevent sticking to walls
  }

  update(deltaTime, map) {
    // Base update logic
    if (!this.active) return;
    
    // Store original position before movement
    const originalX = this.x;
    const originalY = this.y;
    
    // Apply velocity one axis at a time for better collision handling
    // First move on X axis
    this.x += this.velocityX * deltaTime;
    
    // Check for map collisions on X axis
    if (map) {
      this.handleMapBoundaryCollision(map);
      if (this.handleTileCollisionX(map, originalX, originalY)) {
        // X collision occurred
        this.velocityX = 0;
      }
    }
    
    // Then move on Y axis
    this.y += this.velocityY * deltaTime;
    
    // Check for map collisions on Y axis
    if (map) {
      this.handleMapBoundaryCollision(map);
      if (this.handleTileCollisionY(map, originalX, originalY)) {
        // Y collision occurred
        this.velocityY = 0;
      }
    }
  }

  render(renderer) {
    if (!this.visible) return;
    
    // Render the entity's sprite
    if (this.spriteId) {
      renderer.renderSprite(
        this.spriteId,
        this.x, 
        this.y, 
        this.width, 
        this.height, 
        `entity-${this.id}`,
        { state: this.animationState, direction: this.direction }
      );
    } else {
      // Fallback: render a rectangle
      renderer.renderRect(
        this.x, 
        this.y, 
        this.width, 
        this.height, 
        'gray', 
        `entity-${this.id}`
      );
    }
  }

  handleMapBoundaryCollision(map) {
    // Ensure we're within map boundaries with smoother edge collision
    const margin = this.collisionBuffer;
    
    // Horizontal boundary checking
    if (this.x < 0) {
      this.x = 0 + margin;
      this.velocityX = 0;
    } else if (this.x + this.width > map.width) {
      this.x = map.width - this.width - margin;
      this.velocityX = 0;
    }
    
    // Vertical boundary checking
    if (this.y < 0) {
      this.y = 0 + margin;
      this.velocityY = 0;
    } else if (this.y + this.height > map.height) {
      this.y = map.height - this.height - margin;
      this.velocityY = 0;
    }
  }
  
  handleTileCollisionX(map, originalX, originalY) {
    const tileSize = map.tileSize;
    
    // Calculate entity bounds
    const left = this.x;
    const right = this.x + this.width;
    const top = this.y;
    const bottom = this.y + this.height;
    
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
      if (rightTileX > Math.floor((originalX + this.width - 0.001) / tileSize)) {
        for (let y = minTileY; y <= maxTileY; y++) {
          const tile = map.getTile(rightTileX, y);
          if (tile && !tile.isWalkable()) {
            // Collision with right edge of entity
            this.x = rightTileX * tileSize - this.width - this.collisionBuffer;
            collisionOccurred = true;
            break;
          }
        }
      }
    } else if (this.velocityX < 0) { // Moving left
      // Check the left edge
      const leftTileX = Math.floor(left / tileSize);
      
      // If we're entering a new tile
      if (leftTileX < Math.floor(originalX / tileSize)) {
        for (let y = minTileY; y <= maxTileY; y++) {
          const tile = map.getTile(leftTileX, y);
          if (tile && !tile.isWalkable()) {
            // Collision with left edge of entity
            this.x = (leftTileX + 1) * tileSize + this.collisionBuffer;
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
    
    // Calculate entity bounds
    const left = this.x;
    const right = this.x + this.width;
    const top = this.y;
    const bottom = this.y + this.height;
    
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
      if (bottomTileY > Math.floor((originalY + this.height - 0.001) / tileSize)) {
        for (let x = minTileX; x <= maxTileX; x++) {
          const tile = map.getTile(x, bottomTileY);
          if (tile && !tile.isWalkable()) {
            // Collision with bottom edge of entity
            this.y = bottomTileY * tileSize - this.height - this.collisionBuffer;
            collisionOccurred = true;
            break;
          }
        }
      }
    } else if (this.velocityY < 0) { // Moving up
      // Check the top edge
      const topTileY = Math.floor(top / tileSize);
      
      // If we're entering a new tile
      if (topTileY < Math.floor(originalY / tileSize)) {
        for (let x = minTileX; x <= maxTileX; x++) {
          const tile = map.getTile(x, topTileY);
          if (tile && !tile.isWalkable()) {
            // Collision with top edge of entity
            this.y = (topTileY + 1) * tileSize + this.collisionBuffer;
            collisionOccurred = true;
            break;
          }
        }
      }
    }
    
    return collisionOccurred;
  }

  collidesWith(entity) {
    return (
      this.x < entity.x + entity.width &&
      this.x + this.width > entity.x &&
      this.y < entity.y + entity.height &&
      this.y + this.height > entity.y
    );
  }
  
  onCollision(other) {
    // Base collision handler - override in subclasses
  }
}

// Static counter for generating unique IDs
Entity.nextId = 0;

export default Entity;
