import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { hp } from '../../helpers/common'

const FeedSwipe = () => {
  return (
    <View>
      <Text style = {styles.text}> Tap của bạn khác </Text>
    </View>
  )
}

export default FeedSwipe

const styles = StyleSheet.create({
  text: {
    color: 'white',
    alignSelf: 'center',
    marginVertical: hp(4),
    fontSize: hp(2)
  }
})