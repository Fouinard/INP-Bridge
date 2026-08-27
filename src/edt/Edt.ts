import ICAL from "ical.js"

export class EDT {
    endpoint: string
    year: string
    type: string
    location: string
    resources: number
    constructor(endpoint = "edt.grenoble-inp.fr", year = "2026-2027", type = "etudiant", location = "prepaINPGrenoble", resources = 1130) {
        this.endpoint = endpoint
        this.year = year
        this.type = type
        this.location = location
        this.resources = resources
    }

    private getCurrentWeekdays() {
        const today = new Date(2026, 8, 15)

        // Copie pour éviter de modifier today
        const monday = new Date(today)
        const day = today.getDay()

        // Dimanche = 0 → on considère qu'il appartient à la semaine précédente
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
                    Authorization: "Basic " + btoa(`${process.env.USERNAME_AGALAN}:${process.env.PASSWORD_AGALAN}`)
                }
            }
        )
        const icsText = await icsFile.text()
        return this.parseIcalText(icsText)
    }

    private async fetchWithHeaders(endpoint: string, authorization: string, referer: string, method: string, contentType: string, body: string, cookies: string) {
        const res = await fetch(endpoint, {
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,fr-FR;q=0.7,en-GB;q=0.6,it-IT;q=0.5,it;q=0.4,af;q=0.3",
                "cache-control": "no-cache",
                Authorization: authorization,
                "content-type": contentType,
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
            "method": method
        })
        return res
    }

    async getCurrentWeek() {
        const sessionResponse = await fetch(
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/standard/direct_planning.jsp`,
            {
                headers: {
                    Authorization: "Basic " + btoa(`${process.env.USERNAME_AGALAN}:${process.env.PASSWORD_AGALAN}`),
                    Referer: "https://edt.grenoble-inp.fr/"
                },
                method: "GET"
            }
        )
        const setCookies = sessionResponse.headers.getSetCookie()
        const validateSession = await fetch("https://edt.grenoble-inp.fr/2026-2027/prepaINPGrenoble/etudiant/jsp/custom/modules/plannings/direct_planning.jsp", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,fr-FR;q=0.7,en-GB;q=0.6,it-IT;q=0.5,it;q=0.4,af;q=0.3",
                "cache-control": "no-cache",
                Authorization: "Basic " + btoa(`${process.env.USERNAME_AGALAN}:${process.env.PASSWORD_AGALAN}`),
                "content-type": "application/x-www-form-urlencoded",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Microsoft Edge\";v=\"151\", \"Chromium\";v=\"151\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "upgrade-insecure-requests": "1",
                "cookie": setCookies.join("; "),
                "Referer": "https://edt.grenoble-inp.fr/2026-2027/prepaINPGrenoble/etudiant/jsp/standard/direct_planning.jsp"
            },
            "method": "POST"
        })
        const validateCookies = validateSession.headers.getSetCookie()
        fetch("https://edt.grenoble-inp.fr/2026-2027/prepaINPGrenoble/etudiant/jsp/standard/gui/tree.jsp?category=trainee&expand=false&forceLoad=false&reload=false&scroll=0", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,fr-FR;q=0.7,en-GB;q=0.6,it-IT;q=0.5,it;q=0.4,af;q=0.3",
                Authorization: "Basic " + btoa(`${process.env.USERNAME_AGALAN}:${process.env.PASSWORD_AGALAN}`),
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Microsoft Edge\";v=\"151\", \"Chromium\";v=\"151\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "frame",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": setCookies.join("; "),
                "Referer": "https://edt.grenoble-inp.fr/2026-2027/prepaINPGrenoble/etudiant/jsp/standard/gui/tree.jsp?forceLoad=false&isDirect=true"
            },
            "body": null,
            "method": "GET"
        })
        fetch("https://edt.grenoble-inp.fr/2026-2027/prepaINPGrenoble/etudiant/jsp/standard/gui/tree.jsp?branchId=7&expand=false&forceLoad=false&reload=false&scroll=0", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,fr-FR;q=0.7,en-GB;q=0.6,it-IT;q=0.5,it;q=0.4,af;q=0.3",
                Authorization: "Basic " + btoa(`${process.env.USERNAME_AGALAN}:${process.env.PASSWORD_AGALAN}`),
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Microsoft Edge\";v=\"151\", \"Chromium\";v=\"151\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "frame",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": setCookies.join("; "),
                "Referer": "https://edt.grenoble-inp.fr/2026-2027/prepaINPGrenoble/etudiant/jsp/standard/gui/tree.jsp?category=trainee&expand=false&forceLoad=false&reload=false&scroll=0"
            },
            "body": null,
            "method": "GET"
        })
        fetch("https://edt.grenoble-inp.fr/2026-2027/prepaINPGrenoble/etudiant/jsp/standard/gui/tree.jsp?branchId=3719&expand=false&forceLoad=false&reload=false&scroll=0", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,fr-FR;q=0.7,en-GB;q=0.6,it-IT;q=0.5,it;q=0.4,af;q=0.3",
                Authorization: "Basic " + btoa(`${process.env.USERNAME_AGALAN}:${process.env.PASSWORD_AGALAN}`),
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Microsoft Edge\";v=\"151\", \"Chromium\";v=\"151\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "frame",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": setCookies.join("; "),
                "Referer": "https://edt.grenoble-inp.fr/2026-2027/prepaINPGrenoble/etudiant/jsp/standard/gui/tree.jsp?branchId=7&expand=false&forceLoad=false&reload=false&scroll=0"
            },
            "body": null,
            "method": "GET"
        })
        await fetch("https://edt.grenoble-inp.fr/2026-2027/prepaINPGrenoble/etudiant/jsp/standard/gui/tree.jsp?selectId=1130&reset=false&forceLoad=false&scroll=0", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,fr-FR;q=0.7,en-GB;q=0.6,it-IT;q=0.5,it;q=0.4,af;q=0.3",
                Authorization: "Basic " + btoa(`${process.env.USERNAME_AGALAN}:${process.env.PASSWORD_AGALAN}`),
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Microsoft Edge\";v=\"151\", \"Chromium\";v=\"151\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "frame",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": setCookies.join("; "),
                "Referer": "https://edt.grenoble-inp.fr/2026-2027/prepaINPGrenoble/etudiant/jsp/standard/gui/tree.jsp?branchId=3719&expand=false&forceLoad=false&reload=false&scroll=0"
            },
            "body": null,
            "method": "GET"
        })

        const week = this.getCurrentWeekdays()
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
        console.log(body)
        console.log(`https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/custom/modules/plannings/ical.jsp`)
        const response = await fetch(
            `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/custom/modules/plannings/ical.jsp`,
            {
                method: "POST",
                headers: {
                    Authorization:
                        "Basic " +
                        Buffer
                            .from(
                                `${process.env.USERNAME_AGALAN}:${process.env.PASSWORD_AGALAN}`
                            )
                            .toString("base64"),

                    "Content-Type": "application/x-www-form-urlencoded",

                    Referer:
                        `https://${this.endpoint}/${this.year}/${this.location}/${this.type}/jsp/custom/modules/plannings/icalDates.jsp?clearTree=false`,
                    Cookie: setCookies.concat(validateCookies).join("; ")
                },
                body,

            }
        )
        console.log("status:", response.status);
        console.log("headers:");

        for (const [key, value] of response.headers) {
            console.log(key, ":", value);
        }
        const icsText = await response.text();
        console.log(icsText)
        return this.parseIcalText(icsText)
    }
}