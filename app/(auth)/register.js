import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import { useState } from "react";
import { Auth } from "aws-amplify";
import { Stack, useRouter } from 'expo-router'

// Registration page
// Create account using AWS Cognito

const SignUp = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState('')
  const router = useRouter()

  async function register() {
    try {
      await Auth.signUp({
        username, password, attributes: { name: firstName },
        autoSignIn: {
          enabled: true,
        }
      });
      console.log("✅ Success");
      router.push({ pathname: '/verification', params: { username } })

    } catch (error) {
      console.log("❌ Error signing up...", error);
      setError(error.message)
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>

      <Stack.Screen options={{
        headerShown: false, gestureEnabled: false
      }} />
      <View style={{ alignItems: "center", flex: 1 }}>
        <Text
          style={{
            color: "white",
            fontFamily: "InterSemiBold",
            fontSize: 35,
            marginTop: 150,
            marginBottom: 70,
          }}
        >
          mem·o·ra·bil·i·a
        </Text>

        <View
          style={{
            backgroundColor: "#181818",
            width: "75%",
            borderRadius: 10,
            height: "6%",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <TextInput
            style={{
              fontSize: 17,
              color: "white",
              marginLeft: 10,
              fontFamily: "InterRegular",
            }}
            placeholderTextColor={"#808080"}
            placeholder="Name"
            value={firstName}
            onChangeText={setFirstName}
            secureTextEntry={false}
          />
        </View>
        <View
          style={{
            backgroundColor: "#181818",
            width: "75%",
            borderRadius: 10,
            height: "6%",
            justifyContent: "center",
            marginBottom: 25,
          }}
        >
          <TextInput
            style={{
              fontSize: 17,
              color: "white",
              marginLeft: 10,
              fontFamily: "InterRegular",
            }}
            placeholderTextColor={"#808080"}
            placeholder="Email"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View
          style={{
            backgroundColor: "#181818",
            width: "75%",
            borderRadius: 10,
            height: "6%",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <TextInput
            style={{
              fontSize: 17,
              color: "white",
              marginLeft: 10,
              fontFamily: "InterRegular",
            }}
            placeholderTextColor={"#808080"}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity
          onPress={register}
          style={{
            backgroundColor: "white",
            height: "5%",
            width: "30%",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 20, fontFamily: "InterMedium" }}>
            register
          </Text>
        </TouchableOpacity>
        <Text style={{
          color: 'white',
          fontFamily: 'InterRegular',
          fontSize: 15,
          marginTop: 30,
          width: '90%',
          textAlign: 'center',
          marginBottom: 30
        }}>{error}</Text>

        <TouchableOpacity onPress={() => router.replace('/logIn')}>
          <Text
            style={{
              color: "white",
              fontFamily: "InterMedium",
              fontSize: 18,
            }}
          >
            Already have an account?{" "}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
