import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useCarMediaStore} from '../store/useCarMediaStore';
import {MediaQueueItem} from '../specs/NativeCarMediaBridge';

export const HotstarScreen: React.FC = () => {
  const [authToken, setAuthToken] = useState('eyJh...autoSessionToken');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const {playTrack} = useCarMediaStore();

  const handleLaunchOttStream = () => {
    const ottItem: MediaQueueItem = {
      id: 'ott_widevine_1',
      title: 'Premium OTT VOD Stream (DRM Protected)',
      artist: 'Widevine Modular / FairPlay',
      uri: 'https://storage.googleapis.com/wvmedia/cenc/h264/tears/tears.mpd',
      streamType: 'hotstar',
    };
    playTrack(ottItem);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>OTT PLATFORM PORTAL</Text>
      <Text style={styles.subtext}>
        Widevine Modular &amp; FairPlay Streaming with virtual display HDCP safe fallback.
      </Text>

      {/* Session Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Session Authentication</Text>
        <Text style={styles.cardStatus}>
          Status: <Text style={{color: isLoggedIn ? '#2ECC71' : '#E74C3C'}}>{isLoggedIn ? 'Authenticated' : 'Logged Out'}</Text>
        </Text>

        <TextInput
          style={styles.input}
          value={authToken}
          onChangeText={setAuthToken}
          placeholder="JWT Auth Token"
          placeholderTextColor="#8B949E"
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setIsLoggedIn(!isLoggedIn)}>
          <Text style={styles.btnText}>
            {isLoggedIn ? 'Refresh OTT Token' : 'Log In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DRM Engine Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>DRM &amp; Projection Engine</Text>
        <Text style={styles.bullet}>• Android Auto: Widevine L3 software decrypt to projection Surface</Text>
        <Text style={styles.bullet}>• Apple CarPlay: FairPlay Streaming via AVContentKeySession</Text>
        <Text style={styles.bullet}>• Anti-Black Screen: HDCP Virtual Display fallback active</Text>

        <TouchableOpacity
          style={styles.launchBtn}
          onPress={handleLaunchOttStream}>
          <Text style={styles.launchBtnText}>Stream OTT to Vehicle Screen</Text>
        </TouchableOpacity>
      </View>
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
  card: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardStatus: {
    color: '#C9D1D9',
    fontSize: 13,
    marginBottom: 12,
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
    marginBottom: 10,
  },
  toggleBtn: {
    backgroundColor: '#21262D',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#58A6FF',
    fontWeight: '600',
    fontSize: 13,
  },
  bullet: {
    color: '#8B949E',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 4,
  },
  launchBtn: {
    backgroundColor: '#238636',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  launchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
