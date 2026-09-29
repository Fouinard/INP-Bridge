import { Lesson } from "@/services/ade/schedule";
import React, { createContext, useContext, useRef } from "react";

const LessonsContext = createContext<{
    setLessons: (lessons: Lesson[]) => void;
    getLessons: () => Lesson[];
    setDate: (date: Date) => void;
    getDate: () => Date;
    setHours: (start: number, end: number) => void;
    getHours: () => { start: number, end: number };
} | null>(null);

export function LessonsProvider({ children }: { children: React.ReactNode }) {

    const lessonsCache = useRef([] as Lesson[]);
    const dateCache = useRef(new Date());
    const hoursCache = useRef({ start: 0, end: 0 });

    const setHours = (start: number, end: number) => {
        hoursCache.current = { start, end };
    };

    const getHours = () => {
        return hoursCache.current;
    };

    const setDate = (date: Date) => {
        dateCache.current = date;
    }

    const getDate = () => {
        return dateCache.current;
    }

    const setLessons = (lessons: Lesson[]) => {
        lessonsCache.current = lessons;
    };

    const getLessons = () => {
        return lessonsCache.current;
    }

    return (
        <LessonsContext.Provider value={{ setLessons, getLessons, setDate, getDate, setHours, getHours }}>
            {children}
        </LessonsContext.Provider>
    );
}

export const useLessonsContext = () => {
    const context = useContext(LessonsContext);
    if (!context) throw new Error("useLessons has to be used within an LessonsProvider");
    return context;
};