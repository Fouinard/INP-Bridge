import Class from "@/components/schedule/Class";
import { Lesson, Schedule } from "@/services/schedule/Schedule";
import { dateToNaturalLanguage } from "@/utils/Time";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

export default function () {
    const [lessons, setLessons] = useState<Lesson[] | null>(null);
    const [date, setDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
    const [show, setShow] = useState(false);

    useEffect(() => {
        const schedule = new Schedule();

        if (Platform.OS === "web") {
            const logins = localStorage.getItem("logins");

            if (logins) {
                schedule.setLogins(atob(logins));

                schedule.getWeekLessons(date).then((lessons) => {
                    setLessons(lessons);
                });
            }
        } else {
            schedule.getLogins().then(async () => {
                const lessons = await schedule.getWeekLessons(date);
                setLessons(lessons);
            });
        }
    }, []);

    return (
        <View className="flex-1 pt-16 bg-bg px-5">

            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    onChange={(event, selectedDate) => {
                        if (selectedDate) {
                            setDate(selectedDate);
                        }

                        if (Platform.OS === "android") {
                            setShow(false);
                        }
                    }}
                    onDismiss={() => setShow(false)}
                />
            )}

            <Pressable onPress={() => setShow(true)}>
                <Text className="text-text text-3xl font-semibold">
                    {dateToNaturalLanguage(date)}
                </Text>

                <Text className="text-grey text-lg font-normal">
                    Aujourd'hui
                </Text>
            </Pressable>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="flex-col gap-2 pb-[200] mb-4"
            >
                {lessons
                    ?.filter(
                        (lesson) =>
                            lesson.start.getDate() === date.getDate() &&
                            lesson.start.getMonth() === date.getMonth() &&
                            lesson.start.getFullYear() === date.getFullYear()
                    )
                    .sort(
                        (a, b) =>
                            a.start.getTime() - b.start.getTime()
                    )
                    .map((lesson, index) => (
                        <Class
                            key={index}
                            classData={{
                                endDate: lesson.end,
                                startDate: lesson.start,
                                room: lesson.location,
                                subject: lesson.title,
                                teacher: lesson.description
                                    .trim()
                                    .split("\n\n")[0]
                                    .replace("\n", " "),
                            }}
                        />
                    ))}
            </ScrollView>
        </View>
    );
}