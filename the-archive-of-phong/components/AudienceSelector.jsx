// components/AudienceSelector.jsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { useFonts } from 'expo-font';

const AudienceSelector = ({
  targetAudience,
  onAudienceChange
}) => {

  // Handle target audience change
  const handleAudienceChange = (audience) => {
    onAudienceChange(audience); // Call parent function
  };
  const [fontsLoaded] = useFonts({ VT323_400Regular });
  if (!fontsLoaded) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading fonts...</Text>
        </View>
      );
    }
  return (
    <View style={styles.container}>
      <View style={styles.audienceSelector}>
        {/* Shadow/button pair */}
        <View style={styles.shadowWrapper}>
          <View style={styles.shadowLayer} />
          <TouchableOpacity
            style={[
              styles.audienceButton,
              targetAudience === 'school' && styles.activeAudienceButton
            ]}
            onPress={() => handleAudienceChange('school')}
          >
            <Text style={[
              styles.audienceText,
              targetAudience === 'school' && styles.activeAudienceText
            ]}>
              SCHOOL
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.shadowWrapper}>
          <View style={styles.shadowLayer} />
          <TouchableOpacity
            style={[
              styles.audienceButton,
              targetAudience === 'class' && styles.activeAudienceButton
            ]}
            onPress={() => handleAudienceChange('class')}
          >
            <Text style={[
              styles.audienceText,
              targetAudience === 'class' && styles.activeAudienceText
            ]}>
              CLASS
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.shadowWrapper}>
          <View style={styles.shadowLayer} />
          <TouchableOpacity
            style={[
              styles.audienceButton,
              targetAudience === 'yourself' && styles.activeAudienceButton
            ]}
            onPress={() => handleAudienceChange('yourself')}
          >
            <Text style={[
              styles.audienceText,
              targetAudience === 'yourself' && styles.activeAudienceText
            ]}>
              PERSONAL
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AudienceSelector;

const styles = StyleSheet.create({
  // Target Audience Selector
  container: {
    width: wp(90),
    alignSelf: 'center',
    // Pull selector upward without changing surrounding component layout
    marginTop: -hp(10),
  },
  audienceSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  shadowWrapper: {
    position: 'relative'
  },
  shadowLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    transform: [{ translateX: 4 }, { translateY: 5 }],
    zIndex: 0,
    borderWidth: 2,
    borderColor: 'black'
  },
  audienceButton: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(1),
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: theme.colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  activeAudienceButton: {
    backgroundColor: 'black',
    borderColor: theme.colors.orange,
  },
  audienceText: {
    color: 'black',
    fontSize: hp(2.6),
    fontFamily: 'VT323_400Regular'
  },
  activeAudienceText: {
    color: theme.colors.orange,
  },
});