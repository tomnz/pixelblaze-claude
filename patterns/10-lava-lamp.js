// Lava Lamp — Pattern ID: ibahzcpKGvr8482YH
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Slow-moving blobs of warm color drift back and forth
// along each layer's 24 LEDs. Each layer has a different
// speed and phase. Languid, organic, meditative.
// -------------------------------------------------------
// Design: Per-layer arrays for position, velocity, and hue.
// Blobs bounce off edges. Squared brightness after
// smoothstep for good contrast (no flat ambient floor).
// Blob hues drift over time. Hue varies along x within
// blobs for color depth.
// -------------------------------------------------------

var blobPos = array(8)
var blobVel = array(8)
var blobHue = array(8)
var blobWidth = 0.3
var speedMult = 1

var i
for (i = 0; i < 8; i++) {
  blobPos[i] = random(1)
  blobVel[i] = (random(0.08) + 0.04) * (random(1) > 0.5 ? 1 : -1)
  blobHue[i] = i / 8 * 0.12
}

export function sliderSpeed(v) { speedMult = mix(0.2, 3, v) }
export function sliderBlobWidth(v) { blobWidth = mix(0.1, 0.6, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  var i
  for (i = 0; i < 8; i++) {
    blobPos[i] = blobPos[i] + blobVel[i] * speedMult * dt
    if (blobPos[i] > 1) { blobPos[i] = 2 - blobPos[i]; blobVel[i] = -abs(blobVel[i]) }
    if (blobPos[i] < 0) { blobPos[i] = -blobPos[i]; blobVel[i] = abs(blobVel[i]) }
    // Slowly drift each blob's hue
    blobHue[i] = mod(blobHue[i] + dt * 0.02, 1)
  }
}

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var dx = abs(x - blobPos[layer])
  var bright = max(0, 1 - dx / blobWidth)
  bright = smoothstep(0, 1, bright)
  bright = bright * bright
  // Hue varies along x within each blob for color depth
  var hue = blobHue[layer] + bright * 0.06 + wave(x * 2 + layer * 0.3) * 0.04
  var sat = 0.8 + bright * 0.15
  hsv(hue, clamp(sat, 0, 1), bright)
}
