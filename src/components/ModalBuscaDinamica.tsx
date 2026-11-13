import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';

interface ModalBuscaDinamicaProps {
	visible: boolean;
	onClose: () => void;
	titulo?: string;
	placeholder?: string;
	dados: any[];
	onSelect: (item: any) => void;
	isLoading?: boolean;
	onSearchChange?: (termo: string) => void;
	onAddPress?: (termo: string) => void;
	permiteInserir?: boolean;
}

export function ModalBuscaDinamica({
	visible,
	onClose,
	titulo = 'Pesquisar...',
	placeholder = 'Buscar...',
	dados = [],
	onSelect,
	isLoading = false,
	onSearchChange,
	onAddPress,
	permiteInserir = false
}: ModalBuscaDinamicaProps) {
	const [termo, setTermo] = useState('');

	useEffect(() => {
		if (visible) {
			setTermo('');
		}
	}, [visible]);

	const handleChangeText = (texto: string) => {
		setTermo(texto);
		if (onSearchChange) {
			onSearchChange(texto);
		}
	};

	return (
		<Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.container}>
					<View style={styles.header}>
						<Text style={styles.title}>{titulo}</Text>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							{(permiteInserir || onAddPress) && (
								<TouchableOpacity
									style={styles.btnInserirMini}
									onPress={() => onAddPress && onAddPress(termo)}
								>
									<Feather name="plus-circle" size={14} color="#28a745" />
									<Text style={styles.btnInserirTextMini}>Inserir</Text>
								</TouchableOpacity>
							)}
							<TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
								<Feather name="x" size={24} color="#333" />
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.searchBox}>
						<Feather name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
						<TextInput
							style={styles.searchInput}
							placeholder={placeholder}
							placeholderTextColor="#999"
							value={termo}
							onChangeText={handleChangeText}
							autoFocus={true}
						/>
					</View>

					{isLoading ? (
						<ActivityIndicator size="large" color="#0c6ead" style={{ marginTop: 30 }} />
					) : (
						<FlatList
							data={dados}
							keyExtractor={(item, index) => String(item?.id || index)}
							keyboardShouldPersistTaps="handled"
							initialNumToRender={20}
							maxToRenderPerBatch={25}
							windowSize={7}
							renderItem={({ item, index }) => {
								const temCategoria = Boolean(item?.categoria);
								const categoriaAnterior = index > 0 ? dados[index - 1]?.categoria : null;
								const mostrarHeaderCategoria = temCategoria && item.categoria !== categoriaAnterior;

								return (
									<View>
										{mostrarHeaderCategoria && (
											<View style={styles.categoriaHeader}>
												<Text style={styles.categoriaHeaderText}>
													- {item.categoria}
												</Text>
											</View>
										)}
										<TouchableOpacity
											style={[
												styles.itemRow,
												temCategoria && styles.itemRowIndentado
											]}
											onPress={() => onSelect(item)}
										>
											<Text
												style={[
													styles.itemNome,
													temCategoria && styles.itemNomeIndentado
												]}
											>
												{temCategoria
													? `- ${item.nome || item.placa}`
													: (item.nome || item.placa)}
											</Text>
											{item.documento ? (
												<Text style={styles.itemDoc}>{item.documento}</Text>
											) : null}
										</TouchableOpacity>
									</View>
								);
							}}
							ListEmptyComponent={
								<Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
							}
						/>
					)}
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 99999
	},
	container: {
		width: '90%',
		height: '75%',
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 20,
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 5
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15
	},
	title: {
		fontSize: 17,
		fontWeight: 'bold',
		color: '#333'
	},
	searchBox: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
		borderRadius: 8,
		height: 46,
		marginBottom: 12
	},
	searchInput: {
		flex: 1,
		paddingHorizontal: 10,
		fontSize: 15,
		color: '#333'
	},
	categoriaHeader: {
		backgroundColor: '#e8f0fe',
		borderLeftWidth: 4,
		borderLeftColor: '#0c6ead',
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginTop: 12,
		marginBottom: 2,
		borderRadius: 6
	},
	categoriaHeaderText: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#0c6ead',
		textTransform: 'uppercase'
	},
	itemRow: {
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		paddingVertical: 14
	},
	itemRowIndentado: {
		paddingLeft: 22,
		paddingVertical: 12
	},
	itemNome: {
		fontSize: 15,
		fontWeight: '600',
		color: '#333'
	},
	itemNomeIndentado: {
		fontSize: 14,
		fontWeight: '500',
		color: '#444'
	},
	itemDoc: {
		fontSize: 12,
		color: '#888',
		marginTop: 2
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 25,
		color: '#999',
		fontSize: 14
	},
	btnInserirMini: {
		backgroundColor: '#e8f5e9',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
		marginRight: 12,
		flexDirection: 'row',
		alignItems: 'center'
	},
	btnInserirTextMini: {
		color: '#28a745',
		fontWeight: 'bold',
		fontSize: 13,
		marginLeft: 5
	}
});