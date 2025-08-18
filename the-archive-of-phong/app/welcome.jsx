import React from 'react'
import { StyleSheet, View, Text, StatusBar, Pressable, ActivityIndicator } from 'react-native'
import ScreenWrapper from '../components/ScreenWrapper'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'
import { VT323_400Regular } from '@expo-google-fonts/vt323'
import { useFonts } from 'expo-font'
import { SvgXml } from 'react-native-svg'
import { Image } from 'expo-image'

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
    <ScreenWrapper bg={theme.colors.backgroundLight}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/** welcome image */}
        {/** title */}
        <View style={styles.titleContainer}>
          <Image
            source={require('../assets/images/tap-prj.svg')}
            style={{ width: wp(120), height: wp(120) }}
            contentFit='fill'
          />
        </View>
        <View style={styles.footer}>
          <Button
            width={wp(80)}
            height={hp(6)}
            fontSize={hp(5)}
            top={-hp(.5)}
            title="START"
            // buttonStyle = {{marginHorizontal: wp(2)}}
            onPress={() => router.push('signUp')}
          />
          <View style={styles.bottomTextContainer}>
            <Text style={styles.loginText}>
              Already got an account?
            </Text>
            <Pressable onPress={() => router.push('login')}>
              <Text style={[styles.loginText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>
                Login
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
    backgroundColor: theme.colors.backgroundLight,
  },
  titleContainer: {
    alignItems: 'center',
    top: hp(10),
  },
  footer: {
    position: 'absolute',
    top: hp(70),
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
