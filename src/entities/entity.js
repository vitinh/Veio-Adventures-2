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
  }

  update(deltaTime, map) {
    // Base update logic
    if (!this.active) return;
    
    // Apply velocity
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    
    // Map collision (if map provided)
    if (map) {
      this.handleMapCollision(map);
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

  handleMapCollision(map) {
    // Ensure we're within map boundaries with smoother edge collision
    const margin = 0.1; // Small margin to prevent overlap
    
    // Horizontal boundary checking
    if (this.x < 0) {
      this.x = 0 + margin;
      this.velocityX = 0; // Stop horizontal movement
    } else if (this.x + this.width > map.width) {
      this.x = map.width - this.width - margin;
      this.velocityX = 0; // Stop horizontal movement
    }
    
    // Vertical boundary checking
    if (this.y < 0) {
      this.y = 0 + margin;
      this.velocityY = 0; // Stop vertical movement
    } else if (this.y + this.height > map.height) {
      this.y = map.height - this.height - margin;
      this.velocityY = 0; // Stop vertical movement
    }
    
    // Check collision with tiles
    this.handleTileCollision(map);
  }
  
  handleTileCollision(map) {
    // Implementation of Swept AABB collision for smoother tile collision
    // Store original position for collision resolution
    const originalX = this.x;
    const originalY = this.y;
    
    // Calculate entity bounds
    const entityLeft = this.x;
    const entityRight = this.x + this.width;
    const entityTop = this.y;
    const entityBottom = this.y + this.height;
    
    // Determine which tiles to check based on entity position and size
    const startTileX = Math.floor(entityLeft / map.tileSize);
    const endTileX = Math.floor((entityRight - 0.1) / map.tileSize);
    const startTileY = Math.floor(entityTop / map.tileSize);
    const endTileY = Math.floor((entityBottom - 0.1) / map.tileSize);
    
    // Check for collisions with tiles
    let collisionX = false;
    let collisionY = false;
    
    // Separate horizontal and vertical collision checks for better control
    
    // Check horizontal collision first
    for (let y = startTileY; y <= endTileY; y++) {
      // Check tiles in moving direction first for better response
      if (this.velocityX > 0) { // Moving right
        for (let x = endTileX; x >= startTileX; x--) {
          const tile = map.getTile(x, y);
          if (tile && !tile.isWalkable()) {
            // Collision with right edge of entity
            this.x = x * map.tileSize - this.width;
            this.velocityX = 0;
            collisionX = true;
            break;
          }
        }
      } else if (this.velocityX < 0) { // Moving left
        for (let x = startTileX; x <= endTileX; x++) {
          const tile = map.getTile(x, y);
          if (tile && !tile.isWalkable()) {
            // Collision with left edge of entity
            this.x = (x + 1) * map.tileSize;
            this.velocityX = 0;
            collisionX = true;
            break;
          }
        }
      }
      
      if (collisionX) break;
    }
    
    // After resolving X collision, check Y collision with the new X position
    const newStartTileX = Math.floor(this.x / map.tileSize);
    const newEndTileX = Math.floor((this.x + this.width - 0.1) / map.tileSize);
    
    for (let x = newStartTileX; x <= newEndTileX; x++) {
      if (this.velocityY > 0) { // Moving down
        for (let y = endTileY; y >= startTileY; y--) {
          const tile = map.getTile(x, y);
          if (tile && !tile.isWalkable()) {
            // Collision with bottom edge of entity
            this.y = y * map.tileSize - this.height;
            this.velocityY = 0;
            collisionY = true;
            break;
          }
        }
      } else if (this.velocityY < 0) { // Moving up
        for (let y = startTileY; y <= endTileY; y++) {
          const tile = map.getTile(x, y);
          if (tile && !tile.isWalkable()) {
            // Collision with top edge of entity
            this.y = (y + 1) * map.tileSize;
            this.velocityY = 0;
            collisionY = true;
            break;
          }
        }
      }
      
      if (collisionY) break;
    }
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
