import { Alert, StyleSheet, Text, TextInput, View, Pressable } from 'react-native'
import React, { useState, useRef } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import Icon from '../assets/icons'
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import { useRouter } from 'expo-router'
import { hp, wp } from '../helpers/common'
import Input from '../components/Input'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

const Login = () => {
    const router = useRouter();
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [loading, setLoading] = useState(false);
    const onSubmit = async ()=>{
      if (!emailRef.current || !passwordRef.current){
        Alert.alert('Login', 'please fill all the fields!');
        return;
      }
      let email = emailRef.current.trim();
      let password = passwordRef.current.trim();
      setLoading(true);
      const {error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('error', error);
      if (error){
        Alert.alert('Login', error.message);
      }

    }
  return (
    <ScreenWrapper bg = {theme.colors.background}>
      <StatusBar style = 'dark' />
      <View style={styles.container}>
        <BackButton router ={router} />
        {/**welcome Text */}
        <View>
            <Text style = {styles.welcomeText}> Eyyyy,</Text>
            <Text style = {styles.welcomeText}> quay lại rồi hả?</Text>
        </View>




        {/**form Text */}
        <View style = {styles.form}>
          <Text style = {{fontSize: hp(1.5), color: theme.colors.text}}>
            Xin hãy tiếp tục
          </Text>
          <Input
            icon = {<Icon name = "mail" size={26} strokeWidth={1.6}/>}
            placeholder = 'Email đăng kí'
            onChangeText = {value =>emailRef.current = value}

          />
          <Input
            icon = {<Icon name = "lock" size={26} strokeWidth={1.6}/>}
            placeholder = 'Mật khẩu'
            secureTextEntry
            onChangeText = {value =>passwordRef.current = value}
          />
          <Text style = {styles.forgotPassword}>Quên mật khẩu?</Text>
          {/**button */}
          <Button title ={'Đăng nhập'} loading = {loading} onPress = {onSubmit} />

          {/**footer */}
          <View style = {styles.footer}>
            <Text style = {styles.footerText}>Không có tài khoản?</Text>
            <Pressable onPress={() => router.push('signUp')}>
              <Text style = {[styles.footerText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>Đăng kí</Text>
            </Pressable>

          </View>



        </View>


      </View>
      




    </ScreenWrapper>

    
  )
}

export default Login

const styles = StyleSheet.create({
  container:{
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
    
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form:{
    gap:25,
  },
  forgotPassword:{
    textAlign: 'right',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text
  },
  footer:{
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText:{
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6)
  }



})