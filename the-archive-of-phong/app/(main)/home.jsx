import { Alert, Pressable, StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Animated } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import Icon from '../../assets/icons'
import { useRouter, useFocusEffect } from 'expo-router'
import Avatar from '../../components/Avatar'
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera'
import { Image } from "expo-image"
import AntDesign from "@expo/vector-icons/AntDesign"
import Feather from "@expo/vector-icons/Feather"
import Ionicons from "@expo/vector-icons/Ionicons"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { uploadService } from '../../services/uploadService'

const Home = () => {
    const { user, setAuth } = useAuth();
    const router = useRouter();
    const cameraRef = useRef(null);
    
    // Camera states 
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const [capturedImage, setCapturedImage] = useState(null);
    const [targetAudience, setTargetAudience] = useState('yourself');
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(true);
    const [messageText, setMessageText] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Feed states
    const [posts, setPosts] = useState([]);
    const [showFeed, setShowFeed] = useState(false);
    const [feedLoading, setFeedLoading] = useState(false);

    console.log('user:', user);

    // Load posts when component mounts or audience changes
    useEffect(() => {
        loadPosts();
    }, [targetAudience]);

    // Load posts function - Filter by selected audience
    const loadPosts = async () => {
        try {
            setFeedLoading(true);
            console.log('Loading posts for user:', user?.id, 'audience:', targetAudience);
            
            // Use the selected audience for filtering
            const audienceFilter = targetAudience === 'yourself' ? 'yourself' : targetAudience;
            const fetchedPosts = await uploadService.fetchPosts(user?.id, audienceFilter);
            
            console.log('Fetched posts:', fetchedPosts);
            setPosts(fetchedPosts);
        } catch (error) {
            console.error('Error loading posts:', error);
            setPosts([]);
        } finally {
            setFeedLoading(false);
        }
    };

    // Simple function to show feed
    const showPostFeed = () => {
        setShowFeed(true);
        loadPosts(); // Refresh posts when opening feed
    };

    // Simple function to hide feed
    const hidePostFeed = () => {
        setShowFeed(false);
    };

    // Handle screen focus/unfocus to reinitialize camera
    useFocusEffect(
        React.useCallback(() => {
            setIsScreenFocused(true);
            setIsCameraReady(false);
            
            const timer = setTimeout(() => {
                setIsCameraReady(true);
            }, 100);

            return () => {
                setIsScreenFocused(false);
                setIsCameraReady(false);
                clearTimeout(timer);
            };
        }, [])
    );

    // Check camera permissions
    if (!permission) {
        return (
            <ScreenWrapper bg='black'>
                <View style={styles.container}>
                    <Text style={styles.loadingText}>Loading camera permissions...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (!permission.granted) {
        return (
            <ScreenWrapper bg='black'>
                <View style={styles.container}>
                    <View style={styles.permissionContainer}>
                        <Text style={styles.permissionText}>
                            Ứng dụng cần được cấp quyền Camera
                        </Text>
                        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                            <Text style={styles.permissionButtonText}>Cho phép truy cập</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    // Toggle camera facing
    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back')); 
    };

    // Toggle flash
    const toggleFlash = () => {
        setFlash(current => {
            switch (current) {
                case 'off': return 'on';
                case 'on': return 'off';
                default: return 'off';
            }
        });
    };

    // Get flash icon based on current flash mode
    const getFlashIcon = () => {
        switch (flash) {
            case 'on': return 'flash';
            case 'off': return 'flash-off';
            default: return 'flash-off';
        }
    };

    // Take picture with 1:1 aspect ratio
    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });
                
                const croppedUri = await cropImageToSquare(photo.uri, photo.width, photo.height);
                setCapturedImage(croppedUri);
                console.log('Photo taken and cropped:', croppedUri);
            } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert('Error', 'Failed to take picture');
            }
        }
    };

    // Function to crop image to 1:1 aspect ratio
    const cropImageToSquare = async (uri, width, height) => {
        try {
            const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
            
            const size = Math.min(width, height);
            const originX = (width - size) / 2;
            const originY = (height - size) / 2;
            
            const croppedImage = await manipulateAsync(
                uri,
                [
                    {
                        crop: {
                            originX,
                            originY,
                            width: size,
                            height: size,
                        },
                    },
                ],
                { compress: 0.8, format: SaveFormat.JPEG }
            );
            
            return croppedImage.uri;
        } catch (error) {
            console.error('Error cropping image:', error);
            return uri;
        }
    };

    // Retake photo
    const retakePhoto = () => {
        setCapturedImage(null);
        setMessageText('');
    };

    // Handle target audience change
    const handleAudienceChange = (audience) => {
        setTargetAudience(audience);
    };

    // Validate user data before sending photo
    const validateUserData = async () => {
        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return false;
        }

        if (targetAudience !== 'yourself') {
            const { data: userData, error } = await supabase
                .from('users')
                .select('school, class')
                .eq('id', user.id)
                .single();

            if (error || !userData) {
                Alert.alert('Error', 'Unable to fetch user information');
                return false;
            }

            if (targetAudience === 'school' && !userData.school) {
                Alert.alert('Missing Information', 'Please update your school information in profile');
                return false;
            }

            if (targetAudience === 'class' && (!userData.school || !userData.class)) {
                Alert.alert('Missing Information', 'Please update your school and class information in profile');
                return false;
            }
        }

        return true;
    };

    // Send photo with message
    const sendPhoto = async () => {
        if (!capturedImage) {
            Alert.alert('Error', 'No image to upload');
            return;
        }

        const isValid = await validateUserData();
        if (!isValid) return;

        setIsUploading(true);

        try {
            console.log('Starting upload process...');
            
            const result = await uploadService.uploadAndCreatePost(
                capturedImage,
                messageText,
                targetAudience,
                user.id
            );

            console.log('Upload successful:', result);

            const audienceText = targetAudience === 'yourself' 
                ? 'your personal collection' 
                : `${result.audienceCount} people in your ${targetAudience}`;

            Alert.alert(
                'Success!', 
                `Photo shared with ${audienceText}!`,
                [
                    { 
                        text: 'OK', 
                        onPress: () => {
                            setCapturedImage(null);
                            setMessageText('');
                            setTargetAudience('yourself');
                            loadPosts(); // Reload posts after successful upload
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('Upload failed:', error);
            
            Alert.alert(
                'Upload Failed', 
                error.message || 'Something went wrong. Please try again.',
                [
                    { text: 'OK' }
                ]
            );
        } finally {
            setIsUploading(false);
        }
    };

    // Upload overlay component
    const UploadOverlay = ({ isVisible, message = "Uploading..." }) => {
        if (!isVisible) return null;

        return (
            <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.uploadingText}>{message}</Text>
            </View>
        );
    };

    // Feed component
    const FeedView = () => (
        <View style={styles.feedContainer}>
            <View style={styles.feedHeader}>
                <Text style={styles.feedTitle}>
                    {targetAudience === 'yourself' ? 'Your Photos' : 
                     targetAudience === 'class' ? 'Class Photos' : 
                     targetAudience === 'school' ? 'School Photos' : 'Posts'}
                </Text>
                <TouchableOpacity onPress={hidePostFeed}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>
            
            {feedLoading ? (
                <View style={styles.feedLoading}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.feedLoadingText}>Loading posts...</Text>
                </View>
            ) : posts.length === 0 ? (
                <View style={styles.feedEmpty}>
                    <Text style={styles.feedEmptyText}>No posts yet</Text>
                    <Text style={styles.feedEmptySubtext}>
                        {targetAudience === 'yourself' 
                            ? 'Take a photo to start your collection!' 
                            : `No ${targetAudience} photos available yet.`}
                    </Text>
                </View>
            ) : (
                <ScrollView style={styles.feedContent}>
                    {posts.map((post, index) => (
                        <View key={post.id} style={styles.postItem}>
                            <View style={styles.postHeader}>
                                <Text style={styles.postAuthor}>
                                    {post.users?.name || 'Unknown User'}
                                </Text>
                                <Text style={styles.postAudience}>
                                    {post.audience_type}
                                </Text>
                            </View>
                            
                            <Image 
                                source={{ uri: post.file }} 
                                style={styles.postImage}
                                contentFit="cover"
                            />
                            
                            {post.body && (
                                <Text style={styles.postBody}>{post.body}</Text>
                            )}
                            
                            <Text style={styles.postDate}>
                                {new Date(post.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );

    // Show feed if requested
    if (showFeed) {
        return (
            <ScreenWrapper bg='black'>
                <FeedView />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bg='black'>
            <View style={styles.container}>
                {/* Top Header */}
                <View style={styles.topHeader}>
                    <TouchableOpacity onPress={() => router.push('profile')}>
                        <View style={styles.profileButton}>
                            <Ionicons name="person-outline" size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Main Camera Area */}
                <View style={styles.mainCameraArea}>
                    {capturedImage ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image 
                                source={{ uri: capturedImage }} 
                                style={styles.imagePreview}
                                contentFit="cover"
                            />
                            <View style={styles.messageInputContainer}>
                                <TextInput
                                    style={styles.messageInput}
                                    placeholder="Nhập nội dung"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                    value={messageText}
                                    onChangeText={setMessageText}
                                    multiline={true}
                                    maxLength={50}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.cameraContainer}>
                            {isScreenFocused && isCameraReady && (
                                <CameraView
                                    ref={cameraRef}
                                    style={styles.camera}
                                    facing={facing}
                                    flash={flash}
                                    mode="picture"
                                />
                            )}
                        </View>
                    )}
                </View>

                {/* Dynamic Controls Based on State */}
                {capturedImage ? (
                    <>
                        <View style={styles.sendButtonContainer}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={retakePhoto}
                            >
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.sendButton, isUploading && styles.sendButtonDisabled]}
                                onPress={sendPhoto}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Ionicons name="send" size={24} color="white" />
                                )}
                            </TouchableOpacity>

                            <View style={styles.emptySpace} />
                        </View>

                        <View style={styles.audienceSelector}>
                            <TouchableOpacity 
                                style={[styles.audienceButton, targetAudience === 'school' && styles.activeAudienceButton]}
                                onPress={() => handleAudienceChange('school')}
                            >
                                <Ionicons name="school-outline" size={20} color={targetAudience === 'school' ? 'black' : 'white'} />
                                <Text style={[styles.audienceText, targetAudience === 'school' && styles.activeAudienceText]}>
                                    Trường
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.audienceButton, targetAudience === 'class' && styles.activeAudienceButton]}
                                onPress={() => handleAudienceChange('class')}
                            >
                                <Ionicons name="people-outline" size={20} color={targetAudience === 'class' ? 'black' : 'white'} />
                                <Text style={[styles.audienceText, targetAudience === 'class' && styles.activeAudienceText]}>
                                    Lớp
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.audienceButton, targetAudience === 'yourself' && styles.activeAudienceButton]}
                                onPress={() => handleAudienceChange('yourself')}
                            >
                                <Ionicons name="person-outline" size={20} color={targetAudience === 'yourself' ? 'black' : 'white'} />
                                <Text style={[styles.audienceText, targetAudience === 'yourself' && styles.activeAudienceText]}>
                                    Cá nhân
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.swipeIndicator}>
                            <TouchableOpacity onPress={showPostFeed} style={styles.feedButton}>
                                <Text style={styles.swipeText}>Tap to view posts</Text>
                                <Ionicons name="images-outline" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.cameraControls}>
                            <TouchableOpacity 
                                style={styles.sideControlButton}
                                onPress={toggleFlash}
                            >
                                <Ionicons 
                                    name={getFlashIcon()} 
                                    size={28} 
                                    color="white" 
                                />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.captureButton}
                                onPress={takePicture}
                            >
                                <View style={styles.captureButtonOuter}>
                                    <View style={styles.captureButtonInner} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.sideControlButton}
                                onPress={toggleCameraFacing}
                            >
                                <MaterialIcons name="flip-camera-ios" size={28} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.audienceSelector}>
                            <TouchableOpacity 
                                style={[styles.audienceButton, targetAudience === 'school' && styles.activeAudienceButton]}
                                onPress={() => handleAudienceChange('school')}
                            >
                                <Ionicons name="school-outline" size={20} color={targetAudience === 'school' ? 'black' : 'white'} />
                                <Text style={[styles.audienceText, targetAudience === 'school' && styles.activeAudienceText]}>
                                    Trường
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.audienceButton, targetAudience === 'class' && styles.activeAudienceButton]}
                                onPress={() => handleAudienceChange('class')}
                            >
                                <Ionicons name="people-outline" size={20} color={targetAudience === 'class' ? 'black' : 'white'} />
                                <Text style={[styles.audienceText, targetAudience === 'class' && styles.activeAudienceText]}>
                                    Lớp
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.audienceButton, targetAudience === 'yourself' && styles.activeAudienceButton]}
                                onPress={() => handleAudienceChange('yourself')}
                            >
                                <Ionicons name="person-outline" size={20} color={targetAudience === 'yourself' ? 'black' : 'white'} />
                                <Text style={[styles.audienceText, targetAudience === 'yourself' && styles.activeAudienceText]}>
                                    Cá nhân
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.swipeIndicator}>
                            <TouchableOpacity onPress={showPostFeed} style={styles.feedButton}>
                                <Text style={styles.swipeText}>Tap to view posts</Text>
                                <Ionicons name="images-outline" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <UploadOverlay isVisible={isUploading} message="Uploading photo..." />
            </View>
        </ScreenWrapper>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    
    // Top Header
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(6),
        paddingTop: hp(2),
        paddingBottom: hp(1),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationButton: {
        padding: 8,
    },

    // Main Camera Area
    mainCameraArea: {
        width: wp(90),
        height: wp(90),
        marginVertical: hp(2),
        marginHorizontal: wp(5),
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        alignSelf: 'center',
    },
    cameraContainer: {
        flex: 1,
        aspectRatio: 1,
    },
    camera: {
        flex: 1,
    },

    // Camera Controls
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(10),
        paddingVertical: hp(3),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    sideControlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },

    // Target Audience Selector
    audienceSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp(2),
        gap: 8,
    },
    audienceButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'transparent',
        minWidth: 80,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    activeAudienceButton: {
        backgroundColor: 'white',
        borderColor: 'white',
    },
    audienceText: {
        color: 'white',
        fontSize: hp(1.4),
        fontWeight: '500',
    },
    activeAudienceText: {
        color: 'black',
    },

    // Feed Button & Indicator
    swipeIndicator: {
        alignItems: 'center',
        paddingBottom: hp(2),
    },
    feedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        gap: 8,
    },
    swipeText: {
        color: 'white',
        fontSize: hp(1.6),
        opacity: 0.9,
    },

    // Send Button Container
    sendButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(10),
        paddingVertical: hp(3),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    sendButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    cancelButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    emptySpace: {
        width: 50,
        height: 50,
    },

    // Message Input
    messageInputContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: 'center'
    },
    messageInput: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        fontSize: hp(1.8),
        minHeight: 44,
        maxHeight: 100,
        textAlign: 'center'
    },

    // Image Preview
    imagePreviewContainer: {
        flex: 1,
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },

    // Permission & Loading
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(4),
    },
    permissionText: {
        fontSize: hp(2),
        textAlign: 'center',
        marginBottom: 20,
        color: 'white',
    },
    permissionButton: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    permissionButtonText: {
        color: 'black',
        fontSize: hp(1.8),
        fontWeight: '600',
    },
    loadingText: {
        color: 'white',
        fontSize: hp(2),
        textAlign: 'center',
    },
    
    // Upload Overlay
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    uploadingText: {
        color: 'white',
        fontSize: hp(2),
        marginTop: 10,
        textAlign: 'center',
    },

    // Feed Styles
    feedContainer: {
        flex: 1,
        backgroundColor: 'black',
        paddingTop: hp(2),
    },
    feedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(6),
        paddingBottom: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    feedTitle: {
        color: 'white',
        fontSize: hp(2.5),
        fontWeight: 'bold',
    },
    feedLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    feedLoadingText: {
        color: 'white',
        fontSize: hp(1.8),
        marginTop: 10,
    },
    feedEmpty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(8),
    },
    feedEmptyText: {
        color: 'white',
        fontSize: hp(2.2),
        fontWeight: 'bold',
        marginBottom: 10,
    },
    feedEmptySubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: hp(1.6),
        textAlign: 'center',
    },
    feedContent: {
        flex: 1,
        paddingHorizontal: wp(4),
    },
    postItem: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        marginBottom: 15,
        overflow: 'hidden',
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    postAuthor: {
        color: 'white',
        fontSize: hp(1.8),
        fontWeight: 'bold',
    },
    postAudience: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: hp(1.4),
        textTransform: 'capitalize',
    },
    postImage: {
        width: '100%',
        height: wp(80),
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    postBody: {
        color: 'white',
        fontSize: hp(1.6),
        padding: 15,
        paddingTop: 10,
    },
    postDate: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: hp(1.2),
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
});