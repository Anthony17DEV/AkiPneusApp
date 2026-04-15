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

interface Cliente {
	id: number;
	codigo: string;
	nome: string;
	cnpj: string;
	assessor: string;
	situacao: string;
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
	const [filtroAssessor, setFiltroAssessor] = useState('');

	const [modalInserirVisible, setModalInserirVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [idEditando, setIdEditando] = useState<number | null>(null);

	const [fotos, setFotos] = useState<string[]>([]);

	const [formCliente, setFormCliente] = useState({
		cnpj: '', identificacao: '', cidade: '', contato: '',
		fone1: '', fone2: '', email: '', tipoCliente: '', situacao: ''
	});

	const carregarClientes = async (pageToLoad = 1) => {
		if (pageToLoad === 1) setIsLoading(true);
		else setIsFetchingMore(true);

		const filtros = {
			codigo: filtroCodigo, cnpj: filtroCnpj, nome: filtroNome, assessor: filtroAssessor
		};

		const response = await apiService.buscarClientes(user?.id, user?.nivel, filtros, pageToLoad);

		if (response && response.success) {
			const dataArray = response.data || [];
			if (pageToLoad === 1) {
				setClientes(dataArray);
			} else {
				setClientes(prev => [...prev, ...dataArray]);
			}
			setHasMore(dataArray.length === 20);
			setPagina(pageToLoad);
		} else {
			console.log(response?.message || 'Erro ao carregar clientes');
		}

		setIsLoading(false);
		setIsFetchingMore(false);
	};

	useEffect(() => {
		carregarClientes(1);
	}, []);

	const loadMore = () => {
		if (!isLoading && !isFetchingMore && hasMore) {
			carregarClientes(pagina + 1);
		}
	};

	const resetForm = () => {
		setFormCliente({ cnpj: '', identificacao: '', cidade: '', contato: '', fone1: '', fone2: '', email: '', tipoCliente: '', situacao: '' });
		setFotos([]);
		setIsEditing(false);
		setIdEditando(null);
	};

	const abrirModalNovo = () => {
		resetForm();
		setModalInserirVisible(true);
	};

	const handleActionModificar = async (cliente: Cliente) => {
		setIsLoading(true);
		const res = await apiService.buscarClientePorId(cliente.id);
		setIsLoading(false);

		if (res && res.success) {
			const dados = res.data;
			setFormCliente({
				cnpj: dados.cnpj || '',
				identificacao: dados.identificacao || '',
				cidade: dados.cidade || '',
				contato: dados.contato || '',
				fone1: dados.fone1 || '',
				fone2: dados.fone2 || '',
				email: dados.email || '',
				tipoCliente: dados.tipoCliente || '',
				situacao: dados.situacao || ''
			});

			setFotos([]);
			setIsEditing(true);
			setIdEditando(cliente.id);
			setModalInserirVisible(true);
		} else {
			Alert.alert('Erro', res?.message || 'Não foi possível carregar os detalhes do cliente.');
		}
	};

	const abrirCamera = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') { Alert.alert('Permissão negada'); return; }
		let result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
		if (!result.canceled && result.assets[0].base64) {
			setFotos(prev => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
		}
	};

	const abrirGaleria = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.5, base64: true
		});
		if (!result.canceled) {
			const novasFotos = result.assets.filter(asset => asset.base64).map(asset => `data:image/jpeg;base64,${asset.base64}`);
			setFotos(prev => [...prev, ...novasFotos]);
		}
	};

	const removerFoto = (uriRemover: string) => setFotos(fotos.filter(uri => uri !== uriRemover));

	const handleSalvarCliente = async () => {
		if (!formCliente.cnpj || !formCliente.identificacao) {
			Alert.alert('Atenção', 'Preencha pelo menos o CNPJ e a Identificação.');
			return;
		}

		const dadosFinais: any = { ...formCliente, fotos };

		try {
			let response;
			if (isEditing) {
				dadosFinais.id = idEditando;
				response = await apiService.modificarCliente(dadosFinais, user?.id);
			} else {
				response = await apiService.cadastrarCliente(dadosFinais, user?.id);
			}

			if (response && response.success) {
				Alert.alert('Sucesso', isEditing ? 'Cliente atualizado com sucesso!' : 'Novo cliente cadastrado com sucesso.');
				setModalInserirVisible(false);
				resetForm();
				carregarClientes(1);
			} else {
				const errorMsg = response?.message || 'Erro desconhecido no servidor.';
				Alert.alert('Atenção', errorMsg);
			}
		} catch (e: any) {
			Alert.alert('Erro Fatal', e.message);
		}
	};

	const getBadgeStyle = (situacao: string) => {
		switch (situacao?.toUpperCase()) {
			case 'ATIVO': return { bg: '#e6f4ea', text: '#28a745' };
			case 'INATIVO': return { bg: '#ffebee', text: '#b71c1c' };
			default: return { bg: '#f4f6f8', text: '#666' };
		}
	};

	const renderItem = ({ item }: { item: Cliente }) => {
		const badgeInfo = getBadgeStyle(item.situacao);
		return (
			<View style={styles.card}>
				<View style={styles.cardHeader}>
					<Text style={styles.cardClient} numberOfLines={1}>#{item.codigo || item.id} - {item.nome}</Text>
					<View style={[styles.statusBadge, { backgroundColor: badgeInfo.bg }]}>
						<Text style={[styles.statusText, { color: badgeInfo.text }]}>{item.situacao || 'N/A'}</Text>
					</View>
				</View>

				<View style={styles.cardInfoBox}>
					<View style={styles.cardInfoRow}>
						<Feather name="file-text" size={14} color="#666" />
						<Text style={styles.cardInfoText}>{item.cnpj}</Text>
					</View>
					<View style={styles.cardInfoRow}>
						<Feather name="briefcase" size={14} color="#666" />
						<Text style={styles.cardInfoText}>{item.assessor || 'Sem Assessor'}</Text>
					</View>
				</View>

				<View style={styles.cardActions}>
					<TouchableOpacity style={styles.actionBtn} onPress={() => handleActionModificar(item)}>
						<Feather name="edit" size={18} color="#555" />
						<Text style={styles.actionBtnText}>Modificar Dados do Cliente</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>

			<FlatList
				data={clientes}
				keyExtractor={(item) => item.id.toString()}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
				onEndReached={loadMore}
				onEndReachedThreshold={0.3}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Buscar Clientes</Text>

						<View style={styles.row}>
							<View style={{ width: '30%' }}>
								<Text style={styles.label}>Código</Text>
								<TextInput
									style={styles.input} placeholder="Ex: 102" keyboardType="numeric"
									value={filtroCodigo} onChangeText={setFiltroCodigo}
								/>
							</View>
							<View style={{ width: '65%' }}>
								<Text style={styles.label}>CNPJ</Text>
								<MaskedTextInput
									mask="99.999.999/9999-99" style={styles.input} placeholder="00.000.000/0000-00" keyboardType="numeric"
									value={filtroCnpj} onChangeText={(text, rawText) => setFiltroCnpj(rawText)}
								/>
							</View>
						</View>

						<View style={styles.row}>
							<View style={{ width: '48%' }}>
								<Text style={styles.label}>Cliente</Text>
								<TextInput
									style={styles.input} placeholder="Nome/Razão..."
									value={filtroNome} onChangeText={setFiltroNome}
								/>
							</View>
							<View style={{ width: '48%' }}>
								<Text style={styles.label}>Assessor</Text>
								<TextInput
									style={styles.input} placeholder="Nome..."
									value={filtroAssessor} onChangeText={setFiltroAssessor}
								/>
							</View>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={() => carregarClientes(1)}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.btnInserir} onPress={abrirModalNovo}>
								<Feather name="user-plus" size={18} color="#ED1C24" />
								<Text style={styles.btnInserirText}>Novo Cliente</Text>
							</TouchableOpacity>
						</View>

						<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: 15 }]}>Resultados</Text>

						{isLoading && clientes.length === 0 && (
							<View style={{ paddingVertical: 40, alignItems: 'center' }}>
								<ActivityIndicator size="large" color="#ED1C24" />
								<Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text>
							</View>
						)}
					</View>
				}
				ListFooterComponent={
					isFetchingMore ? (
						<ActivityIndicator size="small" color="#ED1C24" style={{ marginVertical: 20 }} />
					) : !hasMore && clientes.length > 0 ? (
						<Text style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>Fim da lista.</Text>
					) : null
				}
				ListEmptyComponent={
					!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum cliente encontrado.</Text> : null
				}
			/>

			<Modal visible={modalInserirVisible} animationType="slide" transparent={false}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#fff' }}>

					<View style={styles.modalHeaderFull}>
						<TouchableOpacity onPress={() => setModalInserirVisible(false)} style={{ padding: 5 }}>
							<Feather name="arrow-left" size={24} color="#333" />
						</TouchableOpacity>
						<Text style={styles.modalTitle}>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</Text>
						<View style={{ width: 24 }} />
					</View>

					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

						<Text style={styles.groupTitle}>1. Dados Principais</Text>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>CNPJ</Text>
							<MaskedTextInput
								mask="99.999.999/9999-99" style={styles.input} placeholder="00.000.000/0000-00" keyboardType="numeric"
								value={formCliente.cnpj} onChangeText={(t, raw) => setFormCliente({ ...formCliente, cnpj: raw })}
							/>
						</View>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Razão Social / Nome Fantasia</Text>
							<TextInput
								style={styles.input} placeholder="Nome da Transportadora ou Cliente"
								value={formCliente.identificacao} onChangeText={(t) => setFormCliente({ ...formCliente, identificacao: t })}
							/>
						</View>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Cidade</Text>
							<TextInput
								style={styles.input} placeholder="Ex: Mossoró - RN"
								value={formCliente.cidade} onChangeText={(t) => setFormCliente({ ...formCliente, cidade: t })}
							/>
						</View>

						<Text style={styles.groupTitle}>2. Contato</Text>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Pessoa de Contato</Text>
							<TextInput
								style={styles.input} placeholder="Nome do gerente/dono"
								value={formCliente.contato} onChangeText={(t) => setFormCliente({ ...formCliente, contato: t })}
							/>
						</View>
						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Telefone 1</Text>
								<MaskedTextInput
									mask="(99) 99999-9999" style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad"
									value={formCliente.fone1} onChangeText={(text, raw) => setFormCliente({ ...formCliente, fone1: raw })}
								/>
							</View>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Telefone 2</Text>
								<MaskedTextInput
									mask="(99) 99999-9999" style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad"
									value={formCliente.fone2} onChangeText={(text, raw) => setFormCliente({ ...formCliente, fone2: raw })}
								/>
							</View>
						</View>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>E-mail</Text>
							<TextInput
								style={styles.input} placeholder="contato@empresa.com" keyboardType="email-address" autoCapitalize="none"
								value={formCliente.email} onChangeText={(t) => setFormCliente({ ...formCliente, email: t })}
							/>
						</View>

						<Text style={styles.groupTitle}>3. Perfil do Cliente</Text>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Tipo de Cliente</Text>
							<RNPickerSelect
								placeholder={{ label: 'Selecione o tipo...', value: '', color: '#999' }}
								onValueChange={(value) => setFormCliente({ ...formCliente, tipoCliente: value })}
								value={formCliente.tipoCliente}
								items={[
									{ label: 'TRANSPORTADORA', value: 'TRANSPORTADORA' },
									{ label: 'FROTA PRÓPRIA', value: 'FROTA PRÓPRIA' },
									{ label: 'AUTÔNOMO', value: 'AUTÔNOMO' },
									{ label: 'BORRACHARIA', value: 'BORRACHARIA' },
								]}
								style={pickerSelectStyles}
								useNativeAndroidPickerStyle={false}
								Icon={() => <Feather name="chevron-down" size={20} color="#000" style={{ marginTop: 15, marginRight: 15 }} />}
							/>
						</View>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Situação</Text>
							<RNPickerSelect
								placeholder={{ label: 'Selecione a situação...', value: '', color: '#999' }}
								onValueChange={(value) => setFormCliente({ ...formCliente, situacao: value })}
								value={formCliente.situacao}
								items={[
									{ label: 'ATIVO', value: 'ATIVO' },
									{ label: 'INATIVO', value: 'INATIVO' },
								]}
								style={pickerSelectStyles}
								useNativeAndroidPickerStyle={false}
								Icon={() => <Feather name="chevron-down" size={20} color="#000" style={{ marginTop: 15, marginRight: 15 }} />}
							/>
						</View>

						<Text style={styles.groupTitle}>4. Anexos / Fotos</Text>
						{isEditing && <Text style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>As fotos antigas já estão salvas no sistema. Tire fotos novas apenas se quiser adicionar mais anexos a este cliente.</Text>}

						{fotos.length > 0 && (
							<View style={styles.fotosGrid}>
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

						<View style={styles.fotoContainer}>
							<TouchableOpacity style={styles.btnFoto} onPress={abrirCamera}>
								<Feather name="camera" size={24} color="#666" />
								<Text style={styles.btnFotoText}>Tirar Foto</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.btnFoto} onPress={abrirGaleria}>
								<Feather name="image" size={24} color="#666" />
								<Text style={styles.btnFotoText}>Galeria</Text>
							</TouchableOpacity>
						</View>

						<TouchableOpacity style={styles.btnSalvar} onPress={handleSalvarCliente}>
							<Feather name="save" size={20} color="#fff" style={{ marginRight: 10 }} />
							<Text style={styles.btnText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}</Text>
						</TouchableOpacity>

						<View style={{ height: 40 }} />
					</ScrollView>
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

	filterSection: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 3, zIndex: 1 },
	sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, color: '#000', marginBottom: 10, minHeight: 48 },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	inputGroup: { width: '100%', marginBottom: 10 },

	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
	btnBuscar: { flex: 1, backgroundColor: '#333', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginRight: 10 },
	btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
	btnInserir: { flex: 1, backgroundColor: '#ffe5e6', borderWidth: 1, borderColor: '#ED1C24', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginLeft: 10 },
	btnInserirText: { color: '#ED1C24', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, marginHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2.22, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardClient: { fontSize: 14, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
	statusBadge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 12 },
	statusText: { fontSize: 10, fontWeight: 'bold' },
	cardInfoBox: { padding: 15, paddingBottom: 10 },
	cardInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
	cardInfoText: { fontSize: 13, color: '#666', marginLeft: 8 },
	cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa' },
	actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
	actionBtnText: { fontSize: 13, fontWeight: '600', color: '#555', marginLeft: 6 },

	modalHeaderFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#ED1C24', marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ffe5e6', paddingBottom: 5 },

	fotosGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
	fotoThumbContainer: { position: 'relative', marginRight: 10, marginBottom: 10 },
	fotoThumb: { width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
	btnRemoverFoto: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ED1C24', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

	fotoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
	btnFoto: { flex: 1, backgroundColor: '#f0f0f0', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 20, marginHorizontal: 5 },
	btnFotoText: { marginTop: 8, fontSize: 14, color: '#666', fontWeight: '500' },
	btnSalvar: { backgroundColor: '#ED1C24', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
});