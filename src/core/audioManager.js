/**
 * Manages audio playback for the game
 */
class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.muted = false;
    this.volume = 0.5; // Default volume level
  }

  init(assetLoader) {
    // Load audio from the asset loader
    for (const [id, audio] of assetLoader.audio.entries()) {
      this.sounds.set(id, audio);
    }
    
    // Set initial volume for all sounds
    this.updateVolume();
  }

  play(id, options = {}) {
    if (this.muted) return null;
    
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Sound not found: ${id}`);
      return null;
    }
    
    // Clone the audio element for overlapping sounds
    const audioInstance = sound.cloneNode();
    
    // Apply options
    if (options.volume !== undefined) {
      audioInstance.volume = options.volume * this.volume;
    } else {
      audioInstance.volume = this.volume;
    }
    
    if (options.loop !== undefined) {
      audioInstance.loop = options.loop;
    }
    
    // Play the sound
    const playPromise = audioInstance.play();
    
    // Handle play errors
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error(`Error playing sound ${id}:`, error);
      });
    }
    
    return audioInstance;
  }

  stop(instance) {
    if (instance) {
      instance.pause();
      instance.currentTime = 0;
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
  }

  updateVolume() {
    // Update volume for all sounds
    for (const sound of this.sounds.values()) {
      sound.volume = this.volume;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

export default AudioManager;
