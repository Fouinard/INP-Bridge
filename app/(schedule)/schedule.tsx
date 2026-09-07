import Break from "@/components/schedule/Break";
import Class from "@/components/schedule/Class";
import { Lesson, Schedule } from "@/services/ade/schedule/Schedule";
import { dateToNaturalLanguage, getNextWeekday, getPreviousWeekday, getRelativeDate } from "@/utils/Time";
import DateTimePicker from '@expo/ui/community/datetime-picker';
import PagerView, { type PagerViewRef } from '@expo/ui/community/pager-view';
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function () {
    const [lessonsCache, setLessonsCache] = useState<Lesson[]>([]);

    const pagerRef = useRef<PagerViewRef>(null);

    const [date, setDate] = useState(() => {
        const today = new Date();
        if ([0, 6].includes(today.getDay())) {
            today.setDate(today.getDate() + (today.getDay() == 0 ? 1 : -2));
        }
        today.setHours(0, 0, 0, 0);
        return today;
    });

    const [timePickerShow, setTimePickerShow] = useState(false);

    const [dateDescription, setDateDescription] = useState("Aujourd'hui");

    const scheduleInstance = useRef<Schedule | null>(null);

    const fetchLessons = async (_date: Date) => {
        console.log("Fetching lessons for date:", _date);
        if (scheduleInstance.current == null) {
            scheduleInstance.current = new Schedule();
        }
        if (lessonsCache != null && lessonsCache.length > 0) {
            const possibleLessons = lessonsCache.filter(lesson =>
                lesson.start.getDate() === _date.getDate() &&
                lesson.start.getMonth() === _date.getMonth() &&
                lesson.start.getFullYear() === _date.getFullYear()
            )
            console.log("Found lessons in cache for date:", _date, possibleLessons);
            if (possibleLessons.length > 0) {
                return possibleLessons.sort((a, b) => a.start.getTime() - b.start.getTime());
            }
        }
        const fetchedLessons = await scheduleInstance.current.getWeekLessons(_date);
        setLessonsCache(lessonsCache.concat(fetchedLessons));
        return fetchedLessons.filter(lesson =>
            lesson.start.getDate() === _date.getDate() &&
            lesson.start.getMonth() === _date.getMonth() &&
            lesson.start.getFullYear() === _date.getFullYear()
        ).sort((a, b) => a.start.getTime() - b.start.getTime());
    }

    const changeCurrentDate = (_date: Date) => {
        setDate(_date);
        setDateDescription(getRelativeDate(_date));
        fetchLessons(_date);
        fetchLessons(getPreviousWeekday(_date));
        fetchLessons(getNextWeekday(_date));

        pagerRef.current?.setPageWithoutAnimation(1);
    }

    useEffect(() => {
        setLessonsCache([]);
        console.log("Initializing lessons cache for date:", date);
        const schedule = new Schedule();
        scheduleInstance.current = schedule;
        console.log(date)
        const init = async () => {
            await fetchLessons(getPreviousWeekday(date));
            await fetchLessons(date);
            await fetchLessons(getNextWeekday(date));
        }
        init()
    }, []);

    const getLessonsForDate = (_date: Date) => {
        const possibleLessons = lessonsCache.
            filter(lesson =>
                lesson.start.getDate() === _date.getDate() &&
                lesson.start.getMonth() === _date.getMonth() &&
                lesson.start.getFullYear() === _date.getFullYear()
            )
            .sort((a, b) => a.start.getTime() - b.start.getTime())
        return <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex-col gap-2 pb-[200] mb-4"
        >
            {possibleLessons
                .flatMap((lesson, index, lessonsOfDay) => {
                    const nextLesson = lessonsOfDay[index + 1];

                    const hasBreak =
                        nextLesson &&
                        nextLesson.start.getTime() > lesson.end.getTime();

                    return [
                        <Class
                            key={`lesson-${lesson.start.getTime()}-${lesson.title}`}
                            classData={{
                                endDate: lesson.end,
                                startDate: lesson.start,
                                room: lesson.location.replace(" (V)", ""),
                                subject: lesson.title,
                                teacher:
                                    lesson.description.match(/^[^\d\n]+$/gm)?.[0] ||
                                    "N/A",
                                classType:
                                    lesson.description.match(
                                        /(?<=_)(CM|TD|TP)(?=_)/
                                    )?.[0] as "CM" | "TD" | "TP" | null,
                            }}
                        />,
                        ...(hasBreak
                            ? [
                                <Break
                                    key={`break-${lesson.end.getTime()}`}
                                    startDate={lesson.end}
                                    endDate={nextLesson.start}
                                />,
                            ]
                            : []),
                    ];
                })}
        </ScrollView>
    }

    return (
        <View className="flex-1 pt-16 bg-bg px-5">

            {timePickerShow && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    onValueChange={(event, selectedDate) => {
                        if (selectedDate) {
                            changeCurrentDate(selectedDate);
                        }
                        setTimePickerShow(false);
                    }}
                    onDismiss={() => setTimePickerShow(false)}
                />
            )}

            <Pressable onPress={() => setTimePickerShow(true)}>
                <Text className="text-text text-3xl font-semibold">
                    {dateToNaturalLanguage(date)}
                </Text>

                <Text className="text-grey text-lg font-normal">
                    {dateDescription}
                </Text>
            </Pressable>

            <PagerView
                ref={pagerRef}
                initialPage={1}
                className="flex-1"
                onPageSelected={(event) => {
                    if (event.nativeEvent.position === 2) {
                        const newDate = getNextWeekday(date);
                        changeCurrentDate(newDate);
                    } else if (event.nativeEvent.position === 0) {
                        const newDate = getPreviousWeekday(date);
                        changeCurrentDate(newDate);
                    }
                }}
            >
                {getLessonsForDate(getPreviousWeekday(date))}
                {getLessonsForDate(date)}
                {getLessonsForDate(getNextWeekday(date))}
            </PagerView>
        </View>
    );
}