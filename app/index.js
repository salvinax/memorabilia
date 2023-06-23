import { Text, View, ScrollView, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router'
import CalendarOn from '../components/calendar'
import { useState } from 'react';

import { COLORS } from '../constants'

const Home = () => {

    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>

            <Stack.Screen options={{ headerShown: false }} />


            <View style={{ flex: 1 }}>

                <CalendarOn />

            </View>






        </SafeAreaView >


    )
}

export default Home;