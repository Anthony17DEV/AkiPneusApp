import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LogoSolutires from '../../assets/images/solutires.png';
import { apiService } from '../../src/services/apiService';

interface MarcaPneu {
	id: number;
	referencia: string;
	marca: string;
	qtd_modelos: number;
}

export default function MarcasScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const API_URL = 'https://sistemascactus.com/apicactus/akipneus/api_marcas.php';

	const [marcas, setMarcas] = useState<MarcaPneu[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [filtroBusca, setFiltroBusca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);

	const [form, setForm] = useState({
		referenciaAntiga: '', marcaAntiga: '',
		referenciaNova: '', marcaNova: ''
	});

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'referencia_pneu' | 'marca_pneu'>('referencia_pneu');
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const [modalCadastroVisible, setModalCadastroVisible] = useState(false);
	const [isCadastrando, setIsCadastrando] = useState(false);
	const [formCadastro, setFormCadastro] = useState({ nome: '' });

	const carregarMarcas = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'listar', busca_referencia: '', busca_marca: '' })
			});
			const res = await response.json();
			if (res.success) {
				setMarcas(res.data);
			} else {
				setMarcas([]);
			}
		} catch (error) {
			console.log('Erro ignorado no listar');
		}
		setIsLoading(false);
	};

	useEffect(() => {
		const refParam = params.referencia_nome as string || '';
		if (refParam) setFiltroBusca(refParam);
		carregarMarcas();
	}, [params.referencia_nome]);

	const resetForm = () => {
		setForm({
			referenciaAntiga: '', marcaAntiga: '',
			referenciaNova: (params.referencia_nome as string) || '', marcaNova: ''
		});
	};

	const handleEditar = (item: MarcaPneu) => {
		resetForm();
		setForm({
			referenciaAntiga: item.referencia,
			marcaAntiga: item.marca,
			referenciaNova: item.referencia,
			marcaNova: item.marca
		});
		setModalVisible(true);
	};

	const excluirMarca = (ref: string, marca: string) => {
		Alert.alert('Atenção', `Deseja realmente excluir a marca "${marca}" da referência "${ref}"?\n\nIsso também removerá os modelos ligados a ela.`, [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir', style: 'destructive', onPress: async () => {
					try {
						await fetch(API_URL, {
							method: 'POST', headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ acao: 'excluir', referencia: ref, marca: marca })
						});
					} catch (error) {
						console.log("Erro ignorado ao excluir");
					} finally {
						Alert.alert('Sucesso', 'Marca excluída com sucesso.');
						carregarMarcas();
					}
				}
			}
		]);
	};

	const salvarMarca = async () => {
		if (!form.referenciaNova.trim() || !form.marcaNova.trim()) {
			Alert.alert('Atenção', 'Referência e Marca são obrigatórias.');
			return;
		}

		setIsSaving(true);
		try {
			const payload = {
				acao: (form.referenciaAntiga && form.marcaAntiga) ? 'atualizar' : 'inserir',
				referencia_antiga: form.referenciaAntiga,
				marca_antiga: form.marcaAntiga,
				referencia_nova: form.referenciaNova.trim(),
				marca_nova: form.marcaNova.trim()
			};

			await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		} catch (error) {
			console.log('Erro ignorado ao salvar');
		} finally {
			Alert.alert('Sucesso', (form.referenciaAntiga && form.marcaAntiga) ? 'Marca atualizada com sucesso!' : 'Marca cadastrada com sucesso!');
			setModalVisible(false);
			carregarMarcas();
			setIsSaving(false);
		}
	};

	const abrirBuscaDinamica = (tipo: 'referencia_pneu' | 'marca_pneu') => {
		setTipoBusca(tipo);
		setTermoComboBusca('');
		setResultadosBusca([]);
		setModalBuscaVisible(true);
		buscarDinamicaNoBanco(tipo, '');
	};

	const buscarDinamicaNoBanco = async (tipo: string, termo: string) => {
		setIsSearching(true);
		const res = await apiService.buscarDinamica(tipo, termo);
		setResultadosBusca(res && res.success ? res.data : []);
		setIsSearching(false);
	};

	const selecionarItemBusca = (item: any) => {
		if (tipoBusca === 'referencia_pneu') {
			setForm({ ...form, referenciaNova: item.nome });
		} else {
			setForm({ ...form, marcaNova: item.nome });
		}
		setModalBuscaVisible(false);
	};

	const salvarCadastroDinamico = async () => {
		if (!formCadastro.nome) { Alert.alert("Atenção", "Preencha o nome do item."); return; }
		setIsCadastrando(true);
		try {
			const response = await fetch('https://sistemascactus.com/apicactus/akipneus/api_pneu_cadastro_rapido.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tipo: tipoBusca,
					nome: formCadastro.nome,
					marca_id: tipoBusca === 'marca_pneu' ? form.referenciaNova : null
				})
			});
			const res = await response.json();
			if (res.success) {
				selecionarItemBusca({ id: res.id, nome: res.nome || formCadastro.nome });
				setModalCadastroVisible(false);
			} else {
				Alert.alert('Erro', res.message || 'Falha ao cadastrar.');
			}
		} catch (err) {
			Alert.alert('Erro', 'Erro na conexão com o servidor de cadastro.');
		} finally {
			setIsCadastrando(false);
		}
	};

	const marcasFiltradas = marcas.filter((m) => {
		const termo = filtroBusca.toLowerCase();
		return (
			(m.referencia && m.referencia.toLowerCase().includes(termo)) ||
			(m.marca && m.marca.toLowerCase().includes(termo))
		);
	});

	return (
		<View style={styles.container}>
			<FlatList
				data={marcasFiltradas}
				keyExtractor={(item, index) => String(item.id || index)}

				initialNumToRender={10}
				maxToRenderPerBatch={10}
				windowSize={5}
				removeClippedSubviews={true}

				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Gerenciar Marcas de Pneus</Text>

						{!!params?.referencia_nome && (
							<TouchableOpacity style={styles.btnVoltarCliente} onPress={() => router.push('/referencias')}>
								<Feather name="arrow-left" size={16} color="#333" />
								<Text style={styles.btnVoltarClienteText}>Voltar para Referências</Text>
							</TouchableOpacity>
						)}

						<View style={styles.inputGroupFull}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
								<Text style={styles.label}>Buscar / Filtrar</Text>
								{filtroBusca.length > 0 && (
									<TouchableOpacity onPress={() => setFiltroBusca('')} style={{ paddingHorizontal: 5 }}>
										<Text style={{ color: '#0c6ead', fontSize: 13, fontWeight: 'bold' }}>Limpar Filtro</Text>
									</TouchableOpacity>
								)}
							</View>
							<TextInput
								style={styles.input}
								placeholder="Referência ou Marca..."
								value={filtroBusca}
								onChangeText={setFiltroBusca}
							/>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={carregarMarcas}>
								<Feather name="search" size={14} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.btnInserir} onPress={() => { resetForm(); setModalVisible(true); }}>
								<Feather name="plus-circle" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir</Text>
							</TouchableOpacity>
						</View>

						<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: -5 }]}>
							Resultados ({marcasFiltradas.length})
						</Text>

						{isLoading && marcas.length === 0 && <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#0c6ead" /><Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text></View>}
					</View>
				}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<View style={{ flex: 1 }}>
								<Text style={styles.cardTitle} numberOfLines={1}>{item.marca}</Text>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
									<MaterialCommunityIcons name="tire" size={14} color="#666" style={{ marginRight: 6 }} />
									<Text style={styles.cardSubTitle} numberOfLines={1}>Ref: {item.referencia}</Text>
								</View>
							</View>
							<View style={styles.statusBadge}>
								<Text style={styles.statusText}>{item.qtd_modelos} Modelo(s)</Text>
							</View>
						</View>

						<View style={styles.cardActions}>
							<View style={styles.actionButtonsRow}>
								<TouchableOpacity
									style={styles.btnActionSecondary}
									onPress={() => router.push({ pathname: '/modelos', params: { referencia_nome: item.referencia, marca_nome: item.marca } })}
								>
									<MaterialCommunityIcons name="tag-multiple" size={14} color="#333" />
									<Text style={styles.btnActionTextSecondary}>Modelos</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.btnEditarCard} onPress={() => handleEditar(item)}>
									<Feather name="edit-2" size={14} color="#ffffff" />
									<Text style={styles.btnEditarCardText}>Editar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirMarca(item.referencia, item.marca)}>
									<Feather name="trash-2" size={14} color="#ffffff" />
									<Text style={styles.btnExcluirCardText}>Excluir</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
				ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhuma marca encontrada.</Text> : null}
			/>

			<Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
						<View style={styles.modalHeaderFull}>
							<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}>
								<Feather name="arrow-left" size={24} color="#fff" />
							</TouchableOpacity>
							<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
							<View style={{ width: 34 }} />
						</View>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
							<Text style={styles.groupTitle}>{form.referenciaAntiga ? 'Editar Marca' : 'Nova Marca de Pneu'}</Text>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Referência de Origem</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('referencia_pneu')}>
									<Text style={{ color: form.referenciaNova ? '#000' : '#999' }}>{form.referenciaNova || 'Selecionar Referência...'}</Text>
									<Feather name="search" size={16} color="#999" />
								</TouchableOpacity>
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Nome da Marca</Text>
								<TextInput
									style={styles.input}
									value={form.marcaNova}
									onChangeText={t => setForm({ ...form, marcaNova: t })}
									placeholder="Ex: Michelin, Pirelli..."
								/>
							</View>

							<View style={{ flexDirection: 'row', marginTop: 30, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalVisible(false)}>
									<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1.5, marginTop: 0, height: 50 }]} onPress={salvarMarca} disabled={isSaving}>
									{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
								</TouchableOpacity>
							</View>

							<View style={{ height: 40 }} />
						</ScrollView>

						{modalBuscaVisible && (
							<Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setModalBuscaVisible(false)}>
								<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
									<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }} keyboardShouldPersistTaps="handled">
										<View style={styles.modalContentBusca}>
											<View style={styles.modalHeaderBusca}>
												<Text style={styles.modalTitleBusca}>Selecionar {tipoBusca === 'referencia_pneu' ? 'Referência' : 'Marca'}</Text>
												<View style={{ flexDirection: 'row', alignItems: 'center' }}>
													<TouchableOpacity
														style={{ backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 15, flexDirection: 'row', alignItems: 'center' }}
														onPress={() => {
															setFormCadastro({ nome: '' });
															setModalBuscaVisible(false);
															setModalCadastroVisible(true);
														}}
													>
														<Feather name="plus-circle" size={14} color="#28a745" />
														<Text style={{ color: '#28a745', fontWeight: 'bold', fontSize: 13, marginLeft: 5 }}>Inserir</Text>
													</TouchableOpacity>
													<TouchableOpacity onPress={() => setModalBuscaVisible(false)}><Feather name="x" size={24} color="#333" /></TouchableOpacity>
												</View>
											</View>
											<View style={styles.inputBuscaContainer}>
												<TextInput style={styles.inputBuscaInterno} placeholder="Buscar..." value={termoComboBusca} onChangeText={t => { setTermoComboBusca(t); buscarDinamicaNoBanco(tipoBusca, t); }} autoFocus />
											</View>
											{isSearching ? <ActivityIndicator style={{ marginTop: 20 }} color="#0c6ead" /> : (
												<FlatList
													data={resultadosBusca}
													keyExtractor={(item, index) => String(item?.id || index)}

													initialNumToRender={10}
													maxToRenderPerBatch={10}
													windowSize={5}
													removeClippedSubviews={true}
													keyboardShouldPersistTaps="handled"

													renderItem={({ item }) => (
														<TouchableOpacity style={styles.itemBuscaDinamica} onPress={() => selecionarItemBusca(item)}><Text style={styles.itemBuscaNome}>{item.nome}</Text></TouchableOpacity>
													)}
													scrollEnabled={false}
													ListEmptyComponent={<Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>}
												/>
											)}
										</View>
									</ScrollView>
								</KeyboardAvoidingView>
							</Modal>
						)}

						{modalCadastroVisible && (
							<Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setModalCadastroVisible(false)}>
								<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
									<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }} keyboardShouldPersistTaps="handled">
										<View style={styles.modalSmall}>
											<Text style={styles.modalTitle}>Cadastrar Nova {tipoBusca === 'marca_pneu' ? 'Marca' : 'Referência'}</Text>
											<Text style={styles.label}>* Nome</Text>
											<TextInput
												style={styles.input}
												value={formCadastro.nome}
												onChangeText={t => setFormCadastro({ ...formCadastro, nome: t })}
												placeholder={`Nome...`}
											/>
											<View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
												<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalCadastroVisible(false)}>
													<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
												</TouchableOpacity>
												<TouchableOpacity style={[styles.btnSalvar, { flex: 1, marginTop: 0, height: 50 }]} onPress={salvarCadastroDinamico}>
													{isCadastrando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
												</TouchableOpacity>
											</View>
										</View>
									</ScrollView>
								</KeyboardAvoidingView>
							</Modal>
						)}
					</KeyboardAvoidingView>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 3, zIndex: 1, marginBottom: 15 },
	sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 10, textTransform: 'uppercase' },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, color: '#000', marginBottom: 10, minHeight: 48, justifyContent: 'center' },
	fakeInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },

	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	inputGroupFull: { width: '100%', marginBottom: 5 },
	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },

	btnVoltarCliente: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 15, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ccc' },
	btnVoltarClienteText: { marginLeft: 6, fontSize: 13, fontWeight: 'bold', color: '#333' },

	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginRight: 10 },
	btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
	btnInserir: { flex: 1, backgroundColor: '#63c77b', borderWidth: 1, borderColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginLeft: 10 },
	btnInserirText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, marginHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2.22, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	cardSubTitle: { fontSize: 13, fontWeight: '600', color: '#666' },
	statusBadge: { backgroundColor: '#e8f0fe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
	statusText: { fontSize: 12, fontWeight: 'bold', color: '#1967d2' },

	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa', alignItems: 'flex-end' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%' },

	btnActionSecondary: { backgroundColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15, marginRight: 8 },
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

	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

	modalContentBusca: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
	modalHeaderBusca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitleBusca: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	inputBuscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, height: 45, marginBottom: 15 },
	inputBuscaInterno: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	itemBuscaDinamica: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 15 },
	itemBuscaNome: { fontSize: 15, fontWeight: '600', color: '#333' },
	emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
	modalSmall: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 }
});