// Heartbeat — Pattern ID: 2Lq8bppccw3s9nCi3
//
// Sharp double-pulse EKG waveform radiates from center outward.
// Layers staggered for a cascading heartbeat through depth.
// Warm ambient glow between beats keeps display active.
//
// Design: Three overlapping triangle pulses at t=0, t=0.22, and
// t=0.38 create the lub-dub-afterbeat EKG shape. Pulse radiates
// from x=0.5 center outward. Per-layer time offset (0.08) for
// cascade. Ambient floor uses wave() modulation (0.02-0.08).

var bpm = 0.025 // time() interval — lower = faster heartbeat
var pulseWidth = 0.15
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

// How fast the heart beats
export function sliderBPM(v) { bpm = mix(0.015, 0.06, v) }
// How wide each heartbeat pulse spreads across the layer
export function sliderPulseWidth(v) { pulseWidth = mix(0.08, 0.25, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t = time(bpm)
  var layerT = mod(t + layerPhase * 0.08, 1) // per-layer stagger for depth cascade
  // Three overlapping triangle pulses create lub-dub-afterbeat EKG shape
  var beat1 = max(0, 1 - abs(layerT) / pulseWidth) // primary pulse at t=0
  var beat2 = max(0, 0.7 - abs(layerT - 0.22) / (pulseWidth * 0.8)) // secondary at t=0.22, 70% amplitude
  var beat3 = max(0, 0.3 - abs(layerT - 0.38) / (pulseWidth * 0.6)) // afterbeat at t=0.38, 30% amplitude
  var pulse = max(beat1, max(beat2, beat3))
  pulse = pulse * pulse // squared for sharper peaks
  var fromCenter = abs(x - 0.5) * 2 // 0 at center, 1 at edges
  var radiate = max(0, pulse - fromCenter * pulse * 0.7) // pulse radiates outward from x=0.5
  var ambient = wave(t * 2 + layerPhase * 0.5) * 0.06 + 0.02 // warm glow between beats
  ambient = ambient * (0.8 + wave(x * 3 + layerPhase * 2) * 0.2) // add spatial variation
  var hue = 0.0 + layerPhase * 0.08 + (1 - pulse) * 0.05 // red base; shifts slightly per layer and between beats
  var sat = 0.8 + pulse * 0.2
  var bright = max(radiate * (1 - fromCenter * 0.3), ambient)
  hsv(hue, sat, bright)
}
