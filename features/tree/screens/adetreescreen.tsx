import { TreeConfirmationModal } from '@/features/tree/components/TreeConfirmationModal';
import { TreeNodeRow } from '@/features/tree/components/TreeNodeRow';
import { useClassTree } from '@/features/tree/hooks/useClassTree';
import { ParsedTreeNode } from '@/features/tree/types';
import { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';

export default function ADETreeScreen() {
    const {
        visibleNodes,
        expandedNodeIds,
        loadingNodeId,
        selectedNode,
        isAlertVisible,
        pendingNode,
        handleNodePress,
        handleConfirmSelection,
        handleCancelSelection,
    } = useClassTree();

    const renderItem = useCallback(({ item }: { item: ParsedTreeNode }) => (
        <TreeNodeRow
            node={item}
            isExpanded={expandedNodeIds.has(item.id)}
            isLoading={loadingNodeId === item.id}
            isSelected={selectedNode?.id === item.id && item.isSelectable}
            onPress={handleNodePress}
        />
    ), [expandedNodeIds, loadingNodeId, handleNodePress, selectedNode]);

    return (
        <View className="flex-1 pt-16 bg-bg px-5">
            <TreeConfirmationModal
                visible={isAlertVisible}
                pendingNode={pendingNode}
                onCancel={handleCancelSelection}
                onConfirm={handleConfirmSelection}
            />

            <Text className="text-text text-3xl font-semibold mb-2">
                Choisissez votre classe
            </Text>

            <FlatList
                data={visibleNodes}
                keyExtractor={item => `${item.type}-${item.id}`}
                renderItem={renderItem}
                removeClippedSubviews={true}
                initialNumToRender={20}
                maxToRenderPerBatch={10}
                windowSize={7}
                contentContainerClassName='gap-1 pt-5'
            />
        </View>
    );
}