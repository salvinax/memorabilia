import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import { Stack, useRouter, useNavigation, BackHandler } from 'expo-router'


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter()
  const navigation = useNavigation();

  async function signIn() {
    try {
      await Auth.signIn(username, password);
      console.log("✅ Success");
      router.push('/')
    } catch (error) {
      console.log("❌ Error signing in...", error);
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
            marginBottom: 100,
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
          onPress={signIn}
          style={{
            backgroundColor: "white",
            height: "5%",
            width: "30%",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
            marginBottom: 150,
          }}
        >
          <Text style={{ fontSize: 20, fontFamily: "InterMedium" }}>login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/register')}>
          <Text
            style={{
              color: "white",
              fontFamily: "InterMedium",
              fontSize: 18,
              bottom: 0,
            }}
          >
            Don't have an account?{" "}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Login;
