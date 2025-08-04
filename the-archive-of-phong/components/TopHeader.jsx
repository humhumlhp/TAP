import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { hp, wp } from '../helpers/common'
import { router } from 'expo-router'

const TopHeader = () => {
    return (
        <View style={styles.topHeader}>
            {/* Profile picture or Default User icon */}
            <TouchableOpacity onPress={() => router.push('profile')}>
                <View style={styles.profileButton}>
                    <Ionicons name="person-outline" size={26} color="white" />
                </View>
            </TouchableOpacity>

            {/* Notification icon */}
            <TouchableOpacity onPress={() => router.push('notifications')} style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={26} color="white" />
            </TouchableOpacity>
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
        paddingTop: hp(2),
        paddingBottom: hp(1),
        borderBottomColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'transparent'
    },
    profileButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },

})