/**
 * SVG-based renderer for the game
 */
class Renderer {
  constructor(container) {
    this.container = container;
    this.svgNS = "http://www.w3.org/2000/svg";
    this.width = 800;
    this.height = 600;
    this.elements = new Map();
    
    this.setupSVG();
  }

  setupSVG() {
    // Create SVG element
    this.svg = document.createElementNS(this.svgNS, "svg");
    this.svg.setAttribute("width", this.width);
    this.svg.setAttribute("height", this.height);
    this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
    this.svg.style.backgroundColor = "#000";
    
    // Add to container
    this.container.appendChild(this.svg);
  }

  clear() {
    // Remove all dynamic elements (keep static elements)
    const elementsToRemove = [];
    
    for (const [id, element] of this.elements.entries()) {
      if (!element.static) {
        elementsToRemove.push(id);
      }
    }
    
    for (const id of elementsToRemove) {
      const element = this.elements.get(id);
      this.svg.removeChild(element);
      this.elements.delete(id);
    }
  }

  createSVGElement(type, attributes = {}) {
    const element = document.createElementNS(this.svgNS, type);
    
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    
    return element;
  }

  renderSprite(spriteId, x, y, width, height, id, animation = null) {
    // Create or update sprite element
    let sprite;
    
    if (this.elements.has(id)) {
      // Update existing sprite
      sprite = this.elements.get(id);
      sprite.setAttribute("x", x);
      sprite.setAttribute("y", y);
      
      // For animated sprites, update the transform or animation state
      if (animation) {
        this.updateSpriteAnimation(sprite, animation);
      }
    } else {
      // Create new sprite element
      sprite = this.createSVGElement("image", {
        id: id,
        x: x,
        y: y,
        width: width,
        height: height,
        href: `src/assets/sprites/${spriteId}.svg`
      });
      
      this.svg.appendChild(sprite);
      this.elements.set(id, sprite);
      
      // Initialize animation if provided
      if (animation) {
        this.initSpriteAnimation(sprite, animation);
      }
    }
    
    return sprite;
  }

  initSpriteAnimation(sprite, animation) {
    // Set up animation properties
    sprite.animation = {
      state: animation.state,
      direction: animation.direction,
      frame: 0,
      timer: 0,
      ...animation
    };
  }

  updateSpriteAnimation(sprite, animation) {
    // Update animation properties
    if (sprite.animation) {
      sprite.animation = {
        ...sprite.animation,
        ...animation
      };
      
      // Apply animation effects (flipping, rotation, etc.)
      if (animation.direction === 'left') {
        sprite.setAttribute("transform", `scale(-1,1) translate(${-parseInt(sprite.getAttribute("x")) * 2 - parseInt(sprite.getAttribute("width"))},0)`);
      } else {
        sprite.setAttribute("transform", "");
      }
    }
  }

  renderRect(x, y, width, height, color, id, isStatic = false) {
    // Create or update rectangle element
    let rect;
    
    if (this.elements.has(id)) {
      // Update existing rectangle
      rect = this.elements.get(id);
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("fill", color);
    } else {
      // Create new rectangle element
      rect = this.createSVGElement("rect", {
        id: id,
        x: x,
        y: y,
        width: width,
        height: height,
        fill: color
      });
      
      rect.static = isStatic;
      this.svg.appendChild(rect);
      this.elements.set(id, rect);
    }
    
    return rect;
  }

  renderCircle(x, y, radius, color, id, isStatic = false) {
    // Create or update circle element
    let circle;
    
    if (this.elements.has(id)) {
      // Update existing circle
      circle = this.elements.get(id);
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("fill", color);
    } else {
      // Create new circle element
      circle = this.createSVGElement("circle", {
        id: id,
        cx: x,
        cy: y,
        r: radius,
        fill: color
      });
      
      circle.static = isStatic;
      this.svg.appendChild(circle);
      this.elements.set(id, circle);
    }
    
    return circle;
  }

  renderText(x, y, text, color, id, isStatic = false) {
    // Create or update text element
    let textElement;
    
    if (this.elements.has(id)) {
      // Update existing text
      textElement = this.elements.get(id);
      textElement.setAttribute("x", x);
      textElement.setAttribute("y", y);
      textElement.textContent = text;
      textElement.setAttribute("fill", color);
    } else {
      // Create new text element
      textElement = this.createSVGElement("text", {
        id: id || `text-${Date.now()}`,
        x: x,
        y: y,
        fill: color,
        "font-family": "Arial",
        "font-size": "14px"
      });
      
      textElement.textContent = text;
      textElement.static = isStatic;
      this.svg.appendChild(textElement);
      
      if (id) {
        this.elements.set(id, textElement);
      }
    }
    
    return textElement;
  }

  removeElement(id) {
    if (this.elements.has(id)) {
      const element = this.elements.get(id);
      this.svg.removeChild(element);
      this.elements.delete(id);
    }
  }
}

export default Renderer;
