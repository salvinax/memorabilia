import { View, SafeAreaView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Stack, useRouter } from 'expo-router'
import CalendarOn from '../components/calendar'
import { useState, useEffect } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { encode as btoa } from 'base-64';
import { Amplify, Auth } from 'aws-amplify';
import config from '../src/aws-exports';

// Configure AWS Amplify 
Amplify.configure({
    ...config,
    Analytics: {
        disabled: true,
    },
});


const Home = () => {

    const router = useRouter()
    const [name, setName] = useState('');

    const getRefreshToken = async () => {

        try {

            const refreshToken = await AsyncStorage.getItem('refreshToken');

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
                throw new Error('Failed to fetch data');
            }

            const resJson = await res.json()

            const {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
                expires_in: expiresIn,
            } = resJson;

            const expTime = new Date().getTime() + expiresIn * 1000
            console.log(expTime)

            await AsyncStorage.setItem('token', newAccessToken)

            if (newRefreshToken) {
                await AsyncStorage.setItem('refreshToken', newRefreshToken);
            }
            await AsyncStorage.setItem('expirationToken', expTime.toString())

        } catch (err) {
            console.log('Could not connect to SPOTIFY endpoint', err)
        }

    }

    //Implement authorization code flow
    // Check Token 
    useEffect(() => {
        (async () => {
            try {
                let tokenTime = await AsyncStorage.getItem('expirationToken')
                if (tokenTime) {

                    if (new Date().getTime() >= tokenTime) {
                        await getRefreshToken();
                    } else {
                        console.log('Refresh Token is still valid.')
                    }
                }

            } catch (error) {
                console.log('No Refresh Token was generated: ', error)
            }
        })()
    }, [])


    // Check if User is Logged In and Retrieve Username
    useEffect(() => {
        (async () => {
            Auth.currentAuthenticatedUser()
                .then((data) => {
                    setName(data.attributes.name);
                }).catch((error) => {
                    console.log("Error with auth:", error);
                    router.replace('/logIn');
                })
        })()

    }, [router]);


    return (<>

        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>

            <Stack.Screen options={{
                headerShown: false
            }} />
            <View style={{ flex: 1 }}>
                <CalendarOn />
                <TouchableOpacity onPress={() => { router.push({ pathname: '/new', params: { name } }) }} style={{ position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'white', height: 50, width: 50, borderRadius: '50%', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesome5 name="plus" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    </>
    )
}

export default Home;

