import Enemy from './enemy.js';

/**
 * Simple enemy implementation
 */
class SimpleEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 30, 30);
    
    // Override base enemy properties
    this.spriteId = 'enemies/enemy';
    this.speed = 60;
    this.health = 20;
    this.maxHealth = 20;
    this.damage = 5;
    this.attackRange = 25;
    this.detectionRange = 150;
    
    // Patrol behavior
    this.patrolPoints = [];
    this.currentPatrolPoint = 0;
    this.patrolWaitTime = 2.0;
    this.patrolTimer = 0;
    this.isWaiting = false;
  }

  idleBehavior(deltaTime) {
    // If we have patrol points, use patrol behavior
    if (this.patrolPoints.length > 0) {
      this.patrolBehavior(deltaTime);
    } else {
      // Default idle behavior - do nothing
      super.idleBehavior(deltaTime);
    }
  }
  
  patrolBehavior(deltaTime) {
    if (this.isWaiting) {
      // Wait at the current patrol point
      this.patrolTimer -= deltaTime;
      
      if (this.patrolTimer <= 0) {
        this.isWaiting = false;
        this.currentPatrolPoint = (this.currentPatrolPoint + 1) % this.patrolPoints.length;
      }
      
      // Don't move while waiting
      this.velocityX = 0;
      this.velocityY = 0;
    } else {
      // Move to the current patrol point
      const point = this.patrolPoints[this.currentPatrolPoint];
      
      const dx = point.x - this.x;
      const dy = point.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5) {
        // Reached the patrol point, start waiting
        this.isWaiting = true;
        this.patrolTimer = this.patrolWaitTime;
        this.velocityX = 0;
        this.velocityY = 0;
      } else if (distance > 0) {
        // Move towards the patrol point
        this.velocityX = (dx / distance) * this.speed;
        this.velocityY = (dy / distance) * this.speed;
        
        // Update direction
        if (Math.abs(dx) > Math.abs(dy)) {
          this.direction = dx > 0 ? 'right' : 'left';
        } else {
          this.direction = dy > 0 ? 'down' : 'up';
        }
      }
    }
  }

  addPatrolPoint(x, y) {
    this.patrolPoints.push({ x, y });
  }
}

export default SimpleEnemy;
