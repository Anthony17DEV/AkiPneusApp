import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { apiService } from '../../src/services/apiService';

interface Veiculo {
	id: number; placa: string; codigo: string; eixos: string; rodado: string; calibragem_padrao: string;
	especie: string; tipo: string; uf: string; renavam: string; ano: string; anoModelo: string; cor: string;
	combustivel: string; tanque: string; qtde_passageiros: string; estepe: string; tipoCarroceria: string;
	taraKg: string; capacidadeKg: string; capacidadeM3: string; tipoProprietario: string; rntrc: string; proprietarioUf: string;
	vencimento_crlv: string; vencimento_civ: string; vencimento_cipp: string;
	marca: string; marca_id: string;
	modelo: string; modelo_id: string;
	proprietario: string; proprietario_id: string;
}

const UFS = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

const TIPOS_VEICULOS = [
	{ label: 'Caminhão', value: 'Caminhão', color: '#000' },
	{ label: 'Cavalo', value: 'Cavalo', color: '#000' },
	{ label: 'Carreta', value: 'Carreta', color: '#000' },
	{ label: 'Hatch', value: 'Hatch', color: '#000' },
	{ label: 'Sedan', value: 'Sedan', color: '#000' },
	{ label: 'Micro-Ônibus', value: 'Micro-Ônibus', color: '#000' },
	{ label: 'Ônibus', value: 'Ônibus', color: '#000' },
	{ label: 'Picape', value: 'Picape', color: '#000' },
	{ label: 'Van', value: 'Van', color: '#000' },
	{ label: 'Utilitario', value: 'Utilitario', color: '#000' },
	{ label: 'Implemento', value: 'Implemento', color: '#000' },
	{ label: 'Motocicleta', value: 'Motocicleta', color: '#000' },
	{ label: 'Doblo', value: 'Doblo', color: '#000' },
	{ label: 'SUV', value: 'SUV', color: '#000' }
];

export default function VeiculosScreen() {
	const navigation = useNavigation<any>();
	const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [filtroBusca, setFiltroBusca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'marca' | 'modelo' | 'entidade'>('marca');
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const URL_FOTOS = 'https://sistemascactus.com/apicactus/akipneus/fotos/';

	const [fotos, setFotos] = useState<string[]>([]);
	const [fotoAntiga, setFotoAntiga] = useState<string | null>(null);

	const [form, setForm] = useState({
		id: '', codigo: '', placa: '', especie: '', tipo: '', uf: '', renavam: '',
		marca: '', marca_id: '', modelo: '', modelo_id: '', ano: '', anoModelo: '', cor: '',
		combustivel: '', tanque: '', qtde_passageiros: '', estepe: '', calibragem_original: '',
		tipoCarroceria: '', tipoRodado: '', eixos: '', taraKg: '', capacidadeKg: '', capacidadeM3: '',
		proprietario: '', proprietario_id: '', tipoProprietario: '', rntrc: '', proprietarioUf: '',
		vencimento_crlv: '', vencimento_civ: '', vencimento_cipp: ''
	});

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
		if (form.tipo === 'Cavalo') return [{ label: 'Toco (2 Eixos)', value: 'Toco', color: '#000' }, { label: 'Truck (3 Eixos)', value: 'Truck', color: '#000' }];
		if (form.tipo === 'Carreta') return [{ label: '2 Eixos', value: '2 Eixos', color: '#000' }, { label: '3 Eixos', value: '3 Eixos', color: '#000' }, { label: '4 Eixos', value: '4 Eixos', color: '#000' }];
		return [{ label: 'Selecione o Tipo de Veículo primeiro', value: '', color: '#000' }];
	};

	useEffect(() => { carregarVeiculos(); }, []);

	const carregarVeiculos = async (busca = '') => {
		setIsLoading(true);
		const res = await apiService.buscarVeiculo(busca);
		setIsLoading(false);
		if (res && res.success && Array.isArray(res.data)) { setVeiculos(res.data); } else { setVeiculos([]); }
	};

	const resetForm = () => {
		setForm({
			id: '', codigo: '', placa: '', especie: '', tipo: '', uf: '', renavam: '', marca: '', marca_id: '', modelo: '', modelo_id: '', ano: '', anoModelo: '', cor: '', combustivel: '', tanque: '', qtde_passageiros: '', estepe: '', calibragem_original: '', tipoCarroceria: '', tipoRodado: '', eixos: '', taraKg: '', capacidadeKg: '', capacidadeM3: '', proprietario: '', proprietario_id: '', tipoProprietario: '', rntrc: '', proprietarioUf: '', vencimento_crlv: '', vencimento_civ: '', vencimento_cipp: ''
		});
		setFotos([]);
		setFotoAntiga(null);
		setIsEditing(false);
	};

	const formatarData = (dataDb: string) => {
		if (!dataDb || dataDb === '0000-00-00') return '';
		const partes = dataDb.split('-');
		if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
		return dataDb;
	};

	const formatarDataInput = (text: string) => {
		let t = text.replace(/\D/g, '');
		if (t.length > 2) t = t.slice(0, 2) + '/' + t.slice(2);
		if (t.length > 5) t = t.slice(0, 5) + '/' + t.slice(5, 9);
		return t;
	};

	const handleEditar = (v: any) => {
		resetForm();
		setForm({
			...form, id: v.id ? v.id.toString() : '', codigo: v.codigo || '', placa: v.placa || '',
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
		setFotoAntiga(v.foto ? `${URL_FOTOS}${v.foto}` : null);
		setIsEditing(true); setModalVisible(true);
	};

	const tirarFoto = async () => {
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		if (permissionResult.granted === false) {
			Alert.alert("Erro", "Você precisa permitir o acesso à câmera.");
			return;
		}
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true, aspect: [4, 3], quality: 0.7, base64: true,
		});
		if (!result.canceled && result.assets[0].base64) {
			setFotos([...fotos, `data:image/jpeg;base64,${result.assets[0].base64}`]);
			setFotoAntiga(null);
		}
	};

	const abrirGaleria = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (permissionResult.granted === false) {
			Alert.alert("Erro", "Você precisa permitir o acesso à galeria.");
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true, quality: 0.7, base64: true,
		});
		if (!result.canceled && result.assets[0].base64) {
			setFotos([...fotos, `data:image/jpeg;base64,${result.assets[0].base64}`]);
			setFotoAntiga(null);
		}
	};

	const removerFoto = (index: number) => {
		setFotos(fotos.filter((_, i) => i !== index));
	};

	const salvarVeiculo = async () => {
		setIsSaving(true);
		try {
			const response = await fetch('https://sistemascactus.com/apicactus/akipneus/api_veiculo_salvar.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...form, fotos })
			});
			const result = await response.json();
			setIsSaving(false);
			if (result.success) {
				Alert.alert('Sucesso', 'Veículo salvo!');
				setModalVisible(false);
				carregarVeiculos();
			} else {
				Alert.alert('Erro ao Salvar', result.message);
			}
		} catch (e) {
			setIsSaving(false);
			Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
		}
	};

	const abrirBuscaDinamica = (tipo: 'marca' | 'modelo' | 'entidade') => {
		if (tipo === 'modelo' && !form.marca_id) {
			Alert.alert('Atenção', 'Por favor, selecione primeiro a Marca.');
			return;
		}
		setTipoBusca(tipo);
		setTermoComboBusca('');
		setResultadosBusca([]);
		setModalBuscaVisible(true);
		buscarDinamicaNoBanco(tipo, '');
	};

	const buscarDinamicaNoBanco = async (tipo: string, termo: string) => {
		setIsSearching(true);
		const marcaIdParaModelo = tipo === 'modelo' ? form.marca_id : null;
		const res = await apiService.buscarDinamica(tipo, termo, marcaIdParaModelo as any);
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
							<View style={{ width: '100%' }}>
								<Text style={styles.label}>Código ou Placa</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: 102 ou ABC-1234"
									value={filtroBusca}
									onChangeText={setFiltroBusca}
									autoCapitalize="characters"
								/>
							</View>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={() => carregarVeiculos(filtroBusca)}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.btnInserir} onPress={() => { resetForm(); setModalVisible(true); }}>
								<Feather name="plus-circle" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir</Text>
							</TouchableOpacity>
						</View>
						<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: 15 }]}>Resultados</Text>
						{isLoading && veiculos.length === 0 && <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#ED1C24" /><Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text></View>}
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
								<Text style={styles.cardInfoText}>Prop: {item.proprietario || 'N/A'}</Text>
							</View>
						</View>

						<View style={styles.cardActions}>
							<View style={styles.actionButtonsRow}>
								<TouchableOpacity
									style={styles.btnChecklistCard}
									onPress={() => navigation.navigate('checklist', {
										veiculo_id: item.id,
										placa: item.placa,
										eixos: item.eixos,
										rodado: item.rodado
									})}
								>
									<Feather name="clipboard" size={16} color="#ffffff" />
									<Text style={styles.btnChecklistCardText}>Checklist</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.btnEditarCard}
									onPress={() => handleEditar(item)}
								>
									<Feather name="edit-2" size={16} color="#ffffff" />
									<Text style={styles.btnEditarCardText}>Editar</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
				ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum veículo encontrado.</Text> : null}
			/>

			<Modal visible={modalVisible} animationType="slide">
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#fff' }}>
					<View style={styles.modalHeaderFull}>
						<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}><Feather name="arrow-left" size={24} color="#333" /></TouchableOpacity>
						<Text style={styles.modalTitle}>{isEditing ? 'Editar Veículo' : 'Cadastro de Veículos'}</Text>
						<View style={{ width: 24 }} />
					</View>

					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
						<Text style={styles.groupTitle}>1. Informações do Veículo</Text>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Código Interno</Text><TextInput style={styles.input} value={form.codigo} onChangeText={t => setForm({ ...form, codigo: t })} keyboardType="numeric" /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Placa</Text><TextInput style={styles.input} value={form.placa} onChangeText={(t) => setForm({ ...form, placa: formatarPlaca(t) })} autoCapitalize="characters" maxLength={8} /></View>
						</View>

						<View style={styles.inputGroupFull}>
							<Text style={styles.label}>Espécie</Text>
							<RNPickerSelect placeholder={{ label: 'Selecione...', value: '', color: '#666' }} value={form.especie} onValueChange={v => setForm({ ...form, especie: v })} items={[{ label: '1 - Passageiros', value: '1', color: '#000' }, { label: '2 - Carga', value: '2', color: '#000' }, { label: '3 - Misto', value: '3', color: '#000' }, { label: '4 - Tração', value: '4', color: '#000' }, { label: '5 - Competição', value: '5', color: '#000' }, { label: '6 - Especial', value: '6', color: '#000' }, { label: '7 - Coleção', value: '7', color: '#000' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} />
						</View>

						<View style={styles.inputGroupFull}>
							<Text style={styles.label}>* Tipo Veículo</Text>
							<RNPickerSelect placeholder={{ label: 'Selecione...', value: '', color: '#666' }} value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v, tipoRodado: '' })} items={TIPOS_VEICULOS} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} />
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

						<Text style={styles.groupTitle}>2. Informações da Carga</Text>

						<View style={styles.inputGroupFull}>
							<Text style={styles.label}>Tipo Carroceria</Text>
							<RNPickerSelect placeholder={{ label: 'Selecione...', value: '', color: '#666' }} value={form.tipoCarroceria} onValueChange={v => setForm({ ...form, tipoCarroceria: v })} items={[{ label: '00 - nao aplicavel', value: '00', color: '#000' }, { label: '01 - Aberta', value: '01', color: '#000' }, { label: '02 - Fechada/Bau', value: '02', color: '#000' }, { label: '03 - Granelera', value: '03', color: '#000' }, { label: '04 - Porta Container', value: '04', color: '#000' }, { label: '05 - Sider', value: '05', color: '#000' }, { label: '06 - Tanque', value: '06', color: '#000' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} />
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Tipo Rodado</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '', color: '#666' }} value={form.tipoRodado} onValueChange={v => setForm({ ...form, tipoRodado: v })} items={getRodadoOptions()} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Eixos</Text><TextInput style={[styles.input, { backgroundColor: '#e1e4e8' }]} value={form.eixos} editable={false} placeholder="Auto" /></View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroup31}><Text style={styles.label}>Tara Kg</Text><TextInput style={styles.input} value={form.taraKg} onChangeText={t => setForm({ ...form, taraKg: t })} keyboardType="numeric" /></View>
							<View style={styles.inputGroup31}><Text style={styles.label}>Cap. Kg</Text><TextInput style={styles.input} value={form.capacidadeKg} onChangeText={t => setForm({ ...form, capacidadeKg: t })} keyboardType="numeric" /></View>
							<View style={styles.inputGroup31}><Text style={styles.label}>Cap. M3</Text><TextInput style={styles.input} value={form.capacidadeM3} onChangeText={t => setForm({ ...form, capacidadeM3: t })} keyboardType="numeric" /></View>
						</View>

						<Text style={styles.groupTitle}>3. Informações do Proprietário</Text>

						<View style={styles.inputGroupFull}>
							<Text style={styles.label}>Proprietário (Digite ou Busque)</Text>
							<View style={styles.inputWithIcon}>
								<TextInput
									style={styles.inputFlex}
									value={form.proprietario}
									onChangeText={t => setForm({ ...form, proprietario: t, proprietario_id: '' })}
									placeholder="Nome do Proprietário..."
								/>
								<TouchableOpacity style={styles.searchIconBtn} onPress={() => abrirBuscaDinamica('entidade')}>
									<Feather name="search" size={20} color="#fff" />
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.inputGroupFull}>
							<Text style={styles.label}>Tipo Proprietário</Text>
							<RNPickerSelect placeholder={{ label: 'Selecione...', value: '', color: '#666' }} value={form.tipoProprietario} onValueChange={v => setForm({ ...form, tipoProprietario: v })} items={[{ label: '0 - AC Agregado', value: '0', color: '#000' }, { label: '1 - Tac Independente', value: '1', color: '#000' }, { label: '2 - Outros', value: '2', color: '#000' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} />
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>RNTRC</Text><TextInput style={styles.input} value={form.rntrc} onChangeText={t => setForm({ ...form, rntrc: t })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>UF do Prop.</Text><RNPickerSelect placeholder={{ label: 'UF', value: '', color: '#666' }} value={form.proprietarioUf} onValueChange={v => setForm({ ...form, proprietarioUf: v })} items={UFS.map(u => ({ label: u, value: u, color: '#000' }))} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
						</View>

						<Text style={[styles.groupTitle, { zIndex: -1, elevation: -1 }]}>4. Fotos do Veículo</Text>

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

						{fotoAntiga && fotos.length === 0 && (
							<View style={{ marginTop: 15, zIndex: -1, elevation: -1 }}>
								<View style={styles.fotoContainerSolo}>
									<Image source={{ uri: fotoAntiga }} style={styles.fotoPreview} />
									<TouchableOpacity style={styles.btnRemoveFoto} onPress={() => setFotoAntiga(null)}>
										<Feather name="x" size={12} color="#fff" />
									</TouchableOpacity>
								</View>
							</View>
						)}

						{fotos.length > 0 && (
							<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15, zIndex: -1, elevation: -1 }}>
								{fotos.map((uri, index) => (
									<View key={index} style={styles.fotoContainerSolo}>
										<Image source={{ uri }} style={styles.fotoPreview} />
										<TouchableOpacity style={styles.btnRemoveFoto} onPress={() => removerFoto(index)}>
											<Feather name="x" size={12} color="#fff" />
										</TouchableOpacity>
									</View>
								))}
							</ScrollView>
						)}

						<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { zIndex: -1, elevation: -1 }]} onPress={salvarVeiculo} disabled={isSaving}>
							{isSaving ? <ActivityIndicator color="#fff" /> : (
								<>
									<Feather name="save" size={20} color="#fff" />
									<Text style={styles.btnSalvarText}>Gravar</Text>
								</>
							)}
						</TouchableOpacity>

						<View style={{ height: 40 }} />
					</ScrollView>

					{modalBuscaVisible && (
						<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 9999, elevation: 9999 }]}>
							<View style={styles.modalContentBusca}>
								<View style={styles.modalHeaderBusca}>
									<Text style={styles.modalTitleBusca}>Selecionar {tipoBusca.toUpperCase()}</Text>
									<TouchableOpacity onPress={() => setModalBuscaVisible(false)}>
										<Feather name="x" size={24} color="#333" />
									</TouchableOpacity>
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
								{isSearching ? <ActivityIndicator style={{ marginTop: 20 }} color="#ED1C24" /> : (
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
					)}
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

const pickerStyles = StyleSheet.create({
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
	inputGroup31: { width: '31%' },
	inputGroupFull: { width: '100%', marginBottom: 5 },

	inputWithIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
	inputFlex: { flex: 1, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000' },
	searchIconBtn: { backgroundColor: '#3276b1', width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8, borderWidth: 1, borderColor: '#3276b1' },

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
	cardInfoText: { fontSize: 13, color: '#666' },
	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
	btnChecklistCard: { backgroundColor: '#f39c12', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, marginRight: 10 },
	btnChecklistCardText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
	btnEditarCard: { backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 8, width: '33%' },
	btnEditarCardText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },

	modalHeaderFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#ED1C24', marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ffe5e6', paddingBottom: 5 },

	fotoContainerWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
	btnFoto: { flex: 1, backgroundColor: '#f0f0f0', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
	btnFotoText: { marginTop: 8, fontSize: 14, color: '#666', fontWeight: '500' },
	fotoContainerSolo: { marginRight: 10, position: 'relative' },
	fotoPreview: { width: 100, height: 100, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
	btnRemoveFoto: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ED1C24', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },

	modalOverlayBusca: { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalContentBusca: { width: '90%', height: '70%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
	modalHeaderBusca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitleBusca: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	inputBuscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, height: 45, marginBottom: 15 },
	inputBuscaInterno: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	itemBuscaDinamica: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 15 },
	itemBuscaNome: { fontSize: 15, fontWeight: '600', color: '#333' },
	itemBuscaDoc: { fontSize: 12, color: '#888', marginTop: 2 },
	emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});