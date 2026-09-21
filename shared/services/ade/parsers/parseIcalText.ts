import ICAL from "ical.js";
import { Lesson } from "../types/schedule.types";

export default function parseIcalText(icsText: string): Lesson[] {
    const jcal = ICAL.parse(icsText);
    const calendar = new ICAL.Component(jcal);
    return calendar.getAllSubcomponents("vevent").map(component => {
        const event = new ICAL.Event(component);
        return {
            title: event.summary,
            start: event.startDate.toJSDate(),
            end: event.endDate.toJSDate(),
            location: event.location,
            description: (event.description || "").replace(
                /\(Exporté\s+le\s*:\s*\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}\)/g,
                ""
            )
        };
    });
}