import { buildBaseUrl } from "../constants";
import { ADESessionParams } from "../session";
import { TreeExpandParams, TreeRequestParams, TreeRequestResponse } from "./types";

export async function expandTreeNode(params: TreeExpandParams): Promise<TreeRequestResponse> {

    const baseUrl = buildBaseUrl(params);
    const key = params.nodeType === "category" ? "category" : "branchId";
    let step = `${key}=${params.nodeId}&expand=false&forceLoad=false&reload=false&scroll=0`

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

    const buffer = await response.arrayBuffer();

    const cleanHtml = decodeLatin1(buffer);

    return { currentUrl: `${baseUrl}/jsp/standard/gui/tree.jsp?${step}`, htmlResponse: cleanHtml };
}

export async function selectTreeNode(params: TreeRequestParams): Promise<TreeRequestResponse> {
    const baseUrl = buildBaseUrl(params);
    let step = `selectId=${params.nodeId}&reset=false&forceLoad=false&scroll=0`


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

    const buffer = await response.arrayBuffer();

    const cleanHtml = decodeLatin1(buffer);

    return { currentUrl: `${baseUrl}/jsp/standard/gui/tree.jsp?${step}`, htmlResponse: cleanHtml };
}

export async function fetchTreeRootEndpoint(params: ADESessionParams): Promise<TreeRequestResponse> {
    const baseUrl = buildBaseUrl(params);

    const response = await fetch(
        `${baseUrl}/jsp/standard/gui/tree.jsp`,
        {
            headers: {
                "Authorization": "Basic " + params.credentials,
                "Referer": `${baseUrl}/jsp/standard/direct_planning.jsp`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": params.cookieString,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            method: "GET",
            credentials: "omit"
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch tree root: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();

    const cleanHtml = decodeLatin1(buffer);


    return { currentUrl: `${baseUrl}/jsp/standard/gui/tree.jsp`, htmlResponse: cleanHtml };
}

export function decodeLatin1(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let result = '';
    const chunkSize = 8192;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        result += String.fromCharCode.apply(null, Array.from(chunk));
    }

    return result;
}