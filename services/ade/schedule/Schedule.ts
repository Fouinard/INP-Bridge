import { getIcal } from "@/services/ade/schedule/endpoints";
import ICAL from "ical.js";
import { SessionManager } from '../session/SessionManager';
import { ADE_DEFAULTS } from "../session/constants";

export interface Lesson {
    title: string;
    start: Date;
    end: Date;
    location: string;
    description: string;
}

export class Schedule {
    resources: number;

    constructor(resources = 1198) {
        this.resources = resources;
    }    

    private parseIcalText(icsText: string): Lesson[] {
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


    async fetch4Weeks() {
        const response = await fetch(
            `https://${ADE_DEFAULTS.endpoint}/directCal/${ADE_DEFAULTS.year}/${ADE_DEFAULTS.type}/${ADE_DEFAULTS.location}?resources=${this.resources}`,
            {
                headers: {
                    Authorization: "Basic " + await SessionManager.getInstance().getFormattedCredentials(),
                }
            }
        );
        const icsText = await response.text();
        return this.parseIcalText(icsText);
    }

    async getWeekLessons(date?: Date): Promise<Lesson[]> {
        const startDate = date ? date.toISOString() : new Date().toISOString();
        const icsText = await SessionManager.getInstance().authenticatedRequest(getIcal, {startDate});
        return this.parseIcalText(icsText);
    }
}