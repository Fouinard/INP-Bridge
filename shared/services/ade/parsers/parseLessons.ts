import { ParsedLesson } from "@/features/schedule/types";
import { Lesson } from "../types/schedule.types";

export default function parseLessons(lessons: Lesson[]): ParsedLesson[] {
    return lessons.map(lesson => {
        return {
            endDate: lesson.end,
            startDate: lesson.start,
            room: lesson.location ? lesson.location.replace(" (V)", "") : "",
            subject: lesson.title,
            teacher: lesson.description ? (lesson.description.match(/^[^\d\n]+$/gm)?.[0] || "N/A") : "N/A",
            classType: lesson.description ? (lesson.description.match(/(?<=_)(CM|TD|TP)(?=_)/)?.[0] as "CM" | "TD" | "TP" | null) : null,
        }
    })
}