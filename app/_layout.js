import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { useCallback, useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen'
// SplashScreen.preventAutoHideAsync().catch(() => { })
//loading 

// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
    /* reloading the app might trigger some race conditions, ignore them */
});
const Layout = () => {

    SplashScreen.preventAutoHideAsync()


    const [fontsLoaded] = useFonts({
        InterRegular: require('../assets/fonts/Inter-Regular.ttf'),
        InterMedium: require('../assets/fonts/Inter-Medium.ttf'),
        InterSemiBold: require('../assets/fonts/Inter-SemiBold.ttf'),
        InterBold: require('../assets/fonts/Inter-Bold.ttf')
    })

    // useEffect(() => {
    //     const prepare = async () => {
    //         // keep splash screen visible
    //         await SplashScreen.preventAutoHideAsync()

    //         //     // pre-load your stuff
    //         await new Promise(resolve => setTimeout(resolve, 10000))

    //         //     // hide splash screen
    //         //     await SplashScreen.hideAsync()
    //     }
    //     prepare()
    // }, [])



    const onLayoutRootView = useCallback(async () => {

        if (fontsLoaded) {
            await new Promise(resolve => setTimeout(resolve, 300));
            //only show if fonts loaded
            await SplashScreen.hideAsync()
        }
    }, [fontsLoaded])

    if (!fontsLoaded) return null;

    // console.log('main')

    return <Stack onLayout={onLayoutRootView} />
}

export default Layout;
