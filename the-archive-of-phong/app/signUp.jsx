import { StyleSheet, Text, TextInput, View, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import Button from '../components/Button'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { StatusBar } from 'react-native'
import { VT323_400Regular } from '@expo-google-fonts/vt323'
import { Image } from 'expo-image'
import { supabase } from '../lib/supabase'



// Component must be capitalized for React and hooks rules
const SignUp = () => {


  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const repasswordRef = useRef("");
  const [loading, setLoading] = useState(false);


  const router = useRouter();

  // After pressing Sign Up button
  const onSubmit = async () => {

    let name = nameRef.current.trim();
    let password = passwordRef.current.trim();
    let repassword = repasswordRef.current.trim();
    let email = emailRef.current.trim();

  setLoading(true);

    //SignUp form Validation
    try {
      if (!email || !name || !password || !repassword) {
        Alert.alert('Sign Up', 'Please fill all the fields');
        return;
      }
      if (password !== repassword) {
        Alert.alert("Passwords don't match", 'Please re-type your password');
        return;
      }
      if (name.length < 2) {
        Alert.alert('Invalid name', 'Name must be at least 2 characters long');
        return;
      }
      if (password.length < 8) {
        Alert.alert('Weak password', 'Password must be at least 8 characters long');
        return;
      }
      //SignUp - authenticate users 
      const { data: { user, session }, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (error) {
        console.error('Signup error:', error);
        Alert.alert('Sign Up Failed', error.message || 'Unknown error');
        return;
      }
      
      //Create a profile for users

      if (user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: email,
            name: name,
            email_verified: false,
            verification_status: 'unverified'
          });
        if (insertError) {
          console.error('User creation error:', insertError);
          // Don't show error to user as auth signup succeeded
          // They can still proceed to email verification
        }

        console.log('User created successfully, redirecting to code redemption...');
        
        // Redirect to code redemption page after successful signup
        router.replace('/codeRedemption');





  }

    } catch (error) {
      console.error('Unexpected signup error:', error);
      Alert.alert('Error', 'Something is wrong, please try again');
    } finally {
      setLoading(false)
    }




  }

  

  return (

    <ScreenWrapper bg={theme.colors.backgroundLight}>
      <View style={styles.container}>
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
          <Text style={styles.title}>Fill in the blank</Text>
        </View>
        <View style={styles.signUpContainer}>
          <Image
            source={require('../assets/images/tap-prj.svg')}
            style={{ width: wp(40), height: wp(40), alignSelf: 'center' }}
            contentFit='contain'
          />

          <View style={styles.inputContainer}>  
            <Text style={styles.infoText}>Full name: </Text>

            <TextInput
              style={styles.input}
              autoCapitalize='words'
              onChangeText={value => nameRef.current = value} //put the "Full name" into nameRef.current



            />

          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.infoText}>Email: </Text>

            <TextInput
              style={styles.input}
              keyboardType='email-address'
              onChangeText={value => emailRef.current = value} //put the email into emailRef.current

            />

          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.infoText}>Password: </Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              secureTextEntry = {true}
              onChangeText={value => passwordRef.current = value} //put the password into passwordRef
            />
          </View>
           <View style={styles.inputContainer}>
            <Text style={styles.infoText}>Re-type password: </Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              secureTextEntry = {true}
              onChangeText={value => repasswordRef.current = value} //put the password into passwordRef
            />
          </View>
          <Text style={styles.warningText}> Important: To access your school's feed, your registered name must match your school ID name exactly. If the names don't match, you may not be able to access the feed. </Text>
        </View>


        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Signing Up...' : 'Sign Up'}
            width={wp(90)}
            height={hp(7)}
            fontSize={hp(5)}
            disabled={loading}
            onPress={onSubmit}
          />

        </View>
        <Text style={styles.termsText}>
          By creating an account, you agree to our Terms of Service and Privacy Policy. {'\n'}
          For more infomation, visit thearchiveofphong.com.
        </Text>






      </View>
    </ScreenWrapper>
  )
}

export default SignUp

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
  signUpContainer: {
    alignSelf: 'center',
    width: wp(90),
    height: hp(50),
    backgroundColor: theme.colors.backgroundLight,
    position: 'relative',
    top: hp(10),
    borderWidth: wp(4),
    borderColor: theme.colors.orange,
    justifyContent: 'flex-start',
  },
  infoText: {
    fontFamily: 'VT323_400Regular',
    fontSize: wp(6),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  input: {
    borderBottomWidth: 1,
    flex: 1,
    paddingVertical: hp(0),
    fontFamily: 'VT323_400Regular',
    fontSize: wp(6),
    color: 'black'
  },
  warningText: {
    fontFamily: 'VT323_400Regular',
    fontSize: wp(3),
    textAlign: 'justify'
  },
  termsText: {
    fontSize: hp(1.3),
    color: 'black',
    textAlign: 'center',
    position: 'absolute',
    bottom: hp(1),
    width: wp(90),
    alignSelf: 'center'
  },
  buttonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: hp(10),
  }


})