import { StyleSheet, Text, TextInput, View, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import Button from '../components/Button'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { StatusBar } from 'react-native'
import { Image } from 'expo-image'
import { supabase } from '../lib/supabase'

const CodeRedemption = () => {
  const classCodeRef = useRef("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    let classCode = classCodeRef.current.trim();

    if (!classCode) {
      Alert.alert('Code Required', 'Please enter your class code');
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('=== CODE REDEMPTION DEBUG ===');
      console.log('Current user:', user?.id);
      console.log('Searching for code:', classCode);
      
      if (!user) {
        Alert.alert('Error', 'Please log in again');
        router.replace('/login');
        return;
      }

      // Search for the class code in public.class_codes table
      const { data: classData, error: searchError } = await supabase
        .from('class_codes')
        .select('*')
        .eq('code', classCode)
        .eq('active', true)
        .single();

      console.log('Search result:', classData);
      console.log('Search error:', searchError);
      console.log('============================');

      if (searchError || !classData) {
        console.error('Search error:', searchError);
        Alert.alert('Invalid Code', 'Class code not found or inactive. Please check and try again.');
        return;
      }

      // Check if code has expired
      if (classData.expires_at && new Date(classData.expires_at) < new Date()) {
        Alert.alert('Code Expired', 'This class code has expired. Please get a new code from your teacher.');
        return;
      }

      // Check if code has reached max usage
      if (classData.max_uses && classData.current_uses >= classData.max_uses) {
        Alert.alert('Code Full', 'This class code has reached its maximum usage limit. Please contact your teacher.');
        return;
      }

      // Update code usage count
      const { error: usageError } = await supabase
        .from('class_codes')
        .update({
          current_uses: (classData.current_uses || 0) + 1
        })
        .eq('id', classData.id);

      if (usageError) {
        console.error('Usage update error:', usageError);
        // Continue anyway - don't block user for usage count error
      }

      // Update user profile with the data that exists in your table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          class: classData.class_name,
          school: classData.school_name,
          class_code: classCode,
          // Skip verification_status for now due to constraint
        })
        .eq('id', user.id);
      
      console.log('User update result:', updateError);

      if (updateError) {
        console.error('Update error:', updateError);
        Alert.alert('Error', 'Failed to verify code. Please try again.');
        return;
      }

      // Success - redirect to main app
      Alert.alert(
        'Success!',
        `Welcome to ${classData.class_name} at ${classData.school_name}!`,
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(main)/home')
          }
        ]
      );

    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.backgroundLight}>
      <View style={styles.container}>
        <StatusBar barStyle={'dark-content'} />
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Enter Your Class Code</Text>
        </View>

        <View style={styles.formContainer}>
          <Image
            source={require('../assets/images/tap-prj.svg')}
            style={{ width: wp(40), height: wp(40), alignSelf: 'center' }}
            contentFit='contain'
          />

          <View style={styles.inputContainer}>
            <Text style={styles.infoText}>Class Code: </Text>
            <TextInput
              style={styles.input}
              autoCapitalize="characters"
              onChangeText={value => classCodeRef.current = value}
            />
          </View>

          <Text style={styles.helperText}>
            Get this code from your friend to access your class/school feed.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Verifying...' : 'Continue'}
            width={wp(90)}
            height={hp(7)}
            fontSize={hp(5)}
            disabled={loading}
            onPress={onSubmit}
          />
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default CodeRedemption

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
  formContainer: {
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
    marginBottom: hp(1),
  },
  input: {
    borderBottomWidth: 1,
    flex: 1,
    paddingVertical: hp(1),
    fontFamily: 'VT323_400Regular',
    fontSize: wp(5),
    color: 'black'
  },
  infoText: {
    fontFamily: 'VT323_400Regular',
    fontSize: wp(5),
    marginRight: wp(2),
  },
  helperText: {
    fontFamily: 'VT323_400Regular',
    fontSize: wp(3.5),
    textAlign: 'center',
    marginTop: hp(4),
    color: theme.colors.text,
  },
  buttonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: hp(10),
  }
})