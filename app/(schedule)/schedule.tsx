import Break from "@/components/schedule/Break";
import Class from "@/components/schedule/Class";
import { Lesson, Schedule } from "@/services/ade/schedule/Schedule";
import { dateToNaturalLanguage, getRelativeDate, getPreviousWeekday, getNextWeekday, isSameWeek } from "@/utils/Time";
import DateTimePicker from "@react-native-community/datetimepicker";
import PagerView, { type PagerViewRef } from '@expo/ui/community/pager-view';
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

export default function () {
    // const [lessons, setLessons] = useState<Lesson[] | null>(null);
    const lessonCacheRef = useRef<Lesson[] | null>(null);

    const yesterdayLessonsRef = useRef<Lesson[] | null>(null);
    const todayLessonsRef = useRef<Lesson[] | null>(null);
    const tomorrowLessonsRef = useRef<Lesson[] | null>(null);

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

    // const [scheduleInstance, setScheduleInstance] = useState<Schedule | null>(null);
    const scheduleInstance = useRef<Schedule | null>(null);

    // async function getDayLessons(_date: Date) {
    //     if (lessonCacheRef.current! != null && lessonCacheRef.current!.length > 0) {
    //         const possibleLessons = lessonCacheRef.current!.filter(lesson =>
    //             lesson.start.getDate() === _date.getDate() &&
    //             lesson.start.getMonth() === _date.getMonth() &&
    //             lesson.start.getFullYear() === _date.getFullYear()
    //         )
    //         if(possibleLessons.length > 0) {
    //             return possibleLessons.sort((a, b) => a.start.getTime() - b.start.getTime());
    //         }
    //     }
    //     if (scheduleInstance == null) {
    //         setScheduleInstance(new Schedule());
    //     }
    //     const lessons = await scheduleInstance!.getWeekLessons(_date);
    //     setlessonCacheRef.current!(lessons);
    //     return lessons.filter(lesson =>
    //         lesson.start.getDate() === _date.getDate() &&
    //         lesson.start.getMonth() === _date.getMonth() &&
    //         lesson.start.getFullYear() === _date.getFullYear()
    //     ).sort((a, b) => a.start.getTime() - b.start.getTime())
    // }

    const fetchLessons = async (date: Date) => {
        if (scheduleInstance.current == null) {
            return;
        }

        const possibleLessons = lessonCacheRef.current?.filter(lesson =>
            lesson.start.getDate() === date.getDate() &&
            lesson.start.getMonth() === date.getMonth() &&
            lesson.start.getFullYear() === date.getFullYear()
        )


        let _todayLessons
        if (possibleLessons != null && possibleLessons.length > 0) {
            _todayLessons = lessonCacheRef.current!!
        } else {
            _todayLessons = await scheduleInstance.current.getWeekLessons(date);
        }

        todayLessonsRef.current = _todayLessons
            .filter(lesson =>
                lesson.start.getDate() === date.getDate() &&
                lesson.start.getMonth() === date.getMonth() &&
                lesson.start.getFullYear() === date.getFullYear()
            ).sort((a, b) => a.start.getTime() - b.start.getTime())

        const yesterday = getPreviousWeekday(date);
        const tomorrow = getNextWeekday(date);
        if (!isSameWeek(yesterday, date)) {
            const _yesterdayLessons = await scheduleInstance.current.getWeekLessons(yesterday);
            yesterdayLessonsRef.current = _yesterdayLessons
                .filter(lesson =>
                    lesson.start.getDate() === yesterday.getDate() &&
                    lesson.start.getMonth() === yesterday.getMonth() &&
                    lesson.start.getFullYear() === yesterday.getFullYear()
                ).sort((a, b) => a.start.getTime() - b.start.getTime())
        } else {
            yesterdayLessonsRef.current = _todayLessons
                .filter(lesson =>
                    lesson.start.getDate() === yesterday.getDate() &&
                    lesson.start.getMonth() === yesterday.getMonth() &&
                    lesson.start.getFullYear() === yesterday.getFullYear()
                ).sort((a, b) => a.start.getTime() - b.start.getTime())
        }

        if (!isSameWeek(tomorrow, date)) {
            const _tomorrowLessons = await scheduleInstance.current.getWeekLessons(tomorrow);
            tomorrowLessonsRef.current = _tomorrowLessons
                .filter(lesson =>
                    lesson.start.getDate() === tomorrow.getDate() &&
                    lesson.start.getMonth() === tomorrow.getMonth() &&
                    lesson.start.getFullYear() === tomorrow.getFullYear()
                ).sort((a, b) => a.start.getTime() - b.start.getTime())
        } else {
            tomorrowLessonsRef.current = _todayLessons
                .filter(lesson =>
                    lesson.start.getDate() === tomorrow.getDate() &&
                    lesson.start.getMonth() === tomorrow.getMonth() &&
                    lesson.start.getFullYear() === tomorrow.getFullYear()
                ).sort((a, b) => a.start.getTime() - b.start.getTime())
        }

        lessonCacheRef.current = _todayLessons;
    }

    useEffect(() => {
        const schedule = new Schedule();
        scheduleInstance.current = schedule;
        // updateLessonsForDate(date)
        fetchLessons(date);
    }, []);

    const getLessonsForDate = (day: -1 | 0 | 1) => {
        const lessons = [todayLessonsRef.current, tomorrowLessonsRef.current, yesterdayLessonsRef.current];
        return <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex-col gap-2 pb-[200] mb-4"
        >
            {
                lessons[day]?.flatMap((lesson, index, lessonsOfDay) => {
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
                                    )?.[0] as "CM" | "TD" | "TP" || null,
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
                })
            }
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
                            fetchLessons(selectedDate);
                            setDate(selectedDate);
                            setDateDescription(getRelativeDate(selectedDate));
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
                    if (event.nativeEvent.position == 2) {
                        const newDate = getNextWeekday(date);
                        fetchLessons(newDate);
                        pagerRef.current?.setPageWithoutAnimation(1);
                        setDate(newDate);
                    } else if (event.nativeEvent.position == 0) {
                        const newDate = getPreviousWeekday(date);
                        fetchLessons(newDate);
                        pagerRef.current?.setPageWithoutAnimation(1);
                        setDate(newDate);
                    }
                }}
            >
                {getLessonsForDate(-1)}
                {getLessonsForDate(0)}
                {getLessonsForDate(1)}
            </PagerView>
        </View>
    );
}