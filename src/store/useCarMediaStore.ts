import {create} from 'zustand';
import {CarMediaBridge} from '../services/CarMediaBridge';
import {MediaQueueItem, CarConnectionStatus} from '../specs/NativeCarMediaBridge';

export interface CarMediaState {
  currentTrack: MediaQueueItem | null;
  queue: MediaQueueItem[];
  isPlaying: boolean;
  preferredResolution: number; // 720 or 1080
  connectionStatus: CarConnectionStatus;
  activeNavigationDestination: {name: string; lat: number; lng: number} | null;

  // Actions
  playTrack: (item: MediaQueueItem) => Promise<void>;
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
  isPlaying: false,
  preferredResolution: 1080,
  connectionStatus: {
    isCarPlayConnected: false,
    isAndroidAutoConnected: false,
  },
  activeNavigationDestination: null,

  playTrack: async (item: MediaQueueItem) => {
    set({currentTrack: item, isPlaying: true});
    if (item.streamType === 'local') {
      await CarMediaBridge.playLocalVideo(item.uri);
    } else {
      await CarMediaBridge.loadStream(item.uri, item.streamType || 'hls');
    }
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
