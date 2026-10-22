import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { CabecalhoListagem } from '../../src/components/CabecalhoListagem';
import { ModalFormularioSimples } from '../../src/components/ModalFormularioSimples';
import { apiService } from '../../src/services/apiService';

interface Dano {
	id: number;
	nome: string;
}

export default function DanosScreen() {
	const router = useRouter();
	const { user, signOut } = useAuth();
	const isMounted = useRef(true);

	const [danos, setDanos] = useState<Dano[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [filtroBusca, setFiltroBusca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [form, setForm] = useState({ id: '', nome: '' });

	useEffect(() => {
		isMounted.current = true;
		carregarDanos();
		return () => { isMounted.current = false; };
	}, []);

	if (user?.nivel?.toUpperCase() !== 'ADMINISTRADOR') {
		return (
			<View style={styles.acessoRestrito}>
				<Feather name="shield-off" size={54} color="#E53935" />
				<Text style={styles.txtRestritoTitulo}>Acesso Restrito</Text>
				<Text style={styles.txtRestritoDesc}>Esta área é dedicada exclusivamente para o gerenciamento de configurações por Administradores.</Text>
				<TouchableOpacity style={styles.btnVoltar} onPress={() => router.replace('/')}>
					<Text style={{ color: '#fff', fontWeight: 'bold' }}>Voltar para o Início</Text>
				</TouchableOpacity>
			</View>
		);
	}

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
						let res = response;

						if (typeof res === 'string') {
							try { res = JSON.parse(res); } catch (e) { res = { success: true }; }
						}

						if (!isMounted.current) return;

						if (res && (res.success === true || res.success === 1 || res.success === 'true' || res === true)) {
							Alert.alert('Sucesso', 'Registro excluído com sucesso.');
							carregarDanos();
						} else {
							Alert.alert('Erro', res?.message || 'Falha ao excluir o registro.');
						}
					} catch (error) {
						if (isMounted.current) {
							Alert.alert('Erro', 'Falha de conexão ou erro no servidor ao tentar excluir.');
						}
					} finally {
						if (isMounted.current) setIsLoading(false);
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
		const payload = { acao: isEditing ? 'editar' : 'inserir', id: form.id, nome: form.nome };
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

	const onChangeForm = (chave: string, valor: string) => setForm({ ...form, [chave]: valor });
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

						<CabecalhoListagem
							busca={filtroBusca}
							setBusca={setFiltroBusca}
							onBuscar={carregarDanos}
							onInserir={abrirModalNovo}
							labelPesquisa="Nome do Dano / Motivo"
						/>

						<Text style={[styles.sectionTitle, { marginTop: 25 }]}>Resultados ({danosFiltrados.length})</Text>
					</View>
				}
				renderItem={({ item }) => (
					<View style={{ paddingHorizontal: 20, paddingBottom: 15 }}>
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<Text style={styles.cardTitle}>{item.nome}</Text>
							</View>
							<View style={styles.cardActions}>
								<View style={styles.actionButtonsRow}>
									<TouchableOpacity style={styles.btnEditarCard} onPress={() => editarDano(item)}>
										<Feather name="edit-2" size={14} color="#ffffff" />
										<Text style={styles.btnCardText}>Modificar</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirDano(item.id)}>
										<Feather name="trash-2" size={14} color="#ffffff" />
										<Text style={styles.btnCardText}>Excluir</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				)}
				ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>Nenhum registro encontrado.</Text> : null}
			/>

			<ModalFormularioSimples
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				onSave={salvarDano}
				onSignOut={confirmSignOut}
				titulo={isEditing ? 'Modificar Dano' : 'Cadastrar Dano'}
				campos={[{ chave: 'nome', label: '* Nome', placeholder: 'Ex: Furo na Lateral...' }]}
				valores={form}
				onChangeValor={onChangeForm}
				isLoading={isSaving}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', padding: 20, elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 0, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 15, color: '#333', flex: 1, marginRight: 10 },
	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa', alignItems: 'flex-end' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 8 },
	btnEditarCard: { backgroundColor: '#0c6ead', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnExcluirCard: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	emptyText: { textAlign: 'center', marginTop: 30, color: '#888', fontSize: 15 },

	acessoRestrito: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8', padding: 20 },
	txtRestritoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15, textAlign: 'center' },
	txtRestritoDesc: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center', lineHeight: 20 },
	btnVoltar: { marginTop: 25, backgroundColor: '#0c6ead', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }
});