import buildIcalQueryParams from "@/shared/services/ade/utils/buildIcalQueryParams";
import { getWeekdays } from "@/utils/Time";
import { ADEGetIcalParams } from "../types/schedule.types";
import { buildBaseUrl } from "./constants";

export async function getIcal(params: ADEGetIcalParams): Promise<string> {

    const baseUrl = buildBaseUrl(params);

    const baseDate = params.startDate ? new Date(params.startDate) : new Date();

    const startWeek = getWeekdays(baseDate);

    const startDate = params.startDate && params.endDate
        ? baseDate
        : new Date(startWeek.startYear, startWeek.startMonth - 1, startWeek.startDay);

    const endDate = params.endDate
        ? new Date(params.endDate)
        : new Date(startWeek.endYear, startWeek.endMonth - 1, startWeek.endDay);

    const bodyParams = buildIcalQueryParams({ startDate, endDate });

    const response = await fetch(
        `${baseUrl}/jsp/custom/modules/plannings/ical.jsp`,
        {
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Authorization": "Basic " + params.credentials,
                "Referer": `${baseUrl}/jsp/custom/modules/plannings/icalDates.jsp?clearTree=false`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": params.cookieString
            },
            method: "POST",
            body: bodyParams,
            credentials: "omit"
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to get week lessons: ${response.statusText}`);
    }

    const icsText = await response.text();
    return icsText;
}