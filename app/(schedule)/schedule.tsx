import { useStartupContext } from "@/components/contexts/StartupContext";
import Break from "@/components/schedule/Break";
import Class from "@/components/schedule/Class";
import { Lesson, Schedule } from "@/services/ade/schedule/Schedule";
import { dateToNaturalLanguage, getClosestDay, getNextWeekday, getPreviousWeekday, getRelativeDate } from "@/utils/Time";
import DateTimePicker from '@expo/ui/community/datetime-picker';
import PagerView, { type PagerViewRef } from '@expo/ui/community/pager-view';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

const formatDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function ScheduleScreen() {
    const setStartupReady = useStartupContext();

    const [lessonsCache, setLessonsCache] = useState<Record<string, Lesson[] | null>>({});

    const pagerRef = useRef<PagerViewRef>(null);
    // const isUpdatingDateRef = useRef(false);

    const [date, setDate] = useState(() => {
        const today = new Date();
        const closestDay = getClosestDay(today);
        closestDay.setHours(0, 0, 0, 0);
        return closestDay;
    });

    const [displayedDate, setDisplayedDate] = useState<Date>(date);

    const updateDisplayedDate = useCallback((targetDate: Date) => {
        setDisplayedDate(prev => {
            if (prev.getTime() !== targetDate.getTime()) {
                return targetDate;
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        setDisplayedDate(date);
    }, [date]);

    const [timePickerShow, setTimePickerShow] = useState(false);
    const scheduleInstance = useRef<Schedule | null>(null);

    const safeDate = (d: any): Date | null => {
        if (!d) return null;
        const dateObj = d instanceof Date ? d : new Date(d);
        return isNaN(dateObj.getTime()) || dateObj.getFullYear() < 2000 ? null : dateObj;
    };

    const fetchLessons = useCallback(async (_date: Date) => {
        if (scheduleInstance.current == null) {
            scheduleInstance.current = new Schedule();
        }

        const dateKey = formatDateKey(_date);

        if (lessonsCache[dateKey] !== undefined) return;

        try {
            const fetchedLessons = await scheduleInstance.current.getWeekLessons(_date);

            const groupedFetched: Record<string, Lesson[]> = {};

            fetchedLessons.forEach(l => {
                const startDate = safeDate(l.start);
                const endDate = safeDate(l.end);

                if (startDate && endDate && startDate.getTime() < endDate.getTime()) {
                    const key = formatDateKey(startDate);
                    if (!groupedFetched[key]) groupedFetched[key] = [];

                    groupedFetched[key].push({
                        ...l,
                        start: startDate,
                        end: endDate
                    });
                }
            });

            setLessonsCache(prev => {
                const updated = { ...prev };

                if (!groupedFetched[dateKey]) {
                    updated[dateKey] = null;
                }

                Object.keys(groupedFetched).forEach(k => {
                    const dayLessons = groupedFetched[k].sort((a, b) => a.start.getTime() - b.start.getTime());

                    const uniqueLessons: Lesson[] = [];
                    const seen = new Set<string>();

                    for (const lesson of dayLessons) {
                        const uniqueKey = `${lesson.start.getTime()}-${lesson.end.getTime()}-${lesson.title}`;
                        if (!seen.has(uniqueKey)) {
                            seen.add(uniqueKey);
                            uniqueLessons.push(lesson);
                        }
                    }

                    updated[k] = uniqueLessons.length > 0 ? uniqueLessons : null;
                });

                return updated;
            });
        } catch (e) {
            console.error("Erreur récupération cours :", e);
        }
    }, [lessonsCache]);

    const renderLessonsForDate = useCallback((_date: Date) => {
        const dateKey = formatDateKey(_date);
        const dayCache = lessonsCache[dateKey];

        // jour pas fetch -> chargement
        if (dayCache === undefined) {
            return (
                <View className="justify-center items-center h-full">
                    <ActivityIndicator size="large" color="#687076" />
                    <Text className="text-text mt-3 text-base font-medium">Chargement...</Text>
                </View>
            );
        }

        // jour fetch, mais pas de cours
        if (dayCache === null || dayCache.length === 0) {
            return (
                <View className="justify-center items-center h-full" >
                    <Text className="text-text text-base font-medium">Aucun cours aujourd'hui.</Text>
                </View>
            );
        }

        // jour fetch et cours
        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="flex-col gap-2 pb-[200] mb-4"
            >
                {dayCache.flatMap((lesson, index, lessonsOfDay) => {
                    const nextLesson = lessonsOfDay[index + 1];

                    const hasBreak = Boolean(
                        nextLesson &&
                        nextLesson.start.getTime() > lesson.end.getTime() &&
                        (nextLesson.start.getTime() - lesson.end.getTime()) > 60000
                    );

                    return [
                        <Class
                            key={`lesson-${lesson.start.getTime()}-${index}`}
                            classData={{
                                endDate: lesson.end,
                                startDate: lesson.start,
                                room: lesson.location ? lesson.location.replace(" (V)", "") : "",
                                subject: lesson.title,
                                teacher: lesson.description ? (lesson.description.match(/^[^\d\n]+$/gm)?.[0] || "N/A") : "N/A",
                                classType: lesson.description ? (lesson.description.match(/(?<=_)(CM|TD|TP)(?=_)/)?.[0] as "CM" | "TD" | "TP" | null) : null,
                            }}
                        />,
                        ...(hasBreak ? [
                            <Break
                                key={`break-${lesson.end.getTime()}-${nextLesson.start.getTime()}`}
                                startDate={lesson.end}
                                endDate={nextLesson.start}
                            />
                        ] : []),
                    ];
                })}
            </ScrollView>
        );
    }, [lessonsCache]);

    const changeCurrentDate = useCallback((_date: Date) => {
        // isUpdatingDateRef.current = true;

        const cleanDate = getClosestDay(_date);
        cleanDate.setHours(0, 0, 0, 0);

        setDate(cleanDate);

        fetchLessons(cleanDate);
        fetchLessons(getPreviousWeekday(cleanDate));
        fetchLessons(getNextWeekday(cleanDate));

        // setTimeout(() => {
        //     isUpdatingDateRef.current = false;
        // }, 150);
    }, [fetchLessons]);

    useEffect(() => {
        setStartupReady();
        scheduleInstance.current = new Schedule();
        changeCurrentDate(date);
    }, []);

    const prevDate = useMemo(() => getPreviousWeekday(date), [date]);
    const nextDate = useMemo(() => getNextWeekday(date), [date]);

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
                    {dateToNaturalLanguage(displayedDate)}
                </Text>
                <Text className="text-grey text-lg font-normal">
                    {getRelativeDate(displayedDate)}
                </Text>
            </Pressable>

            <PagerView
                key={date.toISOString()}
                ref={pagerRef}
                initialPage={1}
                className="flex-1"
                onPageSelected={(event) => {
                    // if (isUpdatingDateRef.current) return;

                    const pos = event.nativeEvent.position;
                    if (pos === 2) {
                        changeCurrentDate(nextDate);
                    } else if (pos === 0) {
                        changeCurrentDate(prevDate);
                    }
                }}
                onPageScroll={(event) => {
                    if (event.nativeEvent.offset > 0.5 && event.nativeEvent.position === 1) {
                        updateDisplayedDate(nextDate);
                    } else if (event.nativeEvent.offset < 0.5 && event.nativeEvent.position === 0) {
                        updateDisplayedDate(prevDate);
                    } else {
                        updateDisplayedDate(date);
                    }
                }}
            >
                <View key={`prev-${prevDate.toISOString()}`}>{renderLessonsForDate(prevDate)}</View>
                <View key={`curr-${date.toISOString()}`}>{renderLessonsForDate(date)}</View>
                <View key={`next-${nextDate.toISOString()}`}>{renderLessonsForDate(nextDate)}</View>
            </PagerView>
        </View>
    );
}