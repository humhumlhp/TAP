import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import Loading from './Loading'

const Button = ({
    buttonStyle,
    textStyle,
    title = '',
    onPress = () => { },
    loading = false,
    hasShadow = true,
    width,
    height,
    children,
    fontSize = wp(5),
    top,
}) => {


    const shadowStyle = {
        borderWidth: 4,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
    }

    if (loading) {
        return (
            <View style={[styles.button, buttonStyle, { backgroundColor: 'white' }]}>
                <Loading />
            </View>
        )
    }
    return (
        <View style={styles.shadowContainer}>
            {hasShadow && <View style={styles.shadow} />}
            <TouchableOpacity onPress={onPress} style={[styles.button, buttonStyle, width && {width}, height && {height}]}>
                {children ||<Text style={[styles.text, {fontSize},top && {top}, textStyle]}>{title}</Text> }
            </TouchableOpacity>
        </View>
    )
}

export default Button

const styles = StyleSheet.create({
    shadowContainer: {
        position: 'relative',
        alignSelf: 'center',
        
    },
    shadow: {
        position: 'absolute',
        top: 5,
        left: 4,
        right: -4,
        bottom: -5,
        backgroundColor: 'black'
    },
    button: {
        backgroundColor: theme.colors.orange,
        justifyContent: 'center',
        alignItems: 'center',
        borderCurve: 'continuous',
        borderColor: 'black',
        borderWidth: 1,
    },
    text: {
        color: theme.colors.black,
        fontFamily: "VT323_400Regular", // String is fine, but ensure font is loaded in parent
        alignItems: 'center',
        textAlign: 'center',
    }




})

