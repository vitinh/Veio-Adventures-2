import Tile from './tile.js';

/**
 * Grass tile implementation
 */
class GrassTile extends Tile {
  constructor() {
    // Create a walkable grass tile with default properties
    super('grass', true, { 
      speedModifier: 1.0, 
      description: 'A patch of grass'
    });
    
    // Set the sprite ID
    this.setSpriteId('tiles/grass');
  }
  
  // Static factory method for easy creation
  static create() {
    return new GrassTile();
  }
}

export default GrassTile;
