import GameMap from './map.js';
import GrassTile from '../tiles/grassTile.js';
import WallTile from '../tiles/wallTile.js';

/**
 * Level 1 implementation
 */
class Level1 extends GameMap {
  constructor() {
    // Create a 20x15 tile map with 32px tiles
    super(20, 15, 32);
    
    // Set map properties
    this.name = 'Level 1';
    this.properties = {
      theme: 'outdoor',
      difficulty: 1
    };
    
    // Generate the map layout
    this.generateMap();
  }

  /**
   * Generate the map layout
   */
  generateMap() {
    // Fill the map with grass
    this.fillWithTile(GrassTile.create());
    
    // Add walls around the edges
    this.createBoundaryWalls();
    
    // Create interior walls (a simple maze-like structure)
    this.createInteriorWalls();
  }

  /**
   * Create walls around the map edges
   */
  createBoundaryWalls() {
    const wallTile = WallTile.create();
    
    // Top and bottom walls
    for (let x = 0; x < this.columns; x++) {
      this.setTile(x, 0, wallTile.clone());
      this.setTile(x, this.rows - 1, wallTile.clone());
    }
    
    // Left and right walls
    for (let y = 0; y < this.rows; y++) {
      this.setTile(0, y, wallTile.clone());
      this.setTile(this.columns - 1, y, wallTile.clone());
    }
  }

  /**
   * Create interior walls
   */
  createInteriorWalls() {
    const wallTile = WallTile.create();
    
    // Add some horizontal walls
    for (let x = 3; x < 10; x++) {
      this.setTile(x, 3, wallTile.clone());
    }
    
    for (let x = 10; x < 17; x++) {
      this.setTile(x, 11, wallTile.clone());
    }
    
    // Add some vertical walls
    for (let y = 4; y < 10; y++) {
      this.setTile(5, y, wallTile.clone());
    }
    
    for (let y = 5; y < 11; y++) {
      this.setTile(15, y, wallTile.clone());
    }
    
    // Add some individual walls
    this.setTile(8, 6, wallTile.clone());
    this.setTile(8, 7, wallTile.clone());
    this.setTile(9, 7, wallTile.clone());
    this.setTile(10, 7, wallTile.clone());
    this.setTile(11, 7, wallTile.clone());
    
    // Create a small enclosed room
    for (let x = 12; x < 17; x++) {
      this.setTile(x, 3, wallTile.clone());
    }
    
    for (let y = 3; y < 7; y++) {
      this.setTile(12, y, wallTile.clone());
      this.setTile(16, y, wallTile.clone());
    }
    
    for (let x = 12; x < 17; x++) {
      this.setTile(x, 7, wallTile.clone());
    }
    
    // Door in the room
    this.setTile(14, 7, GrassTile.create());
  }
}

export default Level1;
