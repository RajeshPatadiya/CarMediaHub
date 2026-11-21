import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface MediaQueueItem {
  id: string;
  title: string;
  artist?: string;
  uri: string;
  streamType?: string; // 'local' | 'youtube' | 'hotstar' | 'netflix' | 'primevideo' | 'sonyliv' | 'zee5' | 'web'
  artworkUrl?: string;
  duration?: number;
}

export interface LocalVideoItem {
  id: string;
  title: string;
  uri: string;
  duration: number; // in seconds
  size: number;     // in bytes
  mimeType: string;
  streamType: string;
}

export interface CarConnectionStatus {
  isCarPlayConnected: boolean;
  isAndroidAutoConnected: boolean;
}

export interface Spec extends TurboModule {
  /**
   * Scans real video files stored locally on the device (MediaStore / Documents).
   */
  scanLocalVideos(): Promise<LocalVideoItem[]>;

  /**
   * Instructs the automotive head-unit engine to play a hardware-accelerated local video.
   * Resumes from the last known bookmark position.
   */
  playLocalVideo(uri: string): Promise<boolean>;

  /**
   * Loads an adaptive streaming source (YouTube HLS/DASH or Hotstar Widevine/FairPlay stream).
   */
  loadStream(url: string, streamType: string): Promise<boolean>;

  /**
   * Loads any web URL or OTT platform on the car head unit screen inside the hardware-accelerated WebView.
   * @param url Web URL
   * @param userAgentType 'desktop' | 'mobile' | 'tv'
   */
  loadWebUrl(url: string, userAgentType: string): Promise<boolean>;

  /**
   * Injects web navigation controls on the car screen (back, forward, reload, desktop, mobile, tv).
   */
  injectWebControl(action: string): Promise<boolean>;

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
   * Skips forward on the car screen (+15s).
   */
  skipNext(): Promise<boolean>;

  /**
   * Skips backward on the car screen (-15s).
   */
  skipPrevious(): Promise<boolean>;

  /**
   * Switches head-unit video rendering resolution (720 or 1080).
   */
  setVideoResolution(height: number): Promise<boolean>;

  /**
   * Queries real-time connection status of CarPlay and Android Auto sessions.
   */
  getCarConnectionStatus(): Promise<CarConnectionStatus>;
}

export default TurboModuleRegistry.get<Spec>('CarMediaBridge');
