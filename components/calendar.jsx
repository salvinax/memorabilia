import { CalendarList } from "react-native-calendars";
import { COLORS } from "../constants";
import { backgroundColor } from "react-native-calendars/src/style";
import { View, Text, Image, StyleSheet } from "react-native";
import { Amplify, Storage, Auth } from "aws-amplify";
import { ENDPOINT_TEMP, ENDPOINT_TEMP_STORE } from "@env";
import * as queries from "../src/graphql/queries";
import { useState, useEffect, createElement } from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const CalendarOn = () => {
  const router = useRouter();
  const items = [
    {
      albumLink: null,
      artists: null,
      contentType: "audio",
      createdAt: "2023-07-05T20:24:10.727Z",
      date: "2023-07-01",
      mediaLink: {
        bucket: "memos3",
        key: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3-2020-02-01",
        region: "us-east-1",
      },
      name: null,
      owner: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3",
      songLink: null,
      text: null,
      titleText: null,
      type: "entry",
      updatedAt: "2023-07-05T20:24:10.727Z",
    },
    {
      albumLink: null,
      artists: "Q",
      contentType: "song",
      createdAt: "2023-07-05T21:21:53.867Z",
      date: "2023-07-27",
      mediaLink: {
        bucket: "memos3",
        key: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3-2020-02-06",
        region: "us-east-1",
      },
      name: "TODAY",
      owner: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3",
      songLink: "6osru1Fx1n50mRD8QWI9m1",
      text: null,
      titleText: null,
      type: "entry",
      updatedAt: "2023-07-05T21:21:53.867Z",
    },
    {
      albumLink: null,
      artists: null,
      contentType: "Text",
      createdAt: "2023-07-05T20:16:23.530Z",
      date: "2023-07-07",
      mediaLink: null,
      name: null,
      owner: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3",
      songLink: null,
      text: "Hi",
      titleText: "Hello",
      type: "entry",
      updatedAt: "2023-07-05T20:16:23.530Z",
    },
    {
      albumLink: null,
      artists: null,
      contentType: "video",
      createdAt: "2023-07-05T20:14:03.633Z",
      date: "2023-07-20",
      mediaLink: {
        bucket: "memos3",
        key: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3-2020-12-20",
        region: "us-east-1",
      },
      name: null,
      owner: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3",
      songLink: null,
      text: null,
      titleText: null,
      type: "entry",
      updatedAt: "2023-07-05T20:14:03.633Z",
    },
    {
      albumLink: null,
      artists: null,
      contentType: "picture",
      createdAt: "2023-07-05T21:24:49.456Z",
      date: "2023-07-26",
      mediaLink: {
        bucket: "memos3",
        key: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3-2020-12-26",
        region: "us-east-1",
      },
      name: null,
      owner: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3",
      songLink: null,
      text: null,
      titleText: null,
      type: "entry",
      updatedAt: "2023-07-05T21:24:49.456Z",
    },
    {
      albumLink: null,
      artists: null,
      contentType: "picture",
      createdAt: "2023-07-05T20:11:47.760Z",
      date: "2023-07-29",
      mediaLink: {
        bucket: "memos3",
        key: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3-2020-12-29",
        region: "us-east-1",
      },
      name: null,
      owner: "118f8bed-397e-48b0-a6f1-97c3eb9ebef3",
      songLink: null,
      text: null,
      titleText: null,
      type: "entry",
      updatedAt: "2023-07-05T20:11:47.760Z",
    },
  ];
  const [userData, setUserData] = useState();
  const [img, setImg] = useState();
  const [imgLink, setImgLink] = useState();
  const [dataFound, setDataFound] = useState();
  const date = new Date();
  // const listDate = [
  //   {
  //     date: "2023-06-21",
  //     type: "song",
  //     imgLink:
  //       "https://images.genius.com/3d7f4ece5c38275f6d91a75e31a88992.1000x1000x1.png",
  //   },

  //   {
  //     date: "2023-06-23",
  //     type: "voice",
  //     imgLink: null,
  //   },

  //   {
  //     date: "2023-06-25",
  //     type: "picture",
  //     imgLink:
  //       "https://i.pinimg.com/originals/ff/6e/e6/ff6ee672bb14438dda4f34968af1c79c.jpg",
  //   },
  //   {
  //     date: "2023-06-22",
  //     type: "picture",
  //     imgLink:
  //       "https://i.pinimg.com/originals/ff/6e/e6/ff6ee672bb14438dda4f34968af1c79c.jpg",
  //   },
  //   {
  //     date: "2023-06-29",
  //     type: "picture",
  //     imgLink:
  //       "https://i.pinimg.com/originals/ff/6e/e6/ff6ee672bb14438dda4f34968af1c79c.jpg",
  //   },
  // ];

  const getUserInfo = async () => {
    const session = await Auth.currentSession();
    const accessToken = session.getAccessToken().getJwtToken();

    const query = queries.entryByDate;
    const endpoint = ENDPOINT_TEMP + "/graphql";
    const variables = {
      type: "entry",
      sortDirection: "ASC",
    };

    // const requestOptions = {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ query, variables }),
    // };

    const request1Options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const key = "118f8bed-397e-48b0-a6f1-97c3eb9ebef3-2023-02-06";

    try {
      // const store = await Storage.put(key, localUri.uri)
      // console.log(store)
      // console.log(dataFound.mediaLink.key);
      // const store = await fetch(
      //   `${ENDPOINT_TEMP_STORE}/public/${key}`,
      //   request1Options
      // );
      // console.log(store);
      // const response = await store.blob();
      // console.log(response);
      // const fileReaderInstance = new FileReader();
      // fileReaderInstance.readAsDataURL(store);
      // fileReaderInstance.onload = () => {
      //   base64data = fileReaderInstance.result;
      //   setImgLink(base64data);
      // };
      // const objImg = URL.createObjectURL(response);
      // setImgLink(objImg);
      // console.log(objImg);
      // console.log(JSON.stringify(store));
      // const query = await fetch(endpoint, requestOptions);
      // const response = await query.json();
      //if (data.data is not null)
      // console.log(response.data.entryByDate.items);
      // setUserData(response.data.entryByDate.items);
      // console.log(response)
    } catch (error) {
      console.log(error);
      // Handle any errors
    }
  };

  useEffect(() => {
    setUserData(items);
    console.log(date);
    console.log(date.getMonth());
    // getUserInfo();
  }, []);

  // useEffect(() => {
  //   // getUserInfo();
  //   console.log(dataFound);
  // }, [dataFound]);

  return (
    <>
      {userData && (
        <CalendarList
          pastScrollRange={date.getMonth()}
          futureScrollRange={12 - date.getMonth() - 1}
          scrollEnabled={true}
          calendarHeight={380}
          theme={{
            textSectionTitleColor: "white",
            backgroundColor: "#000000",
            calendarBackground: "#000000",
            textDayFontFamily: "InterBold",
            textDayHeaderFont: "InterMedium",
            textDayHeaderFontSize: 14,
            textDayFontSize: 16,
            textDayHeaderFontColor: "#ffffff",
            monthTextColor: "white",
            textMonthFontFamily: "InterMedium",
            textDayHeaderFontFamily: "InterRegular",
            weekVerticalMargin: 5,
            textMonthFontSize: 18,
            "stylesheet.calendar.main": {
              dayContainer: {
                width: 50,
                height: 50,
              },
              emptyDayContainer: {
                width: 50,
                height: 50,
              },
            },
            "stylesheet.calendar-list.main": {
              calendar: {
                paddingLeft: 2,
                paddingRight: 2,
              },
            },
          }}
          dayComponent={({ date, state }) => {
            // const map = {};
            // listDate.forEach((item) => {
            //   map[item.date] = item;
            // });

            let containerStyle = styles.noEntryDate;
            let displayStyle = styles.displayText;
            let disableButton = true;

            const isDateFound = userData.find(
              (el) => el.date == date.dateString
            );

            //const url = isDateFound.mediaLink.key

            if (isDateFound) {
              disableButton = false;
              if (
                isDateFound.contentType == "Text" ||
                isDateFound.contentType == "audio"
              ) {
                // containerStyle = styles.noImgCtn;
                displayStyle = styles.displayText1;
              } else if (isDateFound.contentType == "picture") {
                containerStyle = styles.imgCtn;
              } else if (isDateFound.contentType == "video") {
                containerStyle = styles.imgCtn;
              } else if (isDateFound.contentType == "song") {
                containerStyle = styles.imgCtn;
              } else {
                console.log("no content");
              }
            }

            const content = (
              <>
                {isDateFound &&
                  isDateFound.contentType !== "Text" &&
                  isDateFound.contentType !== "audio" && (
                    <Image
                      style={styles.picture}
                      source={{
                        uri: "https://images.genius.com/3d7f4ece5c38275f6d91a75e31a88992.1000x1000x1.png",
                      }}
                    />
                  )}

                <View style={displayStyle}>
                  <Text
                    style={{
                      color: !isDateFound
                        ? "#808080"
                        : isDateFound.contentType !== "Text" &&
                          isDateFound.contentType !== "audio"
                        ? "white"
                        : "black",
                      fontFamily: "InterSemiBold",
                    }}
                  >
                    {date.day}
                  </Text>
                </View>
              </>
            );
            return (
              <>
                {disableButton ? (
                  <View style={containerStyle}>{content}</View>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/old/4",
                        params: isDateFound,
                      })
                    }
                    style={containerStyle}
                  >
                    {content}
                  </TouchableOpacity>
                )}
              </>
            );
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  imgCtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderRadius: "50%",
  },
  displayText: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  displayText1: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    width: 30,
    height: 30,
    borderRadius: "50%",
  },
  // noImgCtn: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   borderWidth: 2,
  //   borderColor: "white",
  //   width: 50,
  //   height: 50,
  //   borderRadius: "50%",
  // },
  noEntryDate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  picture: {
    flex: 1,
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});

export default CalendarOn;
