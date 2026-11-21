import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface MediaQueueItem {
  id: string;
  title: string;
  artist?: string;
  uri: string;
  streamType?: string; // 'local' | 'youtube' | 'hotstar'
  artworkUrl?: string;
  duration?: number;
}

export interface CarConnectionStatus {
  isCarPlayConnected: boolean;
  isAndroidAutoConnected: boolean;
}

export interface Spec extends TurboModule {
  /**
   * Instructs the automotive head-unit engine to play a hardware-accelerated local video.
   * Resumes from the last known bookmark position.
   */
  playLocalVideo(uri: string): Promise<boolean>;

  /**
   * Loads an adaptive streaming source (YouTube HLS/DASH or Hotstar Widevine/FairPlay stream).
   * @param url Stream URL or manifest endpoint
   * @param streamType 'youtube' | 'hotstar' | 'hls' | 'dash'
   */
  loadStream(url: string, streamType: string): Promise<boolean>;

  /**
   * Synchronizes the active phone media queue with the car head-unit media browser.
   */
  syncQueue(items: MediaQueueItem[]): Promise<boolean>;

  /**
   * Initiates turn-by-turn navigation on the vehicle head-unit split-screen dashboard.
   */
  startNavigation(lat: number, lng: number): Promise<boolean>;

  /**
   * Pauses the active head-unit video / media playback.
   */
  pausePlayback(): Promise<boolean>;

  /**
   * Resumes head-unit video / media playback.
   */
  resumePlayback(): Promise<boolean>;

  /**
   * Skips forward or to the next queue item on the car screen.
   */
  skipNext(): Promise<boolean>;

  /**
   * Skips backward or to the previous queue item on the car screen.
   */
  skipPrevious(): Promise<boolean>;

  /**
   * Switches head-unit video rendering resolution (e.g., 720 for eco/low-latency or 1080 for full HD).
   */
  setVideoResolution(height: number): Promise<boolean>;

  /**
   * Queries real-time connection status of CarPlay and Android Auto sessions.
   */
  getCarConnectionStatus(): Promise<CarConnectionStatus>;
}

export default TurboModuleRegistry.get<Spec>('CarMediaBridge');
