// Web Audio API Sound Synthesizer for JustMeet
// Generates warm, subtle sound feedback for key dating app interactions.

let audioCtx: AudioContext | null = null;
let isMutedGlobal = false;

// Initialize or retrieve Web Audio Context safely
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  // Resume context if suspended (browser security blocks autoplay)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  
  return audioCtx;
}

/**
 * Configure global mute state
 */
export function setAudioMuted(muted: boolean) {
  isMutedGlobal = muted;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('justmeet_audio_muted', muted ? 'true' : 'false');
  }
}

/**
 * Check if audio is currently muted
 */
export function getAudioMuted(): boolean {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('justmeet_audio_muted');
    if (stored !== null) {
      return stored === 'true';
    }
  }
  return isMutedGlobal;
}

/**
 * Play a synthesized sound effect using the Web Audio API
 */
export function playSound(type: 'match' | 'message' | 'wink') {
  if (getAudioMuted()) return;
  
  const ctx = getAudioContext();
  if (!ctx) return;

  // Try resuming in case it got suspended
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  switch (type) {
    case 'match': {
      // MATCH SOUND: Warm, upward harmonic chord sweep celebrating a new connection (Arpeggio: F4 -> A4 -> C5 -> F5)
      const notes = [349.23, 440.00, 523.25, 698.46]; 
      const duration = 0.15; // overlap
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Use soft triangle waves for a cozy, organic feel
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gainNode.gain.setValueAtTime(0, now + index * 0.08);
        // Quick ramp up, gentle ramp down
        gainNode.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.4);
      });
      break;
    }

    case 'message': {
      // SEND MESSAGE SOUND: A quick, clean, tactile bubble-pop / chirp (smooth sine wave sweep upward)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      // Fast sweeping pitch from 480Hz to 680Hz
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
      break;
    }

    case 'wink': {
      // RECEIVE WINK SOUND: A sparkly, flirty dual-tone chime (F5 -> Bb5)
      const notes = [698.46, 932.33];
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Sine wave for clean chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);
        
        gainNode.gain.setValueAtTime(0, now + index * 0.06);
        gainNode.gain.linearRampToValueAtTime(0.1, now + index * 0.06 + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.25);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.3);
      });
      break;
    }
  }
}
