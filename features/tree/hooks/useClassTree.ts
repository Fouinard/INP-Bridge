import { useStartupContext } from '@/components/contexts/StartupContext';
import { ParsedTreeNode } from '@/features/tree/types';
import { ADEApi } from '@/shared/services/ade/adeApi';
import { StorageManager } from '@/shared/services/storage/storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useClassTree() {
    const router = useRouter();
    const setStartupReady = useStartupContext();

    const [nodes, setNodes] = useState<ParsedTreeNode[]>([]);
    const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
    const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<ParsedTreeNode | null>(null);
    
    // État de la modale de confirmation
    const [pendingNode, setPendingNode] = useState<ParsedTreeNode | null>(null);
    const [isAlertVisible, setIsAlertVisible] = useState(false);

    // Chargement initial
    useEffect(() => {
        let isMounted = true;
        setStartupReady();

        async function loadInitialTree() {
            try {
                setLoadingNodeId('root');
                const rootNodes = await ADEApi.Tree.fetchTreeRoot();

                if (!isMounted) return;

                setNodes(rootNodes);
                const newExpanded = new Set<string>();

                for (const node of rootNodes) {
                    if (node.isExpanded && !node.isSelectable) {
                        newExpanded.add(node.id);
                    } else if (node.isSelectable && node.isSelected) {
                        setSelectedNode(node);
                    }
                }
                setExpandedNodeIds(newExpanded);
            } catch (error) {
                console.error('Error loading initial tree:', error);
            } finally {
                if (isMounted) setLoadingNodeId(null);
            }
        }

        loadInitialTree();
        return () => { isMounted = false; };
    }, [setStartupReady]);

    // Filtrage des nœuds visibles
    const visibleNodes = useMemo(() => {
        return nodes.filter(node => {
            if (node.level === 0) return true;
            return node.parents.every(parent => expandedNodeIds.has(parent.id));
        });
    }, [nodes, expandedNodeIds]);

    // Gestion du clic sur un nœud
    const handleNodePress = useCallback(async (node: ParsedTreeNode) => {
        if (node.isSelectable) {
            if (selectedNode?.id === node.id) return;
            setPendingNode(node);
            setIsAlertVisible(true);
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
            const updatedNodes = await ADEApi.Tree.expandNode(node.id, node.type);

            const serverSelected = updatedNodes.find(n => n.isSelected && n.isSelectable);
            if (serverSelected && !selectedNode) {
                setSelectedNode(serverSelected);
            }

            setNodes(updatedNodes);
            setExpandedNodeIds(prev => new Set(prev).add(node.id));
        } finally {
            setLoadingNodeId(null);
        }
    }, [expandedNodeIds, nodes, selectedNode]);

    // Confirmation de la sélection d'une classe
    const handleConfirmSelection = useCallback(async () => {
        if (!pendingNode) return;

        const oldSelected = selectedNode;
        const newSelected = pendingNode;

        try {
            await ADEApi.Tree.selectNode(newSelected.id);
            if (oldSelected && oldSelected.id !== newSelected.id) {
                await ADEApi.Tree.selectNode(oldSelected.id);
            }

            setNodes(prevNodes =>
                prevNodes.map(n => {
                    if (n.id === newSelected.id) return { ...n, isSelected: true };
                    if (oldSelected && n.id === oldSelected.id) return { ...n, isSelected: false };
                    return n;
                })
            );

            setSelectedNode(newSelected);

            const nodeList = newSelected.parents.map(parent => [parent.type, parent.id]);
            nodeList.push(["select", newSelected.id]);
            await StorageManager.Default.set("ADEClassTreeList", nodeList);

            setIsAlertVisible(false);
            setPendingNode(null);
            router.push("/schedule");
        } catch (error) {
            console.error("Erreur lors du changement de classe:", error);
            setIsAlertVisible(false);
            setPendingNode(null);
        }
    }, [pendingNode, selectedNode, router]);

    const handleCancelSelection = useCallback(() => {
        setIsAlertVisible(false);
        setPendingNode(null);
    }, []);

    return {
        visibleNodes,
        expandedNodeIds,
        loadingNodeId,
        selectedNode,
        isAlertVisible,
        pendingNode,
        handleNodePress,
        handleConfirmSelection,
        handleCancelSelection,
    };
}