import { Feather } from '@expo/vector-icons';
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
import { api } from '../../src/services/apiService';

interface CategoriaDano {
	id: number;
	nome: string;
	regiao?: string;
	status: string;
	qtd_danos?: number;
}

interface ItemDano {
	id: number;
	nome: string;
	regiao: string;
	categoria_id: number;
	categoria_nome?: string;
}

const REGIOES_PADRAO = [
	'BANDA DE RODAGEM',
	'FLANCO / LATERAL',
	'TALÃO',
	'CARCAÇA'
];

export default function DanoCategoriasScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => { isMounted.current = false; };
	}, []);

	const [categorias, setCategorias] = useState<CategoriaDano[]>([]);
	const [regioesDisponiveis, setRegioesDisponiveis] = useState<string[]>(REGIOES_PADRAO);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [modalVisible, setModalVisible] = useState(false);
	const [modoNovaRegiaoCat, setModoNovaRegiaoCat] = useState(false);
	const [form, setForm] = useState({ id: '', nome: '', regiao: '' });

	const [modalListaDanosVisible, setModalListaDanosVisible] = useState(false);
	const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaDano | null>(null);
	const [danosCategoria, setDanosCategoria] = useState<ItemDano[]>([]);
	const [isLoadingDanos, setIsLoadingDanos] = useState(false);

	const [modalFormDanoVisible, setModalFormDanoVisible] = useState(false);
	const [modoNovaRegiaoDano, setModoNovaRegiaoDano] = useState(false);
	const [formDano, setFormDano] = useState({ id: '', nome: '', regiao: '', categoria_id: '' });

	const carregarCategorias = async () => {
		setIsLoading(true);
		try {
			const response = await api.post('api_dano_categorias.php', { acao: 'listar' });
			const res = response.data;
			if (!isMounted.current) return;
			if (res && res.success) {
				setCategorias(res.data || []);
				if (Array.isArray(res.regioes) && res.regioes.length > 0) {
					setRegioesDisponiveis(res.regioes);
				}
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

	const adicionarRegiaoLocal = (novaRegiao: string) => {
		const limpa = novaRegiao.trim().toUpperCase();
		if (limpa && !regioesDisponiveis.includes(limpa)) {
			setRegioesDisponiveis(prev => [...prev, limpa]);
		}
	};

	const salvarCategoria = async () => {
		if (!form.nome.trim()) {
			Alert.alert('Atenção', 'O nome da categoria é obrigatório.');
			return;
		}

		setIsSaving(true);
		try {
			const regiaoLimpa = form.regiao.trim().toUpperCase();
			const payload = {
				acao: form.id ? 'atualizar' : 'inserir',
				id: form.id,
				nome: form.nome.trim().toUpperCase(),
				regiao: regiaoLimpa,
				user_id: user?.id
			};

			const response = await api.post('api_dano_categorias.php', payload);
			const res = response.data;

			if (!isMounted.current) return;

			if (res && res.success) {
				if (regiaoLimpa) adicionarRegiaoLocal(regiaoLimpa);
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

	const abrirDanosDaCategoria = async (cat: CategoriaDano) => {
		setCategoriaSelecionada(cat);
		setModalListaDanosVisible(true);
		carregarDanos(cat.id);
	};

	const carregarDanos = async (categoriaId: number) => {
		setIsLoadingDanos(true);
		try {
			const response = await api.post('api_dano_categorias.php', {
				acao: 'listar_danos',
				categoria_id: categoriaId
			});
			const res = response.data;
			if (!isMounted.current) return;
			if (res && res.success) {
				setDanosCategoria(res.data || []);
			} else {
				setDanosCategoria([]);
			}
		} catch (e) {
			if (isMounted.current) setDanosCategoria([]);
		} finally {
			if (isMounted.current) setIsLoadingDanos(false);
		}
	};

	const abrirNovoDano = () => {
		setModoNovaRegiaoDano(false);
		setFormDano({
			id: '',
			nome: '',
			regiao: categoriaSelecionada?.regiao || '',
			categoria_id: categoriaSelecionada ? String(categoriaSelecionada.id) : ''
		});
		setModalFormDanoVisible(true);
	};

	const abrirEditarDano = (dano: ItemDano) => {
		const regiaoAtual = (dano.regiao || '').toUpperCase();
		if (regiaoAtual && !regioesDisponiveis.includes(regiaoAtual)) {
			adicionarRegiaoLocal(regiaoAtual);
		}
		setModoNovaRegiaoDano(false);
		setFormDano({
			id: String(dano.id),
			nome: dano.nome,
			regiao: regiaoAtual,
			categoria_id: String(dano.categoria_id || categoriaSelecionada?.id || '')
		});
		setModalFormDanoVisible(true);
	};

	const salvarDano = async () => {
		if (!formDano.regiao.trim()) {
			Alert.alert('Atenção', 'Selecione ou digite a região do pneu.');
			return;
		}
		if (!formDano.categoria_id) {
			Alert.alert('Atenção', 'Selecione a categoria do dano.');
			return;
		}
		if (!formDano.nome.trim()) {
			Alert.alert('Atenção', 'O tipo de dano / ocorrência é obrigatório.');
			return;
		}

		setIsSaving(true);
		try {
			const regiaoLimpa = formDano.regiao.trim().toUpperCase();
			const response = await api.post('api_dano_categorias.php', {
				acao: 'salvar_dano',
				id: formDano.id,
				nome: formDano.nome.trim().toUpperCase(),
				regiao: regiaoLimpa,
				categoria_id: Number(formDano.categoria_id)
			});
			const res = response.data;
			if (!isMounted.current) return;

			if (res && res.success) {
				adicionarRegiaoLocal(regiaoLimpa);
				setModalFormDanoVisible(false);
				if (categoriaSelecionada) {
					carregarDanos(categoriaSelecionada.id);
				}
				carregarCategorias();
			} else {
				Alert.alert('Erro', res?.message || 'Falha ao salvar o dano.');
			}
		} catch (e) {
			if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
		} finally {
			if (isMounted.current) setIsSaving(false);
		}
	};

	const excluirDano = (idDano: number) => {
		Alert.alert(
			'Excluir Dano',
			'Deseja realmente excluir este tipo de dano?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir',
					style: 'destructive',
					onPress: async () => {
						try {
							await api.post('api_dano_categorias.php', { acao: 'excluir_dano', id: idDano });
							if (categoriaSelecionada) carregarDanos(categoriaSelecionada.id);
							carregarCategorias();
						} catch (e) {
							if (categoriaSelecionada) carregarDanos(categoriaSelecionada.id);
						}
					}
				}
			]
		);
	};

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />;

	return (
		<View style={styles.container}>
			<View style={styles.filterSection}>
				<Text style={styles.sectionTitle}>Categorias e Regiões de Danos</Text>
				<TouchableOpacity
					style={styles.btnInserir}
					onPress={() => {
						setModoNovaRegiaoCat(false);
						setForm({ id: '', nome: '', regiao: '' });
						setModalVisible(true);
					}}
				>
					<Feather name="plus-circle" size={18} color="#ffffff" />
					<Text style={styles.btnInserirText}>Nova Categoria</Text>
				</TouchableOpacity>
				<Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: -5, fontSize: 12 }]}>
					Categorias Cadastradas ({categorias.length})
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
							<View style={styles.cardTopRow}>
								<View style={{ flex: 1, marginRight: 10 }}>
									<Text style={styles.cardTitle}>#{item.id} - {item.nome}</Text>
									{item.regiao ? (
										<Text style={styles.cardSubtitle}>Região Padrão: {item.regiao}</Text>
									) : null}
								</View>
								<View style={styles.badgeQtd}>
									<Text style={styles.badgeQtdText}>{item.qtd_danos || 0} danos</Text>
								</View>
							</View>

							<View style={styles.cardActionsRow}>
								<TouchableOpacity
									style={styles.btnDanosCard}
									onPress={() => abrirDanosDaCategoria(item)}
								>
									<Feather name="list" size={14} color="#fff" />
									<Text style={styles.btnEditarCardText}>Danos / Regiões</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.btnEditarCard}
									onPress={() => {
										const reg = (item.regiao || '').toUpperCase();
										if (reg && !regioesDisponiveis.includes(reg)) {
											adicionarRegiaoLocal(reg);
										}
										setModoNovaRegiaoCat(false);
										setForm({ id: String(item.id), nome: item.nome, regiao: reg });
										setModalVisible(true);
									}}
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
					)}
					ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhuma categoria cadastrada.</Text> : undefined}
				/>
			)}

			<Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={() => setModalVisible(false)}>
				<View style={styles.modalOverlay}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
						<View style={styles.modalSmall}>
							<Text style={styles.modalTitle}>{form.id ? 'Editar Categoria' : 'Nova Categoria'}</Text>

							<Text style={styles.label}>* Nome da Categoria</Text>
							<TextInput
								style={styles.inputModal}
								value={form.nome}
								onChangeText={t => setForm({ ...form, nome: t })}
								placeholder="Ex: ACIDENTE, MAU USO..."
								autoCapitalize="characters"
							/>

							<View style={styles.rowHeaderLabel}>
								<Text style={[styles.label, { marginBottom: 0 }]}>Região do Pneu (Opcional)</Text>
								<TouchableOpacity
									onPress={() => {
										setModoNovaRegiaoCat(!modoNovaRegiaoCat);
										setForm({ ...form, regiao: '' });
									}}
								>
									<Text style={styles.linkToggleText}>
										{modoNovaRegiaoCat ? 'Selecionar da lista' : '+ Digitar nova região'}
									</Text>
								</TouchableOpacity>
							</View>

							{modoNovaRegiaoCat ? (
								<TextInput
									style={styles.inputModal}
									value={form.regiao}
									onChangeText={t => setForm({ ...form, regiao: t })}
									placeholder="Digite a região (Ex: OMBRO, TALÃO...)"
									autoCapitalize="characters"
								/>
							) : (
								<RNPickerSelect
									placeholder={{ label: 'Selecione uma região...', value: '', color: '#999' }}
									value={form.regiao}
									onValueChange={(v) => setForm({ ...form, regiao: v || '' })}
									items={regioesDisponiveis.map((r) => ({
										label: r,
										value: r,
										color: '#000'
									}))}
									style={pickerStyles}
									useNativeAndroidPickerStyle={false}
									Icon={PickerIcon}
								/>
							)}

							<View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
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

			<Modal visible={modalListaDanosVisible} animationType="slide" onRequestClose={() => setModalListaDanosVisible(false)}>
				<View style={{ flex: 1, backgroundColor: '#f4f6f8' }}>
					<View style={styles.headerFullModal}>
						<TouchableOpacity onPress={() => setModalListaDanosVisible(false)} style={{ padding: 5 }}>
							<Feather name="arrow-left" size={24} color="#fff" />
						</TouchableOpacity>
						<Text style={styles.headerFullTitle} numberOfLines={1}>
							Danos: {categoriaSelecionada?.nome}
						</Text>
						<View style={{ width: 30 }} />
					</View>

					<View style={styles.filterSection}>
						<TouchableOpacity style={styles.btnInserir} onPress={abrirNovoDano}>
							<Feather name="plus-circle" size={18} color="#ffffff" />
							<Text style={styles.btnInserirText}>Inserir Dano / Região</Text>
						</TouchableOpacity>
					</View>

					{isLoadingDanos ? (
						<ActivityIndicator size="large" color="#0c6ead" style={{ marginTop: 30 }} />
					) : (
						<FlatList
							data={danosCategoria}
							keyExtractor={(item) => String(item.id)}
							contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
							renderItem={({ item, index }) => {
								const regiaoAtual = item.regiao || 'SEM REGIÃO DEFINIDA';
								const regiaoAnt = index > 0 ? (danosCategoria[index - 1]?.regiao || 'SEM REGIÃO DEFINIDA') : '';
								const mostrarHeaderRegiao = regiaoAtual !== regiaoAnt;

								return (
									<View>
										{mostrarHeaderRegiao && (
											<View style={styles.regiaoBanner}>
												<Text style={styles.regiaoBannerText}>{regiaoAtual}</Text>
											</View>
										)}
										<View style={[styles.card, { marginHorizontal: 0, marginBottom: 10 }]}>
											<View style={styles.cardHeader}>
												<View style={{ flex: 1, marginRight: 10 }}>
													<Text style={styles.cardTitle}>- {item.nome}</Text>
													<Text style={styles.cardSubtitle}>Região: {regiaoAtual}</Text>
												</View>
												<View style={styles.actionButtonsRow}>
													<TouchableOpacity style={styles.btnEditarCard} onPress={() => abrirEditarDano(item)}>
														<Feather name="edit-2" size={14} color="#fff" />
													</TouchableOpacity>
													<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirDano(item.id)}>
														<Feather name="trash-2" size={14} color="#fff" />
													</TouchableOpacity>
												</View>
											</View>
										</View>
									</View>
								);
							}}
							ListEmptyComponent={
								<Text style={{ textAlign: 'center', color: '#666', marginTop: 30 }}>
									Nenhum dano cadastrado nesta categoria.
								</Text>
							}
						/>
					)}
				</View>
			</Modal>

			<Modal visible={modalFormDanoVisible} animationType="fade" transparent={true} onRequestClose={() => setModalFormDanoVisible(false)}>
				<View style={styles.modalOverlay}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
						<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }} keyboardShouldPersistTaps="handled">
							<View style={styles.modalSmall}>
								<Text style={styles.modalTitle}>
									{formDano.id ? 'Editar Dano / Ocorrência' : 'Novo Dano / Ocorrência'}
								</Text>

								<View style={styles.rowHeaderLabel}>
									<Text style={[styles.label, { marginBottom: 0 }]}>* Região do Pneu</Text>
									<TouchableOpacity
										onPress={() => {
											setModoNovaRegiaoDano(!modoNovaRegiaoDano);
											setFormDano({ ...formDano, regiao: '' });
										}}
									>
										<Text style={styles.linkToggleText}>
											{modoNovaRegiaoDano ? 'Selecionar da lista' : '+ Digitar nova região'}
										</Text>
									</TouchableOpacity>
								</View>

								{modoNovaRegiaoDano ? (
									<TextInput
										style={styles.inputModal}
										value={formDano.regiao}
										onChangeText={t => setFormDano({ ...formDano, regiao: t })}
										placeholder="Digite a região (Ex: BANDA DE RODAGEM...)"
										autoCapitalize="characters"
									/>
								) : (
									<RNPickerSelect
										placeholder={{ label: 'Selecione a região do pneu...', value: '', color: '#999' }}
										value={formDano.regiao}
										onValueChange={(v) => setFormDano({ ...formDano, regiao: v || '' })}
										items={regioesDisponiveis.map((r) => ({
											label: r,
											value: r,
											color: '#000'
										}))}
										style={pickerStyles}
										useNativeAndroidPickerStyle={false}
										Icon={PickerIcon}
									/>
								)}

								<Text style={styles.label}>* Categoria</Text>
								<RNPickerSelect
									placeholder={{ label: 'Selecione a categoria...', value: '', color: '#999' }}
									value={formDano.categoria_id}
									onValueChange={(v) => setFormDano({ ...formDano, categoria_id: v || '' })}
									items={categorias.map((c) => ({
										label: c.nome,
										value: String(c.id),
										color: '#000'
									}))}
									style={pickerStyles}
									useNativeAndroidPickerStyle={false}
									Icon={PickerIcon}
								/>

								<Text style={styles.label}>* Tipo de Dano / Ocorrência</Text>
								<TextInput
									style={styles.inputModal}
									value={formDano.nome}
									onChangeText={t => setFormDano({ ...formDano, nome: t })}
									placeholder="Ex: INFILTRAÇÃO / IMPACTO POR OBJETO PERFURANTE"
									autoCapitalize="characters"
								/>

								<View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
									<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalFormDanoVisible(false)}>
										<Text style={{ fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.btnSalvar, { flex: 1 }]} onPress={salvarDano} disabled={isSaving}>
										{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
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

const pickerStyles = StyleSheet.create({
	inputIOS: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', marginBottom: 15, paddingRight: 30, minHeight: 48 },
	inputAndroid: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', marginBottom: 15, paddingRight: 30, minHeight: 48 }
});

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	rowHeaderLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
	linkToggleText: { fontSize: 12, fontWeight: 'bold', color: '#0c6ead' },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },
	btnInserir: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8 },
	btnInserirText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 12, gap: 8, backgroundColor: '#fafafa' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
	cardTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
	cardSubtitle: { fontSize: 12, color: '#666', marginTop: 3 },
	badgeQtd: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	badgeQtdText: { color: '#2e7d32', fontSize: 12, fontWeight: 'bold' },
	actionButtonsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
	btnDanosCard: { backgroundColor: '#f39c12', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
	btnEditarCard: { backgroundColor: '#0c6ead', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
	btnEditarCardText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
	btnExcluirCard: { backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalSmall: { width: '88%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
	btnSalvar: { backgroundColor: '#63c77b', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnSalvarText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	headerFullModal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0c6ead', paddingHorizontal: 15, paddingBottom: 15, paddingTop: Platform.OS === 'ios' ? 55 : 35 },
	headerFullTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', flex: 1, textAlign: 'center' },
	regiaoBanner: { backgroundColor: '#e8f0fe', borderLeftWidth: 4, borderLeftColor: '#0c6ead', paddingVertical: 8, paddingHorizontal: 12, marginTop: 10, marginBottom: 8, borderRadius: 6 },
	regiaoBannerText: { fontSize: 13, fontWeight: 'bold', color: '#0c6ead', textTransform: 'uppercase' }
});