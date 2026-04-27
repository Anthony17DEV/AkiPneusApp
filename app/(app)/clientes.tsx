import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView,
	Modal, Platform, ScrollView, StyleSheet, Text, TextInput,
	TouchableOpacity, View
} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import RNPickerSelect from 'react-native-picker-select';

import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';

const URL_FOTOS = 'https://sistemascactus.com/apicactus/akipneus/fotos/';

interface Cliente {
	id: number;
	codigo: string;
	nome: string;
	cnpj: string;
	situacao: string;
	tipoCliente?: string;
	fone1?: string;
}

export default function ClientesScreen() {
	const { user } = useAuth();
	const [clientes, setClientes] = useState<Cliente[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [pagina, setPagina] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const [filtroCodigo, setFiltroCodigo] = useState('');
	const [filtroCnpj, setFiltroCnpj] = useState('');
	const [filtroNome, setFiltroNome] = useState('');

	const [modalInserirVisible, setModalInserirVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [idEditando, setIdEditando] = useState<number | null>(null);

	const [fotos, setFotos] = useState<string[]>([]);
	const [fotoAntiga, setFotoAntiga] = useState<string | null>(null);

	const [formCliente, setFormCliente] = useState({
		cnpj: '', identificacao: '',
		cidade: '', cidade_id: '',
		contato: '', fone1: '', fone2: '', email: '', tipoCliente: '', situacao: ''
	});

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'cidade'>('cidade');
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const carregarClientes = async (pageToLoad = 1) => {
		if (pageToLoad === 1) setIsLoading(true); else setIsFetchingMore(true);
		const filtros = { codigo: filtroCodigo, cnpj: filtroCnpj, nome: filtroNome };
		const response = await apiService.buscarClientes(user?.id, user?.nivel, filtros, pageToLoad);

		if (response && response.success) {
			const dataArray = response.data || [];
			if (pageToLoad === 1) { setClientes(dataArray); } else { setClientes(prev => [...prev, ...dataArray]); }
			setHasMore(dataArray.length === 20); setPagina(pageToLoad);
		}
		setIsLoading(false); setIsFetchingMore(false);
	};

	useEffect(() => { carregarClientes(1); }, []);

	const loadMore = () => { if (!isLoading && !isFetchingMore && hasMore) carregarClientes(pagina + 1); };

	const resetForm = () => {
		setFormCliente({ cnpj: '', identificacao: '', cidade: '', cidade_id: '', contato: '', fone1: '', fone2: '', email: '', tipoCliente: '', situacao: '' });
		setFotos([]);
		setFotoAntiga(null);
		setIsEditing(false);
		setIdEditando(null);
	};

	const abrirModalNovo = () => { resetForm(); setModalInserirVisible(true); };

	const handleActionModificar = async (cliente: Cliente) => {
		setIsLoading(true);
		const res = await apiService.buscarClientePorId(cliente.id);
		setIsLoading(false);

		if (res && res.success) {
			const dados = res.data;
			setFormCliente({
				cnpj: dados.cnpj || '', identificacao: dados.identificacao || '',
				cidade: dados.cidade || '', cidade_id: dados.cidade_id || '',
				contato: dados.contato || '', fone1: dados.fone1 || '', fone2: dados.fone2 || '',
				email: dados.email || '', tipoCliente: dados.tipoCliente || '', situacao: dados.situacao || ''
			});

			setFotoAntiga(dados.foto ? `${URL_FOTOS}${dados.foto}` : null);
			setFotos([]);
			setIsEditing(true);
			setIdEditando(cliente.id);
			setModalInserirVisible(true);
		} else { Alert.alert('Erro', res?.message || 'Não foi possível carregar os detalhes.'); }
	};

	const abrirBuscaDinamica = (tipo: 'cidade') => {
		setTipoBusca(tipo); setTermoComboBusca(''); setResultadosBusca([]); setModalBuscaVisible(true); buscarDinamicaNoBanco(tipo, '');
	};

	const buscarDinamicaNoBanco = async (tipo: string, termo: string) => {
		setIsSearching(true);
		const res = await apiService.buscarDinamica(tipo, termo, null as any);
		if (res && res.success) { setResultadosBusca(res.data); } else { setResultadosBusca([]); }
		setIsSearching(false);
	};

	const selecionarItemBusca = (item: any) => {
		if (tipoBusca === 'cidade') setFormCliente({ ...formCliente, cidade: item.nome, cidade_id: item.id });
		setModalBuscaVisible(false);
	};

	const abrirCamera = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') { Alert.alert('Permissão negada'); return; }
		let result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
		if (!result.canceled && result.assets[0].base64) {
			setFotos([`data:image/jpeg;base64,${result.assets[0].base64}`]);
			setFotoAntiga(null);
		}
	};

	const abrirGaleria = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: false, quality: 0.5, base64: true });
		if (!result.canceled && result.assets[0].base64) {
			setFotos([`data:image/jpeg;base64,${result.assets[0].base64}`]);
			setFotoAntiga(null);
		}
	};

	const removerFoto = (uriRemover: string) => setFotos(fotos.filter(uri => uri !== uriRemover));
	const removerFotoAntiga = () => setFotoAntiga(null);

	const handleSalvarCliente = async () => {
		if (!formCliente.cnpj || !formCliente.identificacao) { Alert.alert('Atenção', 'Preencha pelo menos o CNPJ e a Identificação.'); return; }
		const dadosFinais: any = { ...formCliente, fotos };
		try {
			let response;
			if (isEditing) { dadosFinais.id = idEditando; response = await apiService.modificarCliente(dadosFinais, user?.id); }
			else { response = await apiService.cadastrarCliente(dadosFinais, user?.id); }

			if (response && response.success) {
				Alert.alert('Sucesso', isEditing ? 'Cliente atualizado!' : 'Novo cliente cadastrado.');
				setModalInserirVisible(false); resetForm(); carregarClientes(1);
			} else { Alert.alert('Atenção', response?.message || 'Erro no servidor.'); }
		} catch (e: any) { Alert.alert('Erro Fatal', e.message); }
	};

	const formatarTelefone = (tel?: string) => {
		if (!tel) return 'Sem telefone';
		const limpo = tel.replace(/\D/g, '');
		if (limpo.length === 11) return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
		if (limpo.length === 10) return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
		return tel;
	};

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#000" style={{ marginTop: 15, marginRight: 15 }} />;

	const renderItem = ({ item }: { item: Cliente }) => {
		return (
			<View style={styles.card}>
				<View style={styles.cardHeader}>
					<Text style={styles.cardClient} numberOfLines={1}>#{item.codigo || item.id} - {item.nome}</Text>
					<View style={[styles.statusBadge, { backgroundColor: '#e8f0fe' }]}>
						<Text style={[styles.statusText, { color: '#1967d2' }]}>{item.tipoCliente || 'CLIENTE'}</Text>
					</View>
				</View>
				<View style={styles.cardInfoBox}>
					<View style={styles.cardInfoRow}>
						<Feather name="file-text" size={14} color="#666" />
						<Text style={styles.cardInfoText}>{item.cnpj}</Text>
					</View>
					<View style={styles.cardInfoRow}>
						<Feather name="phone" size={14} color="#666" />
						<Text style={styles.cardInfoText}>{formatarTelefone(item.fone1)}</Text>
					</View>
				</View>
				<View style={styles.cardActions}>
					<TouchableOpacity style={styles.btnEditarCard} onPress={() => handleActionModificar(item)}>
						<Feather name="edit-2" size={18} color="#ffffff" />
						<Text style={styles.btnEditarCardText}>Editar</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={clientes}
				keyExtractor={(item, index) => String(item?.id || index)}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
				onEndReached={loadMore}
				onEndReachedThreshold={0.3}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Buscar Clientes</Text>
						<View style={styles.row}>
							<View style={{ width: '30%' }}><Text style={styles.label}>Código</Text><TextInput style={styles.input} placeholder="Ex: 102" keyboardType="numeric" value={filtroCodigo} onChangeText={setFiltroCodigo} /></View>
							<View style={{ width: '65%' }}><Text style={styles.label}>CNPJ</Text><MaskedTextInput mask="99.999.999/9999-99" style={styles.input} placeholder="00.000.000/0000-00" keyboardType="numeric" value={filtroCnpj} onChangeText={(text, rawText) => setFiltroCnpj(rawText)} /></View>
						</View>
						<View style={styles.row}>
							<View style={{ width: '100%' }}><Text style={styles.label}>Cliente</Text><TextInput style={styles.input} placeholder="Nome/Razão..." value={filtroNome} onChangeText={setFiltroNome} /></View>
						</View>
						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={() => carregarClientes(1)}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.btnInserir} onPress={abrirModalNovo}>
								<Feather name="user-plus" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir</Text>
							</TouchableOpacity>
						</View>
						<Text style={[styles.sectionTitle, { marginTop: -10, marginBottom: -10 }]}></Text>
						{isLoading && clientes.length === 0 && <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#ED1C24" /><Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text></View>}
					</View>
				}
				ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color="#ED1C24" style={{ marginVertical: 20 }} /> : !hasMore && clientes.length > 0 ? <Text style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>Fim da lista.</Text> : null}
				ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum cliente encontrado.</Text> : null}
			/>

			<Modal visible={modalInserirVisible} animationType="slide" transparent={false}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#fff' }}>
					<View style={styles.modalHeaderFull}>
						<TouchableOpacity onPress={() => setModalInserirVisible(false)} style={{ padding: 5 }}><Feather name="arrow-left" size={24} color="#333" /></TouchableOpacity>
						<Text style={styles.modalTitle}>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</Text>
						<View style={{ width: 24 }} />
					</View>

					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
						<Text style={styles.groupTitle}>1. Dados Principais</Text>
						<View style={styles.inputGroup}><Text style={styles.label}>CNPJ</Text><MaskedTextInput mask="99.999.999/9999-99" style={styles.input} placeholder="00.000.000/0000-00" keyboardType="numeric" value={formCliente.cnpj} onChangeText={(t) => setFormCliente({ ...formCliente, cnpj: t })} /></View>
						<View style={styles.inputGroup}><Text style={styles.label}>Razão Social / Nome Fantasia</Text><TextInput style={styles.input} placeholder="Nome do Cliente" value={formCliente.identificacao} onChangeText={(t) => setFormCliente({ ...formCliente, identificacao: t })} /></View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Cidade</Text>
							<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('cidade')}>
								<Text style={{ color: formCliente.cidade ? '#000' : '#999' }}>{formCliente.cidade || 'Selecionar Cidade...'}</Text>
								<Feather name="search" size={16} color="#999" />
							</TouchableOpacity>
						</View>

						<Text style={styles.groupTitle}>2. Contato</Text>
						<View style={styles.inputGroup}><Text style={styles.label}>Pessoa de Contato</Text><TextInput style={styles.input} placeholder="" value={formCliente.contato} onChangeText={(t) => setFormCliente({ ...formCliente, contato: t })} /></View>
						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Telefone 1</Text><MaskedTextInput mask="(99) 99999-9999" style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad" value={formCliente.fone1} onChangeText={(t) => setFormCliente({ ...formCliente, fone1: t })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Telefone 2</Text><MaskedTextInput mask="(99) 99999-9999" style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad" value={formCliente.fone2} onChangeText={(t) => setFormCliente({ ...formCliente, fone2: t })} /></View>
						</View>
						<View style={styles.inputGroup}><Text style={styles.label}>E-mail</Text><TextInput style={styles.input} placeholder="contato@empresa.com" keyboardType="email-address" autoCapitalize="none" value={formCliente.email} onChangeText={(t) => setFormCliente({ ...formCliente, email: t })} /></View>

						<Text style={styles.groupTitle}>3. Perfil do Cliente</Text>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Tipo de Cliente</Text>
							<RNPickerSelect
								placeholder={{ label: 'Selecione o tipo...', value: '', color: '#666' }}
								onValueChange={(value) => setFormCliente({ ...formCliente, tipoCliente: value })}
								value={formCliente.tipoCliente}
								items={[
									{ label: 'TRANSPORTADORA', value: 'TRANSPORTADORA', color: '#000' },
									{ label: 'FROTA PRÓPRIA', value: 'FROTA PRÓPRIA', color: '#000' },
									{ label: 'AUTÔNOMO', value: 'AUTÔNOMO', color: '#000' },
									{ label: 'BORRACHARIA', value: 'BORRACHARIA', color: '#000' }
								]}
								style={pickerSelectStyles}
								useNativeAndroidPickerStyle={false}
								Icon={PickerIcon}
							/>
						</View>

						<Text style={[styles.groupTitle, { zIndex: -1, elevation: -1 }]}>4. Anexos / Fotos</Text>

						{fotoAntiga && fotos.length === 0 && (
							<View style={[styles.fotosGrid, { zIndex: -1, elevation: -1 }]}>
								<View style={styles.fotoThumbContainer}>
									<Image source={{ uri: fotoAntiga }} style={styles.fotoThumb} />
									<TouchableOpacity style={styles.btnRemoverFoto} onPress={removerFotoAntiga}>
										<Feather name="x" size={14} color="#fff" />
									</TouchableOpacity>
								</View>
							</View>
						)}

						{fotos.length > 0 && (
							<View style={[styles.fotosGrid, { zIndex: -1, elevation: -1 }]}>
								{fotos.map((uri, index) => (
									<View key={index} style={styles.fotoThumbContainer}>
										<Image source={{ uri }} style={styles.fotoThumb} />
										<TouchableOpacity style={styles.btnRemoverFoto} onPress={() => removerFoto(uri)}>
											<Feather name="x" size={14} color="#fff" />
										</TouchableOpacity>
									</View>
								))}
							</View>
						)}

						<View style={[styles.fotoContainer, { zIndex: -1, elevation: -1 }]}>
							<TouchableOpacity style={styles.btnFoto} onPress={abrirCamera}>
								<Feather name="camera" size={24} color="#666" />
								<Text style={styles.btnFotoText}>Tirar Foto</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.btnFoto} onPress={abrirGaleria}>
								<Feather name="image" size={24} color="#666" />
								<Text style={styles.btnFotoText}>Galeria</Text>
							</TouchableOpacity>
						</View>

						<TouchableOpacity style={[styles.btnSalvar, { backgroundColor: '#85d697', zIndex: -1, elevation: -1 }]} onPress={handleSalvarCliente}>
							<Feather name="save" size={20} color="#fff" style={{ marginRight: 10 }} />
							<Text style={styles.btnText}>{isEditing ? 'Gravar' : 'Gravar'}</Text>
						</TouchableOpacity>
						<View style={{ height: 40 }} />
					</ScrollView>

					{modalBuscaVisible && (
						<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 9999, elevation: 9999 }]}>
							<View style={styles.modalContentBusca}>
								<View style={styles.modalHeaderBusca}>
									<Text style={styles.modalTitleBusca}>Selecionar {tipoBusca.toUpperCase()}</Text>
									<TouchableOpacity onPress={() => setModalBuscaVisible(false)}><Feather name="x" size={24} color="#333" /></TouchableOpacity>
								</View>
								<View style={styles.inputBuscaContainer}>
									<Feather name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
									<TextInput style={styles.inputBuscaInterno} placeholder={`Buscar...`} value={termoComboBusca} onChangeText={(t) => { setTermoComboBusca(t); buscarDinamicaNoBanco(tipoBusca, t); }} autoFocus={true} />
								</View>
								{isSearching ? <ActivityIndicator style={{ marginTop: 20 }} color="#ED1C24" /> : (
									<FlatList data={resultadosBusca} keyExtractor={(item, index) => String(item?.id || index)}
										renderItem={({ item }) => (
											<TouchableOpacity style={styles.itemBuscaDinamica} onPress={() => selecionarItemBusca(item)}>
												<Text style={styles.itemBuscaNome}>{item.nome}</Text>
											</TouchableOpacity>
										)}
										ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma cidade encontrada.</Text>}
									/>
								)}
							</View>
						</View>
					)}
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

const pickerSelectStyles = StyleSheet.create({
	inputIOS: { fontSize: 14, paddingVertical: 14, paddingHorizontal: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, color: '#000000', paddingRight: 30, backgroundColor: '#f9f9f9', marginBottom: 15 },
	inputAndroid: { fontSize: 14, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, color: '#000000', paddingRight: 30, backgroundColor: '#f9f9f9', marginBottom: 15 },
});

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 3, zIndex: 1, marginBottom: 15 },
	sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, color: '#000', marginBottom: 10, minHeight: 48 },
	fakeInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	inputGroup: { width: '100%', marginBottom: 10 },
	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginRight: 10 },
	btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
	btnInserir: { flex: 1, backgroundColor: '#63c77b', borderWidth: 1, borderColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginLeft: 10 },
	btnInserirText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, marginHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2.22, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardClient: { fontSize: 14, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
	statusBadge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 12 },
	statusText: { fontSize: 10, fontWeight: 'bold' },
	cardInfoBox: { padding: 15, paddingBottom: 10 },
	cardInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
	cardInfoText: { fontSize: 13, color: '#666', marginLeft: 8 },
	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa', alignItems: 'flex-end' },
	btnEditarCard: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 8, width: '33%' },
	btnEditarCardText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },

	modalHeaderFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#ED1C24', marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ffe5e6', paddingBottom: 5 },

	fotosGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
	fotoThumbContainer: { position: 'relative', marginRight: 10, marginBottom: 10 },
	fotoThumb: { width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f0f0f0' },
	btnRemoverFoto: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ED1C24', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
	fotoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
	btnFoto: { flex: 1, backgroundColor: '#f0f0f0', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 20, marginHorizontal: 5 },
	btnFotoText: { marginTop: 8, fontSize: 14, color: '#666', fontWeight: '500' },
	btnSalvar: { backgroundColor: '#ED1C24', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 10 },

	modalOverlayBusca: { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalContentBusca: { width: '90%', height: '70%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
	modalHeaderBusca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitleBusca: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	inputBuscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, height: 45, marginBottom: 15 },
	inputBuscaInterno: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	itemBuscaDinamica: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 15 },
	itemBuscaNome: { fontSize: 15, fontWeight: '600', color: '#333' },
	emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});