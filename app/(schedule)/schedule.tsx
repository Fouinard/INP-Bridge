import Class from "@/components/schedule/Class";
import { Lesson, Schedule } from "@/services/schedule/Schedule";
import { dateToNaturalLanguage } from "@/utils/Time";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";

export default function () {
    const router = useRouter();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const schedule = new Schedule();

    const [lessons, setLessons] = useState<Lesson[] | null>(null);

    if (Platform.OS === "web") {
        const logins = localStorage.getItem('logins');
        if (logins) {
            schedule.setLogins(atob(logins));
            schedule.getWeekLessons(today).then((lessons) => {
                setLessons(lessons);
            })
        }
    } else {
        schedule.getLogins().then(async () => {
            // Toast.show({
            //     type: 'info',
            //     text2: `${btoa(`${schedule.username}:${schedule.password}`)}`,
            //     autoHide: true
            // });

            setLessons(await schedule.getWeekLessons(today));
        })
    }

    // useEffect(() => {
    // }, [lessons]);

    return (
        <View className="flex-1 pt-16 bg-bg px-5">
            <Text className="text-text text-3xl font-semibold">
                {dateToNaturalLanguage(today)}
            </Text>
            <Text className="text-grey text-lg font-normal">
                Aujourd'hui
            </Text>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="flex-col gap-2 pb-[200] mb-4"               
            >
                {lessons && lessons.filter((lesson) => lesson.start >= today && lesson.end <= tomorrow).sort((a, b) => a.start.getTime() - b.start.getTime()).map((lesson, index) => (
                    <Class key={index} classData={
                        {
                            endDate: lesson.end,
                            startDate: lesson.start,
                            room: lesson.location,
                            subject: lesson.title,
                            teacher: lesson.description.trim().split("\n\n")[0].replace("\n", " "),
                        }
                    } />
                ))}
            </ScrollView>
        </View>
    );
}