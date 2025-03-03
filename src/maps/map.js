/**
 * Base map class
 */
class GameMap {
  constructor(width, height, tileSize = 32) {
    this.width = width * tileSize;   // Width in pixels
    this.height = height * tileSize; // Height in pixels
    this.tileSize = tileSize;        // Size of each tile in pixels
    this.columns = width;            // Number of columns
    this.rows = height;              // Number of rows
    
    // 2D array of tiles
    this.tiles = this.createEmptyTileArray();
    
    // Map name and properties
    this.name = 'Unnamed Map';
    this.properties = {};
  }

  /**
   * Create an empty 2D array for tiles
   * @returns {Array} Empty 2D array
   */
  createEmptyTileArray() {
    const tiles = new Array(this.rows);
    
    for (let y = 0; y < this.rows; y++) {
      tiles[y] = new Array(this.columns).fill(null);
    }
    
    return tiles;
  }

  /**
   * Set a tile at a specific position
   * @param {number} x X position in tile coordinates
   * @param {number} y Y position in tile coordinates
   * @param {Tile} tile Tile to place
   * @returns {boolean} True if successful
   */
  setTile(x, y, tile) {
    if (this.isValidTilePosition(x, y)) {
      this.tiles[y][x] = tile;
      return true;
    }
    return false;
  }

  /**
   * Get the tile at a specific position
   * @param {number} x X position in tile coordinates
   * @param {number} y Y position in tile coordinates
   * @returns {Tile|null} The tile or null if out of bounds
   */
  getTile(x, y) {
    if (this.isValidTilePosition(x, y)) {
      return this.tiles[y][x];
    }
    return null;
  }
  
  /**
   * Get the tile at a specific pixel position
   * @param {number} pixelX X position in pixels
   * @param {number} pixelY Y position in pixels
   * @returns {Tile|null} The tile or null if out of bounds
   */
  getTileAt(pixelX, pixelY) {
    const tileX = Math.floor(pixelX / this.tileSize);
    const tileY = Math.floor(pixelY / this.tileSize);
    return this.getTile(tileX, tileY);
  }

  /**
   * Check if tile coordinates are valid
   * @param {number} x X position in tile coordinates
   * @param {number} y Y position in tile coordinates
   * @returns {boolean} True if valid
   */
  isValidTilePosition(x, y) {
    return x >= 0 && x < this.columns && y >= 0 && y < this.rows;
  }

  /**
   * Fill the entire map with a specific tile
   * @param {Tile} tile Tile to fill with
   */
  fillWithTile(tile) {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        this.tiles[y][x] = tile.clone();
      }
    }
  }

  /**
   * Update the map
   * @param {number} deltaTime Time since last frame in seconds
   */
  update(deltaTime) {
    // Update all tiles (for animations)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        const tile = this.tiles[y][x];
        if (tile) {
          tile.update(deltaTime);
        }
      }
    }
  }

  /**
   * Render the map
   * @param {Renderer} renderer Renderer instance
   */
  render(renderer) {
    // Render all tiles
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        const tile = this.tiles[y][x];
        
        if (tile) {
          const pixelX = x * this.tileSize;
          const pixelY = y * this.tileSize;
          
          // Create unique ID for this tile's element
          const tileId = `tile-${x}-${y}`;
          
          // If the tile has a sprite, render it
          if (tile.spriteId) {
            renderer.renderSprite(
              tile.spriteId,
              pixelX,
              pixelY,
              this.tileSize,
              this.tileSize,
              tileId,
              { 
                static: true,
                frame: tile.animated ? tile.getCurrentFrame() : 0
              }
            );
          } else {
            // Fallback to colored rectangle based on tile type
            let color;
            
            switch (tile.type) {
              case 'grass': color = '#4CAF50'; break;
              case 'wall': color = '#795548'; break;
              case 'water': color = '#2196F3'; break;
              default: color = '#CCCCCC';
            }
            
            renderer.renderRect(
              pixelX,
              pixelY,
              this.tileSize,
              this.tileSize,
              color,
              tileId,
              true
            );
          }
        }
      }
    }
  }
}

export default GameMap;
