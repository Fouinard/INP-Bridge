import * as SecureStore from 'expo-secure-store';
import ICAL from "ical.js";
import { getWeekdays } from '@/utils/Time';

export interface Lesson {
    title: string;
    start: Date;
    end: Date;
    location: string;
    description: string;
}

export class Schedule {
    endpoint: string;
    year: string;
    type: string;
    location: string;
    resources: number;
    username: string | null;
    password: string | null;
    setCookies: string | null;
    validateCookies: string | null;

    constructor(endpoint = "edt.grenoble-inp.fr", year = "2026-2027", type = "etudiant", location = "prepaINPGrenoble", resources = 1198) {
        this.endpoint = endpoint;
        this.year = year;
        this.type = type;
        this.location = location;
        this.resources = resources;
        this.username = null;
        this.password = null;
        this.setCookies = null;
        this.validateCookies = null;
    }

    public async getLogins() {
        this.username = await SecureStore.getItemAsync("username");
        this.password = await SecureStore.getItemAsync("password");
    }

    public async setLogins(logins: string) {
        const [username, password] = logins.split(":");
        this.username = username;
        this.password = password;
    }

    private formatNumber(number: number) {
        return number.toString().padStart(2, "0");
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
            `https://${this.endpoint}/directCal/${this.year}/${this.type}/${this.location}?resources=${this.resources}`,
            {
                headers: {
                    Authorization: "Basic " + btoa(`${this.username}:${this.password}`)
                }
            }
        );
        const icsText = await response.text();
        return this.parseIcalText(icsText);
    }

    private async fetchWithHeaders(url: string, authorization: string, referer: string, method: string, contentType: string | null, body: string | null, cookies: string) {
        const headers: Record<string, string> = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Authorization": authorization,
            "Referer": referer,
        };

        if (cookies) {
            headers["Cookie"] = cookies;
        }

        if (contentType) {
            headers["Content-Type"] = contentType;
        }

        return await fetch(url, {
            method,
            headers,
            body
        });
    }

    async getWeekLessons(date?: Date): Promise<Lesson[]> {
        const auth = "Basic " + btoa(`${this.username}:${this.password}`);

        const sessionResponse = await fetch(
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/direct_planning.jsp`,
            {
                headers: {
                    Authorization: auth,
                    Referer: `https://${this.endpoint}/`
                },
                method: "GET"
            }
        );

        const rawCookie = sessionResponse.headers.get("set-cookie") || "";
        const jsessionid = rawCookie.split(";")[0];

        const validateSession = await this.fetchWithHeaders(
            `https://${this.endpoint}/${this.year}/prepaINPGrenoble/etudiant/jsp/custom/modules/plannings/direct_planning.jsp`,
            auth,
            `https://${this.endpoint}/${this.year}/prepaINPGrenoble/etudiant/jsp/standard/direct_planning.jsp`,
            "POST",
            "application/x-www-form-urlencoded",
            null,
            jsessionid
        );

        const validateCookieRaw = validateSession.headers.get("set-cookie") || "";
        const combinedCookies = [jsessionid, validateCookieRaw.split(";")[0]].filter(Boolean).join("; ");

        const treeSteps = [
            `category=trainee&expand=false&forceLoad=false&reload=false&scroll=0`,
            `branchId=7&expand=false&forceLoad=false&reload=false&scroll=0`,
            `branchId=3719&expand=false&forceLoad=false&reload=false&scroll=0`,
            `selectId=${this.resources}&reset=false&forceLoad=false&scroll=0`
        ];

        let lastReferer = `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/gui/tree.jsp?forceLoad=false&isDirect=true`;

        for (const step of treeSteps) {
            const targetUrl = `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/gui/tree.jsp?${step}`;
            await this.fetchWithHeaders(targetUrl, auth, lastReferer, "GET", null, null, combinedCookies);
            lastReferer = targetUrl;
        }

        const week = getWeekdays(date);
        
        const bodyParams = new URLSearchParams({
            clearTree: "false",
            startDay: this.formatNumber(week.startDay),
            startMonth: this.formatNumber(week.startMonth),
            startYear: week.startYear.toString(),
            endDay: this.formatNumber(week.endDay),
            endMonth: this.formatNumber(week.endMonth),
            endYear: week.endYear.toString(),
            calType: "ical",
            x: "34",
            y: "5"
        });

        const response = await this.fetchWithHeaders(
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/custom/modules/plannings/ical.jsp`,
            auth,
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/custom/modules/plannings/icalDates.jsp?clearTree=false`,
            "POST",
            "application/x-www-form-urlencoded",
            bodyParams.toString(),
            combinedCookies
        );

        const icsText = await response.text();
        return this.parseIcalText(icsText);
    }
}