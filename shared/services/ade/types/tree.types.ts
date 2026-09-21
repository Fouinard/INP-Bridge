import { ExpandableNodeTypes } from "@/features/tree/types";
import { ADESessionParams } from "./session.types";

export interface TreeRequestParams extends ADESessionParams {
  nodeId: number | string;
}

export interface TreeExpandParams extends TreeRequestParams {
  nodeType: ExpandableNodeTypes;
}

export interface TreeRequestResponse {
  currentUrl: string;
  htmlResponseBuffer: ArrayBuffer;
}