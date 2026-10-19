import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ModalBuscaDinamicaProps {
	visible: boolean;
	onClose: () => void;
	titulo: string;
	dados: any[];
	onSelect: (item: any) => void;
	isLoading?: boolean;
	placeholderBusca?: string;
	onSearchChange?: (texto: string) => void;
}

export function ModalBuscaDinamica({
	visible,
	onClose,
	titulo,
	dados,
	onSelect,
	isLoading = false,
	placeholderBusca = 'Buscar Referência...',
	onSearchChange
}: ModalBuscaDinamicaProps) {
	const [termoBusca, setTermoBusca] = useState('');

	useEffect(() => {
		if (visible) {
			setTermoBusca('');
		}
	}, [visible]);

	const handleChangeText = (texto: string) => {
		setTermoBusca(texto);
		if (onSearchChange) {
			onSearchChange(texto);
		}
	};

	const dadosFiltrados = (dados || []).filter((item) => {
		if (!termoBusca.trim()) return true;
		const texto = (item?.nome || item?.referencia || item?.marca || item?.descricao || '').toString().toUpperCase();
		return texto.includes(termoBusca.trim().toUpperCase());
	});

	return (
		<Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
			<View style={styles.modalOverlayBusca}>
				<View style={styles.modalContentBusca}>
					<View style={styles.modalHeaderBusca}>
						<Text style={styles.modalTitleBusca}>{titulo}</Text>
						<TouchableOpacity onPress={onClose}>
							<Feather name="x" size={24} color="#333" />
						</TouchableOpacity>
					</View>

					<View style={styles.inputBuscaContainer}>
						<Feather name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
						<TextInput
							style={styles.inputBuscaInterno2}
							placeholder={placeholderBusca}
							placeholderTextColor="#999"
							value={termoBusca}
							onChangeText={handleChangeText}
							autoFocus={true}
						/>
					</View>

					{isLoading ? (
						<ActivityIndicator style={{ marginTop: 20 }} color="#0c6ead" />
					) : (
						<FlatList
							data={dadosFiltrados}
							keyExtractor={(item, index) => String(item?.id || item?.nome || index)}
							initialNumToRender={10}
							maxToRenderPerBatch={10}
							windowSize={5}
							removeClippedSubviews={true}
							keyboardShouldPersistTaps="handled"
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.itemBuscaDinamica}
									onPress={() => onSelect(item)}
								>
									<Text style={styles.itemBuscaNome}>
										{item?.nome || item?.referencia || item?.marca || item?.descricao || ''}
									</Text>
								</TouchableOpacity>
							)}
							ListEmptyComponent={<Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>}
						/>
					)}
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlayBusca: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalContentBusca: { width: '90%', height: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
	modalHeaderBusca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitleBusca: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	inputBuscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, height: 45, marginBottom: 15 },
	inputBuscaInterno2: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	itemBuscaDinamica: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 15 },
	itemBuscaNome: { fontSize: 15, fontWeight: '600', color: '#333' },
	emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});