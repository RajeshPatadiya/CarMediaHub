import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useCarMediaStore} from '../store/useCarMediaStore';
import {MediaQueueItem} from '../specs/NativeCarMediaBridge';

const SAMPLE_VIDEOS: MediaQueueItem[] = [
  {
    id: 'local_1',
    title: 'Dashcam Road Trip Recording (1080p)',
    artist: 'Camera Loop #104',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    streamType: 'local',
    duration: 596,
  },
  {
    id: 'local_2',
    title: 'Automotive Showcase Video (MKV)',
    artist: 'Vehicle Media Hub',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    streamType: 'local',
    duration: 653,
  },
  {
    id: 'local_3',
    title: 'Highway Cruise Landscape (MOV)',
    artist: 'Scenic Drive',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    streamType: 'local',
    duration: 15,
  },
];

export const LocalVideosScreen: React.FC = () => {
  const {playTrack, currentTrack} = useCarMediaStore();

  const renderItem = ({item}: {item: MediaQueueItem}) => {
    const isCurrent = currentTrack?.id === item.id;
    return (
      <View style={[styles.itemCard, isCurrent && styles.activeItemCard]}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDetails}>
            {item.artist} • {Math.floor((item.duration || 0) / 60)}m {(item.duration || 0) % 60}s
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => playTrack(item)}>
          <Text style={styles.playButtonText}>
            {isCurrent ? 'Playing' : 'Cast to Car'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LOCAL VIDEO VAULT</Text>
      <Text style={styles.subtext}>
        Hardware-accelerated zero-copy playback on vehicle head unit with auto-resume.
      </Text>
      <FlatList
        data={SAMPLE_VIDEOS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
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
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  activeItemCard: {
    borderColor: '#238636',
    backgroundColor: '#0D2214',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  itemDetails: {
    color: '#8B949E',
    fontSize: 12,
    marginTop: 4,
  },
  playButton: {
    backgroundColor: '#238636',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
