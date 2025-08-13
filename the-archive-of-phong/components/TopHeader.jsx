import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { hp, wp } from '../helpers/common'
import { router } from 'expo-router'
import Button from './Button'

const TopHeader = () => {
    return (
        <View style={styles.topHeader}>
            {/* Profile picture or Default User icon */}
            <Button 
                width = {wp(13)}
                height={wp(13)}
                onPress={() => router.push('profile')}
            >
                <Ionicons name = 'person' size = {wp(8)} color = 'black' />
            </Button>

            {/* Notification icon
            <Button
                width = {wp(13)}
                height={wp(13)}
                onPress={() => router.push('notifications')}
            >
                <Ionicons name = 'notifications' size = {wp(8)} color = 'black' />
            </Button> */}
        </View>
    )
}

export default TopHeader

const styles = StyleSheet.create({
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(6),
        paddingBottom: hp(1),
        borderBottomColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'transparent'
    },

})