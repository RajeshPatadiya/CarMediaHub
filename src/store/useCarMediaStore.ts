import {create} from 'zustand';
import {CarMediaBridge} from '../services/CarMediaBridge';
import {MediaQueueItem, LocalVideoItem, CarConnectionStatus} from '../specs/NativeCarMediaBridge';

export interface CarMediaState {
  currentTrack: MediaQueueItem | null;
  queue: MediaQueueItem[];
  localVideos: LocalVideoItem[];
  isLoadingVideos: boolean;
  isPlaying: boolean;
  preferredResolution: number; // 720 or 1080
  currentWebUrl: string;
  userAgentMode: 'desktop' | 'mobile' | 'tv';
  connectionStatus: CarConnectionStatus;
  activeNavigationDestination: {name: string; lat: number; lng: number} | null;

  // Actions
  fetchLocalVideos: () => Promise<void>;
  playTrack: (item: MediaQueueItem) => Promise<void>;
  loadWebUrlOnCar: (url: string, ua?: 'desktop' | 'mobile' | 'tv') => Promise<void>;
  injectWebAction: (action: string) => Promise<void>;
  setUserAgentMode: (mode: 'desktop' | 'mobile' | 'tv') => void;
  togglePlayPause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  setResolution: (res: number) => Promise<void>;
  setQueue: (items: MediaQueueItem[]) => Promise<void>;
  setNavigationTarget: (name: string, lat: number, lng: number) => Promise<void>;
  refreshConnectionStatus: () => Promise<void>;
}

export const useCarMediaStore = create<CarMediaState>((set, get) => ({
  currentTrack: null,
  queue: [],
  localVideos: [],
  isLoadingVideos: false,
  isPlaying: false,
  preferredResolution: 1080,
  currentWebUrl: 'https://m.youtube.com',
  userAgentMode: 'desktop',
  connectionStatus: {
    isCarPlayConnected: false,
    isAndroidAutoConnected: false,
  },
  activeNavigationDestination: null,

  fetchLocalVideos: async () => {
    set({isLoadingVideos: true});
    try {
      const videos = await CarMediaBridge.scanLocalVideos();
      set({localVideos: videos, isLoadingVideos: false});
    } catch (e) {
      console.error('Failed to scan local videos:', e);
      set({isLoadingVideos: false});
    }
  },

  playTrack: async (item: MediaQueueItem) => {
    set({currentTrack: item, isPlaying: true});
    if (item.streamType === 'local') {
      await CarMediaBridge.playLocalVideo(item.uri);
    } else {
      await CarMediaBridge.loadStream(item.uri, item.streamType || 'hls');
    }
  },

  loadWebUrlOnCar: async (url: string, ua = get().userAgentMode) => {
    set({currentWebUrl: url});
    await CarMediaBridge.loadWebUrl(url, ua);
  },

  injectWebAction: async (action: string) => {
    await CarMediaBridge.injectWebControl(action);
  },

  setUserAgentMode: (mode) => {
    set({userAgentMode: mode});
  },

  togglePlayPause: async () => {
    const isPlaying = get().isPlaying;
    if (isPlaying) {
      await CarMediaBridge.pausePlayback();
      set({isPlaying: false});
    } else {
      await CarMediaBridge.resumePlayback();
      set({isPlaying: true});
    }
  },

  skipNext: async () => {
    await CarMediaBridge.skipNext();
  },

  skipPrevious: async () => {
    await CarMediaBridge.skipPrevious();
  },

  setResolution: async (res: number) => {
    await CarMediaBridge.setVideoResolution(res);
    set({preferredResolution: res});
  },

  setQueue: async (items: MediaQueueItem[]) => {
    set({queue: items});
    await CarMediaBridge.syncQueue(items);
  },

  setNavigationTarget: async (name: string, lat: number, lng: number) => {
    set({activeNavigationDestination: {name, lat, lng}});
    await CarMediaBridge.startNavigation(lat, lng);
  },

  refreshConnectionStatus: async () => {
    const status = await CarMediaBridge.getCarConnectionStatus();
    set({connectionStatus: status});
  },
}));
