import { Alert, StyleSheet, Text, TextInput, View, Pressable } from 'react-native'
import React, { useState, useRef } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import Ionicons from '@expo/vector-icons/Ionicons'
import { StatusBar } from 'react-native'
import { useRouter } from 'expo-router'
import { hp, wp } from '../helpers/common'
import Button from '../components/Button'
import { Image } from 'expo-image'
import { supabase } from '../lib/supabase'

const Login = () => {
    const router = useRouter();
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [loading, setLoading] = useState(false);
    
    const onSubmit = async () => {
      if (!emailRef.current || !passwordRef.current) {
        Alert.alert('Login', 'Please fill all the fields!');
        return;
      }
      
      let email = emailRef.current.trim();
      let password = passwordRef.current.trim();
      setLoading(true);
      
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          Alert.alert('Login Failed', error.message);
        }
        // Success handling is done by _layout.jsx auth state listener
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  return (
    <ScreenWrapper bg={theme.colors.backgroundLight}>
      <View style={styles.container}>
        <StatusBar barStyle={'dark-content'} />
        <View style={styles.backButtonContainer}>
          <Button
            width={wp(13)}
            height={wp(13)}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={30} color="black" />
          </Button>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Welcome Back</Text>
        </View>
        
        <View style={styles.loginContainer}>
          <Image
            source={require('../assets/images/tap-prj.svg')}
            style={{ width: wp(40), height: wp(40), alignSelf: 'center' }}
            contentFit='contain'
          />

          <View style={styles.inputContainer}>
            <Text style={styles.infoText}>Email: </Text>
            <TextInput
              style={styles.input}
              keyboardType='email-address'
              onChangeText={value => emailRef.current = value}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.infoText}>Password: </Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              secureTextEntry={true}
              onChangeText={value => passwordRef.current = value}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Signing In...' : 'Sign In'}
            width={wp(90)}
            height={hp(7)}
            fontSize={hp(5)}
            disabled={loading}
            onPress={onSubmit}
          />
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('signUp')}>
            <Text style={[styles.footerText, { color: theme.colors.orange, fontWeight: 'bold' }]}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  titleContainer: {
    position: 'relative',
    width: wp(90),
    top: hp(10),
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: hp(5),
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    left: wp(5),
    top: hp(1)
  },
  loginContainer: {
    alignSelf: 'center',
    width: wp(90),
    height: hp(40),
    backgroundColor: theme.colors.backgroundLight,
    position: 'relative',
    top: hp(10),
    borderWidth: wp(4),
    borderColor: theme.colors.orange,
    justifyContent: 'flex-start',
    padding: wp(5),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  input: {
    borderBottomWidth: 1,
    flex: 1,
    paddingVertical: hp(0),
    fontFamily: 'VT323_400Regular',
    fontSize: wp(6),
    color: 'black'
  },
  infoText: {
    fontFamily: 'VT323_400Regular',
    fontSize: wp(6),
  },
  buttonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: hp(15),
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: hp(5),
    width: wp(100),
    alignSelf: 'center',
  },
  footerText: {
    fontSize: hp(2),
    color: 'black',
    fontFamily: 'VT323_400Regular',
  }
})