import { Alert, Pressable, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import Header from '../../components/Header'
import BackButton from '../../components/BackButton'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { theme } from '../../constants/theme'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/Avatar'

const Profile = () => {
  const [fullUser, setFullUser] = useState(user);
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const onLogout = async () => {
    //setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout', "Error signing out!")
    }
  }
  const handleLogout = async () => {
    Alert.alert('Confirm', "Are you sure you want to logout?", [
      {
        text: 'Cancel',
        onPress: () => console.log('modal cancelled'),
        style: 'cancel'
      },
      {
        text: 'Logout',
        onPress: () => onLogout(),
        style: 'destructive'

      }
    ])
  }
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('name, school, class')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setFullUser(data);
        }
      }
    };

    fetchUserData();
  }, [user?.id]);
  return (
    <ScreenWrapper bg='white'>
      <UserHeader user={fullUser} router={router} handleLogout={handleLogout} />
    </ScreenWrapper>
  )
}

const UserHeader = ({ user, router, handleLogout }) => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: wp(4) }}>
      <View>
        <Header title='Profile' mb={30} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name='logout' color={theme.colors.rose} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={0} //change this back when redraw userDefault pic -> rounded = {theme.radius.xxl*1.4}
              style={{ borderWidth: 0 }} //remove this when the above happened
            />
            <Pressable style={styles.editIcon} onPress={() => router.push('editProfile')}>
              <Icon name='edit' strokeWidth={2.5} size={20} />
            </Pressable>
          </View>
          {/** username and address */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.userName}>{user && user.name}</Text>
            <Text style={styles.infoText}>{user && user.class}</Text>
            <Text style={styles.infoText}>{user && user.school}</Text>
          </View>
          {/**email, phone, bio */}
          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              {/* <Icon name = 'mail' size = {20} color = {theme.colors.textLight} /> */}
              {/* <Text style = {styles.infoText}>
                  {user && user.email}
                </Text> */}
              {/* <Icon name = 'mail' size = {20} color = {theme.colors.textLight} /> */}
              {/* <Text style = {styles.infoText}>
                  {user && user.phoneNumber}
                </Text> */}
              {/* <Icon name = 'mail' size = {20} color = {theme.colors.textLight} /> }
                { <Text style = {styles.infoText}>
                  {user && user.phoneNumber}
                </Text>  */}

              {
                user && user.bio && (
                  <Text style={styles.infoText}>{user.bio}</Text>
                )
              }
            </View>

          </View>
        </View>
      </View>



    </View>
  )


}

export default Profile

const styles = StyleSheet.create({
  logoutButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: '#fee2e2'
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center'
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: '500',
    color: 'black'
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: '500',
    color: theme.colors.textDark
  }





})