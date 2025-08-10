import React from 'react'
import { StyleSheet, View, Text, StatusBar, Image, Pressable, ActivityIndicator} from 'react-native'
import ScreenWrapper from '../components/ScreenWrapper'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'
import {VT323_400Regular} from '@expo-google-fonts/vt323'
import { useFonts } from 'expo-font'

const Welcome = () => {
  const [fontsLoaded] = useFonts({
    VT323_400Regular
  });
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading fonts...</Text>
      </View>
    );
  }
  const router = useRouter();
  return (
    <ScreenWrapper bg = {theme.colors.backgroundLight}>
      <StatusBar style = "dark" />
      <View style = {styles.container}>
          {/** welcome image */}
          {/** title */}
          <View style={styles.titleContainer}>
          <Text style={styles.title}>
            The Archive of Phong
          </Text>
      </View>
      <View style = {styles.footer}>
        <Button 
        title = "START"
        // buttonStyle = {{marginHorizontal: wp(2)}}
        onPress={()=> router.push('signUp')}
        />
        <View style = {styles.bottomTextContainer }>
          <Text style = {styles.loginText}>
            Bạn đã có tài khoản?
          </Text>
          <Pressable onPress={() => router.push('login')}>
          <Text style = {[styles.loginText, {color:theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>
           Đăng nhập
          </Text>
        </Pressable>
        </View> 
        


      </View>



      
      </View>
    </ScreenWrapper>
  )
}

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.backgroundLight,
    marginHorizontal: wp(4)
  },
  titleContainer: {
    alignItems:'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(12),
    textAlign: 'left',
    left: wp(3),
    fontFamily: "VT323_400Regular",
  },
  punchline: {
    textAlign: 'center',
    paddingHorizontal: wp(10),
    fontSize: hp(1.7),
    color: theme.colors.text,

  },
  footer: {
    gap: 30,
    width: '100%'
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  loginText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6),

  }

});
