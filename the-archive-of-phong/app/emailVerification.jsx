import { StyleSheet, Text, TextInput, View, Alert } from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Button from "../components/Button";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "react-native";
import { VT323_400Regular } from "@expo-google-fonts/vt323";
import { Image } from "expo-image";
import { supabase } from "../lib/supabase";

// Component must be capitalized for React and hooks rules
const EmailVerification = () => {
  const router = useRouter();

  // After pressing Sign Up button
  const onSubmit = async () => {};

  return (
    <ScreenWrapper bg={theme.colors.backgroundLight}>
      <View style={styles.container}>
        <StatusBar barStyle={"dark-content"} />
        <View style={styles.backButtonContainer}>
          <Button width={wp(13)} height={wp(13)} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </Button>
        </View>


        <View style = {styles.resendContainer}>
        <Text style = {styles.textContainer}>
          Please check your email for verification link.
        </Text>
        <View style = {styles.buttonContainer} >
        <Button 
          width={wp(90)}
          height={hp(7)}
          title="Resend email"
        
        
        
        
        />
        </View>
        </View>




        
      </View>
    </ScreenWrapper>
  );
};

export default EmailVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    position: "relative",
    width: wp(90),
    top: hp(10),
    alignSelf: "center",
    alignItems: "center",
  },
  title: {
    fontSize: hp(5),
    fontFamily: "VT323_400Regular",
    textAlign: "center",
  },
  backButtonContainer: {
    position: "absolute",
    left: wp(5),
    top: hp(1),
  },
  textContainer: {
    position: 'absolute',
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    alignSelf: 'center',
    top: hp(30),
    fontSize: wp(10)
  },
  buttonContainer: {
    position: 'absolute',
    top: hp(40),
    alignSelf: 'center'
  },

});
