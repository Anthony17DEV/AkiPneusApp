import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Referencia {
	id: number;
	nome: string;
	qtd_marcas: number;
}

export default function ReferenciasScreen() {
	const router = useRouter();
	const API_URL = 'https://sistemascactus.com/apicactus/akipneus/api_referencias.php';

	const [referencias, setReferencias] = useState<Referencia[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [filtroBusca, setFiltroBusca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [form, setForm] = useState({ nomeAntigo: '', nomeNovo: '' });

	const carregarReferencias = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'listar', busca: filtroBusca })
			});
			const res = await response.json();
			if (res.success) {
				setReferencias(res.data || []);
			} else {
				setReferencias([]);
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha ao buscar as referências.');
		}
		setIsLoading(false);
	};

	useEffect(() => {
		carregarReferencias();
	}, []);

	const resetForm = () => {
		setForm({ nomeAntigo: '', nomeNovo: '' });
		setModalVisible(true);
	};

	const editarReferencia = (item: Referencia) => {
		setForm({ nomeAntigo: item.nome, nomeNovo: item.nome });
		setModalVisible(true);
	};

	const salvarReferencia = async () => {
		if (!form.nomeNovo.trim()) {
			Alert.alert('Atenção', 'O nome da referência é obrigatório.');
			return;
		}

		const nomeUpper = form.nomeNovo.trim().toUpperCase();
		const duplicado = referencias.find(r => r.nome.toUpperCase() === nomeUpper && r.nome.toUpperCase() !== form.nomeAntigo.toUpperCase());

		if (duplicado) {
			Alert.alert('Atenção', 'Esta referência já está cadastrada no sistema!');
			return;
		}

		setIsSaving(true);
		const acao = form.nomeAntigo ? 'atualizar' : 'inserir';

		try {
			const response = await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: acao, nomeAntigo: form.nomeAntigo, nome: form.nomeNovo })
			});
			const res = await response.json();

			if (res.success) {
				Alert.alert('Sucesso', res.message);
				setModalVisible(false);
				carregarReferencias();
			} else {
				Alert.alert('Atenção', res.message || 'Falha ao salvar referência.');
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha na conexão com o servidor.');
		}
		setIsSaving(false);
	};

	const excluirReferencia = (nome: string) => {
		Alert.alert(
			'Excluir Referência',
			`Tem certeza que deseja excluir a referência "${nome}"?\nTodos os modelos associados a ela poderão ficar inacessíveis.`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir', style: 'destructive', onPress: async () => {
						try {
							const response = await fetch(API_URL, {
								method: 'POST', headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ acao: 'excluir', nome: nome })
							});
							const res = await response.json();
							if (res.success) {
								Alert.alert('Sucesso', 'Referência excluída com sucesso.');
								carregarReferencias();
							} else {
								Alert.alert('Erro', res.message || 'Falha ao excluir.');
							}
						} catch (error) {
							Alert.alert('Erro', 'Falha na conexão com o servidor.');
						}
					}
				}
			]
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={referencias}
				keyExtractor={(item, index) => String(item?.id || index)}
				contentContainerStyle={{ paddingBottom: 40 }}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Gerenciar Referências</Text>

						<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
							<View style={styles.inputContainer}>
								<Feather name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
								<TextInput
									style={styles.inputBuscaInterno}
									placeholder="Buscar referência..."
									value={filtroBusca}
									onChangeText={setFiltroBusca}
									onSubmitEditing={carregarReferencias}
								/>
							</View>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={carregarReferencias}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.btnInserir} onPress={resetForm}>
								<Feather name="plus-circle" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir Referência</Text>
							</TouchableOpacity>
						</View>
						<Text style={[styles.sectionTitle, { marginTop: 25 }]}>Resultados ({referencias.length})</Text>
					</View>
				}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<View style={{ flex: 1, paddingRight: 10 }}>
								<Text style={styles.cardTitle} numberOfLines={2}>{item.nome}</Text>
							</View>
							<View style={styles.statusBadge}>
								<Text style={styles.statusText}>{item.qtd_marcas} Marcas</Text>
							</View>
						</View>

						<View style={styles.cardActions}>
							<View style={styles.actionButtonsRow}>
								<TouchableOpacity style={styles.btnActionSecondary} onPress={() => router.push(`/marcas?ref_id=${item.id}&ref_nome=${encodeURIComponent(item.nome)}`)}>
									<Feather name="list" size={14} color="#333" />
									<Text style={styles.btnActionTextSecondary}>Ver Marcas</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.btnEditarCard} onPress={() => editarReferencia(item)}>
									<Feather name="edit-2" size={14} color="#ffffff" />
								</TouchableOpacity>

								<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirReferencia(item.nome)}>
									<Feather name="trash-2" size={14} color="#ffffff" />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
				ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhuma referência encontrada.</Text> : null}
			/>

			<Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
				<View style={styles.modalOverlayBusca}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: '100%' }}>
						<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} keyboardShouldPersistTaps="handled">
							<View style={styles.modalSmall}>
								<Text style={styles.modalTitle}>{form.nomeAntigo ? 'Editar Referência' : 'Nova Referência'}</Text>

								<Text style={styles.label}>* Nome da Referência</Text>
								<TextInput
									style={styles.inputModal}
									value={form.nomeNovo}
									onChangeText={t => setForm({ ...form, nomeNovo: t })}
									placeholder="Ex: 295/80R22.5"
									autoCapitalize="characters"
								/>

								<View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
									<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalVisible(false)}>
										<Text style={{ fontWeight: 'bold' }}>Cancelar</Text>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.btnSalvar, { flex: 1, marginTop: 0 }]} onPress={salvarReferencia} disabled={isSaving}>
										{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Gravar</Text>}
									</TouchableOpacity>
								</View>
							</View>
						</ScrollView>
					</KeyboardAvoidingView>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', padding: 20, elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },

	inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 8, height: 48, borderWidth: 1, borderColor: '#ddd' },
	inputBuscaInterno: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },

	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8, marginRight: 8 },
	btnInserir: { flex: 1, backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8 },
	btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
	btnInserirText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
	statusBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
	statusText: { color: '#28a745', fontSize: 11, fontWeight: 'bold' },

	cardActions: { padding: 10, backgroundColor: '#fafafa', alignItems: 'flex-end' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%' },

	btnActionSecondary: { backgroundColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
	btnActionTextSecondary: { color: '#333', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	btnEditarCard: { backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15 },
	btnEditarCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	btnExcluirCard: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15, marginLeft: 8 },
	btnExcluirCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	modalHeaderFull: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
		backgroundColor: '#0c6ead', paddingHorizontal: 15, paddingBottom: 15,
		paddingTop: Platform.OS === 'ios' ? 65 : (StatusBar.currentHeight ? StatusBar.currentHeight + 15 : 50),
		elevation: 4,
	},
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c6ead', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 5 },

	modalOverlayBusca: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalSmall: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },

	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnDefault: { backgroundColor: '#eee', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});