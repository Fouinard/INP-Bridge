import { TreeNodeRow } from '@/components/class_selector/TreeNodeRow';
import { ParsedTreeNode } from '@/services/ade/tree/types';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    View
} from 'react-native';

import { ADETreeService } from '@/services/ade/tree/TreeService';
import { useCallback, useMemo } from 'react';
import { Text } from 'react-native';

export default function TreeScreen() {
    const [nodes, setNodes] = useState<ParsedTreeNode[]>([]);
    const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
    const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<ParsedTreeNode | null>(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [pendingNode, setPendingNode] = useState<ParsedTreeNode | null>(null);
    const [previousSelectedNode, setPreviousSelectedNode] = useState<ParsedTreeNode | null>(null);

    const visibleNodes = useMemo(() => {
        return nodes.filter(node => {
            if (node.level === 0) return true;
            return node.parents.every(parent => expandedNodeIds.has(parent.id));
        });
    }, [nodes, expandedNodeIds]);

    const handleNodePress = useCallback(async (node: ParsedTreeNode) => {
        if (node.isSelectable) {
            if (selectedNode?.id === node.id && !alertVisible) {
                return;
            }

            setPreviousSelectedNode(selectedNode);
            setSelectedNode(node);
            setPendingNode(node);
            setAlertVisible(true);
            return;
        }

        if (expandedNodeIds.has(node.id)) {
            setExpandedNodeIds(prev => {
                const next = new Set(prev);
                next.delete(node.id);
                return next;
            });
            return;
        }

        const hasChildrenInMemory = nodes.some(n =>
            n.parents.some(parent => parent.id === node.id)
        );

        if (hasChildrenInMemory) {
            setExpandedNodeIds(prev => new Set(prev).add(node.id));
            return;
        }

        try {
            setLoadingNodeId(node.id);
            const updatedNodes = await ADETreeService.expandNode(node.id, node.type);

            const serverSelected = updatedNodes.find(n => n.isSelected && n.isSelectable);
            if (serverSelected && !selectedNode) {
                setSelectedNode(serverSelected);
                setPreviousSelectedNode(serverSelected);
            }

            setNodes(updatedNodes);
            setExpandedNodeIds(prev => new Set(prev).add(node.id));
        } finally {
            setLoadingNodeId(null);
        }
    }, [expandedNodeIds]);

    useEffect(() => {
        let isMounted = true;

        async function loadInitialTree() {
            try {
                setLoadingNodeId('root');

                const rootNodes = await ADETreeService.fetchTreeRoot({});

                if (isMounted) {
                    setNodes(rootNodes);
                    for (const node of rootNodes) {
                        if (node.isExpanded && !node.isSelectable) {
                            setExpandedNodeIds(prev => new Set(prev).add(node.id));
                        }
                        else if (node.isSelectable && node.isSelected) {
                            setPreviousSelectedNode(node);
                            setSelectedNode(node);
                        }
                    };
                }
            } catch (error) {
                console.error(`Error loading initial tree:`, error);
            } finally {
                if (isMounted) {
                    setLoadingNodeId(null);
                }
            }
        }

        loadInitialTree();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleConfirmSelection = useCallback(async () => {
        if (previousSelectedNode?.id !== pendingNode?.id) {
            await ADETreeService.selectNode(pendingNode!.id);
        }

        await ADETreeService.selectNode(previousSelectedNode!.id);

        setAlertVisible(false);
        setPendingNode(null);
        setPreviousSelectedNode(selectedNode);
    }, [previousSelectedNode, pendingNode, selectedNode]);

    const handleCancelSelection = useCallback(() => {
        setSelectedNode(previousSelectedNode);
        setAlertVisible(false);
        setPendingNode(null);
    }, [previousSelectedNode]);

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
            <Modal
                transparent
                visible={alertVisible}
                animationType="fade"
                onRequestClose={handleCancelSelection}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-5">
                    <View className="bg-white dark:bg-gray-800 p-6 rounded-3xl w-full max-w-sm shadow-xl">
                        <Text className="text-xl font-semibold text-text mb-2">
                            Changer de classe
                        </Text>
                        <Text className="text-base text-gray-500 mb-6">
                            Voulez-vous sélectionner <Text className="font-bold text-primary">{pendingNode?.label}</Text> ?
                        </Text>

                        <View className="flex-row justify-end gap-3">
                            <Pressable
                                onPress={handleCancelSelection}
                                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700"
                            >
                                <Text className="text-gray-700 dark:text-gray-200 font-medium">Annuler</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleConfirmSelection}
                                className="px-4 py-2 rounded-xl bg-primary"
                            >
                                <Text className="text-white font-medium">Confirmer</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            <Text className="text-text text-3xl font-semibold">
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