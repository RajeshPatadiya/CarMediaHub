import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useCarMediaStore} from '../store/useCarMediaStore';

const PRESET_DESTINATIONS = [
  {name: 'Tech Campus & Innovation Park', lat: 37.422, lng: -122.084},
  {name: 'City Center Automotive Supercharger', lat: 37.7749, lng: -122.4194},
  {name: 'Coastal Highway Scenic Lookout', lat: 36.5785, lng: -121.9438},
];

export const NavigationScreen: React.FC = () => {
  const {setNavigationTarget, activeNavigationDestination} = useCarMediaStore();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>TURN-BY-TURN NAVIGATION</Text>
      <Text style={styles.subtext}>
        Split-screen dashboard navigation coordinated with media controls.
      </Text>

      {activeNavigationDestination && (
        <View style={styles.activeCard}>
          <Text style={styles.activeLabel}>ACTIVE VEHICLE ROUTE</Text>
          <Text style={styles.activeTitle}>{activeNavigationDestination.name}</Text>
          <Text style={styles.activeCoords}>
            Coordinates: {activeNavigationDestination.lat.toFixed(4)},{' '}
            {activeNavigationDestination.lng.toFixed(4)}
          </Text>
        </View>
      )}

      <Text style={[styles.header, {marginTop: 16, marginBottom: 8}]}>
        SELECT DESTINATION
      </Text>
      <FlatList
        data={PRESET_DESTINATIONS}
        keyExtractor={item => item.name}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.destCard}
            onPress={() => setNavigationTarget(item.name, item.lat, item.lng)}>
            <View style={{flex: 1}}>
              <Text style={styles.destTitle}>{item.name}</Text>
              <Text style={styles.destCoords}>
                {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
              </Text>
            </View>
            <Text style={styles.navActionText}>Project ➔</Text>
          </TouchableOpacity>
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
  activeCard: {
    backgroundColor: '#0D2214',
    borderColor: '#238636',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  activeLabel: {
    color: '#2ECC71',
    fontSize: 11,
    fontWeight: '700',
  },
  activeTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  activeCoords: {
    color: '#8B949E',
    fontSize: 12,
    marginTop: 2,
  },
  destCard: {
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  destTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  destCoords: {
    color: '#8B949E',
    fontSize: 12,
    marginTop: 2,
  },
  navActionText: {
    color: '#58A6FF',
    fontWeight: '700',
    fontSize: 14,
  },
});
