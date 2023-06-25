import { CalendarList } from "react-native-calendars";
import { COLORS } from "../constants";
import { backgroundColor } from "react-native-calendars/src/style";
import { View, Text, Image, StyleSheet } from "react-native";

const CalendarOn = () => {
  const listDate = [
    {
      date: "2023-06-21",
      type: "song",
      imgLink:
        "https://images.genius.com/3d7f4ece5c38275f6d91a75e31a88992.1000x1000x1.png",
    },

    {
      date: "2023-06-23",
      type: "voice",
      imgLink: null,
    },

    {
      date: "2023-06-25",
      type: "picture",
      imgLink:
        "https://i.pinimg.com/originals/ff/6e/e6/ff6ee672bb14438dda4f34968af1c79c.jpg",
    },
    {
      date: "2023-06-22",
      type: "picture",
      imgLink:
        "https://i.pinimg.com/originals/ff/6e/e6/ff6ee672bb14438dda4f34968af1c79c.jpg",
    },
    {
      date: "2023-06-29",
      type: "picture",
      imgLink:
        "https://i.pinimg.com/originals/ff/6e/e6/ff6ee672bb14438dda4f34968af1c79c.jpg",
    },
  ];
  return (
    <CalendarList
      pastScrollRange={3}
      futureScrollRange={12}
      scrollEnabled={true}
      calendarHeight={450}
      theme={{
        textSectionTitleColor: "white",
        backgroundColor: "#000000",
        calendarBackground: "#000000",
        textDayFontFamily: "InterMedium",
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

        const isDateFound = listDate.find((el) => el.date == date.dateString);

        let containerStyle = styles.noEntryDate;

        if (isDateFound && isDateFound?.imgLink) {
          containerStyle = styles.imgCtn;
        } else if (isDateFound && !isDateFound?.imgLink) {
          containerStyle = styles.noImgCtn;
        }
        return (
          <View style={containerStyle}>
            {isDateFound?.imgLink && (
              <Image
                style={styles.picture}
                source={{ uri: isDateFound.imgLink }}
              />
            )}

            <View style={styles.displayText}>
              <Text
                style={{
                  color: isDateFound ? "white" : "#808080",
                }}
              >
                {date.day}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  imgCtn: {
    flex: 1,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  displayText: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  noImgCtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 50,
  },
  noEntryDate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  picture: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});

export default CalendarOn;
