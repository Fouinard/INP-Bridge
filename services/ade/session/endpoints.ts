import { CookieDict, findCookie, getCookies } from "@/utils/cookies";
import { ADE_DEFAULTS, buildBaseUrl } from "./constants";
import { ADEAuthenticatedParams, ADESessionParams, TreeExpandParams, TreeRequestParams } from "./types";

export async function createSession(params: ADEAuthenticatedParams): Promise<CookieDict> {
    const baseUrl = buildBaseUrl(params);
    const response = await fetch(
        `${baseUrl}/jsp/standard/direct_planning.jsp`,
        {
            method: "GET",
            headers: {
                Authorization: "Basic " + params.credentials,
                Referer: `https://${ADE_DEFAULTS.endpoint}/`,
            },
            credentials: "omit"
        }
    );

    const cookies = getCookies(response);
    const jsessionid = findCookie(cookies, "jsession")?.value;
    const bigipserver = findCookie(cookies, "bigipserver")?.value;

    if (!jsessionid) {
        throw new Error(`Failed to create session: jsessionid: ${jsessionid}; bigipserver: ${bigipserver}`);
    }

    return cookies;
}


export async function valiateSession(params: ADESessionParams): Promise<CookieDict> {
    const baseUrl = buildBaseUrl(params);
    const response = await fetch(
        `${baseUrl}/jsp/custom/modules/plannings/direct_planning.jsp`,
        {
            headers: {
                "Authorization": "Basic " + params.credentials,
                "Referer": `${baseUrl}/jsp/standard/direct_planning.jsp`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": params.cookieString
            },
            method: "POST",
            credentials: "omit"
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to validate session: ${response.statusText}`);
    }

    const fetchedCookies = getCookies(response);
    const acceswebcookie = findCookie(fetchedCookies, "accesweb")?.value;

    if (!acceswebcookie) {
        throw new Error(`Failed to validate session: acceswebcookie: ${acceswebcookie}; jsessionid: ${params.cookieString}`);
    }

    return fetchedCookies;
}


export async function expandTreeNode(params: TreeExpandParams): Promise<string> {

    const baseUrl = buildBaseUrl(params);
    const key = params.nodeType === "category" ? "category" : "branchId";
    let step = `${key}=${params.nodeId}&expand=true&expand=false&forceLoad=false&reload=false&scroll=0`

    const response = await fetch(
        `${baseUrl}/jsp/standard/gui/tree.jsp?${step}`,
        {
            headers: {
                "Authorization": "Basic " + params.credentials,
                "Referer": params.referer || `${baseUrl}/jsp/standard/direct_planning.jsp`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": params.cookieString,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

            },
            method: "GET",
            credentials: "omit"
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to expand ${params.nodeType} (id = ${params.nodeId}): ${response.statusText}`);
    }

    return `${baseUrl}/jsp/standard/gui/tree.jsp?${step}`
}

export async function selectTreeNode(params: TreeRequestParams) {
    const baseUrl = buildBaseUrl(params);
    let step = `selectId=${params.nodeId}&&reset=false&forceLoad=false&scroll=0`

    const response = await fetch(
        `${baseUrl}/jsp/standard/gui/tree.jsp?${step}`,
        {
            headers: {
                "Authorization": "Basic " + params.credentials,
                "Referer": params.referer || `${baseUrl}/jsp/standard/direct_planning.jsp`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": params.cookieString,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

            },
            method: "GET",
            credentials: "omit"
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to select node (id = ${params.nodeId}): ${response.statusText}`);
    }

    return `${baseUrl}/jsp/standard/gui/tree.jsp?${step}`
}
