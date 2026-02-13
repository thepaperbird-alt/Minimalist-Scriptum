
class AudioService {
  private audioContext: AudioContext | null = null;

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Synthesizes a short, low-fidelity beep sound typical of early mobile phone UI feedback.
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

    // Early mobile phones used simple oscillators, often sine or slightly rounded square waves.
    osc.type = 'sine';
    
    // Low-ish frequency beep for that "old tech" UI feel.
    // Keys at ~880Hz (A5), Space slightly lower at ~587Hz (D5).
    const frequency = isSpace ? 587.33 : 880.00;
    
    // Add a tiny bit of random pitch variation for a less robotic feel
    const variance = (Math.random() - 0.5) * 5;
    osc.frequency.setValueAtTime(frequency + variance, now);
    
    // Very short duration: 25ms-40ms
    const duration = isSpace ? 0.04 : 0.025;
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  public playSpaceSound() {
    this.playKeySound(true);
  }
}

export const audioService = new AudioService();
