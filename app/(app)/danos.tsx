import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '../../contexts/AuthContext';
import { CabecalhoListagem } from '../../src/components/CabecalhoListagem';
import { api } from '../../src/services/apiService';

interface Dano {
	id: number;
	nome: string;
	regiao?: string;
	categoria_id?: number;
	categoria_nome?: string;
}

interface Categoria {
	id: number;
	nome: string;
}

const REGIOES_PADRAO = [
	'BANDA DE RODAGEM',
	'FLANCO / LATERAL',
	'TALÃO',
	'CARCAÇA'
];

export default function DanosScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const isMounted = useRef(true);

	const [danos, setDanos] = useState<Dano[]>([]);
	const [categorias, setCategorias] = useState<Categoria[]>([]);
	const [regioesDisponiveis, setRegioesDisponiveis] = useState<string[]>(REGIOES_PADRAO);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [filtroBusca, setFiltroBusca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [modoNovaRegiao, setModoNovaRegiao] = useState(false);
	const [form, setForm] = useState({ id: '', nome: '', regiao: '', categoria_id: '' });

	useEffect(() => {
		isMounted.current = true;
		carregarDados();
		return () => { isMounted.current = false; };
	}, []);

	if (user?.nivel?.toUpperCase() !== 'ADMINISTRADOR') {
		return (
			<View style={styles.acessoRestrito}>
				<Feather name="shield-off" size={54} color="#E53935" />
				<Text style={styles.txtRestritoTitulo}>Acesso Restrito</Text>
				<Text style={styles.txtRestritoDesc}>
					Esta área é dedicada exclusivamente para o gerenciamento de configurações por Administradores.
				</Text>
				<TouchableOpacity style={styles.btnVoltar} onPress={() => router.replace('/')}>
					<Text style={{ color: '#fff', fontWeight: 'bold' }}>Voltar para o Início</Text>
				</TouchableOpacity>
			</View>
		);
	}

	const adicionarRegiaoLocal = (novaRegiao: string) => {
		const limpa = novaRegiao.trim().toUpperCase();
		if (limpa && !regioesDisponiveis.includes(limpa)) {
			setRegioesDisponiveis(prev => [...prev, limpa]);
		}
	};

	const carregarDados = async () => {
		setIsLoading(true);
		try {
			const [resDanos, resCat] = await Promise.all([
				api.post('api_dano_categorias.php', { acao: 'listar_danos', busca: filtroBusca }),
				api.post('api_dano_categorias.php', { acao: 'listar' })
			]);

			if (!isMounted.current) return;

			if (resDanos.data && resDanos.data.success && Array.isArray(resDanos.data.data)) {
				// Garantia extra no app contra qualquer dano duplicado
				const mapaUnicos = new Map<string, Dano>();
				for (const item of resDanos.data.data) {
					const chave = String(item?.nome || '').trim().toUpperCase();
					if (chave && !mapaUnicos.has(chave)) {
						mapaUnicos.set(chave, item);
					}
				}
				setDanos(Array.from(mapaUnicos.values()));
			} else {
				setDanos([]);
			}

			if (resCat.data && resCat.data.success) {
				setCategorias(resCat.data.data || []);
				if (Array.isArray(resCat.data.regioes) && resCat.data.regioes.length > 0) {
					setRegioesDisponiveis(resCat.data.regioes);
				}
			} else {
				setCategorias([]);
			}
		} catch (error) {
			if (isMounted.current) {
				Alert.alert('Erro', 'Não foi possível carregar os dados.');
			}
		} finally {
			if (isMounted.current) setIsLoading(false);
		}
	};

	const abrirModalNovo = () => {
		setModoNovaRegiao(false);
		setForm({ id: '', nome: '', regiao: '', categoria_id: '' });
		setIsEditing(false);
		setModalVisible(true);
	};

	const editarDano = (dano: Dano) => {
		const regiaoAtual = (dano.regiao || '').trim().toUpperCase();
		if (regiaoAtual && !regioesDisponiveis.includes(regiaoAtual)) {
			adicionarRegiaoLocal(regiaoAtual);
		}
		setModoNovaRegiao(false);
		setForm({
			id: String(dano.id),
			nome: dano.nome,
			regiao: regiaoAtual,
			categoria_id: dano.categoria_id ? String(dano.categoria_id) : ''
		});
		setIsEditing(true);
		setModalVisible(true);
	};

	const excluirDano = (id: number) => {
		Alert.alert('Atenção', 'Deseja realmente excluir este registro?', [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir',
				style: 'destructive',
				onPress: async () => {
					setIsLoading(true);
					try {
						const response = await api.post('api_dano_categorias.php', {
							acao: 'excluir_dano',
							id
						});
						const res = response.data;

						if (!isMounted.current) return;

						if (res && res.success) {
							Alert.alert('Sucesso', 'Registro excluído com sucesso.');
							carregarDados();
						} else {
							Alert.alert('Erro', res?.message || 'Falha ao excluir o registro.');
						}
					} catch (error) {
						if (isMounted.current) {
							Alert.alert('Erro', 'Falha de conexão ao tentar excluir.');
						}
					} finally {
						if (isMounted.current) setIsLoading(false);
					}
				}
			}
		]);
	};

	const salvarDano = async () => {
		const nomeLimpo = form.nome.trim().toUpperCase();
		const regiaoLimpa = form.regiao.trim().toUpperCase();

		if (!regiaoLimpa) {
			Alert.alert('Atenção', 'Selecione ou digite a região do pneu.');
			return;
		}
		if (!form.categoria_id) {
			Alert.alert('Atenção', 'Selecione a categoria do dano.');
			return;
		}
		if (!nomeLimpo) {
			Alert.alert('Atenção', 'Preencha o nome do dano.');
			return;
		}

		// Evita duplicidade já no app
		const jaExiste = danos.some(
			d => d.nome.trim().toUpperCase() === nomeLimpo && String(d.id) !== String(form.id)
		);
		if (jaExiste) {
			Alert.alert('Atenção', 'Já existe um dano cadastrado com este nome.');
			return;
		}

		setIsSaving(true);
		try {
			const response = await api.post('api_dano_categorias.php', {
				acao: 'salvar_dano',
				id: form.id,
				nome: nomeLimpo,
				regiao: regiaoLimpa,
				categoria_id: Number(form.categoria_id)
			});
			const res = response.data;

			if (!isMounted.current) return;

			if (res && res.success) {
				adicionarRegiaoLocal(regiaoLimpa);
				setModalVisible(false);
				Alert.alert('Sucesso', isEditing ? 'Registro atualizado!' : 'Cadastrado com sucesso!');
				carregarDados();
			} else {
				Alert.alert('Erro', res?.message || 'Falha ao salvar o registro.');
			}
		} catch (e) {
			if (isMounted.current) {
				Alert.alert('Erro', 'Falha na conexão com o servidor.');
			}
		} finally {
			if (isMounted.current) setIsSaving(false);
		}
	};

	const termoFiltro = filtroBusca.trim().toLowerCase();
	const danosFiltrados = danos.filter(d => {
		if (!termoFiltro) return true;
		return (
			(d.nome || '').toLowerCase().includes(termoFiltro) ||
			(d.regiao || '').toLowerCase().includes(termoFiltro) ||
			(d.categoria_nome || '').toLowerCase().includes(termoFiltro)
		);
	});

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />;

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
							onBuscar={carregarDados}
							onInserir={abrirModalNovo}
							labelPesquisa="Dano, Região ou Categoria"
						/>

						<Text style={[styles.sectionTitle, { marginTop: 25 }]}>Resultados ({danosFiltrados.length})</Text>
					</View>
				}
				renderItem={({ item, index }) => {
					const regiaoAtual = (item.regiao || 'SEM REGIÃO DEFINIDA').toUpperCase();
					const regiaoAnterior = index > 0 ? (danosFiltrados[index - 1]?.regiao || 'SEM REGIÃO DEFINIDA').toUpperCase() : '';
					const mostrarHeaderRegiao = regiaoAtual !== regiaoAnterior;

					return (
						<View style={{ paddingHorizontal: 20 }}>
							{mostrarHeaderRegiao && (
								<View style={styles.regiaoBanner}>
									<Text style={styles.regiaoBannerText}>{regiaoAtual}</Text>
								</View>
							)}
							<View style={[styles.card, { marginHorizontal: 0, marginBottom: 12 }]}>
								<View style={styles.cardHeader}>
									<View style={{ flex: 1 }}>
										<Text style={styles.cardTitle}>{item.nome}</Text>
										<View style={styles.badgesRow}>
											{item.categoria_nome ? (
												<View style={styles.badgeCategoria}>
													<MaterialCommunityIcons name="shape-outline" size={12} color="#0c6ead" style={{ marginRight: 4 }} />
													<Text style={styles.txtBadgeCategoria}>{item.categoria_nome}</Text>
												</View>
											) : null}
											{item.regiao ? (
												<View style={styles.badgeRegiao}>
													<MaterialCommunityIcons name="tire" size={12} color="#555" style={{ marginRight: 4 }} />
													<Text style={styles.txtBadgeRegiao}>{item.regiao}</Text>
												</View>
											) : null}
										</View>
									</View>
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
					);
				}}
				ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>Nenhum registro encontrado.</Text> : undefined}
			/>

			<Modal
				visible={modalVisible}
				animationType="fade"
				transparent={true}
				statusBarTranslucent={true}
				onRequestClose={() => setModalVisible(false)}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={styles.modalOverlay}
				>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>{isEditing ? 'Modificar Dano' : 'Cadastrar Dano'}</Text>
							<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
								<Feather name="x" size={24} color="#333" />
							</TouchableOpacity>
						</View>

						<ScrollView
							contentContainerStyle={{ paddingBottom: 10 }}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
						>
							<View style={styles.rowHeaderLabel}>
								<Text style={[styles.label, { marginBottom: 0 }]}>* Região do Pneu</Text>
								<TouchableOpacity
									onPress={() => {
										setModoNovaRegiao(!modoNovaRegiao);
										setForm({ ...form, regiao: '' });
									}}
								>
								</TouchableOpacity>
							</View>

							{modoNovaRegiao ? (
								<TextInput
									style={styles.input}
									value={form.regiao}
									onChangeText={t => setForm({ ...form, regiao: t })}
									placeholder="Ex: BANDA DE RODAGEM, TALÃO..."
									autoCapitalize="characters"
								/>
							) : (
								<RNPickerSelect
									placeholder={{ label: 'Selecione a região do pneu...', value: '', color: '#666' }}
									value={form.regiao}
									onValueChange={v => setForm({ ...form, regiao: v || '' })}
									items={regioesDisponiveis.map(r => ({ label: r, value: r, color: '#000' }))}
									style={pickerStyles}
									useNativeAndroidPickerStyle={false}
									Icon={PickerIcon}
								/>
							)}

							<Text style={styles.label}>* Categoria do Dano</Text>
							<RNPickerSelect
								placeholder={{ label: 'Selecione a categoria...', value: '', color: '#666' }}
								value={form.categoria_id}
								onValueChange={v => setForm({ ...form, categoria_id: v || '' })}
								items={categorias.map(cat => ({ label: cat.nome, value: String(cat.id), color: '#000' }))}
								style={pickerStyles}
								useNativeAndroidPickerStyle={false}
								Icon={PickerIcon}
							/>

							<Text style={styles.label}>* Nome do Dano / Ocorrência</Text>
							<TextInput
								style={styles.input}
								value={form.nome}
								onChangeText={t => setForm({ ...form, nome: t })}
								placeholder="Ex: IMPACTO / ATRITO POR OBJETO CORTANTE"
								autoCapitalize="characters"
							/>
						</ScrollView>

						<View style={{ flexDirection: 'row', marginTop: 10, gap: 10, borderTopWidth: 1, borderColor: '#eee', paddingTop: 15 }}>
							<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalVisible(false)}>
								<Text style={{ fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.btnSalvar, { flex: 1, marginTop: 0 }]} onPress={salvarDano} disabled={isSaving}>
								{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
							</TouchableOpacity>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

const pickerStyles = StyleSheet.create({
	inputIOS: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', marginBottom: 15, paddingRight: 30, minHeight: 48 },
	inputAndroid: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', marginBottom: 15, paddingRight: 30, minHeight: 48 }
});

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', padding: 20, elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	rowHeaderLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
	linkToggleText: { fontSize: 12, fontWeight: 'bold', color: '#0c6ead' },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },

	regiaoBanner: { backgroundColor: '#e8f0fe', borderLeftWidth: 4, borderLeftColor: '#0c6ead', paddingVertical: 8, paddingHorizontal: 12, marginTop: 10, marginBottom: 8, borderRadius: 6 },
	regiaoBannerText: { fontSize: 13, fontWeight: 'bold', color: '#0c6ead', textTransform: 'uppercase' },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 0, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
	badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
	badgeCategoria: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f0fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
	txtBadgeCategoria: { fontSize: 11, fontWeight: 'bold', color: '#0c6ead' },
	badgeRegiao: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f2f5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
	txtBadgeRegiao: { fontSize: 11, fontWeight: '600', color: '#555' },

	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa', alignItems: 'flex-end' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 8 },
	btnEditarCard: { backgroundColor: '#0c6ead', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnExcluirCard: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	emptyText: { textAlign: 'center', marginTop: 30, color: '#888', fontSize: 15 },

	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
	modalContent: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: '85%', elevation: 10 },
	modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	btnSalvar: { backgroundColor: '#63c77b', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnSalvarText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

	acessoRestrito: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8', padding: 20 },
	txtRestritoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15, textAlign: 'center' },
	txtRestritoDesc: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center', lineHeight: 20 },
	btnVoltar: { marginTop: 25, backgroundColor: '#0c6ead', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }
});