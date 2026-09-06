import { ParsedTreeNode } from "@/services/ade/tree/types";
import { ChevronRight } from "@getpapillon/papicons";
import Checkbox from "expo-checkbox";
import { memo } from "react";
import { Text, TouchableOpacity } from "react-native";

interface TreeNodeRowProps {
  node: ParsedTreeNode;
  isExpanded: boolean;
  isLoading: boolean;
  onPress: (node: ParsedTreeNode) => void;
  isSelected: boolean
}

export const TreeNodeRow = memo(
  function TreeNodeRow(props: TreeNodeRowProps) {

    return (
      <TouchableOpacity
        onPress={() => props.onPress(props.node)}
        className="flex flex-row items-center gap-2"
        style={{paddingLeft: props.node.level * 16}}
      >
        {!props.node.isSelectable && 
          <ChevronRight className="fill-primary size-[17px]" 
          //@ts-ignore 
          style={{ transform: [{ rotate: props.isExpanded ? '90deg' : '0deg' }]}} 
          color="white" />
        }
        {props.node.isSelectable && 
        <Checkbox
          value={props.isSelected}
          onValueChange={()=>props.onPress(props.node)}
          color={props.isSelected ? '#0055FF' : undefined}
        />
        }
        <Text numberOfLines={1} className="text-primary font-inter font-medium text-xl">{props.node.label}</Text>
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    return (
      prev.node.id === next.node.id &&
      prev.isExpanded === next.isExpanded &&
      prev.isLoading === next.isLoading &&
      prev.isSelected === next.isSelected
    );
  }
);