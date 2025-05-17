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
    pulseDirection: 1,
    pulseStep: 0.03,
    lastTimestamp: 0,
    connected: false
  };
  
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
    // Try to connect to the noesis server
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
    // Occasionally change color during pulse
    if (Math.random() < 0.08) {
      state.color = getRandomColor();
    }
  } else if (state.size < 3.5) {
    state.size = 3.5;
    state.pulseDirection = 1;
  }
  
  // Update the pixel's appearance
  pixel.style.left = `${state.x}px`;
  pixel.style.top = `${state.y}px`;
  pixel.style.width = `${state.size}px`;
  pixel.style.height = `${state.size}px`;
  
  // Create a glow effect with box-shadow
  const glowSize = state.size * 2;
  pixel.style.boxShadow = `0 0 ${glowSize}px ${state.color}`;
  pixel.style.backgroundColor = state.color;
  
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
