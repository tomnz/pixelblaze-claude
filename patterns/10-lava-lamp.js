// Lava Lamp — Pattern ID: ibahzcpKGvr8482YH
//
// Slow-moving blobs of warm color drift back and forth along
// each layer's LEDs. Languid, organic, meditative feel.
//
// Design: Per-layer blob with random initial position/velocity,
// bouncing off edges. smoothstep() then squaring for soft glow
// falloff. Hue drifts slowly per layer with subtle x-based
// wave modulation. Blob width is slider-controllable.

// Per-layer blob state: one blob per layer bounces along the X axis
var blobPos = array(32) // x position of each blob (0-1)
var blobVel = array(32) // velocity (units/sec), sign = direction
var blobHue = array(32) // slowly drifting hue per layer
var blobWidth = 0.3 // half-width of blob glow in x-space
var speedMult = 1
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
// Auto-detect layer count and y range from pixel map
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

var i
for (i = 0; i < 32; i++) {
  blobPos[i] = random(1)
  blobVel[i] = (random(0.08) + 0.04) * (random(1) > 0.5 ? 1 : -1) // speed 0.04-0.12, random direction
  blobHue[i] = i / 32 * 0.12 // spread initial hues over warm range (~12% of wheel)
}

// How fast the blobs drift back and forth
export function sliderSpeed(v) { speedMult = mix(0.2, 3, v) }
// How large each glowing blob appears
export function sliderBlobWidth(v) { blobWidth = mix(0.1, 0.6, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  var i
  for (i = 0; i < numLayers; i++) {
    blobPos[i] = blobPos[i] + blobVel[i] * speedMult * dt
    // Bounce off edges: reflect position and reverse velocity
    if (blobPos[i] > 1) { blobPos[i] = 2 - blobPos[i]; blobVel[i] = -abs(blobVel[i]) }
    if (blobPos[i] < 0) { blobPos[i] = -blobPos[i]; blobVel[i] = abs(blobVel[i]) }
    blobHue[i] = mod(blobHue[i] + dt * 0.02, 1)
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var dx = abs(x - blobPos[layer])
  var bright = max(0, 1 - dx / blobWidth) // linear falloff from blob center
  bright = smoothstep(0, 1, bright) // smooth edges (cubic hermite)
  bright = bright * bright // additional squaring for soft glow with sharp center
  var hue = blobHue[layer] + bright * 0.06 + wave(x * 2 + layer * 0.3) * 0.04
  var sat = 0.8 + bright * 0.15
  hsv(hue, clamp(sat, 0, 1), bright)
}
