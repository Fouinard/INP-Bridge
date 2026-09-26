import { ParsedTreeNode } from '@/features/tree/types';
import { Modal, Pressable, Text, View } from 'react-native';

interface Props {
    visible: boolean;
    pendingNode: ParsedTreeNode | null;
    onCancel: () => void;
    onConfirm: () => void;
}

export function TreeConfirmationModal({ visible, pendingNode, onCancel, onConfirm }: Props) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
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
                            onPress={onCancel}
                            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700"
                        >
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">Annuler</Text>
                        </Pressable>

                        <Pressable
                            onPress={onConfirm}
                            className="px-4 py-2 rounded-xl bg-primary"
                        >
                            <Text className="text-black font-medium">Confirmer</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>

    );
}