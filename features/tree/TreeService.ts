import { ADEApi } from "@/shared/services/ade/adeApi";
import { NodeType, ParsedTreeNode } from "./types";

export const ADETreeService = {

    async fetchTreeRoot(): Promise<ParsedTreeNode[]> {
        try {
            return await ADEApi.Tree.fetchTreeRoot();
        } catch (error) {
            throw new Error(`Failed to fetch tree root: ${error}`);
        }
    },

    async selectNode(nodeId: string): Promise<void> {
        try {
            await ADEApi.Tree.selectNode(nodeId);
        } catch (error) {
            throw new Error(`Failed to select node (id = ${nodeId}): ${error}`);
        }
    },

    async expandNode(nodeId: string, nodeType: NodeType): Promise<ParsedTreeNode[]> {
        try {
            const treeNodes = await ADEApi.Tree.expandNode(nodeId, nodeType);
            return treeNodes;
        } catch (error) {
            throw new Error(`Failed to expand ${nodeType} (id = ${nodeId}): ${error}`);
        }
    },

    async closeNode(nodeId: string): Promise<void> {
        try {
            await ADEApi.Tree.closeNode(nodeId);
        } catch (error) {
            throw new Error(`Failed to close node (id = ${nodeId}): ${error}`);
        }
    }
}
