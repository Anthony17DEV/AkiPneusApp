import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../src/services/apiService';

interface CategoriaDano {
	id: number;
	nome: string;
	status: string;
}

export default function DanoCategoriasScreen() {
	const router = useRouter();
	const { user, signOut } = useAuth();
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => { isMounted.current = false; };
	}, []);

	const [categorias, setCategorias] = useState<CategoriaDano[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);

	const [form, setForm] = useState({ id: '', nome: '' });

	const carregarCategorias = async () => {
		setIsLoading(true);
		try {
			const response = await api.post('api_dano_categorias.php', { acao: 'listar' });
			const res = response.data;
			if (!isMounted.current) return;
			if (res && res.success) {
				setCategorias(res.data || []);
			} else {
				setCategorias([]);
			}
		} catch (error) {
			if (isMounted.current) setCategorias([]);
		} finally {
			if (isMounted.current) setIsLoading(false);
		}
	};

	useEffect(() => {
		carregarCategorias();
	}, []);

	const salvarCategoria = async () => {
		if (!form.nome.trim()) {
			Alert.alert('Atenção', 'O nome da categoria é obrigatório.');
			return;
		}

		setIsSaving(true);
		try {
			const payload = {
				acao: form.id ? 'atualizar' : 'inserir',
				id: form.id,
				nome: form.nome.trim(),
				user_id: user?.id
			};

			const response = await api.post('api_dano_categorias.php', payload);
			const res = response.data;

			if (!isMounted.current) return;

			if (res && res.success) {
				Alert.alert('Sucesso', 'Categoria salva com sucesso!');
				setModalVisible(false);
				carregarCategorias();
			} else {
				Alert.alert('Erro', res?.message || 'Falha ao salvar categoria.');
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
		} finally {
			if (isMounted.current) setIsSaving(false);
		}
	};

	const excluirCategoria = (id: number) => {
		Alert.alert(
			'Excluir Categoria',
			'Deseja realmente excluir esta categoria?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir',
					style: 'destructive',
					onPress: async () => {
						try {
							await api.post('api_dano_categorias.php', { acao: 'excluir', id });
							carregarCategorias();
						} catch (error) {
							carregarCategorias();
						}
					}
				}
			]
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.filterSection}>
				<Text style={styles.sectionTitle}>Categorias de Danos</Text>
				<TouchableOpacity
					style={styles.btnInserir}
					onPress={() => { setForm({ id: '', nome: '' }); setModalVisible(true); }}
				>
					<Feather name="plus-circle" size={18} color="#ffffff" />
					<Text style={styles.btnInserirText}>Nova Categoria</Text>
				</TouchableOpacity>
				<Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: -5, fontSize: 12 }]}>
					Registros ({categorias.length})
				</Text>
			</View>

			{isLoading && categorias.length === 0 ? (
				<View style={{ paddingVertical: 40, alignItems: 'center' }}>
					<ActivityIndicator size="large" color="#0c6ead" />
					<Text style={{ marginTop: 10, color: '#666' }}>Carregando...</Text>
				</View>
			) : (
				<FlatList
					data={categorias}
					keyExtractor={(item) => String(item.id)}
					contentContainerStyle={{ paddingBottom: 40 }}
					renderItem={({ item }) => (
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<Text style={styles.cardTitle}>#{item.id} - {item.nome}</Text>
								<View style={styles.actionButtonsRow}>
									<TouchableOpacity
										style={styles.btnEditarCard}
										onPress={() => { setForm({ id: String(item.id), nome: item.nome }); setModalVisible(true); }}
									>
										<Feather name="edit-2" size={14} color="#fff" />
										<Text style={styles.btnEditarCardText}>Editar</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.btnExcluirCard}
										onPress={() => excluirCategoria(item.id)}
									>
										<Feather name="trash-2" size={14} color="#fff" />
									</TouchableOpacity>
								</View>
							</View>
						</View>
					)}
					ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhuma categoria cadastrada.</Text> : undefined}
				/>
			)}

			<Modal visible={modalVisible} animationType="slide" transparent={true}>
				<View style={styles.modalOverlay}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
						<View style={styles.modalSmall}>
							<Text style={styles.modalTitle}>{form.id ? 'Editar Categoria' : 'Nova Categoria'}</Text>

							<Text style={styles.label}>* Nome da Categoria</Text>
							<TextInput
								style={styles.inputModal}
								value={form.nome}
								onChangeText={t => setForm({ ...form, nome: t })}
								placeholder="Ex: ACIDENTES, MAU USO..."
								autoCapitalize="characters"
							/>

							<View style={{ flexDirection: 'row', marginTop: 15, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalVisible(false)}>
									<Text style={{ fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.btnSalvar, { flex: 1, marginTop: 0 }]} onPress={salvarCategoria} disabled={isSaving}>
									{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
								</TouchableOpacity>
							</View>
						</View>
					</KeyboardAvoidingView>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },
	btnInserir: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8 },
	btnInserirText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
	cardTitle: { fontWeight: 'bold', fontSize: 15, color: '#333', flex: 1, marginRight: 10 },
	actionButtonsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
	btnEditarCard: { backgroundColor: '#0c6ead', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
	btnEditarCardText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
	btnExcluirCard: { backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalSmall: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
	btnSalvar: { backgroundColor: '#63c77b', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnSalvarText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});