import {
    Text,
    View,
    SafeAreaView,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { API } from "aws-amplify";
import { useState } from "react";
import * as mutations from "../../src/graphql/mutations";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TransitionPresets } from "@react-navigation/stack";


// Create a Text Journal Entry

const Note = () => {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const d = new Date();
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const router = useRouter();

    // User creates new text journal entry 
    const addEntry = async () => {
        let yourDate = new Date();
        // let entryDate = yourDate.toISOString().split("T")[0];
        let entryDate = '2023-07-15'
        try {
            const response = await API.graphql({
                query: mutations.createEntry,
                variables: {
                    input: {
                        date: entryDate,
                        type: "entry",
                        contentType: "Text",
                        text: text,
                        titleText: title,
                    },
                },
            });
            console.log(response)
        } catch (error) {
            console.log("Not able to Create Post: ", error);
        }
        router.replace("/");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    ...TransitionPresets.ModalSlideFromBottomIOS,
                }}
            />
            <View
                style={{
                    width: "90%",
                    justifyContent: "space-between",
                    flexDirection: "row",
                    alignSelf: "center",
                    marginTop: 10,
                }}
            >
                <TouchableOpacity onPress={addEntry}>
                    <Text
                        style={{
                            color: "white",
                            fontFamily: "InterMedium",
                            fontSize: 20,
                            marginTop: 5,
                        }}
                    >
                        save
                    </Text>
                </TouchableOpacity>
                <Pressable
                    onPress={() => {
                        router.back();
                    }}
                >
                    <MaterialIcons name="keyboard-arrow-down" size={40} color="white" />
                </Pressable>
            </View>
            <ScrollView style={styles.container}>
                <Text style={styles.dateCtn}>
                    {months[d.getMonth()] +
                        " " +
                        d.getDate() +
                        ", " +
                        d.getFullYear() +
                        " @ " +
                        new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                </Text>
                <TextInput
                    multiline={true}
                    placeholderTextColor={"#808080"}
                    placeholder="your title here..."
                    style={styles.titleInput}
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    multiline={true}
                    placeholderTextColor={"#808080"}
                    placeholder="what happened today?"
                    style={styles.textInput}
                    value={text}
                    onChangeText={setText}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        rowGap: 5,
        paddingLeft: 5,
        paddingRight: 5,
    },

    titleInput: {
        color: "white",
        width: "100%",
        paddingLeft: 10,
        fontSize: 30,
        fontFamily: "InterMedium",
        marginBottom: 10,
    },

    textInput: {
        color: "white",
        height: 20,
        width: "100%",
        fontSize: 15,
        fontFamily: "InterRegular",
        minHeight: 500,
        paddingLeft: 10,
    },
    dateCtn: {
        color: "#808080",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 15,
    },
    doneBtn: {
        color: "white",
        backgroundColor: "white",
        height: 20,
        width: 20,
    },
});

export default Note;
