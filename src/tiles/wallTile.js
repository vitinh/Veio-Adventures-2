import Tile from './tile.js';

/**
 * Wall tile implementation
 */
class WallTile extends Tile {
  constructor() {
    // Create a non-walkable wall tile with default properties
    super('wall', false, {
      solid: true,
      description: 'A solid wall'
    });
    
    // Set the sprite ID
    this.setSpriteId('tiles/wall');
  }
  
  // Static factory method for easy creation
  static create() {
    return new WallTile();
  }
}

export default WallTile;
