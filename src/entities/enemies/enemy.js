import Entity from '../entity.js';

/**
 * Base enemy class
 */
class Enemy extends Entity {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    
    // Enemy properties
    this.type = 'enemy';
    this.health = 30;
    this.maxHealth = 30;
    this.speed = 50;
    this.damage = 10;
    this.attackRange = 20;
    this.detectionRange = 200;
    this.attackCooldown = 1.0; // Seconds between attacks
    this.attackTimer = 0;
    this.state = 'idle'; // idle, chase, attack
    
    // Target (usually the player)
    this.target = null;
  }

  update(deltaTime, map) {
    if (!this.active) return;
    
    // Update attack cooldown
    if (this.attackTimer > 0) {
      this.attackTimer -= deltaTime;
    }
    
    // Basic AI behavior
    this.updateAI(deltaTime);
    
    // Call parent update for physics and animation
    super.update(deltaTime, map);
  }
  
  updateAI(deltaTime) {
    if (!this.target) return;
    
    // Calculate distance to target
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Determine state based on distance
    if (distance <= this.attackRange) {
      this.state = 'attack';
    } else if (distance <= this.detectionRange) {
      this.state = 'chase';
    } else {
      this.state = 'idle';
    }
    
    // Execute behavior based on state
    switch (this.state) {
      case 'attack':
        this.attackBehavior();
        break;
      case 'chase':
        this.chaseBehavior(dx, dy, distance, deltaTime);
        break;
      case 'idle':
        this.idleBehavior(deltaTime);
        break;
    }
    
    // Update facing direction
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else {
      this.direction = dy > 0 ? 'down' : 'up';
    }
    
    // Update animation state
    this.animationState = (this.velocityX !== 0 || this.velocityY !== 0) ? 'walk' : 'idle';
  }
  
  attackBehavior() {
    if (this.attackTimer <= 0 && this.target) {
      // Deal damage to target
      if (typeof this.target.takeDamage === 'function') {
        this.target.takeDamage(this.damage);
      }
      
      // Reset attack cooldown
      this.attackTimer = this.attackCooldown;
      
      // Stop moving while attacking
      this.velocityX = 0;
      this.velocityY = 0;
    }
  }
  
  chaseBehavior(dx, dy, distance, deltaTime) {
    if (distance > 0) {
      // Normalize direction vector
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      // Set velocity
      this.velocityX = normalizedDx * this.speed;
      this.velocityY = normalizedDy * this.speed;
    }
  }
  
  idleBehavior(deltaTime) {
    // Default idle behavior - do nothing
    this.velocityX = 0;
    this.velocityY = 0;
  }

  render(renderer) {
    // Call parent render method
    super.render(renderer);
    
    // Render health bar if damaged
    if (this.health < this.maxHealth) {
      const healthBarWidth = this.width;
      const healthBarHeight = 4;
      const healthPercent = this.health / this.maxHealth;
      
      // Background of health bar
      renderer.renderRect(
        this.x, 
        this.y - healthBarHeight - 2, 
        healthBarWidth, 
        healthBarHeight, 
        'rgba(0, 0, 0, 0.5)', 
        `health-bg-${this.id}`
      );
      
      // Foreground of health bar
      renderer.renderRect(
        this.x, 
        this.y - healthBarHeight - 2, 
        healthBarWidth * healthPercent, 
        healthBarHeight, 
        'red', 
        `health-fg-${this.id}`
      );
    }
  }

  setTarget(target) {
    this.target = target;
  }
  
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    if (this.health <= 0) {
      this.die();
      return false;
    }
    
    return true;
  }
  
  die() {
    console.log('Enemy died');
    this.active = false;
    this.animationState = 'death';
    
    // Remove after death animation
    setTimeout(() => {
      this.visible = false;
    }, 1000);
  }
  
  onCollision(other) {
    // Handle collision with other entities
  }
}

export default Enemy;
