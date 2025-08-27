import { View, Text, Button, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";
import { Image } from "expo-image";
import { wp } from "../helpers/common";
import { theme } from "../constants/theme";

const index = () => {

  return (
    <ScreenWrapper bg = {theme.colors.backgroundLight}>
      <View style = {styles.container}>
      <Image
        source={require("../assets/images/tap-prj.svg")}
        style={{ width: wp(100), height: wp(100), alignSelf: "center"}}
        contentFit="fill"
      />
      </View>
    </ScreenWrapper>
  );
};


export default index;

const styles = StyleSheet.create({
container: {
  flex: 1,
  justifyContent:'center',
  alignItems: 'center' 
}

})
