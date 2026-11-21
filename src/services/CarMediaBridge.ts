import NativeCarMediaBridge, {
  MediaQueueItem,
  CarConnectionStatus,
} from '../specs/NativeCarMediaBridge';

/**
 * High-level bridge service with graceful fallback for development,
 * simulator, and physical device testing without an active car head-unit connection.
 */
class CarMediaBridgeService {
  private nativeModule = NativeCarMediaBridge;

  async playLocalVideo(uri: string): Promise<boolean> {
    if (this.nativeModule) {
      return this.nativeModule.playLocalVideo(uri);
    }
    console.log('[CarMediaBridge Mock] playLocalVideo:', uri);
    return true;
  }

  async loadStream(url: string, streamType: string): Promise<boolean> {
    if (this.nativeModule) {
      return this.nativeModule.loadStream(url, streamType);
    }
    console.log(`[CarMediaBridge Mock] loadStream (${streamType}):`, url);
    return true;
  }

  async syncQueue(items: MediaQueueItem[]): Promise<boolean> {
    if (this.nativeModule) {
      return this.nativeModule.syncQueue(items);
    }
    console.log('[CarMediaBridge Mock] syncQueue:', items.length, 'items');
    return true;
  }

  async startNavigation(lat: number, lng: number): Promise<boolean> {
    if (this.nativeModule) {
      return this.nativeModule.startNavigation(lat, lng);
    }
    console.log('[CarMediaBridge Mock] startNavigation:', lat, lng);
    return true;
  }

  async pausePlayback(): Promise<boolean> {
    if (this.nativeModule) {
      return this.nativeModule.pausePlayback();
    }
    console.log('[CarMediaBridge Mock] pausePlayback');
    return true;
  }

  async resumePlayback(): Promise<boolean> {
    if (this.nativeModule) {
      return this.nativeModule.resumePlayback();
    }
    console.log('[CarMediaBridge Mock] resumePlayback');
    return true;
  }

  async skipNext(): Promise<boolean> {
    if (this.nativeModule) {
      return this.nativeModule.skipNext();
    }
    console.log('[CarMediaBridge Mock] skipNext');
    return true;
  }

  async skipPrevious(): Promise<boolean> {
    if (this.nativeModule) {
      return this.nativeModule.skipPrevious();
    }
    console.log('[CarMediaBridge Mock] skipPrevious');
    return true;
  }

  async setVideoResolution(height: number): Promise<boolean> {
    if (this.nativeModule) {
      return this.nativeModule.setVideoResolution(height);
    }
    console.log('[CarMediaBridge Mock] setVideoResolution:', height);
    return true;
  }

  async getCarConnectionStatus(): Promise<CarConnectionStatus> {
    if (this.nativeModule) {
      return this.nativeModule.getCarConnectionStatus();
    }
    return {
      isCarPlayConnected: false,
      isAndroidAutoConnected: false,
    };
  }
}

export const CarMediaBridge = new CarMediaBridgeService();
