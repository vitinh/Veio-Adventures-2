/**
 * Loads and manages game assets (sprites, audio)
 */
class AssetLoader {
  constructor() {
    this.sprites = new Map();
    this.audio = new Map();
    this.loaded = 0;
    this.total = 0;
  }

  async loadAssets() {
    // Define assets to load
    const sprites = [
      { id: 'player/player', path: 'src/assets/sprites/player/player.svg' },
      { id: 'enemies/enemy', path: 'src/assets/sprites/enemies/enemy.svg' },
      { id: 'tiles/grass', path: 'src/assets/sprites/tiles/grass.svg' },
      { id: 'tiles/wall', path: 'src/assets/sprites/tiles/wall.svg' }
    ];
    
    const audioFiles = [
      { id: 'step', path: 'src/assets/audio/step.wav' },
      { id: 'impact', path: 'src/assets/audio/impact.wav' }
    ];
    
    this.total = sprites.length + audioFiles.length;
    this.loaded = 0;
    
    // Load all assets in parallel
    try {
      const spritePromises = sprites.map(sprite => this.loadSprite(sprite.id, sprite.path));
      const audioPromises = audioFiles.map(audio => this.loadAudio(audio.id, audio.path));
      
      await Promise.all([...spritePromises, ...audioPromises]);
      
      console.log('All assets loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading assets:', error);
      return false;
    }
  }

  async loadSprite(id, path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load sprite: ${path}`);
      }
      
      const svgText = await response.text();
      this.sprites.set(id, svgText);
      this.loaded++;
      
      return true;
    } catch (error) {
      console.error(`Error loading sprite ${id}:`, error);
      throw error;
    }
  }

  async loadAudio(id, path) {
    try {
      const audio = new Audio();
      
      return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          this.audio.set(id, audio);
          this.loaded++;
          resolve(true);
        }, { once: true });
        
        audio.addEventListener('error', () => {
          reject(new Error(`Failed to load audio: ${path}`));
        }, { once: true });
        
        audio.src = path;
      });
    } catch (error) {
      console.error(`Error loading audio ${id}:`, error);
      throw error;
    }
  }

  getSprite(id) {
    return this.sprites.get(id);
  }

  getAudio(id) {
    return this.audio.get(id);
  }

  getLoadProgress() {
    if (this.total === 0) return 100;
    return Math.floor((this.loaded / this.total) * 100);
  }
}

export default AssetLoader;
