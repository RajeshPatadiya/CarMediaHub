import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {HomeScreen} from './src/screens/HomeScreen';
import {LocalVideosScreen} from './src/screens/LocalVideosScreen';
import {YouTubeScreen} from './src/screens/YouTubeScreen';
import {OTTPlatformScreen} from './src/screens/OTTPlatformScreen';
import {NavigationScreen} from './src/screens/NavigationScreen';

type TabType = 'home' | 'local' | 'youtube' | 'ott' | 'nav';

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'local':
        return <LocalVideosScreen />;
      case 'youtube':
        return <YouTubeScreen />;
      case 'ott':
        return <OTTPlatformScreen />;
      case 'nav':
        return <NavigationScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Automotive Brand Header */}
      <View style={styles.appHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.brandTitle}>CARMEDIA HUB</Text>
          <View style={styles.devPill}>
            <Text style={styles.devPillText}>Rajesh Patadiya</Text>
          </View>
        </View>
        <Text style={styles.brandSub}>CarPlay &amp; Android Auto Infotainment • Developed by Rajesh Patadiya</Text>
      </View>

      {/* Screen Container */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Dark Theme Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'home' && styles.activeTabItem]}
          onPress={() => setActiveTab('home')}>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'home' && styles.activeTabLabel,
            ]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'local' && styles.activeTabItem]}
          onPress={() => setActiveTab('local')}>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'local' && styles.activeTabLabel,
            ]}>
            Local
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'youtube' && styles.activeTabItem,
          ]}
          onPress={() => setActiveTab('youtube')}>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'youtube' && styles.activeTabLabel,
            ]}>
            Streams
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'ott' && styles.activeTabItem,
          ]}
          onPress={() => setActiveTab('ott')}>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'ott' && styles.activeTabLabel,
            ]}>
            OTT All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'nav' && styles.activeTabItem]}
          onPress={() => setActiveTab('nav')}>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'nav' && styles.activeTabLabel,
            ]}>
            Nav
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E14',
  },
  appHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0D1117',
    borderBottomWidth: 1,
    borderBottomColor: '#21262D',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  devPill: {
    backgroundColor: '#238636',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  devPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandSub: {
    color: '#8B949E',
    fontSize: 11,
    marginTop: 2,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0D1117',
    borderTopWidth: 1,
    borderTopColor: '#21262D',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeTabItem: {
    backgroundColor: '#161B22',
  },
  tabLabel: {
    color: '#8B949E',
    fontSize: 11,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#58A6FF',
    fontWeight: '700',
  },
});

export default App;
