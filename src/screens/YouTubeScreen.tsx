import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useCarMediaStore} from '../store/useCarMediaStore';
import {MediaQueueItem} from '../specs/NativeCarMediaBridge';

const CURATED_FEEDS: MediaQueueItem[] = [
  {
    id: 'yt_1',
    title: 'Adaptive High Bitrate Video Stream',
    artist: 'HLS Live Demonstration',
    uri: 'https://storage.googleapis.com/exoplayer-test-media-1/m3u8/adaptive.m3u8',
    streamType: 'youtube',
  },
  {
    id: 'yt_2',
    title: 'Automotive Electric Vehicle Tech Stream',
    artist: 'Clean Car Player Stream',
    uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    streamType: 'youtube',
  },
];

export const YouTubeScreen: React.FC = () => {
  const [customUrl, setCustomUrl] = useState('');
  const {playTrack, preferredResolution, setResolution} = useCarMediaStore();

  const handleCustomStream = () => {
    if (!customUrl.trim()) return;
    const item: MediaQueueItem = {
      id: `custom_${Date.now()}`,
      title: 'Custom Stream Feed',
      artist: 'Network Stream',
      uri: customUrl.trim(),
      streamType: 'youtube',
    };
    playTrack(item);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ADAPTIVE WEB STREAMS</Text>
      <Text style={styles.subtext}>
        Lightweight HLS / DASH stream layer with resolution switching and background audio.
      </Text>

      {/* Input box */}
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Paste HLS / DASH / Web Stream URL..."
          placeholderTextColor="#8B949E"
          value={customUrl}
          onChangeText={setCustomUrl}
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleCustomStream}>
          <Text style={styles.submitBtnText}>Project to Car</Text>
        </TouchableOpacity>
      </View>

      {/* Curated list */}
      <Text style={[styles.header, {marginTop: 16, marginBottom: 8}]}>
        RECOMMENDED STREAMS
      </Text>
      <FlatList
        data={CURATED_FEEDS}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.feedCard}>
            <View style={{flex: 1}}>
              <Text style={styles.feedTitle}>{item.title}</Text>
              <Text style={styles.feedSubtitle}>{item.artist}</Text>
            </View>
            <TouchableOpacity
              style={styles.feedBtn}
              onPress={() => playTrack(item)}>
              <Text style={styles.feedBtnText}>Play on Head Unit</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E14',
    padding: 16,
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
    marginVertical: 8,
  },
  inputCard: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#30363D',
    gap: 10,
  },
  input: {
    backgroundColor: '#0D1117',
    color: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  submitBtn: {
    backgroundColor: '#1F6FEB',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  feedCard: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  feedTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  feedSubtitle: {
    color: '#8B949E',
    fontSize: 12,
    marginTop: 4,
  },
  feedBtn: {
    backgroundColor: '#238636',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  feedBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
