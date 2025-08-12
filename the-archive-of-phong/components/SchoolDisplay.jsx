import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { useFonts } from 'expo-font';

const SchoolDisplay = () => {
  const { user } = useAuth();
    const [fontsLoaded] = useFonts({ VT323_400Regular });
  if (!user) {
    return (
      <View style={styles.wrapper}>
        <ActivityIndicator size="small" color={theme.colors.black} />
      </View>
    );
  }

  const school = user.school;

  return (
    <View style={[styles.wrapper, !school && styles.missing]}>
      <Text style={[styles.schoolText, !school && styles.placeholder]}>
        {school}
      </Text>
    </View>
  );
};

export default SchoolDisplay;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    maxWidth: wp(65),
    top: hp(1)
  },
  missing: {
    backgroundColor: '#ffe9cc',
  },
  schoolText: {
    fontFamily: 'VT323_400Regular', // per request
    fontSize: hp(2),
    color: theme.colors.black,
    alignItems: 'center',
    alignSelf: 'center',
    textAlign: 'center'
  },
  placeholder: {
    
  },
});