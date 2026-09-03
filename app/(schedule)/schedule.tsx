import Class from "@/components/schedule/Class";
import { Lesson, Schedule } from "@/services/schedule/Schedule";
import { dateToNaturalLanguage, getRelativeDate, getWeekdays } from "@/utils/Time";
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
    const [day, setDay] = useState("Aujourd'hui");

    const [schedule, setSchedule] = useState<Schedule | null>(null);

    function updateLessonsForDate(newDate: Date) {
        const schedule = new Schedule();
        if (Platform.OS === "web") {
            const logins = localStorage.getItem("logins");

            if (logins) {
                schedule.setLogins(atob(logins));

                schedule.getWeekLessons(newDate).then((lessons) => {
                    setLessons(lessons);
                });
            }
        } else {
            schedule.getLogins().then(async () => {
                const lessons = await schedule.getWeekLessons(newDate);
                setLessons(lessons);
            });
        }
    }

    useEffect(() => {
        // const schedule = new Schedule();
        setSchedule(schedule);
        updateLessonsForDate(date)
    }, []);

    return (
        <View className="flex-1 pt-16 bg-bg px-5">

            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    onValueChange={(event, selectedDate) => {
                        if (selectedDate) {
                            if(getWeekdays(selectedDate) != getWeekdays(date)) {
                                updateLessonsForDate(selectedDate);
                            }
                            setDate(selectedDate);
                            setDay(getRelativeDate(selectedDate));
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
                    {day}
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
                            key={`${lesson.start}+${lesson.title}+${index}`}
                            classData={{
                                endDate: lesson.end,
                                startDate: lesson.start,
                                room: lesson.location,
                                subject: lesson.title,
                                teacher: lesson.description.match(/^[^\d\n]+$/gm)?.[0] || "N/A",
                                classType: lesson.description.match(/(?<=_)(CM|TD|TP)(?=_)/)?.[0] as "CM" | "TD" | "TP" || null,
                            }}
                        />
                    ))}
            </ScrollView>
        </View>
    );
}