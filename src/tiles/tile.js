/**
 * Base tile class for the map
 */
class Tile {
  constructor(type, walkable = true, properties = {}) {
    this.type = type;
    this.walkable = walkable;
    this.spriteId = null;
    this.properties = properties;
    
    // For animated tiles
    this.animated = false;
    this.animationFrames = 1;
    this.animationSpeed = 0;
    this.currentFrame = 0;
    this.animationTimer = 0;
  }

  /**
   * Check if this tile is walkable
   * @returns {boolean} True if entities can walk on this tile
   */
  isWalkable() {
    return this.walkable;
  }

  /**
   * Set sprite for the tile
   * @param {string} spriteId ID of the sprite to use
   */
  setSpriteId(spriteId) {
    this.spriteId = spriteId;
  }

  /**
   * Make this tile animated
   * @param {number} frames Number of animation frames
   * @param {number} speed Animation speed (seconds per frame)
   */
  setAnimated(frames, speed) {
    this.animated = true;
    this.animationFrames = frames;
    this.animationSpeed = speed;
  }

  /**
   * Update the tile (for animations)
   * @param {number} deltaTime Time since last frame in seconds
   */
  update(deltaTime) {
    if (!this.animated) return;
    
    this.animationTimer += deltaTime;
    
    if (this.animationTimer >= this.animationSpeed) {
      this.animationTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % this.animationFrames;
    }
  }

  /**
   * Get the current animation frame
   * @returns {number} Current frame index
   */
  getCurrentFrame() {
    return this.currentFrame;
  }

  /**
   * Clone this tile
   * @returns {Tile} A new tile with the same properties
   */
  clone() {
    const newTile = new Tile(this.type, this.walkable, {...this.properties});
    
    if (this.spriteId) {
      newTile.setSpriteId(this.spriteId);
    }
    
    if (this.animated) {
      newTile.setAnimated(this.animationFrames, this.animationSpeed);
    }
    
    return newTile;
  }

  /**
   * Factory method to create a tile
   * @param {string} type Type of tile
   * @param {boolean} walkable Whether the tile is walkable
   * @param {Object} properties Additional properties
   * @returns {Tile} New tile instance
   */
  static create(type, walkable, properties = {}) {
    return new Tile(type, walkable, properties);
  }
}

export default Tile;
