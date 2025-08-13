import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import Button from '../Button';
import { hp, wp } from '../../helpers/common';
import ScreenWrapper from '../ScreenWrapper';
import { theme } from '../../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

// Format date as dd/mm/yy
const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d)) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
};
const PostUno = () => {
    const params = useLocalSearchParams();
    const { file = '', name = '', klass = '', date = '', body = '', image = '', } = params;

    return (
        <ScreenWrapper bg={theme.colors.backgroundLight}>
            <View style={styles.container}>
                <View style={styles.backButtonContainer}>
                    <Button
                        width={wp(13)}
                        height={wp(13)}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={30} color="black" />
                    </Button>
                </View>
                <Image source={{ uri: String(file) }} style={styles.image} contentFit="contain" />

                <View style={styles.meta}>
                    <View style={styles.avatarRow}>
                        {image ? (
                            <Image source={{ uri: String(image) }} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={[styles.avatar, styles.center]}>
                                <Ionicons name='person-sharp' size={hp(5.5)} strokeWidth={2} />
                            </View>
                        )}




                        {/* in this row but flex-end */}



                    </View>
                    <Text style={styles.text}>name: {String(name)}</Text>
                    <Text style={styles.text}>class: {String(klass)}</Text>
                    <Text style={styles.text}>date: {formatDate(date)}</Text>

                    {/* Fetch and display post's message input by user when taking picture */}
                    {body ? (
                        <Text style={styles.text}>message: {String(body)}</Text>
                    ) : null}
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default PostUno;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButtonContainer: {
        position: 'absolute',
        top: hp(1),
        left: wp(5),
    },
    shadowLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        transform: [{ translateX: 4 }, { translateY: 5 }],
        zIndex: 0,
        borderWidth: 2,
        borderColor: 'black'
    },
    image: {
        width: wp(90),
        height: wp(90),
        alignSelf: 'center',
        marginTop: hp(10),
        borderWidth: 5,
        borderColor: '#000',
    },
    meta: {
        marginTop: hp(2),
        marginHorizontal: wp(5),
    },
    avatarRow: {
        // marginBottom: hp(0),
        alignItems: 'flex-start',
    },
    avatar: {
        height: hp(8),
        width: hp(8),
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: theme.colors.backgroundLight,
        overflow: 'hidden',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: wp(8),
        color: '#000',
        marginBottom: hp(0.5),
        fontFamily: 'VT323_400Regular'
    },
});