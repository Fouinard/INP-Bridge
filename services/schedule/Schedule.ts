import ICAL from "ical.js"
import * as SecureStore from 'expo-secure-store';

export interface Lesson {
    title: string;
    start: Date;
    end: Date;
    location: string;
    description: string;
}

export class Schedule {
    endpoint: string
    year: string
    type: string
    location: string
    resources: number
    username: string | null
    password: string | null
    constructor(endpoint = "edt.grenoble-inp.fr", year = "2026-2027", type = "etudiant", location = "prepaINPGrenoble", resources = 1130) {
        this.endpoint = endpoint
        this.year = year
        this.type = type
        this.location = location
        this.resources = resources
        this.username = null
        this.password = null
    }

    public async getLogins() {
        this.username = await SecureStore.getItemAsync("username")
        this.password = await SecureStore.getItemAsync("password")
    }

    public async setLogins(logins: string) {
        const [username, password] = logins.split(":")
        this.username = username
        this.password = password
    }

    private getWeekdays(date?: Date) {
        const today = date || new Date()
        const monday = new Date(today)
        const day = today.getDay()
        const diffToMonday = day === 0 ? -6 : 1 - day
        monday.setDate(today.getDate() + diffToMonday)
        const friday = new Date(monday)
        friday.setDate(monday.getDate() + 4)
        return {
            startDay: monday.getDate(),
            startMonth: monday.getMonth() + 1,
            startYear: monday.getFullYear(),

            endDay: friday.getDate(),
            endMonth: friday.getMonth() + 1,
            endYear: friday.getFullYear()
        }
    }

    private formatNumber(number: number) {
        return number.toString().padStart(2, "0")
    }

    private parseIcalText(icsText: string) {
        const jcal = ICAL.parse(icsText)
        const calendar = new ICAL.Component(jcal)
        const events = calendar.getAllSubcomponents("vevent").map(component => {
            const event = new ICAL.Event(component)
            return {
                title: event.summary,
                start: event.startDate.toJSDate(),
                end: event.endDate.toJSDate(),
                location: event.location,
                description: event.description.replace(
                    /\(Exporté\s+le\s*:\s*\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}\)/g,
                    ""
                )
            }
        })
        return events
    }

    async fetch4Weeks() {
        const icsFile = await fetch(
            `https://${this.endpoint}/directCal/${this.year}/${this.type}/${this.location}?resources=${this.resources}`,
            {
                headers: {
                    Authorization: "Basic " + btoa(`${this.username}:${this.password}`)
                }
            }
        );
        const icsText = await icsFile.text();
        return this.parseIcalText(icsText);
    }

    private async fetchWithHeaders(endpoint: string, authorization: string, referer: string, method: string, contentType: string | null, body: string | BodyInit | null, cookies: string) {
        const req = new Request(endpoint, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,fr-FR;q=0.7,en-GB;q=0.6,it-IT;q=0.5,it;q=0.4,af;q=0.3",
                "cache-control": "no-cache",
                "Authorization": authorization,
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Microsoft Edge\";v=\"151\", \"Chromium\";v=\"151\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "upgrade-insecure-requests": "1",
                "cookie": cookies,
                "Referer": referer
            },
            "method": method,
            "body": body
        });
        if (contentType) req.headers.set("content-type", contentType);
        const res = await fetch(endpoint, req);
        return res;
    }

    async getWeekLessons(date?: Date) {
        const sessionResponse = await fetch(
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/direct_planning.jsp`,
            {
                headers: {
                    Authorization: "Basic " + btoa(`${this.username}:${this.password}`),
                    Referer: `https://${this.endpoint}/`
                },
                method: "GET"
            }
        );
        console.log(await sessionResponse.text())
        console.log(sessionResponse.headers)
        const setCookies = typeof sessionResponse.headers.getSetCookie === "function" ? sessionResponse.headers.getSetCookie() : [sessionResponse.headers.get("set-cookie")].filter(Boolean);
        console.log(setCookies)
        const validateSession = await this.fetchWithHeaders(
            `https://${this.endpoint}/${this.year}/prepaINPGrenoble/etudiant/jsp/custom/modules/plannings/direct_planning.jsp`,
            "Basic " + btoa(`${this.username}:${this.password}`),
            `https://${this.endpoint}/${this.year}/prepaINPGrenoble/etudiant/jsp/standard/direct_planning.jsp`,
            "POST",
            "application/x-www-form-urlencoded",
            null,
            setCookies.join("; ")
        );
        const validateCookies = typeof validateSession.headers.getSetCookie === "function" ? validateSession.headers.getSetCookie() : [validateSession.headers.get("set-cookie")].filter(Boolean);
        console.log(validateCookies)
        await this.fetchWithHeaders(
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/gui/tree.jsp?category=trainee&expand=false&forceLoad=false&reload=false&scroll=0`,
            "Basic " + btoa(`${this.username}:${this.password}`),
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/gui/tree.jsp?forceLoad=false&isDirect=true`,
            "GET",
            null,
            null,
            setCookies.join("; ")
        );
        await this.fetchWithHeaders(
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/gui/tree.jsp?branchId=7&expand=false&forceLoad=false&reload=false&scroll=0`,
            "Basic " + btoa(`${this.username}:${this.password}`),
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/gui/tree.jsp?category=trainee&expand=false&forceLoad=false&reload=false&scroll=0`,
            "GET",
            null,
            null,
            setCookies.join("; ")
        );
        await this.fetchWithHeaders(
            `https://${this.endpoint}/2026-2027/${this.location}/${this.type}/jsp/standard/gui/tree.jsp?branchId=3719&expand=false&forceLoad=false&reload=false&scroll=0`,
            "Basic " + btoa(`${this.username}:${this.password}`),
            `https://${this.endpoint}/2026-2027/${this.location}/${this.type}/jsp/standard/gui/tree.jsp?branchId=7&expand=false&forceLoad=false&reload=false&scroll=0`,
            "GET",
            null,
            null,
            setCookies.join("; ")
        );
        await this.fetchWithHeaders(
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/gui/tree.jsp?selectId=1130&reset=false&forceLoad=false&scroll=0`,
            "Basic " + btoa(`${this.username}:${this.password}`),
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/gui/tree.jsp?branchId=3719&expand=false&forceLoad=false&reload=false&scroll=0`,
            "GET",
            null,
            null,
            setCookies.join("; ")
        );

        const week = this.getWeekdays(date);
        const body = new URLSearchParams({
            clearTree: "false",

            startDay: this.formatNumber(week.startDay),
            startMonth: this.formatNumber(week.startMonth),
            startYear: this.formatNumber(week.startYear),

            endDay: this.formatNumber(week.endDay),
            endMonth: this.formatNumber(week.endMonth),
            endYear: this.formatNumber(week.endYear),

            calType: "ical",
            x: "34",
            y: "5"
        });
        console.log(body.toString());
        const response = await this.fetchWithHeaders(
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/custom/modules/plannings/ical.jsp`,
            "Basic " + btoa(`${this.username}:${this.password}`),
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/custom/modules/plannings/icalDates.jsp?clearTree=false`,
            "POST",
            "application/x-www-form-urlencoded",
            body,
            setCookies.concat(validateCookies).join("; ")
        );
        const icsText = await response.text();
        return this.parseIcalText(icsText) as Lesson[];
    }
}