import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { apiService } from '../../src/services/apiService';

import LogoSolutires from '../../assets/images/solutires.png';

interface Veiculo {
	id: number; placa: string; codigo: string; eixos: string; rodado: string; calibragem_padrao: string;
	especie: string; tipo: string; uf: string; renavam: string; ano: string; anoModelo: string; cor: string;
	combustivel: string; tanque: string; qtde_passageiros: string; estepe: string; tipoCarroceria: string;
	taraKg: string; capacidadeKg: string; capacidadeM3: string; tipoProprietario: string; rntrc: string; proprietarioUf: string;
	vencimento_crlv: string; vencimento_civ: string; vencimento_cipp: string;
	marca: string; marca_id: string;
	modelo: string; modelo_id: string;
	proprietario: string; proprietario_id: string;
	foto: string;
}

const UFS = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

const TIPOS_VEICULOS = [
	{ label: 'Caminhão', value: 'Caminhão', color: '#000' },
	{ label: 'Cavalo', value: 'Cavalo', color: '#000' },
	{ label: 'Carreta', value: 'Carreta', color: '#000' },
	{ label: 'Dolly', value: 'Dolly', color: '#000' },
];

export default function VeiculosScreen() {
	const navigation = useNavigation<any>();
	const params = useLocalSearchParams();
	const router = useRouter();

	const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [filtroBusca, setFiltroBusca] = useState('');
	const [filtroTipo, setFiltroTipo] = useState('');
	const [filtroCliente, setFiltroCliente] = useState('');
	const [filtroClienteId, setFiltroClienteId] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'marca' | 'modelo' | 'entidade'>('marca');
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const [modalCadastroVisible, setModalCadastroVisible] = useState(false);
	const [isCadastrando, setIsCadastrando] = useState(false);
	const [formCadastro, setFormCadastro] = useState({ nome: '' });

	const URL_FOTOS = 'https://sistemascactus.com/apicactus/akipneus/fotos/';
	const API_CADASTRO_URL = 'https://sistemascactus.com/apicactus/akipneus/api_veiculo_cadastro_rapido.php';

	const [fotosNovas, setFotosNovas] = useState<string[]>([]);
	const [fotosAntigas, setFotosAntigas] = useState<string[]>([]);
	const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

	const [form, setForm] = useState({
		id: '', codigo: '', placa: '', especie: '', tipo: '', uf: '', renavam: '',
		marca: '', marca_id: '', modelo: '', modelo_id: '', ano: '', anoModelo: '', cor: '',
		combustivel: '', tanque: '', qtde_passageiros: '', estepe: '', calibragem_original: '',
		tipoCarroceria: '', tipoRodado: '', eixos: '', taraKg: '', capacidadeKg: '', capacidadeM3: '',
		proprietario: '', proprietario_id: '', tipoProprietario: '', rntrc: '', proprietarioUf: '',
		vencimento_crlv: '', vencimento_civ: '', vencimento_cipp: ''
	});

	useEffect(() => {
		if (params.action === 'novo') {
			resetForm();
			if (params.tipo_sugerido) {
				setForm(prev => ({ ...prev, tipo: params.tipo_sugerido as string }));
			}
			setModalVisible(true);
		}
	}, [params.action]);

	useEffect(() => {
		const paramId = (params.cliente_id as string) || '';
		const paramNome = (params.cliente_nome as string) || '';

		setFiltroClienteId(paramId);
		setFiltroCliente(paramNome);

		buscarVeiculosNaApi(filtroBusca, filtroTipo, paramNome, paramId);
	}, [params.cliente_id, params.cliente_nome]);

	const buscarVeiculosNaApi = async (buscaStr: string, tipoStr: string, cliNomeStr: string, cliIdStr: string) => {
		setIsLoading(true);
		const res = await apiService.buscarVeiculo({
			busca: buscaStr,
			cliente: cliNomeStr,
			tipo: tipoStr,
			cliente_id: cliIdStr
		});
		setIsLoading(false);
		if (res && res.success && Array.isArray(res.data)) {
			setVeiculos(res.data);
		} else {
			setVeiculos([]);
		}
	};

	const carregarVeiculos = () => {
		buscarVeiculosNaApi(filtroBusca, filtroTipo, filtroCliente, filtroClienteId);
	};

	const formatarPlaca = (text: string) => {
		let p = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
		if (p.length > 3) p = p.slice(0, 3) + '-' + p.slice(3, 7);
		return p;
	};

	useEffect(() => {
		const r = form.tipoRodado;
		if (['3/4', 'Toco', '2 Eixos'].includes(r)) {
			setForm(f => ({ ...f, eixos: '2' }));
		} else if (['Truck', '3 Eixos'].includes(r)) {
			setForm(f => ({ ...f, eixos: '3' }));
		} else if (['Bi-truck', '4 Eixos'].includes(r)) {
			setForm(f => ({ ...f, eixos: '4' }));
		}
	}, [form.tipoRodado]);

	const getRodadoOptions = () => {
		if (form.tipo === 'Caminhão') return [{ label: '3/4 (2 Eixos)', value: '3/4', color: '#000' }, { label: 'Toco (2 Eixos)', value: 'Toco', color: '#000' }, { label: 'Truck (3 Eixos)', value: 'Truck', color: '#000' }, { label: 'Bi-truck (4 Eixos)', value: 'Bi-truck', color: '#000' }];
		if (form.tipo === 'Cavalo') return [{ label: 'Toco (2 Eixos)', value: 'Toco', color: '#000' }, { label: 'Truck (3 Eixos)', value: 'Truck', color: '#000' }, { label: 'Bi-truck (4 Eixos)', value: 'Bi-truck', color: '#000' }];
		if (form.tipo === 'Carreta') return [{ label: '2 Eixos', value: '2 Eixos', color: '#000' }, { label: '3 Eixos', value: '3 Eixos', color: '#000' }, { label: '4 Eixos', value: '4 Eixos', color: '#000' }];
		if (form.tipo === 'Dolly') return [{ label: '2 Eixos', value: '2 Eixos', color: '#000' }];
		return [{ label: 'Selecione o Tipo de Veículo primeiro', value: '', color: '#000' }];
	};

	const formatarData = (dataDb: string) => {
		if (!dataDb || dataDb === '0000-00-00') return '';
		const partes = dataDb.split('-');
		if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
		return dataDb;
	};

	const resetForm = () => {
		setForm({
			id: '', codigo: '', placa: '', especie: '', tipo: '', uf: '', renavam: '', marca: '', marca_id: '', modelo: '', modelo_id: '', ano: '', anoModelo: '', cor: '', combustivel: '', tanque: '', qtde_passageiros: '', estepe: '', calibragem_original: '', tipoCarroceria: '', tipoRodado: '', eixos: '', taraKg: '', capacidadeKg: '', capacidadeM3: '', proprietario: '', proprietario_id: '', tipoProprietario: '', rntrc: '', proprietarioUf: '', vencimento_crlv: '', vencimento_civ: '', vencimento_cipp: ''
		});
		setFotosNovas([]);
		setFotosAntigas([]);
		setIsEditing(false);
		setFotoAmpliada(null);
	};

	const handleEditar = (v: any) => {
		setForm({
			id: v.id ? v.id.toString() : '', codigo: v.codigo || '', placa: v.placa || '',
			especie: v.especie || '', tipo: v.tipo || '', uf: v.uf || '', renavam: v.renavam || '',
			marca: v.marca || '', marca_id: v.marca_id || '',
			modelo: v.modelo || '', modelo_id: v.modelo_id || '',
			ano: v.ano || '', anoModelo: v.anoModelo || '', cor: v.cor || '',
			combustivel: v.combustivel || '', tanque: v.tanque || '', qtde_passageiros: v.qtde_passageiros || '',
			estepe: v.estepe ? v.estepe.toString() : '', calibragem_original: v.calibragem_padrao || '',
			tipoCarroceria: v.tipoCarroceria || '', tipoRodado: v.rodado || '', eixos: v.eixos ? v.eixos.toString() : '',
			taraKg: v.taraKg || '', capacidadeKg: v.capacidadeKg || '', capacidadeM3: v.capacidadeM3 || '',
			proprietario: v.proprietario || '', proprietario_id: v.proprietario_id || '',
			tipoProprietario: v.tipoProprietario || '', rntrc: v.rntrc || '', proprietarioUf: v.proprietarioUf || '',
			vencimento_crlv: formatarData(v.vencimento_crlv), vencimento_civ: formatarData(v.vencimento_civ), vencimento_cipp: formatarData(v.vencimento_cipp)
		});

		const dbFoto = v.foto || v.veic_tx_foto;
		if (dbFoto) {
			setFotosAntigas(dbFoto.split(','));
		} else {
			setFotosAntigas([]);
		}

		setFotosNovas([]);
		setIsEditing(true);
		setModalVisible(true);
	};

	const tirarFoto = async () => {
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		if (permissionResult.granted === false) { Alert.alert("Erro", "Você precisa permitir o acesso à câmera."); return; }
		const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.7, base64: true });
		if (!result.canceled && result.assets[0].base64) {
			setFotosNovas([...fotosNovas, `data:image/jpeg;base64,${result.assets[0].base64}`]);
		}
	};

	const abrirGaleria = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (permissionResult.granted === false) { Alert.alert("Erro", "Você precisa permitir o acesso à galeria."); return; }
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			quality: 0.7,
			base64: true
		});

		if (!result.canceled) {
			const nf = result.assets.map(asset => `data:image/jpeg;base64,${asset.base64}`);
			setFotosNovas([...fotosNovas, ...nf]);
		}
	};

	const removerFotoAntiga = (index: number) => { setFotosAntigas(fotosAntigas.filter((_, i) => i !== index)); };
	const removerFotoNova = (index: number) => { setFotosNovas(fotosNovas.filter((_, i) => i !== index)); };

	const salvarVeiculo = async () => {
		setIsSaving(true);
		try {
			const payload = {
				...form,
				fotosAntigas_mantidas: fotosAntigas,
				fotos: fotosNovas
			};

			const response = await fetch('https://sistemascactus.com/apicactus/akipneus/api_veiculo_salvar.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const result = await response.json();
			setIsSaving(false);

			if (result.success) {
				setModalVisible(false);

				Alert.alert('Sucesso', 'Veículo salvo!', [
					{
						text: 'OK',
						onPress: () => {
							if (params.returnTo === 'checklist') {
								router.push({
									pathname: '/checklist',
									params: { placa: params.placa_origem as string }
								});
							} else {
								carregarVeiculos();
							}
						}
					}
				]);
			} else {
				Alert.alert('Erro ao Salvar', result.message);
			}
		} catch (e) {
			setIsSaving(false);
			Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
		}
	};

	const abrirBuscaDinamica = (tipo: 'marca' | 'modelo' | 'entidade', termoInicial = '') => {
		if (tipo === 'modelo' && !form.marca_id) {
			Alert.alert('Atenção', 'Por favor, selecione primeiro a Marca.');
			return;
		}
		setTipoBusca(tipo);
		setTermoComboBusca(termoInicial);
		setResultadosBusca([]);
		setModalBuscaVisible(true);
		buscarDinamicaNoBanco(tipo, termoInicial);
	};

	const buscarDinamicaNoBanco = async (tipo: string, termo: string) => {
		setIsSearching(true);
		const marcaIdParaModelo = tipo === 'modelo' ? form.marca_id : null;
		const res = await apiService.buscarDinamica(tipo, termo, { marca_id: marcaIdParaModelo });
		if (res && res.success) { setResultadosBusca(res.data); } else { setResultadosBusca([]); }
		setIsSearching(false);
	};

	const selecionarItemBusca = (item: any) => {
		if (tipoBusca === 'marca') {
			setForm({ ...form, marca: item.nome, marca_id: item.id, modelo: '', modelo_id: '' });
		} else if (tipoBusca === 'modelo') {
			setForm({ ...form, modelo: item.nome, modelo_id: item.id });
		} else if (tipoBusca === 'entidade') {
			setForm({ ...form, proprietario: item.nome, proprietario_id: item.id });
		}
		setModalBuscaVisible(false);
	};

	const salvarCadastroDinamico = async () => {
		if (!formCadastro.nome) { Alert.alert("Atenção", "Preencha o nome do item."); return; }
		setIsCadastrando(true);
		try {
			const response = await fetch(API_CADASTRO_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tipo: tipoBusca,
					nome: formCadastro.nome,
					marca_id: tipoBusca === 'modelo' ? form.marca_id : null
				})
			});
			const res = await response.json();
			if (res.success) {
				selecionarItemBusca({ id: res.id, nome: res.nome });
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

	const renderBuscaDinamica = () => (
		<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 9999, elevation: 9999 }]}>
			<View style={styles.modalContentBusca}>
				<View style={styles.modalHeaderBusca}>
					<Text style={styles.modalTitleBusca}>Selecionar {tipoBusca.toUpperCase()}</Text>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						{(tipoBusca === 'marca' || tipoBusca === 'modelo') && (
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
						)}
						<TouchableOpacity onPress={() => setModalBuscaVisible(false)}>
							<Feather name="x" size={24} color="#333" />
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.inputBuscaContainer}>
					<Feather name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
					<TextInput
						style={styles.inputBuscaInterno}
						placeholder={`Digite o nome da ${tipoBusca}...`}
						value={termoComboBusca}
						onChangeText={(t) => { setTermoComboBusca(t); buscarDinamicaNoBanco(tipoBusca, t); }}
						autoFocus={true}
					/>
				</View>

				{termoComboBusca.trim().length > 0 && (tipoBusca === 'marca' || tipoBusca === 'modelo') && (
					<TouchableOpacity
						style={styles.btnInserirBuscaDinamica}
						onPress={() => {
							setFormCadastro({ nome: termoComboBusca.trim() });
							setModalBuscaVisible(false);
							setModalCadastroVisible(true);
						}}
					>
						<Feather name="plus-circle" size={18} color="#28a745" />
						<Text style={styles.btnInserirBuscaDinamicaText}>Cadastrar Novo: "{termoComboBusca.trim()}"</Text>
					</TouchableOpacity>
				)}

				{isSearching ? <ActivityIndicator style={{ marginTop: 20 }} color="#0c6ead" /> : (
					<FlatList
						data={resultadosBusca}
						keyExtractor={(item, index) => String(item?.id || index)}
						renderItem={({ item }) => (
							<TouchableOpacity style={styles.itemBuscaDinamica} onPress={() => selecionarItemBusca(item)}>
								<Text style={styles.itemBuscaNome}>{item.nome}</Text>
								{item.documento && <Text style={styles.itemBuscaDoc}>{item.documento}</Text>}
							</TouchableOpacity>
						)}
						ListEmptyComponent={<Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>}
					/>
				)}
			</View>
		</View>
	);

	const renderCadastroDinamico = () => (
		<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 99999, elevation: 99999 }]}>
			<View style={styles.modalSmall}>
				<Text style={styles.modalTitle}>
					Cadastrar Nova {tipoBusca === 'marca' ? 'Marca' : 'Modelo'}
				</Text>

				<Text style={styles.label}>* Nome {tipoBusca === 'modelo' && `(Para a marca ${form.marca})`}</Text>

				<TextInput
					style={styles.input}
					value={formCadastro.nome}
					onChangeText={t => setFormCadastro({ ...formCadastro, nome: t })}
					placeholder={`Nome da ${tipoBusca}...`}
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
		</View>
	);

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />;

	return (
		<View style={styles.container}>
			<FlatList
				data={veiculos}
				keyExtractor={(item, index) => String(item?.id || index)}
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Buscar Veículos</Text>

						<View style={styles.row}>
							<View style={{ width: '48%' }}>
								<Text style={styles.label}>Código ou Placa</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: 102 ou ABC"
									value={filtroBusca}
									onChangeText={setFiltroBusca}
									autoCapitalize="characters"
								/>
							</View>
							<View style={{ width: '48%' }}>
								<Text style={styles.label}>Tipo de Veículo</Text>
								<RNPickerSelect
									placeholder={{ label: 'Todos...', value: '', color: '#666' }}
									value={filtroTipo}
									onValueChange={setFiltroTipo}
									items={TIPOS_VEICULOS}
									style={pickerStyles}
									useNativeAndroidPickerStyle={false}
									Icon={PickerIcon}
								/>
							</View>
						</View>

						<View style={styles.inputGroupFull}>
							<Text style={styles.label}>Cliente</Text>
							<TextInput
								style={styles.input}
								placeholder="Nome do Cliente..."
								value={filtroCliente}
								onChangeText={(text) => {
									setFiltroCliente(text);
									setFiltroClienteId('');
								}}
							/>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={() => carregarVeiculos()}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.btnInserir} onPress={() => { resetForm(); setModalVisible(true); }}>
								<Feather name="plus-circle" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir</Text>
							</TouchableOpacity>
						</View>

						<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: -5 }]}>
							Resultados ({veiculos.length} registros encontrados)
						</Text>

						{isLoading && veiculos.length === 0 && <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#0c6ead" /><Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text></View>}
					</View>
				}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<Text style={styles.cardClient} numberOfLines={1}>#{item.codigo || item.id} - {item.placa}</Text>
							<View style={[styles.statusBadge, { backgroundColor: '#e8f0fe' }]}>
								<Text style={[styles.statusText, { color: '#1967d2' }]}>{item.tipo || 'VEÍCULO'}</Text>
							</View>
						</View>

						<View style={styles.cardInfoBox}>
							<View style={styles.cardInfoRow}>
								<MaterialCommunityIcons name="truck-outline" size={16} color="#666" style={{ marginRight: 8 }} />
								<Text style={styles.cardInfoText}>Marca: #{item.marca_id || '--'} {item.marca} - {item.modelo}</Text>
							</View>
							<View style={styles.cardInfoRow}>
								<Feather name="info" size={14} color="#666" style={{ marginRight: 8 }} />
								<Text style={styles.cardInfoText}>Rodado: {item.rodado} • {item.eixos} Eixos</Text>
							</View>
							<View style={styles.cardInfoRow}>
								<Feather name="user" size={14} color="#666" style={{ marginRight: 8 }} />
								<Text style={styles.cardInfoText}>Cliente: {item.proprietario || 'N/A'}</Text>
							</View>
						</View>

						<View style={styles.cardActions}>
							<View style={styles.actionButtonsRow}>
								<TouchableOpacity
									style={styles.btnActionSecondary}
									onPress={() => navigation.navigate('checklist', {
										veiculo_id: item.id,
										placa: item.placa,
										eixos: item.eixos,
										rodado: item.rodado
									})}
								>
									<Feather name="clipboard" size={14} color="#333" />
									<Text style={styles.btnActionTextSecondary}>Checklist</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.btnEditarCard}
									onPress={() => handleEditar(item)}
								>
									<Feather name="edit-2" size={14} color="#ffffff" />
									<Text style={styles.btnEditarCardText}>Editar</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
				ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum veículo encontrado.</Text> : null}
			/>

			<Modal visible={modalVisible} animationType="slide" transparent={true}>
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

						<View style={styles.modalHeaderFull}>
							<TouchableOpacity onPress={() => {
								setModalVisible(false);
								if (params.returnTo === 'checklist') {
									router.push({
										pathname: '/checklist',
										params: { placa: params.placa_origem as string }
									});
								}
							}} style={{ padding: 5 }}>
								<Feather name="arrow-left" size={24} color="#fff" />
							</TouchableOpacity>
							<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
							<View style={{ width: 24 }} />
						</View>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
							<Text style={styles.groupTitle}>1. Informações do Veículo</Text>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Cliente</Text>
								<View style={styles.inputWithIcon}>
									<TextInput
										style={styles.inputFlex}
										value={form.proprietario}
										onChangeText={t => setForm({ ...form, proprietario: t, proprietario_id: '' })}
										placeholder="Nome do Cliente..."
									/>
									<TouchableOpacity style={styles.searchIconBtn} onPress={() => abrirBuscaDinamica('entidade', form.proprietario)}>
										<Feather name="search" size={20} color="#fff" />
									</TouchableOpacity>
								</View>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Código Interno</Text><TextInput style={styles.input} value={form.codigo} onChangeText={t => setForm({ ...form, codigo: t })} keyboardType="numeric" /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>* Placa</Text><TextInput style={styles.input} value={form.placa} onChangeText={(t) => setForm({ ...form, placa: formatarPlaca(t) })} autoCapitalize="characters" maxLength={8} /></View>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Renavam</Text><TextInput style={styles.input} value={form.renavam} onChangeText={t => setForm({ ...form, renavam: t })} keyboardType="numeric" /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>UF</Text><RNPickerSelect placeholder={{ label: 'UF', value: '', color: '#666' }} value={form.uf} onValueChange={v => setForm({ ...form, uf: v })} items={UFS.map(u => ({ label: u, value: u, color: '#000' }))} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Marca</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('marca')}>
									<Text style={{ color: form.marca ? '#000' : '#999' }}>{form.marca || 'Selecionar...'}</Text>
									<Feather name="search" size={16} color="#999" />
								</TouchableOpacity>
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Modelo</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('modelo')}>
									<Text style={{ color: form.modelo ? '#000' : '#999' }}>{form.modelo || 'Selecionar...'}</Text>
									<Feather name="search" size={16} color="#999" />
								</TouchableOpacity>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Ano Fab.</Text><TextInput style={styles.input} value={form.ano} onChangeText={t => setForm({ ...form, ano: t })} keyboardType="numeric" maxLength={4} /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>Ano Mod.</Text><TextInput style={styles.input} value={form.anoModelo} onChangeText={t => setForm({ ...form, anoModelo: t })} keyboardType="numeric" maxLength={4} /></View>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Cor</Text><TextInput style={styles.input} value={form.cor} onChangeText={t => setForm({ ...form, cor: t })} /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>Combustível</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '', color: '#666' }} value={form.combustivel} onValueChange={v => setForm({ ...form, combustivel: v })} items={[{ label: 'ARLA', value: 'ARLA', color: '#000' }, { label: 'Gasolina', value: 'Gasolina', color: '#000' }, { label: 'Etanol', value: 'Etanol', color: '#000' }, { label: 'GNV', value: 'GNV', color: '#000' }, { label: 'Diesel', value: 'Diesel', color: '#000' }, { label: 'Diesel S10', value: 'Diesel S10', color: '#000' }, { label: 'Diesel S50', value: 'Diesel S50', color: '#000' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>Estepe (Qntd)</Text>
									<RNPickerSelect
										placeholder={{ label: 'Selecione...', value: '', color: '#666' }}
										value={form.estepe}
										onValueChange={v => setForm({ ...form, estepe: v })}
										items={[{ label: '1', value: '1', color: '#000' }, { label: '2', value: '2', color: '#000' }]}
										style={pickerStyles}
										useNativeAndroidPickerStyle={false}
										Icon={PickerIcon}
									/>
								</View>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>Calib. Orig. (Lbs)</Text>
									<TextInput
										style={styles.input}
										value={form.calibragem_original}
										onChangeText={t => setForm({ ...form, calibragem_original: t })}
										keyboardType="numeric"
										placeholder="Ex: 110"
									/>
								</View>
							</View>

							<Text style={styles.groupTitle}>2. Informações da Carga</Text>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Tipo Veículo</Text>
								<RNPickerSelect placeholder={{ label: 'Selecione...', value: '', color: '#666' }} value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v, tipoRodado: '' })} items={TIPOS_VEICULOS} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} />
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Tipo Rodado</Text>
								<RNPickerSelect placeholder={{ label: 'Selecione...', value: '', color: '#666' }} value={form.tipoRodado} onValueChange={v => setForm({ ...form, tipoRodado: v })} items={getRodadoOptions()} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} />
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroup31}><Text style={styles.label}>Tara Kg</Text><TextInput style={styles.input} value={form.taraKg} onChangeText={t => setForm({ ...form, taraKg: t })} keyboardType="numeric" /></View>
								<View style={styles.inputGroup31}><Text style={styles.label}>Cap. Kg</Text><TextInput style={styles.input} value={form.capacidadeKg} onChangeText={t => setForm({ ...form, capacidadeKg: t })} keyboardType="numeric" /></View>
								<View style={styles.inputGroup31}><Text style={styles.label}>Cap. M3</Text><TextInput style={styles.input} value={form.capacidadeM3} onChangeText={t => setForm({ ...form, capacidadeM3: t })} keyboardType="numeric" /></View>
							</View>

							<Text style={[styles.groupTitle, { zIndex: -1, elevation: -1 }]}>3. Fotos do Veículo</Text>

							<View style={[styles.fotoContainerWrap, { zIndex: -1, elevation: -1 }]}>
								<TouchableOpacity style={[styles.btnFoto, { marginRight: 5 }]} onPress={tirarFoto}>
									<Feather name="camera" size={24} color="#666" />
									<Text style={styles.btnFotoText}>Câmera</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.btnFoto, { marginLeft: 5 }]} onPress={abrirGaleria}>
									<Feather name="image" size={24} color="#666" />
									<Text style={styles.btnFotoText}>Galeria</Text>
								</TouchableOpacity>
							</View>

							{(fotosAntigas.length > 0 || fotosNovas.length > 0) && (
								<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15, zIndex: -1, elevation: -1 }}>
									{fotosAntigas.map((nomeFoto, index) => (
										<View key={`antiga_${index}`} style={styles.fotoContainerSolo}>
											<TouchableOpacity onPress={() => setFotoAmpliada(`${URL_FOTOS}${nomeFoto}`)}>
												<Image source={{ uri: `${URL_FOTOS}${nomeFoto}?t=${new Date().getTime()}` }} style={styles.fotoPreview} />
											</TouchableOpacity>
											<TouchableOpacity style={styles.btnRemoveFoto} onPress={() => removerFotoAntiga(index)}>
												<Feather name="x" size={14} color="#fff" />
											</TouchableOpacity>
										</View>
									))}

									{fotosNovas.map((uri, index) => (
										<View key={`nova_${index}`} style={styles.fotoContainerSolo}>
											<TouchableOpacity onPress={() => setFotoAmpliada(uri)}>
												<Image source={{ uri }} style={styles.fotoPreview} />
											</TouchableOpacity>
											<TouchableOpacity style={styles.btnRemoveFoto} onPress={() => removerFotoNova(index)}>
												<Feather name="x" size={14} color="#fff" />
											</TouchableOpacity>
										</View>
									))}
								</ScrollView>
							)}

							<View style={{ flexDirection: 'row', marginTop: 20, gap: 10, zIndex: -1, elevation: -1 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => {
									setModalVisible(false);
									if (params.returnTo === 'checklist') {
										router.push({
											pathname: '/checklist',
											params: { placa: params.placa_origem as string }
										});
									}
								}}>
									<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1, marginTop: 0, height: 50 }]} onPress={salvarVeiculo} disabled={isSaving}>
									{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
								</TouchableOpacity>
							</View>

							<View style={{ height: 40 }} />
						</ScrollView>

						{!!fotoAmpliada && (
							<View style={styles.fullScreenOverlay}>
								<TouchableOpacity style={styles.closeFullBtn} onPress={() => setFotoAmpliada(null)}>
									<Feather name="x" size={30} color="#fff" />
								</TouchableOpacity>
								<Image source={{ uri: fotoAmpliada }} style={styles.fullScreenImage} resizeMode="contain" />
							</View>
						)}

						{modalBuscaVisible && renderBuscaDinamica()}
						{modalCadastroVisible && renderCadastroDinamico()}

					</KeyboardAvoidingView>
				</View>
			</Modal>

			{!modalVisible && modalBuscaVisible && (
				<Modal visible={true} transparent={true} animationType="fade">
					{renderBuscaDinamica()}
				</Modal>
			)}

			{!modalVisible && modalCadastroVisible && (
				<Modal visible={true} transparent={true} animationType="fade">
					{renderCadastroDinamico()}
				</Modal>
			)}

		</View>
	);
}

const pickerStyles = StyleSheet.create({
	inputIOS: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', marginBottom: 15, paddingRight: 30, minHeight: 48 },
	inputAndroid: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', marginBottom: 15, paddingRight: 30, minHeight: 48 }
});

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 3, zIndex: 1, marginBottom: 15 },
	sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, color: '#000', marginBottom: 10, minHeight: 48 },
	fakeInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	inputGroup31: { width: '31%' },
	inputGroupFull: { width: '100%', marginBottom: 5 },

	inputWithIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
	inputFlex: { flex: 1, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000' },
	searchIconBtn: { backgroundColor: '#0c6ead', width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8, borderWidth: 1, borderColor: '#0c6ead' },

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
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%' },
	btnActionSecondary: { backgroundColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12, marginRight: 8 },
	btnActionTextSecondary: { color: '#333', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	btnEditarCard: { backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15 },
	btnEditarCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	modalHeaderFull: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#0c6ead',
		paddingHorizontal: 15,
		paddingBottom: 15,
		paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ? StatusBar.currentHeight + -15 : 40),
		elevation: 4,
	},
	modalTitleHeader: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c6ead', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 5 },
	fotoContainerWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
	btnFoto: { flex: 1, backgroundColor: '#f0f0f0', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
	btnFotoText: { marginTop: 8, fontSize: 14, color: '#666', fontWeight: '500' },

	fotoContainerSolo: { marginRight: 10, position: 'relative' },
	fotoPreview: { width: 100, height: 100, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f0f0f0' },

	btnRemoveFoto: { position: 'absolute', top: 5, right: 5, backgroundColor: '#E53935', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 5 },

	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
	btnDefault: { backgroundColor: '#eee', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

	fullScreenOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 99999, elevation: 99999 },
	closeFullBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, zIndex: 100000, elevation: 100000, padding: 10 },
	fullScreenImage: { width: '100%', height: '80%' },

	modalOverlayBusca: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalContentBusca: { width: '90%', height: '70%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
	modalHeaderBusca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitleBusca: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	inputBuscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, height: 45, marginBottom: 15 },
	inputBuscaInterno: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	itemBuscaDinamica: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 15 },
	itemBuscaNome: { fontSize: 15, fontWeight: '600', color: '#333' },
	itemBuscaDoc: { fontSize: 12, color: '#888', marginTop: 2 },
	emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
	btnInserirBuscaDinamica: { backgroundColor: '#e8f5e9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#63c77b', marginBottom: 15 },
	btnInserirBuscaDinamicaText: { color: '#28a745', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },

	modalSmall: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
});