import { CalendarList } from "react-native-calendars";
import { View, Text, Image, StyleSheet } from "react-native";
import { Storage, API } from "aws-amplify";
import * as queries from "../src/graphql/queries";
import { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";

// Display Calendar with all Journal Entries
const CalendarOn = () => {
  const router = useRouter();
  const [userData, setUserData] = useState();
  const [imgData, setImgData] = useState([]);

  // Get all Journal Entries when page first renders
  useEffect(() => {
    (async () => {
      try {
        const response = await API.graphql({
          query: queries.entryByDate,
          variables: {
            type: "entry",
            sortDirection: "ASC",
          },
        });

        let newArr = {};
        let allDates = {};

        for (let el of response.data.entryByDate.items) {
          allDates[el.date] = el;
          if (el.contentType == "video" || el.contentType == "picture") {
            const contentUrl = await Storage.get(el.mediaLink.key);
            // Generate Video thumbnail and store in array
            if (el.contentType == "video") {
              const thumbnail = await generateThumbnail(contentUrl);
              newArr[el.date] = thumbnail;
            } else {
              newArr[el.date] = contentUrl;
            }
          }
        }

        setImgData(newArr);
        setUserData(allDates);
      } catch (error) {
        console.log("Could not retrieve user info: ", error);
        // Handle any errors
      }
    })();
  }, []);

  // Generate Thumbnail for Video Journal Entries
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

  // pastScrollRange={date.getMonth()}
  // futureScrollRange={12 - date.getMonth() - 1}

  return (
    <>
      {userData && (
        <CalendarList
          pastScrollRange={8}
          futureScrollRange={1}
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

            let isDateFound = userData[date.dateString];

            let url = "";

            if (isDateFound) {
              disableButton = false;

              if (isDateFound.mediaLink?.key) {
                isDateFound.key = isDateFound.mediaLink.key;
              }

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
                console.log("No content");
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
