// Create AudioContext only when needed (browser autoplay policies)
let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// DOS-style beep sound generator
const generateBeep = (frequency, duration, type = 'square') => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
};

export const playGenerateSound = () => {
  // Ascending beeps for generation
  generateBeep(440, 0.1); // A4
  setTimeout(() => generateBeep(523.25, 0.1), 100); // C5
  setTimeout(() => generateBeep(659.25, 0.15), 200); // E5
};

export const playSaveSound = () => {
  // Short confirmation beep
  generateBeep(587.33, 0.1, 'sine'); // D5
  setTimeout(() => generateBeep(880, 0.15, 'sine'), 100); // A5
};

export const playEditCompleteSound = () => {
  // Descending confirmation
  generateBeep(783.99, 0.1); // G5
  setTimeout(() => generateBeep(659.25, 0.1), 100); // E5
  setTimeout(() => generateBeep(523.25, 0.15), 200); // C5
};

export const playDeleteSound = () => {
  // Quick descending pattern for deletion
  generateBeep(440, 0.08); // A4
  setTimeout(() => generateBeep(330, 0.08), 50); // E4
  setTimeout(() => generateBeep(220, 0.12, 'sawtooth'), 100); // A3
}; 