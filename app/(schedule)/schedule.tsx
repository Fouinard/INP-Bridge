import { Text, View, TextInput, ScrollView, Pressable } from "react-native";
import Toast from "react-native-toast-message";
import * as SecureStore from 'expo-secure-store';
import { Checkbox } from "expo-checkbox";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import colors from "@/styles/colors";
import { dateToNaturalLanguage } from "@/utils/Time";
import { Lesson, Schedule } from "@/services/schedule/Schedule";
import { Platform } from "react-native";
import Class from "@/components/schedule/Class";

export default function () {
    const router = useRouter();

    const today = new Date();
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
        <ScrollView className="flex-1 pt-16 bg-bg px-5">
            <Text className="text-text text-3xl font-semibold">
                {dateToNaturalLanguage(today)}
            </Text>
            <Text className="text-grey text-lg font-normal">
                Aujourd'hui
            </Text>
            <View>
                {lessons && lessons.filter((lesson) => lesson.start >= today).map((lesson, index) => (
                    <Class key={index} classData={
                        {
                            endDate: lesson.end,
                            startDate: lesson.start,
                            room: lesson.description.trim().split('\n\n')[1],
                            subject: lesson.title,
                            teacher: lesson.description.trim().split("\n\n")[0]
                        }
                    } />
                ))}
            </View>
        </ScrollView>
    );
}