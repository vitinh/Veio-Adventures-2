import Game from './core/game.js';

// Create and initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game('game-container');
  game.init();
});
