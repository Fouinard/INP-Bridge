import { Lesson } from "@/services/ade/schedule";
import { useLessonsContext } from "@/components/contexts/LessonsContext";
import { View, Text, ScrollView, Pressable } from "react-native";
import Class from "@/components/schedule/Class";
import { dateToNaturalLanguage, getRelativeDate } from "@/utils/Time";

export default function () {
    const lessonsContext = useLessonsContext();
    const lessons = lessonsContext.getLessons();
    const displayedDate = lessonsContext.getDate();
    const hours = lessonsContext.getHours();

    return (
        <View className="flex-1 pt-16 bg-bg px-5">
            <Text className="text-text text-3xl font-semibold">
                {dateToNaturalLanguage(displayedDate)} - {hours.start}h à {hours.end}h
            </Text>
            <Text className="text-grey text-lg font-normal">
                {getRelativeDate(displayedDate)}
            </Text>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="flex-col gap-2 pb-[200] mb-4"
            >
                {
                    lessons.map((lesson, index) => (
                        <Class
                            key={`lesson-${lesson.start.getTime()}-${lesson.title}`}
                            classData={{
                                endDate: lesson.end,
                                startDate: lesson.start,
                                room: lesson.location
                                    ? lesson.location.replace(" (V)", "")
                                    : "",
                                subject: lesson.title,
                                teacher:
                                    lesson.description?.match(
                                        /^[^\d\n]+$/gm,
                                    )?.[0] || "N/A",
                                classType:
                                    (lesson.description?.match(
                                        /(?<=_)(CM|TD|TP)(?=_)/
                                    )?.[0] as "CM" | "TD" | "TP" | null) || null,
                            }}
                        />
                    ))
                }
            </ScrollView>
        </View >
    )
}