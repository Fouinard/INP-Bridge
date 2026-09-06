import { ADERequestParams, SessionManager } from "../session";
import { expandTreeNode, fetchTreeRootEndpoint, selectTreeNode } from "./endpoints";
import { parseHtmlTree } from "./parseHtmlTree";
import { NodeType } from "./types";

export class ADETreeService {

    public static async fetchTreeRoot(params: ADERequestParams) {
        const treeRoot = await SessionManager.getInstance().authenticatedRequest(fetchTreeRootEndpoint, params);
        const parsedTree = parseHtmlTree(treeRoot.htmlResponse);
        return parsedTree;
    }

    public static async selectNode(nodeId: string) {
        const response = await SessionManager.getInstance().authenticatedRequest(
            selectTreeNode,
            {
                nodeId: nodeId,
            }
        )

        return parseHtmlTree(response.htmlResponse);
    }

    public static async expandNode(nodeId: string, nodeType: NodeType) {
        const response = await SessionManager.getInstance().authenticatedRequest(
            expandTreeNode,
            {
                nodeId: nodeId,
                nodeType: nodeType,
            }
        )

        const parsed = parseHtmlTree(response.htmlResponse)
        return parsed;
    }

    public static async closeNode(nodeId: string) {
        const response = await SessionManager.getInstance().authenticatedRequest(
            selectTreeNode,
            {
                nodeId: nodeId,
            }
        )

        return response
    }
}
