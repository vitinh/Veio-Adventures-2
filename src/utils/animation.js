/**
 * Animation utility for sprite animation
 */
class Animation {
  constructor(name, frames, frameDelay = 0.1, loop = true) {
    this.name = name;
    this.frames = frames; // Array of frame indices or objects
    this.frameDelay = frameDelay; // Seconds per frame
    this.loop = loop;
    this.currentFrame = 0;
    this.timer = 0;
    this.isPlaying = false;
    this.isComplete = false;
    this.onComplete = null; // Callback when animation completes
  }

  /**
   * Update the animation
   * @param {number} deltaTime Time since last frame in seconds
   * @returns {number} Current frame index
   */
  update(deltaTime) {
    if (!this.isPlaying) return this.currentFrame;
    
    this.timer += deltaTime;
    
    if (this.timer >= this.frameDelay) {
      this.timer = 0;
      this.currentFrame++;
      
      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.isPlaying = false;
          this.isComplete = true;
          
          if (this.onComplete) {
            this.onComplete();
          }
        }
      }
    }
    
    return this.getCurrentFrameIndex();
  }

  /**
   * Play the animation
   * @param {boolean} reset Whether to reset the animation
   */
  play(reset = false) {
    this.isPlaying = true;
    this.isComplete = false;
    
    if (reset) {
      this.currentFrame = 0;
      this.timer = 0;
    }
  }

  /**
   * Pause the animation
   */
  pause() {
    this.isPlaying = false;
  }

  /**
   * Stop the animation and reset it
   */
  stop() {
    this.isPlaying = false;
    this.currentFrame = 0;
    this.timer = 0;
    this.isComplete = false;
  }

  /**
   * Get the current frame index
   * @returns {number} Current frame index
   */
  getCurrentFrameIndex() {
    return this.frames[this.currentFrame];
  }

  /**
   * Set a callback to be called when the animation completes
   * @param {Function} callback Callback function
   */
  setCompletionCallback(callback) {
    this.onComplete = callback;
  }
}

/**
 * Animation manager to handle multiple animations
 */
class AnimationManager {
  constructor() {
    this.animations = new Map();
    this.currentAnimation = null;
  }

  /**
   * Add an animation
   * @param {string} name Animation name
   * @param {Animation} animation Animation instance
   */
  addAnimation(name, animation) {
    this.animations.set(name, animation);
  }

  /**
   * Create and add a new animation
   * @param {string} name Animation name
   * @param {Array} frames Array of frame indices
   * @param {number} frameDelay Seconds per frame
   * @param {boolean} loop Whether the animation should loop
   * @returns {Animation} The created animation
   */
  createAnimation(name, frames, frameDelay = 0.1, loop = true) {
    const animation = new Animation(name, frames, frameDelay, loop);
    this.addAnimation(name, animation);
    return animation;
  }

  /**
   * Play an animation
   * @param {string} name Animation name
   * @param {boolean} reset Whether to reset the animation
   * @returns {boolean} True if successful
   */
  play(name, reset = false) {
    const animation = this.animations.get(name);
    
    if (animation) {
      this.currentAnimation = name;
      animation.play(reset);
      return true;
    }
    
    return false;
  }

  /**
   * Update the current animation
   * @param {number} deltaTime Time since last frame in seconds
   * @returns {number} Current frame index
   */
  update(deltaTime) {
    const animation = this.getAnimation();
    
    if (animation) {
      return animation.update(deltaTime);
    }
    
    return 0;
  }

  /**
   * Get the current animation
   * @returns {Animation|null} Current animation
   */
  getAnimation() {
    if (!this.currentAnimation) return null;
    return this.animations.get(this.currentAnimation);
  }

  /**
   * Get the current animation name
   * @returns {string|null} Current animation name
   */
  getCurrentAnimationName() {
    return this.currentAnimation;
  }
}

export { Animation, AnimationManager };
