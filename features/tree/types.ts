export type ExpandableNodeTypes = "category" | "branch";

export type SelectableNodeTypes = "select";

export type NodeType = ExpandableNodeTypes | SelectableNodeTypes;

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