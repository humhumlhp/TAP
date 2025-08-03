import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { hp, wp } from '../helpers/common'

const AudienceSelector = () => {
  return (
    <View style = {styles.container}>
      <Text>AudienceControl</Text>
      {/* School Icon */}
      {/* Class Icon */}
      {/* Personal Icon */}



    </View>
  )
}

export default AudienceSelector

const styles = StyleSheet.create({
  container: {
      width: wp(50),
      height: hp(6),
      marginVertical: hp(1),
      // marginHorizontal: wp(),
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 1)',
      alignSelf: 'center',
  },
}
)