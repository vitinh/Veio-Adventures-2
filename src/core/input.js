/**
 * Handles keyboard input for the game
 */
class InputHandler {
  constructor() {
    this.keys = new Map();
    this.previousKeys = new Map();
    
    // Set up event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Prevent default behavior for arrow keys (scrolling)
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });
  }

  handleKeyDown(event) {
    this.keys.set(event.code, true);
  }

  handleKeyUp(event) {
    this.keys.set(event.code, false);
  }

  update() {
    // Save previous key states
    this.previousKeys = new Map(this.keys);
  }

  isKeyDown(code) {
    return this.keys.get(code) || false;
  }

  wasKeyPressed(code) {
    return this.keys.get(code) && !this.previousKeys.get(code);
  }

  wasKeyReleased(code) {
    return !this.keys.get(code) && this.previousKeys.get(code);
  }
  
  // Helper methods for common actions
  get isUp() { return this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW'); }
  get isDown() { return this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS'); }
  get isLeft() { return this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA'); }
  get isRight() { return this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD'); }
  get isJump() { return this.isKeyDown('Space'); }
  get isAction() { return this.isKeyDown('KeyE'); }
}

export default InputHandler;
