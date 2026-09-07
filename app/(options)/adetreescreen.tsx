import { TreeNodeRow } from '@/components/class_selector/TreeNodeRow';
import { ParsedTreeNode } from '@/services/ade/tree/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

import { ADETreeService } from '@/services/ade/tree/TreeService';
import { StorageManager } from '@/services/storage';

export default function TreeScreen() {
    const [nodes, setNodes] = useState<ParsedTreeNode[]>([]);
    const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
    const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<ParsedTreeNode | null>(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [pendingNode, setPendingNode] = useState<ParsedTreeNode | null>(null);

    const visibleNodes = useMemo(() => {
        return nodes.filter(node => {
            if (node.level === 0) return true;
            return node.parents.every(parent => expandedNodeIds.has(parent.id));
        });
    }, [nodes, expandedNodeIds]);

    const handleNodePress = useCallback((node: ParsedTreeNode) => {
        if (node.isSelectable) {
            // Si c'est déjà la classe sélectionnée en local, pas besoin d'ouvrir la modal
            if (selectedNode?.id === node.id) {
                return;
            }
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

        (async () => {
            try {
                setLoadingNodeId(node.id);
                const updatedNodes = await ADETreeService.expandNode(node.id, node.type);

                const serverSelected = updatedNodes.find(n => n.isSelected && n.isSelectable);
                if (serverSelected && !selectedNode) {
                    setSelectedNode(serverSelected);
                }

                setNodes(updatedNodes);
                setExpandedNodeIds(prev => new Set(prev).add(node.id));
            } finally {
                setLoadingNodeId(null);
            }
        })();
    }, [expandedNodeIds, nodes, selectedNode]);

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
                        } else if (node.isSelectable && node.isSelected) {
                            setSelectedNode(node);
                        }
                    }
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
        if (!pendingNode) return;

        const oldSelected = selectedNode;
        const newSelected = pendingNode;

        try {
            // 1. Inversion des sélections côté ADE
            await ADETreeService.selectNode(newSelected.id);
            if (oldSelected && oldSelected.id !== newSelected.id) {
                await ADETreeService.selectNode(oldSelected.id);
            }

            // 2. Mise à jour forcée du tableau nodes pour rafraîchir l'UI
            setNodes(prevNodes =>
                prevNodes.map(n => {
                    if (n.id === newSelected.id) return { ...n, isSelected: true };
                    if (oldSelected && n.id === oldSelected.id) return { ...n, isSelected: false };
                    return n;
                })
            );

            // 3. Mise à jour du state selectedNode
            setSelectedNode(newSelected);

            // 4. Persistence locale
            const nodeList = newSelected.parents.map(parent => [parent.type, parent.id]);
            nodeList.push(["select", newSelected.id]);
            await StorageManager.Default.set("ADEClassTreeList", nodeList);

        } catch (error) {
            console.error(`Erreur lors du changement de classe:`, error);
        } finally {
            setAlertVisible(false);
            setPendingNode(null);
        }
    }, [pendingNode, selectedNode]);

    const handleCancelSelection = useCallback(() => {
        setAlertVisible(false);
        setPendingNode(null);
    }, []);

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
                                <Text className="text-black font-medium">Confirmer</Text>
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