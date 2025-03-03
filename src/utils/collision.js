/**
 * Collision detection utilities
 */
const Collision = {
  /**
   * Check for AABB collision between two rectangles
   * @param {Object} a First rectangle {x, y, width, height}
   * @param {Object} b Second rectangle {x, y, width, height}
   * @returns {boolean} True if collision detected
   */
  checkRectVsRect(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  },

  /**
   * Check for collision between two circles
   * @param {Object} a First circle {x, y, radius}
   * @param {Object} b Second circle {x, y, radius}
   * @returns {boolean} True if collision detected
   */
  checkCircleVsCircle(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
  },

  /**
   * Check for collision between a circle and a rectangle
   * @param {Object} circle Circle {x, y, radius}
   * @param {Object} rect Rectangle {x, y, width, height}
   * @returns {boolean} True if collision detected
   */
  checkCircleVsRect(circle, rect) {
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    // Calculate distance from closest point to circle center
    const dx = closestX - circle.x;
    const dy = closestY - circle.y;
    const distanceSquared = dx * dx + dy * dy;
    
    return distanceSquared <= circle.radius * circle.radius;
  },

  /**
   * Check if a point is inside a rectangle
   * @param {Object} point Point {x, y}
   * @param {Object} rect Rectangle {x, y, width, height}
   * @returns {boolean} True if point is inside rectangle
   */
  checkPointVsRect(point, rect) {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  },

  /**
   * Check if a point is inside a circle
   * @param {Object} point Point {x, y}
   * @param {Object} circle Circle {x, y, radius}
   * @returns {boolean} True if point is inside circle
   */
  checkPointVsCircle(point, circle) {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    const distanceSquared = dx * dx + dy * dy;
    return distanceSquared <= circle.radius * circle.radius;
  },

  /**
   * Get collision information (normal, depth, etc.)
   * @param {Object} a First rectangle {x, y, width, height}
   * @param {Object} b Second rectangle {x, y, width, height}
   * @returns {Object|null} Collision info or null if no collision
   */
  getCollisionInfo(a, b) {
    // Check if collision is happening
    if (!this.checkRectVsRect(a, b)) {
      return null;
    }
    
    // Calculate overlap on each axis
    const overlapX1 = a.x + a.width - b.x;  // a's right - b's left
    const overlapX2 = b.x + b.width - a.x;  // b's right - a's left
    const overlapY1 = a.y + a.height - b.y; // a's bottom - b's top
    const overlapY2 = b.y + b.height - a.y; // b's bottom - a's top
    
    // Find minimum overlap
    const overlapX = Math.min(overlapX1, overlapX2);
    const overlapY = Math.min(overlapY1, overlapY2);
    
    // Determine collision normal and depth
    if (overlapX < overlapY) {
      // X-axis collision
      const normalX = overlapX1 < overlapX2 ? -1 : 1;
      return {
        normal: { x: normalX, y: 0 },
        depth: overlapX
      };
    } else {
      // Y-axis collision
      const normalY = overlapY1 < overlapY2 ? -1 : 1;
      return {
        normal: { x: 0, y: normalY },
        depth: overlapY
      };
    }
  },

  /**
   * Resolve collision between two objects
   * @param {Object} a First object with position and velocity
   * @param {Object} b Second object with position and velocity
   * @returns {boolean} True if collision was resolved
   */
  resolveCollision(a, b) {
    const info = this.getCollisionInfo(a, b);
    
    if (!info) {
      return false;
    }
    
    // Determine if objects can move
    const aMovable = !a.static;
    const bMovable = !b.static;
    
    if (aMovable && bMovable) {
      // Both objects can move - share the correction
      a.x -= info.normal.x * info.depth * 0.5;
      a.y -= info.normal.y * info.depth * 0.5;
      
      b.x += info.normal.x * info.depth * 0.5;
      b.y += info.normal.y * info.depth * 0.5;
    } else if (aMovable) {
      // Only A can move
      a.x -= info.normal.x * info.depth;
      a.y -= info.normal.y * info.depth;
    } else if (bMovable) {
      // Only B can move
      b.x += info.normal.x * info.depth;
      b.y += info.normal.y * info.depth;
    } else {
      // Neither can move
      return false;
    }
    
    return true;
  }
};

export default Collision;
