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

interface OTTService {
  id: string;
  name: string;
  category: string;
  color: string;
  url: string;
  preferredUa: 'desktop' | 'mobile' | 'tv';
  description: string;
}

const OTT_SERVICES: OTTService[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Free & Premium Video',
    color: '#FF0000',
    url: 'https://m.youtube.com',
    preferredUa: 'mobile',
    description: 'Ad-friendly touch interface with 720p/1080p resolution switching.',
  },
  {
    id: 'hotstar',
    name: 'Disney+ Hotstar',
    category: 'Movies, Series & Sports',
    color: '#1F6FEB',
    url: 'https://www.hotstar.com',
    preferredUa: 'desktop',
    description: 'Widevine EME DRM streaming with persistent login sessions.',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Originals & Feature Films',
    color: '#E50914',
    url: 'https://www.netflix.com',
    preferredUa: 'desktop',
    description: 'Hardware-accelerated web streaming on in-car display.',
  },
  {
    id: 'primevideo',
    name: 'Amazon Prime Video',
    category: 'Global Movies & TV',
    color: '#00A8E1',
    url: 'https://www.primevideo.com',
    preferredUa: 'desktop',
    description: 'Full-screen theater mode with persistent login cookies.',
  },
  {
    id: 'zee5',
    name: 'Zee5',
    category: 'Regional Cinema & Live Shows',
    color: '#8E44AD',
    url: 'https://www.zee5.com',
    preferredUa: 'desktop',
    description: 'Zero-lag Indian regional & live streaming on car head unit.',
  },
];

export const OTTPlatformScreen: React.FC = () => {
  const {
    currentWebUrl,
    userAgentMode,
    loadWebUrlOnCar,
    injectWebAction,
    setUserAgentMode,
  } = useCarMediaStore();

  const [inputUrl, setInputUrl] = useState('https://m.youtube.com');

  const handleLaunchService = (service: OTTService) => {
    setInputUrl(service.url);
    setUserAgentMode(service.preferredUa);
    loadWebUrlOnCar(service.url, service.preferredUa);
    Alert.alert(
      'Streaming to Car Screen',
      `Projecting ${service.name} to vehicle head unit.\n\nDeveloped by Rajesh Patadiya`,
      [{text: 'OK'}]
    );
  };

  const handleCustomGo = () => {
    let target = inputUrl.trim();
    if (!target) return;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    loadWebUrlOnCar(target, userAgentMode);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>OTT &amp; IN-CAR WEB BROWSER ENGINE</Text>
      <Text style={styles.subtext}>
        Universal web streaming container rendered onto the car head-unit Presentation layer with Widevine EME &amp; persistent cookies.
      </Text>

      {/* Developer Attribution Card */}
      <View style={styles.devCard}>
        <Text style={styles.devTag}>VEHICLE PRESENTATION LAYER</Text>
        <Text style={styles.devName}>Developed by Rajesh Patadiya</Text>
        <Text style={styles.devSub}>
          VirtualDisplay MotionEvent Forwarding • CookieManager Persistence • EME DRM Enabled
        </Text>
      </View>

      {/* In-Car Interactive URL Bar */}
      <View style={styles.browserCard}>
        <Text style={styles.sectionTitle}>CAR BROWSER ADDRESS BAR</Text>
        <View style={styles.urlInputRow}>
          <TextInput
            style={styles.urlInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="Enter URL or search..."
            placeholderTextColor="#8B949E"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.goBtn} onPress={handleCustomGo}>
            <Text style={styles.goBtnText}>Go ➔</Text>
          </TouchableOpacity>
        </View>

        {/* In-Car Web Control Bar */}
        <View style={styles.webControlRow}>
          <TouchableOpacity
            style={styles.controlPill}
            onPress={() => injectWebAction('back')}>
            <Text style={styles.controlPillText}>◀ Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlPill}
            onPress={() => injectWebAction('forward')}>
            <Text style={styles.controlPillText}>Forward ▶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlPill}
            onPress={() => injectWebAction('reload')}>
            <Text style={styles.controlPillText}>↻ Reload</Text>
          </TouchableOpacity>

          {/* User-Agent Selector */}
          <TouchableOpacity
            style={[styles.controlPill, styles.uaPill]}
            onPress={() => {
              const nextUa = userAgentMode === 'desktop' ? 'mobile' : userAgentMode === 'mobile' ? 'tv' : 'desktop';
              setUserAgentMode(nextUa);
              injectWebAction(nextUa);
            }}>
            <Text style={styles.uaPillText}>UA: {userAgentMode.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Supported OTT Services */}
      <Text style={[styles.sectionTitle, {marginTop: 18, marginBottom: 10}]}>
        PRESET IN-CAR CHANNELS
      </Text>

      {OTT_SERVICES.map(service => {
        const isCurrent = currentWebUrl === service.url;
        return (
          <View
            key={service.id}
            style={[
              styles.serviceCard,
              {borderLeftColor: service.color, borderLeftWidth: 4},
              isCurrent && styles.activeServiceCard,
            ]}>
            <View style={styles.serviceHeader}>
              <View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceCategory}>{service.category}</Text>
              </View>
              <TouchableOpacity
                style={[styles.launchBtn, {backgroundColor: service.color}]}
                onPress={() => handleLaunchService(service)}>
                <Text style={styles.launchBtnText}>
                  {isCurrent ? 'Active on Car' : 'Play on Head Unit'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.serviceDesc}>{service.description}</Text>
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
  browserCard: {
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
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#0D1117',
    color: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  goBtn: {
    backgroundColor: '#1F6FEB',
    borderRadius: 6,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  webControlRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  controlPill: {
    flex: 1,
    backgroundColor: '#21262D',
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  controlPillText: {
    color: '#F0F6FC',
    fontSize: 11,
    fontWeight: '600',
  },
  uaPill: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
  },
  uaPillText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  serviceCard: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  activeServiceCard: {
    backgroundColor: '#0D2214',
    borderColor: '#238636',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  serviceCategory: {
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
  serviceDesc: {
    color: '#8B949E',
    fontSize: 12,
    lineHeight: 18,
  },
});
