/**
 * Handles keyboard input for the game with improved responsiveness
 */
class InputHandler {
  constructor() {
    this.keys = new Map();
    this.previousKeys = new Map();
    this.keyPressTime = new Map(); // Track how long keys have been pressed
    this.keyDownEvents = new Map(); // Track keydown events for this frame
    this.keyUpEvents = new Map();   // Track keyup events for this frame
    
    // Set up event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Prevent default behavior for game control keys
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 
           'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE'].includes(e.code)) {
        e.preventDefault();
      }
    });
  }

  handleKeyDown(event) {
    // Only register keydown if the key wasn't already down
    const isNewPress = !this.keys.get(event.code);
    
    this.keys.set(event.code, true);
    
    if (isNewPress) {
      this.keyDownEvents.set(event.code, true);
      this.keyPressTime.set(event.code, 0);
    }
  }

  handleKeyUp(event) {
    this.keys.set(event.code, false);
    this.keyUpEvents.set(event.code, true);
    this.keyPressTime.delete(event.code); // Clear press time
  }

  update(deltaTime) {
    // Update key press times
    for (const [key, isPressed] of this.keys.entries()) {
      if (isPressed) {
        const currentTime = this.keyPressTime.get(key) || 0;
        this.keyPressTime.set(key, currentTime + deltaTime);
      }
    }
    
    // Save previous key states
    this.previousKeys = new Map(this.keys);
    
    // Clear per-frame event tracking
    this.keyDownEvents = new Map();
    this.keyUpEvents = new Map();
  }

  isKeyDown(code) {
    return this.keys.get(code) || false;
  }

  wasKeyPressed(code) {
    return this.keyDownEvents.get(code) || false;
  }

  wasKeyReleased(code) {
    return this.keyUpEvents.get(code) || false;
  }
  
  getKeyPressTime(code) {
    return this.keyPressTime.get(code) || 0;
  }
  
  // Helper methods for common actions
  get isUp() { return this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW'); }
  get isDown() { return this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS'); }
  get isLeft() { return this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA'); }
  get isRight() { return this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD'); }
  get isJump() { return this.isKeyDown('Space'); }
  get isAction() { return this.isKeyDown('KeyE'); }
  
  // New methods to get values between 0 and 1 for analog-like input
  get upValue() { return this.isUp ? 1 : 0; }
  get downValue() { return this.isDown ? 1 : 0; }
  get leftValue() { return this.isLeft ? 1 : 0; }
  get rightValue() { return this.isRight ? 1 : 0; }
  
  // Get horizontal and vertical vectors (-1 to 1)
  get horizontalAxis() { return this.rightValue - this.leftValue; }
  get verticalAxis() { return this.downValue - this.upValue; }
}

export default InputHandler;