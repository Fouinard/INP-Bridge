import { NodeType, ParsedTreeNode } from "@/features/tree/types";
import { ParsedLesson } from "@/types/schedule.types";
import { getIcal } from "./api/scheduleEndpoints";
import { expandTreeNode, fetchTreeRootEndpoint, selectTreeNode } from "./api/treeEndpoints";
import parseHtmlTree from "./parsers/parseHtmlTree";
import parseIcalText from "./parsers/parseIcalText";
import parseLessons from "./parsers/parseLessons";
import parseRawHtml from "./parsers/parseRawHtml";
import { SessionManager } from "./session/SessionManager";
import { TreeRequestResponse } from "./types/tree.types";

function processHtmlBuffer(buffer: ArrayBuffer): ParsedTreeNode[] {
    const parsedHtml = parseRawHtml(buffer);
    return parseHtmlTree(parsedHtml);
}

export const ADEApi = {

    Tree: {
        async fetchTreeRoot() {
            const response = await SessionManager.getInstance().authenticatedRequest(fetchTreeRootEndpoint);
            const parsedNodes = processHtmlBuffer(response.htmlResponseBuffer);
            return parsedNodes;
        },
    
        async expandNode(nodeId: string, nodeType: NodeType): Promise<ParsedTreeNode[]> {
            const response = await SessionManager.getInstance().authenticatedRequest(
                expandTreeNode,
                {
                    nodeId: nodeId,
                    nodeType: nodeType
                }
            )
    
            const parsedNodes = processHtmlBuffer(response.htmlResponseBuffer);
            return parsedNodes;
        },
    
        async selectNode(nodeId: string): Promise<ParsedTreeNode[]> {
            const response = await SessionManager.getInstance().authenticatedRequest(
                selectTreeNode,
                {
                    nodeId: nodeId,
                }
            )
    
            const parsedNodes = processHtmlBuffer(response.htmlResponseBuffer);
            return parsedNodes;
        },
    
        async closeNode(nodeId: string): Promise<TreeRequestResponse> {
            const response = await SessionManager.getInstance().authenticatedRequest(
                selectTreeNode,
                {
                    nodeId: nodeId,
                }
            )
    
            return response;
        },
    },

    Schedule: {
        async getIcal(startDate?: Date, endDate?: Date): Promise<ParsedLesson[]> {
            const ical = await SessionManager.getInstance().authenticatedRequest(getIcal, {startDate, endDate});
            const parsed = parseIcalText(ical);
            return parseLessons(parsed);
        }
    },

    Auth: {
        async createSession(credentials: { username: string, password: string }): Promise<void> {
            return await SessionManager.getInstance().createSession(credentials);
        },

        async selectclass(nodeListOverride?: string[][]): Promise<void> {
            return await SessionManager.getInstance().selectClass(nodeListOverride);
        }
    }
}