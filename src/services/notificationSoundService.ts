
class NotificationSoundService {
  private audioContext: AudioContext | null = null;
  private soundBuffer: AudioBuffer | null = null;
  private fallbackAudio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.7;
  private isInitialized: boolean = false;

  constructor() {
    this.loadPreferences();
    this.initializeFallback();
  }

  private loadPreferences() {
    try {
      const savedPrefs = localStorage.getItem('notification-sound-preferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        this.isEnabled = prefs.enabled ?? true;
        this.volume = prefs.volume ?? 0.7;
      }
    } catch (error) {
      console.warn('Failed to load sound preferences:', error);
    }
  }

  private savePreferences() {
    try {
      localStorage.setItem('notification-sound-preferences', JSON.stringify({
        enabled: this.isEnabled,
        volume: this.volume
      }));
    } catch (error) {
      console.warn('Failed to save sound preferences:', error);
    }
  }

  private initializeFallback() {
    try {
      this.fallbackAudio = new Audio('/sounds/notification.mp3');
      this.fallbackAudio.volume = this.volume;
      this.fallbackAudio.preload = 'auto';
    } catch (error) {
      console.warn('Failed to initialize fallback audio:', error);
    }
  }

  private async initializeAudioContext() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadSound();
      this.isInitialized = true;
      console.log('[NotificationSound] Audio context initialized successfully');
    } catch (error) {
      console.warn('[NotificationSound] Failed to initialize audio context:', error);
      // Fallback para HTMLAudioElement
      this.initializeFallback();
    }
  }

  private async loadSound() {
    if (!this.audioContext) return;

    try {
      const response = await fetch('/sounds/notification.mp3');
      if (!response.ok) {
        throw new Error(`Failed to fetch sound: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      this.soundBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log('[NotificationSound] Sound loaded successfully');
    } catch (error) {
      console.warn('[NotificationSound] Failed to load sound:', error);
      throw error;
    }
  }

  public async playNotification(type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    if (!this.isEnabled) {
      console.log('[NotificationSound] Sound is disabled');
      return;
    }

    console.log('[NotificationSound] Attempting to play notification sound');

    // Inicializar se necessário
    if (!this.isInitialized) {
      await this.initializeAudioContext();
    }

    // Tentar usar Web Audio API primeiro
    if (this.audioContext && this.soundBuffer) {
      try {
        await this.playWithWebAudio();
        console.log('[NotificationSound] Played with Web Audio API');
        return;
      } catch (error) {
        console.warn('[NotificationSound] Web Audio failed, trying fallback:', error);
      }
    }

    // Fallback para HTMLAudioElement
    await this.playWithFallback();
  }

  private async playWithWebAudio() {
    if (!this.audioContext || !this.soundBuffer) {
      throw new Error('Audio context or buffer not available');
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.soundBuffer;
    gainNode.gain.value = this.volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }

  private async playWithFallback() {
    if (!this.fallbackAudio) {
      console.warn('[NotificationSound] No fallback audio available');
      return;
    }

    try {
      this.fallbackAudio.volume = this.volume;
      this.fallbackAudio.currentTime = 0;
      
      const playPromise = this.fallbackAudio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('[NotificationSound] Played with fallback audio');
      }
    } catch (error) {
      console.warn('[NotificationSound] Fallback audio failed:', error);
      
      // Se ainda assim falhar, pode ser por falta de interação do usuário
      if (error.name === 'NotAllowedError') {
        console.log('[NotificationSound] Autoplay blocked - user interaction required');
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.savePreferences();
    console.log('[NotificationSound] Sound enabled:', enabled);
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.savePreferences();
    
    if (this.fallbackAudio) {
      this.fallbackAudio.volume = this.volume;
    }
    console.log('[NotificationSound] Volume set to:', this.volume);
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  // Método para testar o som
  public async testSound() {
    console.log('[NotificationSound] Testing sound...');
    await this.playNotification('info');
  }
}

export const notificationSoundService = new NotificationSoundService();
