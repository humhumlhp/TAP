// components/AudienceSelector.jsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import { VT323_400Regular } from '@expo-google-fonts/vt323';

const AudienceSelector = ({ 
  targetAudience, 
  onAudienceChange 
}) => {
  
  // Handle target audience change
  const handleAudienceChange = (audience) => {
    onAudienceChange(audience); // Call parent function
  };

  return (
  <View style = {styles.container}>
    <View style={styles.audienceSelector}>
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
  );
};

export default AudienceSelector;

const styles = StyleSheet.create({
  // Target Audience Selector
  container:{
    width: wp(90),
    alignSelf: 'center'
  },
  audienceSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%'
  },
  audienceButton: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(1),
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: theme.colors.orange,
    alignItems: 'center',
  },
  activeAudienceButton: {
    backgroundColor: 'black',
    borderColor: theme.colors.orange,
  },
  audienceText: {
    color: 'white',
    fontSize: hp(2.5),
    fontFamily: 'VT323_400Regular'
  },
  activeAudienceText: {
    color: theme.colors.orange,
  },
});