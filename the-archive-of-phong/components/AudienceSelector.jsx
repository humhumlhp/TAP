// components/AudienceSelector.jsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hp, wp } from '../helpers/common';

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
        <Ionicons 
          name="school-outline" 
          size={20} 
          color={targetAudience === 'school' ? 'black' : 'white'} 
        />
        <Text style={[
          styles.audienceText, 
          targetAudience === 'school' && styles.activeAudienceText
        ]}>
          Trường
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.audienceButton, 
          targetAudience === 'class' && styles.activeAudienceButton
        ]}
        onPress={() => handleAudienceChange('class')}
      >
        <Ionicons 
          name="people-outline" 
          size={20} 
          color={targetAudience === 'class' ? 'black' : 'white'} 
        />
        <Text style={[
          styles.audienceText, 
          targetAudience === 'class' && styles.activeAudienceText
        ]}>
          Lớp
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.audienceButton, 
          targetAudience === 'yourself' && styles.activeAudienceButton
        ]}
        onPress={() => handleAudienceChange('yourself')}
      >
        <Ionicons 
          name="person-outline" 
          size={20} 
          color={targetAudience === 'yourself' ? 'black' : 'white'} 
        />
        <Text style={[
          styles.audienceText, 
          targetAudience === 'yourself' && styles.activeAudienceText
        ]}>
          Cá nhân
        </Text>
      </TouchableOpacity>
    </View>
  </View>
  );
};

export default AudienceSelector;

const styles = StyleSheet.create({
  // Target Audience Selector
  audienceSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: 50,
    gap: 8,
    backgroundColor: '#272727ff',
    marginVertical: hp(1)
  },
  audienceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
    minWidth: 80,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  activeAudienceButton: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  audienceText: {
    color: 'white',
    fontSize: hp(1.4),
    fontWeight: '500',
  },
  activeAudienceText: {
    color: 'black',
  },
});