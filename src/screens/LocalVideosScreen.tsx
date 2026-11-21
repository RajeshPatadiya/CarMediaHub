import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useCarMediaStore} from '../store/useCarMediaStore';
import {LocalVideoItem, MediaQueueItem} from '../specs/NativeCarMediaBridge';

export const LocalVideosScreen: React.FC = () => {
  const {localVideos, isLoadingVideos, fetchLocalVideos, playTrack, currentTrack} = useCarMediaStore();

  useEffect(() => {
    fetchLocalVideos();
  }, [fetchLocalVideos]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const formatSize = (bytes: number): string => {
    if (bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handlePlay = (item: LocalVideoItem) => {
    const queueItem: MediaQueueItem = {
      id: item.id,
      title: item.title,
      artist: 'Local Media Storage',
      uri: item.uri,
      streamType: 'local',
      duration: item.duration,
    };
    playTrack(queueItem);
  };

  const renderItem = ({item}: {item: LocalVideoItem}) => {
    const isCurrent = currentTrack?.id === item.id;
    return (
      <View style={[styles.itemCard, isCurrent && styles.activeItemCard]}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.itemDetails}>
            {formatDuration(item.duration)} • {formatSize(item.size)} • {item.mimeType.replace('video/', '').toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.playButton, isCurrent && styles.activePlayButton]}
          onPress={() => handlePlay(item)}>
          <Text style={styles.playButtonText}>
            {isCurrent ? '▶ Playing in Car' : 'Cast to Car'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>REAL LOCAL VIDEO ENGINE</Text>
          <Text style={styles.subtext}>
            Hardware-accelerated MediaCodec / VideoToolbox decoding from MediaStore.
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchLocalVideos}>
          <Text style={styles.refreshBtnText}>↻ Scan Storage</Text>
        </TouchableOpacity>
      </View>

      {isLoadingVideos ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#238636" />
          <Text style={styles.loadingText}>Scanning device storage for MP4, MKV, MOV files...</Text>
        </View>
      ) : localVideos.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No Local Videos Found</Text>
          <Text style={styles.emptySub}>
            Drop MP4, MKV, or MOV files into your device Movies/Downloads folder, then tap "Scan Storage".
          </Text>
          <TouchableOpacity style={styles.scanNowBtn} onPress={fetchLocalVideos}>
            <Text style={styles.scanNowBtnText}>Scan Storage Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={localVideos}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E14',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  header: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtext: {
    color: '#C9D1D9',
    fontSize: 12,
    marginTop: 2,
    maxWidth: 240,
  },
  refreshBtn: {
    backgroundColor: '#21262D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  refreshBtnText: {
    color: '#58A6FF',
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    gap: 10,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 14,
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
    marginRight: 10,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
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
  activePlayButton: {
    backgroundColor: '#1F6FEB',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#8B949E',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    color: '#8B949E',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  scanNowBtn: {
    backgroundColor: '#238636',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  scanNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
