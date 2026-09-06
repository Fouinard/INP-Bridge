import { ADESessionParams } from "@/services/ade/session";

export interface TreeRequestParams extends ADESessionParams {
  nodeId: number | string;
}

export type ExpandableNodeTypes = "category" | "branch";

export type SelectableNodeTypes = "select";

export type NodeType = ExpandableNodeTypes | SelectableNodeTypes;

export interface TreeExpandParams extends TreeRequestParams {
  nodeType: ExpandableNodeTypes;
}

export interface TreeRequestResponse {
  currentUrl: string;
  htmlResponse: string;
}

export interface ParentNode {
  id: string;
  type: ExpandableNodeTypes;
}

export interface ParsedTreeNode {
  id: string;
  label: string;
  type: NodeType;
  level: number;
  isExpanded: boolean;
  isSelectable: boolean;
  parents: ParentNode[];
  isSelected: boolean;
}