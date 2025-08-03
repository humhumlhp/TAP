import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { hp, wp } from '../../helpers/common'

const CameraControl = () => {
  return (
    <View style={styles.container}>
      <Text>CameraControl</Text>
    </View>
  )
}

export default CameraControl

const styles = StyleSheet.create({
  container: {
    width: wp(25),
    height: wp(25),
    marginVertical: hp(4),
    // marginHorizontal: wp(),
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',
    alignSelf: 'center',
  }


})