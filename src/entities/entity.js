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
    // Basic collision with map boundaries
    this.x = Math.max(0, Math.min(map.width - this.width, this.x));
    this.y = Math.max(0, Math.min(map.height - this.height, this.y));
    
    // Check collision with tiles
    this.handleTileCollision(map);
  }
  
  handleTileCollision(map) {
    // Check the four corners of the entity against map tiles
    const corners = [
      { x: this.x, y: this.y },                           // Top-left
      { x: this.x + this.width, y: this.y },              // Top-right
      { x: this.x, y: this.y + this.height },             // Bottom-left
      { x: this.x + this.width, y: this.y + this.height } // Bottom-right
    ];
    
    for (const corner of corners) {
      const tile = map.getTileAt(corner.x, corner.y);
      
      if (tile && !tile.isWalkable()) {
        // Simple collision response - push out of the tile
        // This is a basic implementation that could be improved
        
        // Get tile boundaries
        const tileX = Math.floor(corner.x / map.tileSize) * map.tileSize;
        const tileY = Math.floor(corner.y / map.tileSize) * map.tileSize;
        
        // Calculate overlap
        const overlapX1 = (this.x + this.width) - tileX;
        const overlapX2 = (tileX + map.tileSize) - this.x;
        const overlapY1 = (this.y + this.height) - tileY;
        const overlapY2 = (tileY + map.tileSize) - this.y;
        
        // Find minimum overlap
        const overlapX = Math.min(overlapX1, overlapX2);
        const overlapY = Math.min(overlapY1, overlapY2);
        
        // Resolve collision along the axis with smaller overlap
        if (overlapX < overlapY) {
          // X-axis collision
          if (overlapX1 < overlapX2) {
            this.x = tileX - this.width; // Push left
          } else {
            this.x = tileX + map.tileSize; // Push right
          }
          this.velocityX = 0;
        } else {
          // Y-axis collision
          if (overlapY1 < overlapY2) {
            this.y = tileY - this.height; // Push up
          } else {
            this.y = tileY + map.tileSize; // Push down
          }
          this.velocityY = 0;
        }
      }
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
