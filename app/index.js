import { Text, View, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Stack, useRouter, useLocation } from 'expo-router'
import CalendarOn from '../components/calendar'
import { useState, useEffect } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { encode as btoa } from 'base-64';
import { COLORS } from '../constants'
import { Amplify, Storage, Auth } from 'aws-amplify';
import config from '../src/aws-exports';




Amplify.configure({
    ...config,
    Analytics: {
        disabled: true,
    },
});




//login with aws https://instamobile.io/mobile-development/react-native-aws-amplify/




const setTokens = async (name, value) => {

    try {
        await AsyncStorage.setItem(name, value)

    } catch (error) {
        //was not able to save in async storage
        console.log(error)
    }
}

const retrieveTokens = async (name) => {

    try {
        const data = await AsyncStorage.getItem(name)

        return data

        //if you can't retrieve data then login again??

    } catch (error) {
        return null

    }

}

const Home = () => {

    const router = useRouter()
    const [auth, setAuth] = useState();
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')

    const getRefreshToken = async () => {

        const refreshToken = retrieveTokens('refreshToken')

        try {


            const credsB64 = btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET);

            const res = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${credsB64}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
            })

            if (!res.ok) {
                console.log(res.error)
            } else {
                const resJson = await res.json()

                const {
                    access_token: newAccessToken,
                    refresh_token: newRefreshToken,
                    expires_in: expiresIn,
                } = resJson;



                const expTime = new Date().getTime() + expiresIn * 1000

                //do a function for async storate try and catch errors

                await setTokens('token', newAccessToken)

                if (newRefreshToken) {
                    await setTokens('refreshToken', newRefreshToken);
                }
                await AsyncStorage.setItem('expirationToken', expTime.toString())

            }

        } catch (err) {
            console.log(err)

        }


    }
    //implement authorization code flow

    useEffect(() => {
        const checkToken = async () => {

            let token = await retrieveTokens('expirationToken')
            console.log('date', token)

            if (token) {
                if (new Date().getTime() > token) {
                    await getRefreshToken();
                    console.log('refresh token generated')
                } else {
                    console.log('not yet')
                }
            } else {
                console.log('no token')
            }
        }


        // checkToken()

    }, [])

    const checkUserSignedIn = async () => {
        Auth.currentAuthenticatedUser()
            .then((data) => {
                setAuth(true)
                setName(data.attributes.name)
                console.log('name', data.attributes.name)

            }).catch((error) => {
                setAuth(false);
                console.log("error with auth:", error);
                router.push('/logIn')
            })

    };



    useEffect(() => {
        checkUserSignedIn();

    }, [router]);

    useEffect(() => {
        if (loading) {
            console.log('its true')
        }

    }, [loading])

    const handleLayout = () => {
        console.log('trigger')
    }



    return (<>


        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>

            <Stack.Screen options={{
                headerShown: false
            }} />
            {/* {!loading ? <ActivityIndicator size="large" color="white" />
                : */}
            <View style={{ flex: 1 }}>
                <CalendarOn style={{}} />
                <TouchableOpacity onPress={() => { router.push({ pathname: '/new', params: { name } }) }} style={{ position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: 'white', height: 50, width: 50, borderRadius: '50%', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesome5 name="plus" size={24} color="black" />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    </>












    )
}

export default Home;

