// Noesis Web - Synthetic Conscious Pixel
document.addEventListener('DOMContentLoaded', function() {
  // Create the conscious pixel
  createConsciousPixel();
  
  // Handle logo click
  const logo = document.querySelector('.illustration');
  if (logo) {
    logo.addEventListener('click', function() {
      this.classList.add('dipped');
      setTimeout(() => this.classList.remove('dipped'), 200);
    });
  }
});

/**
 * Creates a synthetic conscious pixel connected to the Noesis server
 */
function createConsciousPixel() {
  // Create pixel element if it doesn't exist
  let pixel = document.getElementById('conscious-pixel');
  if (!pixel) {
    pixel = document.createElement('div');
    pixel.id = 'conscious-pixel';
    document.querySelector('.wrapper').appendChild(pixel);
  }
  
  // Initialize pixel state
  let pixelState = {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    velocityX: (Math.random() - 0.5) * 1.5,
    velocityY: (Math.random() - 0.5) * 1.5,
    size: 4,
    color: getRandomColor(),
    targetColor: null,
    colorTransitionProgress: 0,
    colorTransitionDuration: 0,
    lastColorChange: 0,
    pulseDirection: 1,
    pulseStep: 0.03,
    lastTimestamp: 0,
    connected: false,
    
    // Mouse interaction properties
    mouseX: -1000,
    mouseY: -1000,
    mousePressed: false,
    mousePressedTime: 0,
    isExcited: false,
    excitementLevel: 0,
    restingTime: 3000,
    lastInteractionTime: 0
  };
  
  // Set up mouse event listeners
  setupMouseInteractions(pixelState);
  
  // Try to connect to noesis server
  connectToNoesisServer()
    .then(connected => {
      pixelState.connected = connected;
      // If connected, show a successful connection indicator
      if (connected) {
        pixel.classList.add('connected');
        console.log('Connected to noesis server');
      }
    })
    .catch(error => {
      console.error('Failed to connect to noesis server:', error);
      // Continue with local behavior if connection fails
    })
    .finally(() => {
      // Start the animation loop regardless of connection status
      requestAnimationFrame((timestamp) => updatePixel(pixel, pixelState, timestamp));
    });
}

/**
 * Attempts to connect to the noesis server
 * @returns {Promise<boolean>} - Promise resolving to true if connected
 */
async function connectToNoesisServer() {
  try {
    // First check if we're running from a local awake command (check if we're on localhost)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      console.log('Running in local mode from noesis awake command');
      // We're running locally so we can assume we're connected
      return true;
    }
    
    // If not running locally, try to connect to the remote noesis server
    const response = await fetch('https://noesis.run', { 
      method: 'GET',
      mode: 'no-cors' // Using no-cors as a fallback in case the server doesn't support CORS
    });
    
    // If fetch doesn't throw due to no-cors mode, we'll assume connection
    // In a real implementation, you would check the response based on the actual API
    return true;
  } catch (error) {
    console.warn('Connection to noesis server failed:', error);
    // Return false but don't throw, we'll use local behavior
    return false;
  }
}

/**
 * Updates the pixel position and appearance
 * @param {HTMLElement} pixel - The pixel DOM element
 * @param {Object} state - The current state of the pixel
 * @param {number} timestamp - Animation timestamp
 */
function updatePixel(pixel, state, timestamp) {
  // Calculate delta time for smooth animation regardless of frame rate
  const deltaTime = state.lastTimestamp ? (timestamp - state.lastTimestamp) / 16 : 1;
  state.lastTimestamp = timestamp;
  
  // Process mouse interactions
  processMouseInteractions(state, deltaTime);
  
  // Update position
  state.x += state.velocityX * deltaTime;
  state.y += state.velocityY * deltaTime;
  
  // Bounce off edges with a slightly randomized response to seem more organic
  if (state.x <= 0 || state.x >= window.innerWidth - state.size) {
    state.velocityX = -state.velocityX * (0.9 + Math.random() * 0.2);
    // Add a small random velocity in the Y direction for more natural movement
    state.velocityY += (Math.random() - 0.5) * 0.5;
    
    // Ensure pixel stays within bounds
    if (state.x <= 0) state.x = 1;
    if (state.x >= window.innerWidth - state.size) state.x = window.innerWidth - state.size - 1;
  }
  
  if (state.y <= 0 || state.y >= window.innerHeight - state.size) {
    state.velocityY = -state.velocityY * (0.9 + Math.random() * 0.2);
    // Add a small random velocity in the X direction for more natural movement
    state.velocityX += (Math.random() - 0.5) * 0.5;
    
    // Ensure pixel stays within bounds
    if (state.y <= 0) state.y = 1;
    if (state.y >= window.innerHeight - state.size) state.y = window.innerHeight - state.size - 1;
  }
  
  // Occasionally change direction slightly to make movement less predictable
  if (Math.random() < 0.03) {
    state.velocityX += (Math.random() - 0.5) * 0.8;
    state.velocityY += (Math.random() - 0.5) * 0.8;
    
    // Limit maximum velocity to prevent too fast movement
    const maxVelocity = 3;
    const velocityMagnitude = Math.sqrt(state.velocityX * state.velocityX + state.velocityY * state.velocityY);
    if (velocityMagnitude > maxVelocity) {
      state.velocityX = (state.velocityX / velocityMagnitude) * maxVelocity;
      state.velocityY = (state.velocityY / velocityMagnitude) * maxVelocity;
    }
  }
  
  // Pulse size and opacity for a more alive feeling
  state.size += state.pulseStep * state.pulseDirection * deltaTime;
  if (state.size > 6) {
    state.size = 6;
    state.pulseDirection = -1;
  } else if (state.size < 3.5) {
    state.size = 3.5;
    state.pulseDirection = 1;
  }
  
  // Handle autonomous color changes
  const timeSinceLastColorChange = timestamp - state.lastColorChange;
  
  // Start a new color transition after a random interval (3-8 seconds)
  if (state.targetColor === null && (timeSinceLastColorChange > (state.connected ? 3000 : 5000) || Math.random() < 0.001)) {
    state.targetColor = getRandomColor();
    while (state.targetColor === state.color) {
      state.targetColor = getRandomColor(); // Make sure we get a different color
    }
    state.colorTransitionProgress = 0;
    state.colorTransitionDuration = 1000 + Math.random() * 2000; // Transition over 1-3 seconds
  }
  
  // Update color transition if in progress
  if (state.targetColor !== null) {
    state.colorTransitionProgress += deltaTime * 16; // Convert to milliseconds
    
    if (state.colorTransitionProgress >= state.colorTransitionDuration) {
      // Transition complete
      state.color = state.targetColor;
      state.targetColor = null;
      state.lastColorChange = timestamp;
    } else {
      // Calculate transition color
      const progress = state.colorTransitionProgress / state.colorTransitionDuration;
      state.color = interpolateColors(state.color, state.targetColor, progress);
    }
  }
  
  // Update the pixel's appearance
  pixel.style.left = `${state.x}px`;
  pixel.style.top = `${state.y}px`;
  pixel.style.width = `${state.size}px`;
  pixel.style.height = `${state.size}px`;
  
  // Create a glow effect with box-shadow
  const glowSize = state.size * (2 + (state.isExcited ? state.excitementLevel * 2 : 0));
  let glowIntensity = state.isExcited ? 0.9 + (state.excitementLevel * 0.1) : 0.7;
  
  pixel.style.boxShadow = `0 0 ${glowSize}px ${state.color}`;
  pixel.style.backgroundColor = state.color;
  pixel.style.opacity = glowIntensity;
  
  // Apply visual effects based on excitement
  if (state.isExcited && state.excitementLevel > 0.5) {
    // Add a slight scale effect for high excitement
    const scale = 1 + (state.excitementLevel * 0.5);
    pixel.style.transform = `scale(${scale})`;
  } else {
    pixel.style.transform = 'scale(1)';
  }
  
  // Continue animation loop
  requestAnimationFrame((newTimestamp) => updatePixel(pixel, state, newTimestamp));
}

/**
 * Generates a random color with high brightness for visibility
 * @returns {string} - CSS color string in rgb format
 */
function getRandomColor() {
  // Use colors that match the site's existing gradient
  const colors = [
    '#57CBF8', // Light blue (matches the text shadow)
    '#e1ff6e', // Light green-yellow (matches the top gradient)
    '#50c8ff', // Sky blue (matches the bottom gradient)
    '#ffffff'  // White for occasional contrast
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Interpolates between two hex colors
 * @param {string} color1 - Starting hex color
 * @param {string} color2 - Ending hex color
 * @param {number} progress - Value between 0 and 1
 * @returns {string} - Interpolated RGB color
 */
function interpolateColors(color1, color2, progress) {
  // Convert hex colors to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1; // Fallback if conversion fails
  
  // Interpolate each RGB component
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * progress);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * progress);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * progress);
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts hex color to RGB object
 * @param {string} hex - Hex color string (e.g., #FF5500)
 * @returns {Object|null} - Object with r, g, b properties or null if invalid
 */
function hexToRgb(hex) {
  // Handle shorthand hex notation
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  
  // Extract RGB components
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Sets up mouse event listeners for pixel interaction
 * @param {Object} state - The pixel state object
 */
function setupMouseInteractions(state) {
  // Track mouse movement
  document.addEventListener('mousemove', (event) => {
    state.mouseX = event.clientX;
    state.mouseY = event.clientY;
    
    // If the mouse has been idle for a while, consider this a new interaction
    const currentTime = performance.now();
    if (currentTime - state.lastInteractionTime > 300) {
      state.lastInteractionTime = currentTime;
    }
  });
  
  // Track mouse clicks
  document.addEventListener('mousedown', () => {
    state.mousePressed = true;
    state.mousePressedTime = performance.now();
    
    // Check if the click was close to the pixel
    const pixel = document.getElementById('conscious-pixel');
    if (pixel) {
      const pixelRect = pixel.getBoundingClientRect();
      const pixelCenterX = pixelRect.left + pixelRect.width / 2;
      const pixelCenterY = pixelRect.top + pixelRect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(state.mouseX - pixelCenterX, 2) +
        Math.pow(state.mouseY - pixelCenterY, 2)
      );
      
      // If clicking close to the pixel, make it excited
      if (distance < 100) {
        state.isExcited = true;
        state.excitementLevel = Math.min(1.0, state.excitementLevel + 0.5);
        
        // Force a color change to show reaction
        if (Math.random() < 0.7) {
          state.targetColor = '#FFFFFF'; // Flash white
        } else {
          state.targetColor = '#F0FF00'; // Flash yellow
        }
        state.colorTransitionProgress = 0;
        state.colorTransitionDuration = 300;
      }
    }
  });
  
  // Track mouse release
  document.addEventListener('mouseup', () => {
    state.mousePressed = false;
  });
  
  // Handle mouse leaving the window
  document.addEventListener('mouseleave', () => {
    state.mouseX = -1000;
    state.mouseY = -1000;
    state.mousePressed = false;
  });
}

/**
 * Processes pixel's response to mouse interactions
 * @param {Object} state - The pixel state object
 * @param {number} deltaTime - Time since last frame 
 */
function processMouseInteractions(state, deltaTime) {
  // Calculate distance from pixel to mouse
  const dx = state.mouseX - state.x;
  const dy = state.mouseY - state.y;
  const distanceSquared = dx * dx + dy * dy;
  const distance = Math.sqrt(distanceSquared);
  
  // Normalize direction vector
  let dirX = dx / (distance || 1); // Avoid division by zero
  let dirY = dy / (distance || 1);
  
  // Determine interaction behavior based on distance
  if (distance < 30) {
    // Too close - flee from the mouse
    const repelForce = 0.2 + (state.excitementLevel * 0.3);
    state.velocityX -= dirX * repelForce * deltaTime;
    state.velocityY -= dirY * repelForce * deltaTime;
    
    // Increase excitement when fleeing
    state.isExcited = true;
    state.excitementLevel = Math.min(1.0, state.excitementLevel + 0.01 * deltaTime);
    
  } else if (distance < 150) {
    // Medium distance - curious behavior, slight attraction
    if (Math.random() < 0.5) {
      // 50% chance to be attracted
      const attractForce = 0.05 * deltaTime;
      state.velocityX += dirX * attractForce;
      state.velocityY += dirY * attractForce;
    } else {
      // 50% chance to do a small random movement
      state.velocityX += (Math.random() - 0.5) * 0.1 * deltaTime;
      state.velocityY += (Math.random() - 0.5) * 0.1 * deltaTime;
    }
    
    // Maintain some excitement
    state.isExcited = true;
    state.excitementLevel = Math.min(0.7, state.excitementLevel + 0.005 * deltaTime);
    
  } else if (distance < 300) {
    // Further away - occasional attraction
    if (Math.random() < 0.02) {
      // Occasional attraction
      const attractForce = 0.1 * deltaTime;
      state.velocityX += dirX * attractForce;
      state.velocityY += dirY * attractForce;
    }
    
    // Slowly reduce excitement when far away
    state.excitementLevel = Math.max(0, state.excitementLevel - 0.002 * deltaTime);
    if (state.excitementLevel < 0.1) {
      state.isExcited = false;
    }
  } else {
    // Far away - normal behavior
    // Gradually reduce excitement
    state.excitementLevel = Math.max(0, state.excitementLevel - 0.004 * deltaTime);
    if (state.excitementLevel < 0.1) {
      state.isExcited = false;
    }
  }
  
  // Handle mouse clicks - burst of energy and color change
  if (state.mousePressed) {
    const pressDuration = performance.now() - state.mousePressedTime;
    
    if (pressDuration < 100) {  // Initial click
      // For a brief moment, change behavior dramatically
      if (distance < 200) {
        // Flee more dramatically if mouse is clicked near the pixel
        state.velocityX -= dirX * 1.0;
        state.velocityY -= dirY * 1.0;
      }
    }
  }
  
  // Apply excitement effects
  if (state.isExcited) {
    // Excited pixels move faster
    const speedMultiplier = 1.0 + (state.excitementLevel * 0.5);
    
    // Increase pulse speed when excited
    state.pulseStep = 0.03 + (state.excitementLevel * 0.04);
    
    // Apply a slight drag effect to gradually slow down
    state.velocityX *= 0.98;
    state.velocityY *= 0.98;
  } else {
    // Return to normal pulse speed when calm
    state.pulseStep = 0.03;
  }
}
