import { Alert, StyleSheet, Text, TextInput, View, Pressable, Modal } from 'react-native'
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
import ClassChoiceList from '../components/ClassChoiceList'; // Import your new component

const SignUp = () => {
    const router = useRouter();
    const emailRef = useRef("");
    const nameRef = useRef("");
    const passwordRef = useRef("");
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classModalVisible, setClassModalVisible] = useState(false);

const onSubmit = async ()=>{
  if (!emailRef.current || !passwordRef.current || !selectedClass) {
    Alert.alert('SignUp', 'please fill all the fields!');
    return;
  }

  let name = nameRef.current.trim();
  let email = emailRef.current.trim();
  let password = passwordRef.current.trim();

  setLoading(true);

  // First, sign up the user
  const { data: { user, session }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        // Keep metadata if needed
      },
    },
  });

  if (signUpError) {
    setLoading(false);
    Alert.alert('Sign up', signUpError.message);
    return;
  }

  // Then, update the users table with the class
  if (user) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ class: selectedClass })
      .eq('id', user.id);

    if (updateError) {
      Alert.alert('Update Error', updateError.message);
    }
  }

  setLoading(false);
}
    // const onSubmit = async ()=>{
    //   if (!emailRef.current || !passwordRef.current || !selectedClass) {
    //     Alert.alert('SignUp', 'please fill all the fields!');
    //     return;
    //   }
    //   // good to go
    //   let name = nameRef.current.trim();
    //   let email = emailRef.current.trim();
    //   let password = passwordRef.current.trim();

    //   setLoading(true);

    //   const {data: {session}, error} = await supabase.auth.signUp({
    //     email,
    //     password,
    //     options: {
    //       data: {
    //         name,
    //         class: selectedClass, // Save the class in user metadata
    //       },
    //     },
    //   })
    //   setLoading(false);
    //   //console.log('session: ', session);
    //   //console.log('error: ', error);
    //   if (error){
    //     Alert.alert('Sign up', error.message);
    //   }

    // }
  return (
    <ScreenWrapper bg={theme.colors.background}>
      <StatusBar style = 'dark' />
      <View style={styles.container}>
        <BackButton router ={router} />
        {/**welcome Text */}
        <View>
            <Text style = {styles.welcomeText}> Phần 1: </Text>
            <Text style = {styles.welcomeText}> Điền vào chỗ trống</Text>
        </View>
      



        {/**form Text */}
        <View style = {styles.form}>
          <Text style = {{fontSize: hp(1.5), color: theme.colors.text}}>
            Xin vui lòng điền đầy đủ thông tin
          </Text>
          <Input
            icon = {<Icon name = "user" size={26} strokeWidth={1.6}/>}
            placeholder = 'Họ và tên khớp với thẻ học sinh'
            onChangeText = {value => nameRef.current = value}

          />

          <Input
            icon = {<Icon name = "mail" size={26} strokeWidth={1.6}/>}
            placeholder = 'Email'
            onChangeText = {value =>emailRef.current = value}

          />
          <Input
            icon = {<Icon name = "lock" size={26} strokeWidth={1.6}/>}
            placeholder = 'Mật khẩu'
            secureTextEntry
            onChangeText = {value =>passwordRef.current = value}
          />
          {/* Class selection styled like Input */}
          <Pressable
            style={styles.inputlist}
            onPress={() => setClassModalVisible(true)}
          >
            <Icon name="users" size={26} strokeWidth={1.6} />
            <Text style={{ color: theme.colors.text, fontSize: hp(1.5) }}>
              {selectedClass ? `Lớp: ${selectedClass}` : 'Chọn lớp của bạn'}
            </Text>
          </Pressable>
          {/* Modal for class selection */}
          <Modal
            visible={classModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setClassModalVisible(false)}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 20,
                width: '80%'
              }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Chọn lớp</Text>
                <ClassChoiceList
                  onSelect={cls => {
                    setSelectedClass(cls);
                    setClassModalVisible(false);
                  }}
                />
                <Pressable onPress={() => setClassModalVisible(false)} style={{ marginTop: 16 }}>
                  
                  <Text style={{ color: theme.colors.primaryDark, textAlign: 'center' }}>Đóng</Text>
               
                </Pressable>
              </View>
            </View>
          </Modal>
          {/**button */}
          <Button title ={'Đăng kí'} loading = {loading} onPress = {onSubmit} />  

          {/**footer */}
          <View style = {styles.footer}>
            <Text style = {styles.footerText}>Đã có tài khoản?</Text>
            <Pressable onPress={() => router.push('login')}>
              <Text style = {[styles.footerText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>Đăng nhập</Text>
            </Pressable>

          </View>



        </View>


      </View>
      




    </ScreenWrapper>

    
  )
}

export default SignUp

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
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    marginTop: 10,
  },
  inputlist: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 0.4,
  borderColor: theme.colors.text,
  borderRadius: theme.radius.xxl,
  borderCurve: 'continuous',
  padding: 25,
  paddingHorizontal: 20,
  gap: 15,
  marginBottom: 10,
},
})