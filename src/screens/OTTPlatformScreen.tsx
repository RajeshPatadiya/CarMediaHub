import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {useCarMediaStore} from '../store/useCarMediaStore';
import {MediaQueueItem} from '../specs/NativeCarMediaBridge';

interface OTTPlatform {
  id: string;
  name: string;
  category: string;
  color: string;
  defaultStreamUrl: string;
  streamType: string;
  description: string;
}

const SUPPORTED_PLATFORMS: OTTPlatform[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Free & Premium Video',
    color: '#FF0000',
    defaultStreamUrl: 'https://storage.googleapis.com/exoplayer-test-media-1/m3u8/adaptive.m3u8',
    streamType: 'youtube',
    description: 'Ad-friendly automotive streaming layer with 720p/1080p resolution switching.',
  },
  {
    id: 'hotstar',
    name: 'Disney+ Hotstar',
    category: 'Movies, Series & Live Sports',
    color: '#1F6FEB',
    defaultStreamUrl: 'https://storage.googleapis.com/wvmedia/cenc/h264/tears/tears.mpd',
    streamType: 'hotstar',
    description: 'Widevine & FairPlay DRM streaming with virtual projection fallback.',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Originals & Feature Films',
    color: '#E50914',
    defaultStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    streamType: 'netflix',
    description: 'Automotive web portal with session persistence and full-screen car playback.',
  },
  {
    id: 'primevideo',
    name: 'Amazon Prime Video',
    category: 'Global Movies & TV',
    color: '#00A8E1',
    defaultStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    streamType: 'primevideo',
    description: 'Hardware-accelerated theater playback on CarPlay and Android Auto screens.',
  },
  {
    id: 'sonyliv',
    name: 'SonyLIV',
    category: 'Live Sports & Premium Originals',
    color: '#F39C12',
    defaultStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    streamType: 'sonyliv',
    description: 'Cricket, football, and regional cinema with zero-lag audio sync.',
  },
];

export const OTTPlatformScreen: React.FC = () => {
  const {playTrack, currentTrack, isPlaying, togglePlayPause} = useCarMediaStore();
  const [selectedPlatform, setSelectedPlatform] = useState<OTTPlatform>(SUPPORTED_PLATFORMS[0]);
  const [customStreamUrl, setCustomStreamUrl] = useState('');

  const handleLaunchPlatform = (platform: OTTPlatform) => {
    setSelectedPlatform(platform);
    const mediaItem: MediaQueueItem = {
      id: `ott_${platform.id}_${Date.now()}`,
      title: `${platform.name} - In-Car Infotainment`,
      artist: `Streamed via CarMediaHub by Rajesh Patadiya`,
      uri: customStreamUrl.trim() || platform.defaultStreamUrl,
      streamType: platform.streamType,
    };
    playTrack(mediaItem);
    Alert.alert(
      'Projecting to Car Screen',
      `Launching ${platform.name} on your vehicle head unit with zero-lag hardware decoding.\n\nDeveloped by Rajesh Patadiya`,
      [{text: 'OK'}]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>OTT ALL-IN-ONE THEATER</Text>
      <Text style={styles.subtext}>
        Universal automotive streaming engine for YouTube, Hotstar, Prime Video, SonyLIV, and Netflix.
      </Text>

      {/* Developer Badge */}
      <View style={styles.devCard}>
        <Text style={styles.devTag}>AUTOMOTIVE ARCHITECTURE</Text>
        <Text style={styles.devName}>Developed by Rajesh Patadiya</Text>
        <Text style={styles.devSub}>
          Native CarPlay AVPlayer (VideoToolbox) &amp; Android Auto Media3 (MediaCodec)
        </Text>
      </View>

      {/* Custom Stream Override */}
      <View style={styles.customCard}>
        <Text style={styles.sectionTitle}>CUSTOM STREAM / DIRECT VOD LINK</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional: Paste direct HLS / DASH / MP4 manifest URL..."
          placeholderTextColor="#8B949E"
          value={customStreamUrl}
          onChangeText={setCustomStreamUrl}
        />
      </View>

      {/* Platform Cards */}
      <Text style={[styles.sectionTitle, {marginTop: 16, marginBottom: 10}]}>
        AVAILABLE OTT CHANNELS
      </Text>
      {SUPPORTED_PLATFORMS.map(platform => {
        const isCurrent = currentTrack?.streamType === platform.streamType;
        return (
          <View
            key={platform.id}
            style={[
              styles.platformCard,
              {borderLeftColor: platform.color, borderLeftWidth: 4},
              isCurrent && styles.activePlatformCard,
            ]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.platformName}>{platform.name}</Text>
                <Text style={styles.platformCategory}>{platform.category}</Text>
              </View>
              <TouchableOpacity
                style={[styles.launchBtn, {backgroundColor: platform.color}]}
                onPress={() => handleLaunchPlatform(platform)}>
                <Text style={styles.launchBtnText}>
                  {isCurrent && isPlaying ? 'Playing in Car' : 'Play on Head Unit'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.platformDesc}>{platform.description}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E14',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtext: {
    color: '#C9D1D9',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  devCard: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#238636',
  },
  devTag: {
    color: '#2ECC71',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  devName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  devSub: {
    color: '#8B949E',
    fontSize: 11,
    marginTop: 2,
  },
  customCard: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  sectionTitle: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#0D1117',
    color: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#30363D',
    marginTop: 8,
  },
  platformCard: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  activePlatformCard: {
    backgroundColor: '#0D2214',
    borderColor: '#238636',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  platformCategory: {
    color: '#8B949E',
    fontSize: 11,
    marginTop: 2,
  },
  launchBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  launchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  platformDesc: {
    color: '#8B949E',
    fontSize: 12,
    lineHeight: 18,
  },
});
