import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
const postView = () => {
  return (
    <ScreenWrapper bg={theme.colors.backgroundLight}>
    <Text>Hello</Text>
    </ScreenWrapper>
  )
}

export default postView

const styles = StyleSheet.create({})