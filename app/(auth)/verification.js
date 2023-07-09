import { TransitionPresets } from "@react-navigation/stack";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { useState, useRef, useEffect } from "react";
import { Auth } from "aws-amplify";
import { Stack, useRouter, useLocalSearchParams } from 'expo-router'

const Verification = () => {
    const digitRefs = Array.from({ length: 6 }, () => useRef(null));
    const digit1Ref = useRef(null)
    const digit2Ref = useRef(null)
    const digit3Ref = useRef(null)
    const digit4Ref = useRef(null)
    const digit5Ref = useRef(null)
    const digit6Ref = useRef(null)
    const { username } = useLocalSearchParams();

    const [code, setCode] = useState("")
    const [error, setError] = useState('')
    const router = useRouter()




    async function confirmSignUp() {
        console.log(username)
        try {

            await Auth.confirmSignUp(username, code);
            console.log('✅ Code confirmed');
            router.push('/')

        } catch (error) {
            console.log(
                '❌ Verification code does not match. Please enter a valid verification code.',
                error.message
            );

            setError(error.message)
        }
    }



    const handleDigitChange = (text, ref, prevRef) => {
        if (text.length === 1) {
            // setCode((current) => {
            //     return [...current, text]
            // })

            setCode((current) => {
                const updated = current + text
                return updated
            })


            ref.current.focus()

        } else if (text.length === 0) {
            setCode((current) => {
                return current.slice(0, -1)
            })
            prevRef.current.focus()
        }
    };


    useEffect(() => {
        console.log(code)
    }, [code])
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black', alignItems: "center" }}>

            <Stack.Screen options={{
                headerShown: false, ...TransitionPresets.ModalSlideFromBottomIOS, gestureEnabled: false
            }} />


            <Text style={styles.title}>Verification Code</Text>
            <Text style={styles.subTitle}>Enter your verification code that we sent  you through e-mail.</Text>



            <View style={{ flexDirection: 'row', columnGap: 15, justifyContent: 'center', marginBottom: 35 }}>

                <TextInput
                    ref={digit1Ref}
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={1}
                    onChangeText={(text) => handleDigitChange(text, digit2Ref, digit1Ref)}
                />
                <TextInput
                    ref={digit2Ref}
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={1}
                    onChangeText={(text) => handleDigitChange(text, digit3Ref, digit1Ref)}
                />

                <TextInput
                    ref={digit3Ref}
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={1}
                    onChangeText={(text) => handleDigitChange(text, digit4Ref, digit2Ref)}
                />
                <TextInput
                    ref={digit4Ref}
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={1}
                    onChangeText={(text) => handleDigitChange(text, digit5Ref, digit3Ref)}
                />


                <TextInput
                    ref={digit5Ref}
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={1}
                    onChangeText={(text) => handleDigitChange(text, digit6Ref, digit4Ref)}
                />
                <TextInput
                    ref={digit6Ref}
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={1}
                    onChangeText={(text) => handleDigitChange(text, digit6Ref, digit5Ref)}
                />
            </View>
            <TouchableOpacity onPress={confirmSignUp} style={styles.btn}><Text style={styles.btnFont}>submit</Text></TouchableOpacity>

            <Text style={styles.errorMsg}>{error}</Text>

        </SafeAreaView >



    )
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: "#181818",
        width: 50,
        height: 50,
        borderRadius: 50,
        color: 'white',
        fontFamily: 'InterSemiBold',
        textAlign: 'center'
    },
    btn: {
        backgroundColor: "white",
        width: 120,
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',

    },
    btnFont: {
        color: 'black', fontFamily: 'InterSemiBold', fontSize: 18

    }, subTitle: {
        width: '90%',
        textAlign: 'center',
        color: '#acacac',
        fontFamily: 'InterMedium',
        fontSize: 18,
        marginBottom: 50
    },
    title: {
        color: 'white',
        fontFamily: 'InterSemiBold',
        fontSize: 28,
        marginTop: 80,
        marginBottom: 15
    },
    errorMsg: {
        color: 'white',
        fontFamily: 'InterRegular',
        fontSize: 15,
        marginTop: 30,
        width: '90%',
        textAlign: 'center'

    }
})
export default Verification