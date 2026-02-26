
class AudioService {
  private audioContext: AudioContext | null = null;

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Synthesizes a sharp, short square-wave beep typical of vintage computer systems (PC speaker style).
   */
  public playKeySound(isSpace = false) {
    this.init();
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    // Square waves provide that hollow, buzzy retro computer sound.
    osc.type = 'square';
    
    // Higher frequencies for that "blip" effect.
    // Standard keys at 1200Hz, Space at 900Hz.
    const frequency = isSpace ? 900 : 1200;
    
    // Minimal pitch variation for consistency
    const variance = (Math.random() - 0.5) * 10;
    osc.frequency.setValueAtTime(frequency + variance, now);
    
    // Extremely short duration for a "blip" rather than a "beep": 15ms-25ms
    const duration = isSpace ? 0.025 : 0.015;
    
    // Square waves are perceptionally louder, so we keep the gain low.
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + duration + 0.005);
  }

  public playSpaceSound() {
    this.playKeySound(true);
  }
}

export const audioService = new AudioService();
