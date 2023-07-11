import { CalendarList } from "react-native-calendars";
import { View, Text, Image, StyleSheet } from "react-native";
import { Storage, API } from "aws-amplify";
import * as queries from "../src/graphql/queries";
import { useState, useEffect, createElement } from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as VideoThumbnails from "expo-video-thumbnails";

const CalendarOn = () => {
  const router = useRouter();
  const [userData, setUserData] = useState();
  const [imgData, setImgData] = useState([]);
  const date = new Date();

  const setTokens = async (name, value) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      //was not able to save in async storage
      console.log(error);
    }
  };

  const getUserInfo = async () => {
    try {
      const response = await API.graphql({
        query: queries.entryByDate,
        variables: {
          type: "entry",
          sortDirection: "ASC",
        },
      });

      // console.log(response.data.entryByDate.items);
      let newArr = {};

      for (let el of response.data.entryByDate.items) {
        if (el.contentType !== "Text" && el.contentType !== "song") {
          //if not text or song entry, get the media link and save it to async storage because router params has a character limit
          const contentUrl = await Storage.get(el.mediaLink.key);
          //store in async storage
          await setTokens(el.date, contentUrl);

          if (el.contentType == "video") {
            const thumbnail = await generateThumbnail(contentUrl);
            newArr[el.date] = thumbnail;
          } else {
            newArr[el.date] = contentUrl;
          }
        }
      }

      setUserData(response.data.entryByDate.items);
      setImgData(newArr);
      // const completeData = listData.map(async (el) => {
      // MAP IS NOT ASYNC IF YOU WANT TO USE MAP YOU COULD ALSO USE await Promise.all(array.map(item => anAsyncFunction(item)));
      // });
    } catch (error) {
      console.log("Could not retrieve user info: ", error);
      // Handle any errors
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const generateThumbnail = async (uriVid) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(uriVid, {
        time: 200,
      });
      return uri;
    } catch (e) {
      console.log("THUMBNAIL ERROR: ", e);
    }
  };

  return (
    <>
      {userData && (
        <CalendarList
          pastScrollRange={date.getMonth()}
          futureScrollRange={12 - date.getMonth() - 1}
          scrollEnabled={true}
          calendarHeight={390}
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
              container: {
                paddingLeft: 0,
                paddingRight: 0,
              },
            },
            "stylesheet.calendar.header": {
              header: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 0,
                alignItems: "center",
              },
            },
          }}
          dayComponent={({ date, state }) => {
            let containerStyle = styles.noEntryDate;
            let displayStyle = styles.displayText;
            let disableButton = true;

            const isDateFound = userData.find(
              (el) => el.date == date.dateString
            );

            let url = "";

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
                url = imgData[isDateFound.date];
              } else if (isDateFound.contentType == "video") {
                containerStyle = styles.imgCtn;
                url = imgData[isDateFound.date];
              } else if (isDateFound.contentType == "song") {
                containerStyle = styles.imgCtn;
                url = "https://" + isDateFound.albumLink;
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
                        uri: url,
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
                        pathname: "/old/entry",
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
