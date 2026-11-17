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
							initialNumToRender={25}
							maxToRenderPerBatch={25}
							windowSize={7}
							renderItem={({ item, index }) => {
								const grupo = item?.regiao || item?.categoria || '';
								const grupoAnterior = index > 0 ? (dados[index - 1]?.regiao || dados[index - 1]?.categoria || '') : '';
								const temGrupo = Boolean(grupo);
								const mostrarHeaderGrupo = temGrupo && grupo !== grupoAnterior;

								return (
									<View>
										{mostrarHeaderGrupo && (
											<View style={styles.grupoHeader}>
												<Text style={styles.grupoHeaderText}>
													{grupo}
												</Text>
											</View>
										)}
										<TouchableOpacity
											style={[
												styles.itemRow,
												temGrupo && styles.itemRowIndentado
											]}
											onPress={() => onSelect(item)}
										>
											<Text
												style={[
													styles.itemNome,
													temGrupo && styles.itemNomeIndentado
												]}
											>
												{temGrupo
													? `- ${item.nome || item.placa}`
													: (item.nome || item.placa)}
											</Text>
											{item.documento ? (
												<Text style={[styles.itemDoc, temGrupo && { paddingLeft: 12 }]}>
													{item.documento}
												</Text>
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
		height: '78%',
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
	grupoHeader: {
		backgroundColor: '#e8f0fe',
		borderLeftWidth: 4,
		borderLeftColor: '#0c6ead',
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginTop: 12,
		marginBottom: 2,
		borderRadius: 6
	},
	grupoHeaderText: {
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
		paddingLeft: 18,
		paddingVertical: 11
	},
	itemNome: {
		fontSize: 15,
		fontWeight: '600',
		color: '#333'
	},
	itemNomeIndentado: {
		fontSize: 14,
		fontWeight: '600',
		color: '#222'
	},
	itemDoc: {
		fontSize: 11,
		color: '#777',
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