import { ADESessionParams } from "../types/session.types";
import { TreeExpandParams, TreeRequestParams, TreeRequestResponse } from "../types/tree.types";
import { buildBaseUrl } from "./constants";

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

    return { currentUrl: `${baseUrl}/jsp/standard/gui/tree.jsp?${step}`, htmlResponseBuffer: buffer };
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

    return { currentUrl: `${baseUrl}/jsp/standard/gui/tree.jsp?${step}`, htmlResponseBuffer: buffer };
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

    return { currentUrl: `${baseUrl}/jsp/standard/gui/tree.jsp`, htmlResponseBuffer: buffer };
}