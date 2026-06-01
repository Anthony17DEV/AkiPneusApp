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

	const [filtroRef, setFiltroRef] = useState('');
	const [filtroMarca, setFiltroMarca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);

	const [form, setForm] = useState({
		referenciaAntiga: '', marcaAntiga: '',
		referenciaNova: '', marcaNova: ''
	});

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const carregarMarcas = async (refStr = filtroRef, marcaStr = filtroMarca) => {
		setIsLoading(true);
		try {
			const response = await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'listar', busca_referencia: refStr, busca_marca: marcaStr })
			});
			const res = await response.json();
			if (res.success) {
				setMarcas(res.data);
			} else {
				setMarcas([]);
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha ao buscar as marcas.');
		}
		setIsLoading(false);
	};

	useEffect(() => {
		const refParam = params.referencia_nome as string || '';
		setFiltroRef(refParam);
		carregarMarcas(refParam, filtroMarca);
	}, [params.referencia_nome]);

	const resetForm = () => {
		setForm({
			referenciaAntiga: '', marcaAntiga: '',
			referenciaNova: filtroRef || '', marcaNova: ''
		});
	};

	const handleEditar = (item: MarcaPneu) => {
		resetForm();
		setForm({
			referenciaAntiga: item.referencia, marcaAntiga: item.marca,
			referenciaNova: item.referencia, marcaNova: item.marca
		});
		setModalVisible(true);
	};

	const excluirMarca = (referencia: string, marca: string) => {
		Alert.alert('Atenção', `Deseja realmente excluir a marca "${marca}"?\n\nIsso também removerá todos os modelos ligados a ela.`, [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir', style: 'destructive', onPress: async () => {
					try {
						const response = await fetch(API_URL, {
							method: 'POST', headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ acao: 'excluir', referencia: referencia, marca: marca })
						});
						const res = await response.json();
						if (res.success) {
							Alert.alert('Sucesso', 'Marca excluída.');
							carregarMarcas();
						} else {
							Alert.alert('Erro', res.message);
						}
					} catch (error) {
						Alert.alert('Erro', 'Falha ao excluir a marca.');
					}
				}
			}
		]);
	};

	const salvarMarca = async () => {
		if (!form.referenciaNova.trim() || !form.marcaNova.trim()) {
			Alert.alert('Atenção', 'Referência e Marca são campos obrigatórios.');
			return;
		}

		setIsSaving(true);
		try {
			const payload = {
				acao: form.marcaAntiga ? 'atualizar' : 'inserir',
				referencia_antiga: form.referenciaAntiga,
				marca_antiga: form.marcaAntiga,
				referencia_nova: form.referenciaNova.trim(),
				marca_nova: form.marcaNova.trim()
			};

			const response = await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const res = await response.json();

			if (res.success) {
				Alert.alert('Sucesso', res.message);
				setModalVisible(false);
				carregarMarcas();
			} else {
				Alert.alert('Erro', res.message || 'Falha ao salvar.');
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha na conexão com o servidor.');
		}
		setIsSaving(false);
	};

	const abrirBuscaDinamica = () => {
		setTermoComboBusca('');
		setResultadosBusca([]);
		setModalBuscaVisible(true);
		buscarDinamicaNoBanco('');
	};

	const buscarDinamicaNoBanco = async (termo: string) => {
		setIsSearching(true);
		const res = await apiService.buscarDinamica('referencia_pneu', termo);
		setResultadosBusca(res && res.success ? res.data : []);
		setIsSearching(false);
	};

	const selecionarItemBusca = (item: any) => {
		setForm({ ...form, referenciaNova: item.nome });
		setModalBuscaVisible(false);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={marcas}
				keyExtractor={(item, index) => String(item.id || index)}
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Gerenciar Marcas</Text>

						{!!params?.referencia_nome && (
							<TouchableOpacity style={styles.btnVoltarCliente} onPress={() => router.push('/referencias')}>
								<Feather name="arrow-left" size={16} color="#333" />
								<Text style={styles.btnVoltarClienteText}>Voltar para Referências</Text>
							</TouchableOpacity>
						)}

						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Filtro de Referência</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: 295/80"
									value={filtroRef}
									onChangeText={t => setFiltroRef(t.replace(/,/g, '.'))}
								/>
							</View>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Filtro de Marca</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: Michelin"
									value={filtroMarca}
									onChangeText={setFiltroMarca}
								/>
							</View>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={() => carregarMarcas()}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.btnInserir} onPress={() => { resetForm(); setModalVisible(true); }}>
								<Feather name="plus-circle" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir</Text>
							</TouchableOpacity>
						</View>

						<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: -5 }]}>
							Resultados ({marcas.length})
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
									<Feather name="corner-down-right" size={14} color="#666" style={{ marginRight: 6 }} />
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
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
						<View style={styles.modalHeaderFull}>
							<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}>
								<Feather name="arrow-left" size={24} color="#fff" />
							</TouchableOpacity>
							<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
							<View style={{ width: 34 }} />
						</View>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
							<Text style={styles.groupTitle}>{form.marcaAntiga ? 'Editar Marca' : 'Nova Marca'}</Text>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Referência de Origem</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={abrirBuscaDinamica}>
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
						</ScrollView>

						{modalBuscaVisible && (
							<Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setModalBuscaVisible(false)}>
								<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
									<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }} keyboardShouldPersistTaps="handled">
										<View style={styles.modalContentBusca}>
											<View style={styles.modalHeaderBusca}>
												<Text style={styles.modalTitleBusca}>Selecionar Referência</Text>
												<TouchableOpacity onPress={() => setModalBuscaVisible(false)}><Feather name="x" size={24} color="#333" /></TouchableOpacity>
											</View>
											<View style={styles.inputBuscaContainer}>
												<TextInput style={styles.inputBuscaInterno} placeholder="Buscar..." value={termoComboBusca} onChangeText={t => { setTermoComboBusca(t); buscarDinamicaNoBanco(t); }} autoFocus />
											</View>
											{isSearching ? <ActivityIndicator style={{ marginTop: 20 }} color="#0c6ead" /> : (
												<FlatList
													data={resultadosBusca}
													keyExtractor={(item, index) => String(item?.id || index)}
													renderItem={({ item }) => (
														<TouchableOpacity style={styles.itemBuscaDinamica} onPress={() => selecionarItemBusca(item)}><Text style={styles.itemBuscaNome}>{item.nome}</Text></TouchableOpacity>
													)}
													scrollEnabled={false}
												/>
											)}
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

	modalOverlayBusca: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalContentBusca: { width: '90%', height: '70%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
	modalHeaderBusca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitleBusca: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	inputBuscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, height: 45, marginBottom: 15 },
	inputBuscaInterno: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	itemBuscaDinamica: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 15 },
	itemBuscaNome: { fontSize: 15, fontWeight: '600', color: '#333' },
});