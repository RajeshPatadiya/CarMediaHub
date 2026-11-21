import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useCarMediaStore} from '../store/useCarMediaStore';

export const HomeScreen: React.FC = () => {
  const {
    connectionStatus,
    currentTrack,
    isPlaying,
    preferredResolution,
    togglePlayPause,
    skipNext,
    skipPrevious,
    setResolution,
    refreshConnectionStatus,
    loadWebUrlOnCar,
  } = useCarMediaStore();

  useEffect(() => {
    refreshConnectionStatus();
    const interval = setInterval(refreshConnectionStatus, 2500);
    return () => clearInterval(interval);
  }, [refreshConnectionStatus]);

  const handleLaunchCarTrigger = () => {
    loadWebUrlOnCar('https://m.youtube.com', 'mobile');
    Alert.alert(
      'Car Screen Trigger',
      'Launched live video & web projection on your vehicle in-dash display!\n\nDeveloped by Rajesh Patadiya',
      [{text: 'OK'}]
    );
  };

  const isConnected = connectionStatus.isCarPlayConnected || connectionStatus.isAndroidAutoConnected;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Automotive Connection Status Banner */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionHeader}>VEHICLE INFOTAINMENT CONNECTION</Text>
        <View style={styles.statusRow}>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.indicatorDot,
                {
                  backgroundColor: connectionStatus.isCarPlayConnected
                    ? '#2ECC71'
                    : '#7F8C8D',
                },
              ]}
            />
            <Text style={styles.badgeText}>
              CarPlay: {connectionStatus.isCarPlayConnected ? 'Connected' : 'Ready'}
            </Text>
          </View>

          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.indicatorDot,
                {
                  backgroundColor: connectionStatus.isAndroidAutoConnected
                    ? '#2ECC71'
                    : '#7F8C8D',
                },
              ]}
            />
            <Text style={styles.badgeText}>
              Android Auto: {connectionStatus.isAndroidAutoConnected ? 'Connected' : 'Ready'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.launchCarBtn} onPress={handleLaunchCarTrigger}>
          <Text style={styles.launchCarBtnText}>
            {isConnected ? '🚀 Live on Vehicle Screen' : '⚡ Launch on Car Screen'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Now Playing on Head Unit */}
      <View style={styles.playerCard}>
        <Text style={styles.sectionHeader}>NOW PROJECTING</Text>
        <Text style={styles.trackTitle}>
          {currentTrack ? currentTrack.title : 'Ready to Stream'}
        </Text>
        <Text style={styles.trackSubtitle}>
          {currentTrack ? currentTrack.artist || 'Local Media Storage' : 'Select a local video or OTT channel to project to your vehicle screen'}
        </Text>

        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={skipPrevious}>
            <Text style={styles.btnText}>⏮ -15s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.primaryBtn]}
            onPress={togglePlayPause}>
            <Text style={[styles.btnText, styles.primaryBtnText]}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={skipNext}>
            <Text style={styles.btnText}>+15s ⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Resolution Selector */}
        <View style={styles.resolutionContainer}>
          <Text style={styles.resolutionLabel}>Anti-Lag Projection Quality:</Text>
          <View style={styles.resButtons}>
            <TouchableOpacity
              style={[
                styles.resPill,
                preferredResolution === 720 && styles.resPillActive,
              ]}
              onPress={() => setResolution(720)}>
              <Text
                style={[
                  styles.resPillText,
                  preferredResolution === 720 && styles.resPillTextActive,
                ]}>
                720p (Eco / Zero-Lag)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.resPill,
                preferredResolution === 1080 && styles.resPillActive,
              ]}
              onPress={() => setResolution(1080)}>
              <Text
                style={[
                  styles.resPillText,
                  preferredResolution === 1080 && styles.resPillTextActive,
                ]}>
                1080p (Full HD)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Developer Attribution Card */}
      <View style={styles.devCard}>
        <Text style={styles.devTag}>CARPLAY &amp; ANDROID AUTO ARCHITECTURE</Text>
        <Text style={styles.devTitle}>Developed by Rajesh Patadiya</Text>
        <Text style={styles.devSubtitle}>
          Hardware MediaCodec &amp; VideoToolbox pipelines • VirtualDisplay Presentation • Full OTT Theater (YouTube, Hotstar, Netflix, Prime Video, Zee5).
        </Text>
      </View>

      {/* Quick Infotainment Stats */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionHeader}>PRODUCTION HARDENING</Text>
        <Text style={styles.infoRow}>• Media Engine: AndroidX Media3 ExoPlayer (Single Main-Thread)</Text>
        <Text style={styles.infoRow}>• Audio Focus: Active with Navigation Ducking (20%)</Text>
        <Text style={styles.infoRow}>• In-Car Touch: VirtualDisplay MotionEvent Injection Active</Text>
        <Text style={styles.infoRow}>• Persistent DRM: Widevine EME &amp; CookieManager Flush</Text>
        <Text style={styles.infoRow}>• Author: Rajesh Patadiya</Text>
      </View>
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
  statusCard: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  sectionHeader: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  badgeText: {
    color: '#F0F6FC',
    fontSize: 13,
    fontWeight: '600',
  },
  launchCarBtn: {
    backgroundColor: '#1F6FEB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  launchCarBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  playerCard: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  trackSubtitle: {
    color: '#8B949E',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  controlBtn: {
    backgroundColor: '#21262D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  primaryBtn: {
    backgroundColor: '#238636',
    paddingHorizontal: 28,
  },
  btnText: {
    color: '#F0F6FC',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resolutionContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#30363D',
  },
  resolutionLabel: {
    color: '#8B949E',
    fontSize: 12,
    marginBottom: 8,
  },
  resButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  resPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#21262D',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  resPillActive: {
    backgroundColor: '#1F6FEB',
    borderColor: '#58A6FF',
  },
  resPillText: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: '600',
  },
  resPillTextActive: {
    color: '#FFFFFF',
  },
  devCard: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
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
  devTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  devSubtitle: {
    color: '#8B949E',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  infoRow: {
    color: '#C9D1D9',
    fontSize: 13,
    lineHeight: 22,
  },
});
