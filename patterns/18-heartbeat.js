// Heartbeat — Pattern ID: 2Lq8bppccw3s9nCi3
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Sharp double-pulse EKG waveform radiates from center of
// each layer. Layers are staggered in time for a cascading
// heartbeat. Between beats, a dim warm glow breathes slowly
// so the display never goes fully dark.
// -------------------------------------------------------
// Design: bpm=0.025 gives ~1.6s cycle. The double-beat
// occupies ~40% of the cycle (pulseWidth 0.15 + second
// beat at 0.22). A subtle between-beat ambient glow
// (0.04-0.08) keeps layers visible during rest phase.
// Third afterpulse at 0.38 adds more active time.
// -------------------------------------------------------

var bpm = 0.025
var pulseWidth = 0.15

export function sliderBPM(v) { bpm = mix(0.015, 0.06, v) }
export function sliderPulseWidth(v) { pulseWidth = mix(0.08, 0.25, v) }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8

  var t = time(bpm)
  // Stagger each layer's beat — tighter stagger for quicker cascade
  var layerT = mod(t + layerPhase * 0.08, 1)

  // Sharp heartbeat waveform: two quick peaks then rest
  // First strong beat, second smaller beat close behind
  var beat1 = max(0, 1 - abs(layerT) / pulseWidth)
  var beat2 = max(0, 0.7 - abs(layerT - 0.22) / (pulseWidth * 0.8))
  // Third subtle afterpulse for more active time
  var beat3 = max(0, 0.3 - abs(layerT - 0.38) / (pulseWidth * 0.6))
  var pulse = max(beat1, max(beat2, beat3))
  pulse = pulse * pulse

  // Pulse radiates outward from center
  var fromCenter = abs(x - 0.5) * 2
  var radiate = max(0, pulse - fromCenter * pulse * 0.7)

  // Between-beat ambient: gentle warm breathing
  var ambient = wave(t * 2 + layerPhase * 0.5) * 0.06 + 0.02
  // Ambient varies along x for visual interest
  ambient = ambient * (0.8 + wave(x * 3 + layerPhase * 2) * 0.2)

  // Hue: red at peak, shifts through warm colors per layer
  var hue = 0.0 + layerPhase * 0.08 + (1 - pulse) * 0.05
  var sat = 0.8 + pulse * 0.2

  // Bright core, dimmer edges, with ambient floor
  var bright = max(radiate * (1 - fromCenter * 0.3), ambient)

  hsv(hue, sat, bright)
}
