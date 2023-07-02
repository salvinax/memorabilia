import { Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser'
import { Stack, useRouter } from 'expo-router'
import CalendarOn from '../components/calendar'
import { useState, useEffect } from 'react';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI } from '@env';

import { encode as btoa } from 'base-64';

import { COLORS } from '../constants'

WebBrowser.maybeCompleteAuthSession(); //only for web doesn't do anything in native
//https://developer.spotify.com/documentation/web-api/tutorials/code-flow 

//endpoint
const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const getToken = async (authCode) => {

    try {

        const credsB64 = btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET);

        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credsB64}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=authorization_code&code=${authCode}&redirect_uri=${REDIRECT_URI}`,
        })
        //buffer.toString('base64')

        if (!res.ok) {
            console.log('ERROR')
        } else {

            const resJson = await res.json()

            const {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: expiresIn,
            } = resJson;



            const expTime = new Date().getTime() + expiresIn * 1000
            console.log(accessToken)

            //do a function for async storate try and catch errors 
            await setTokens('token', accessToken)
            await setTokens('refreshToken', refreshToken)
            await setTokens('expirationToken', expTime.toString())
        }

    } catch (err) {
        console.log(err)

    }
}

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
        //was not able to retrieve data

    }

}




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


const Home = () => {
    const router = useRouter()
    //implement authorization code flow 
    const [request, response, promptAsync] = useAuthRequest({
        clientId: SPOTIFY_CLIENT_ID,
        scopes: ['user-read-recently-played', 'playlist-modify-public'],
        usePKCE: false,
        redirectUri: REDIRECT_URI

        //authorization code received 
        //to do: get tokens access and refresh

    }, discovery);

    useEffect(() => {
        if (response?.type === 'success') {
            const { code } = response.params;
            getToken(code);
            const id = 4;
            router.push(`/music/${id}`)
        }
    }, [response]);


    // useEffect(() => {
    //     const checkToken = async () => {
    //         const tokenExpirationTime = await AsyncStorage.getItem('expirationToken');
    //         if (new Date().getTime() > tokenExpirationTime) {
    //             await getRefreshToken();
    //         }





    //     }

    // })




    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>

            <Stack.Screen options={{
                headerStyle: { backgroundColor: 'white' },
                headerRight: () => (
                    <TouchableOpacity style={{ backgroundColor: 'green', width: 20, height: 20 }} onPress={() => { promptAsync() }} >
                    </TouchableOpacity>
                ),
                headerLeft: () => (
                    <View style={{ flexDirection: 'row', columnGap: '5' }}><TouchableOpacity style={{ backgroundColor: 'red', width: 20, height: 20 }} onPress={() => { router.push('/note/4') }} >
                    </TouchableOpacity><TouchableOpacity style={{ backgroundColor: 'orange', width: 20, height: 20 }} onPress={() => { router.push('/camera/4') }} >
                        </TouchableOpacity></View>

                ),
                headerTitle: () => (
                    <TouchableOpacity style={{ backgroundColor: 'blue', width: 20, height: 20 }} onPress={() => { router.push('/voice/4') }} >
                    </TouchableOpacity>
                )
            }} />

            {/* options={{ headerShown: false }}  */}


            <View style={{ flex: 1 }}>

                <CalendarOn />

            </View>






        </SafeAreaView >


    )
}

export default Home;