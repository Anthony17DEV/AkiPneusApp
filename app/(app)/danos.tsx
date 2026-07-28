import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LogoSolutires from '../../assets/images/smart_pneus.png';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';

interface Dano {
	id: number;
	nome: string;
}

export default function DanosScreen() {
	const router = useRouter();
	const { user, signOut } = useAuth();

	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	if (user?.nivel?.toUpperCase() !== 'ADMINISTRADOR') {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8', padding: 20 }}>
				<Feather name="shield-off" size={54} color="#E53935" />
				<Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15, textAlign: 'center' }}>
					Acesso Restrito
				</Text>
				<Text style={{ fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
					Esta área é dedicada exclusivamente para o gerenciamento de configurações por Administradores.
				</Text>
				<TouchableOpacity
					style={{ marginTop: 25, backgroundColor: '#0c6ead', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
					onPress={() => router.replace('/')}
				>
					<Text style={{ color: '#fff', fontWeight: 'bold' }}>Voltar para o Início</Text>
				</TouchableOpacity>
			</View>
		);
	}

	const [danos, setDanos] = useState<Dano[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [filtroBusca, setFiltroBusca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [form, setForm] = useState({ id: '', nome: '' });

	const confirmSignOut = () => {
		Alert.alert('Sair da Conta', 'Tem a certeza que deseja sair da aplicação?', [
			{ text: 'Cancelar', style: 'cancel' },
			{ text: 'Sair', style: 'destructive', onPress: signOut },
		]);
	};

	const carregarDanos = async () => {
		setIsLoading(true);
		try {
			const response = await apiService.listarDanos(filtroBusca);
			if (response && response.success) {
				if (isMounted.current) setDanos(response.data || []);
			} else {
				if (isMounted.current) setDanos([]);
			}
		} catch (error) {
			Alert.alert("Erro", "Não foi possível carregar os dados.");
		} finally {
			if (isMounted.current) setIsLoading(false);
		}
	};

	useEffect(() => {
		carregarDanos();
	}, []);

	const abrirModalNovo = () => {
		setForm({ id: '', nome: '' });
		setIsEditing(false);
		setModalVisible(true);
	};

	const editarDano = (dano: Dano) => {
		setForm({ id: String(dano.id), nome: dano.nome });
		setIsEditing(true);
		setModalVisible(true);
	};

	const excluirDano = (id: number) => {
		Alert.alert('Atenção', 'Deseja realmente excluir este registro?', [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir', style: 'destructive', onPress: async () => {
					setIsLoading(true);
					try {
						const response = await apiService.excluirDano(id);

						console.log('Resposta da API ao excluir:', response);

						if (response && response.success) {
							Alert.alert('Sucesso', 'Registro excluído.');
							carregarDanos();
						} else {
							Alert.alert('Erro', response?.message || 'O registro foi excluído, mas a API retornou um formato inesperado.');
							setIsLoading(false);
						}
					} catch (error) {
						console.error('Erro na requisição:', error);
						Alert.alert('Erro', 'Falha de conexão ou erro no servidor ao tentar excluir.');
						setIsLoading(false);
					}
				}
			}
		]);
	};

	const salvarDano = async () => {
		if (!form.nome.trim()) {
			Alert.alert('Atenção', 'Preencha o nome do dano.');
			return;
		}

		setIsSaving(true);

		const payload = {
			acao: isEditing ? 'editar' : 'inserir',
			id: form.id,
			nome: form.nome
		};

		const response = await apiService.salvarDano(payload);

		if (isMounted.current) setIsSaving(false);

		if (response && response.success) {
			setModalVisible(false);
			Alert.alert('Sucesso', isEditing ? 'Registro atualizado!' : 'Cadastrado com sucesso!');
			carregarDanos();
		} else {
			Alert.alert('Erro', response?.message || 'Falha ao salvar o registro.');
		}
	};

	const danosFiltrados = danos.filter(d => d.nome.toLowerCase().includes(filtroBusca.toLowerCase()));

	return (
		<View style={styles.container}>
			<FlatList
				data={danosFiltrados}
				keyExtractor={(item) => String(item.id)}
				contentContainerStyle={{ paddingBottom: 100 }}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Registro de Danos</Text>

						<View style={styles.row}>
							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>Nome do Dano / Motivo</Text>
								<TextInput
									style={styles.input}
									placeholder="Buscar..."
									value={filtroBusca}
									onChangeText={setFiltroBusca}
								/>
							</View>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={carregarDanos}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.btnInserir} onPress={abrirModalNovo}>
								<Feather name="plus-circle" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir</Text>
							</TouchableOpacity>
						</View>

						<Text style={[styles.sectionTitle, { marginTop: 25 }]}>Resultados ({danosFiltrados.length})</Text>
					</View>
				}
				renderItem={({ item }) => (
					<View style={{ paddingHorizontal: 20, paddingBottom: 15 }}>
						<View style={[styles.card, { marginHorizontal: 0, marginBottom: 0 }]}>
							<View style={styles.cardHeader}>
								<Text style={styles.cardTitle}>{item.nome}</Text>
							</View>

							<View style={styles.cardActions}>
								<View style={styles.actionButtonsRow}>
									<TouchableOpacity style={styles.btnEditarCard} onPress={() => editarDano(item)}>
										<Feather name="edit-2" size={14} color="#ffffff" />
										<Text style={styles.btnEditarCardText}>Modificar</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirDano(item.id)}>
										<Feather name="trash-2" size={14} color="#ffffff" />
										<Text style={styles.btnExcluirCardText}>Excluir</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				)}
				ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>Nenhum registro encontrado.</Text> : null}
			/>

			<Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
				<View style={{ flex: 1, backgroundColor: '#f4f6f8' }}>
					<View style={styles.modalHeaderFullScreen}>
						<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}>
							<Feather name="arrow-left" size={24} color="#fff" />
						</TouchableOpacity>
						<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
						<TouchableOpacity onPress={confirmSignOut} style={{ padding: 5 }}>
							<Feather name="power" size={22} color="#fff" />
						</TouchableOpacity>
					</View>

					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
						<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
							<Text style={styles.groupTitle}>{isEditing ? 'Modificar Dano' : 'Cadastrar Dano'}</Text>

							<Text style={styles.label}>* Nome</Text>
							<TextInput
								style={styles.inputModal}
								value={form.nome}
								onChangeText={t => setForm({ ...form, nome: t })}
								placeholder="Ex: Furo na Lateral..."
								autoCapitalize="characters"
							/>

							<View style={{ flexDirection: 'row', marginTop: 30, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalVisible(false)}>
									<Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1.5, height: 50, marginTop: 0 }]} onPress={salvarDano} disabled={isSaving}>
									{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
								</TouchableOpacity>
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
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupFull: { width: '100%' },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 10, justifyContent: 'center' },

	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8, marginRight: 8 },
	btnInserir: { flex: 1, backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8 },
	btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
	btnInserirText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 15, color: '#333', flex: 1, marginRight: 10 },

	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa', alignItems: 'flex-end' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 8 },
	btnEditarCard: { backgroundColor: '#0c6ead', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnEditarCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	btnExcluirCard: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnExcluirCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	emptyText: { textAlign: 'center', marginTop: 30, color: '#888', fontSize: 15 },

	modalHeaderFullScreen: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#0c6ead',
		paddingHorizontal: 15,
		paddingBottom: 15,
		paddingTop: Platform.OS === 'ios' ? 65 : (StatusBar.currentHeight ? StatusBar.currentHeight + 15 : 50),
		elevation: 4,
	},
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c6ead', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 5 },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },

	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});