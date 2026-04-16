import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
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

const UFS = ['RN', 'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

export default function VeiculosScreen() {
	const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [filtroBusca, setFiltroBusca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const [fotos, setFotos] = useState<string[]>([]);

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'marca' | 'modelo' | 'entidade'>('marca');
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const [form, setForm] = useState({
		id: '', codigo: '', placa: '', especie: '', tipo: '', uf: '', renavam: '',
		marca: '', marca_id: '', modelo: '', modelo_id: '', ano: '', anoModelo: '', cor: '',
		combustivel: '', tanque: '', qtde_passageiros: '', estepe: '', calibragem_original: '',
		tipoCarroceria: '', tipoRodado: '', eixos: '', taraKg: '', capacidadeKg: '', capacidadeM3: '',
		proprietario: '', proprietario_id: '', tipoProprietario: '', rntrc: '', proprietarioUf: '',
		vencimento_crlv: '', vencimento_civ: '', vencimento_cipp: ''
	});

	const [eixosPermitidos, setEixosPermitidos] = useState<string[]>(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);

	useEffect(() => {
		const rodado = form.tipoRodado;
		let permitidos = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
		if (rodado === '3/4' || rodado === 'Toco') { permitidos = ['2']; }
		else if (rodado === 'Truck') { permitidos = ['3']; }
		else if (rodado === 'Bitruck') { permitidos = ['4']; }
		else if (rodado === 'Carreta') { permitidos = ['2', '3', '4', '5', '6']; }
		setEixosPermitidos(permitidos);
		if (!permitidos.includes(form.eixos)) {
			setForm(prev => ({ ...prev, eixos: permitidos.length === 1 ? permitidos[0] : '' }));
		}
	}, [form.tipoRodado]);

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
		setIsEditing(false);
	};

	const formatarData = (dataDb: string) => {
		if (!dataDb || dataDb === '0000-00-00') return '';
		const partes = dataDb.split('-');
		if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
		return dataDb;
	};

	const handleEditar = (v: Veiculo) => {
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
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.7,
			base64: true,
		});

		if (!result.canceled && result.assets[0].base64) {
			setFotos([...fotos, `data:image/jpeg;base64,${result.assets[0].base64}`]);
		}
	};

	const removerFoto = (index: number) => {
		const novasFotos = fotos.filter((_, i) => i !== index);
		setFotos(novasFotos);
	};

	const salvarVeiculo = async () => {
		if (!form.placa || !form.tipo || !form.marca_id || !form.modelo_id || !form.tipoRodado || !form.eixos) {
			Alert.alert('Atenção', 'Preencha todos os campos obrigatórios (*), incluindo Marca e Modelo.');
			return;
		}
		setIsSaving(true);
		const dadosCompletos = { ...form, fotos };
		const res = await apiService.salvarVeiculo(dadosCompletos);
		setIsSaving(false);
		if (res && res.success) {
			Alert.alert('Sucesso', res.message);
			setModalVisible(false);
			carregarVeiculos();
		} else {
			Alert.alert('Erro', res?.message || 'Falha ao gravar.');
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
			<View style={styles.headerBusca}>
				<Text style={styles.title}>Gestão de Frotas</Text>
				<View style={styles.row}>
					<TextInput style={styles.inputBusca} placeholder="Código ou Placa..." value={filtroBusca} onChangeText={setFiltroBusca} autoCapitalize="characters" />
					<TouchableOpacity style={styles.btnBuscar} onPress={() => carregarVeiculos(filtroBusca)}>
						<Feather name="search" size={20} color="#fff" />
					</TouchableOpacity>
				</View>
				<TouchableOpacity style={styles.btnNovo} onPress={() => { resetForm(); setModalVisible(true); }}>
					<Feather name="plus-circle" size={18} color="#ED1C24" />
					<Text style={styles.btnNovoText}>Inserir Veículo</Text>
				</TouchableOpacity>
			</View>

			{isLoading ? <ActivityIndicator size="large" color="#ED1C24" style={{ marginTop: 50 }} /> : (
				<FlatList data={veiculos} keyExtractor={(item, index) => String(item?.id || index)} contentContainerStyle={{ padding: 20 }}
					renderItem={({ item }) => (
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<MaterialCommunityIcons name="truck-outline" size={24} color="#333" />
								<Text style={styles.cardPlaca}>{item.placa}</Text>
								<View style={styles.badgeCode}><Text style={styles.badgeCodeText}>Cód: {item.codigo || 'N/A'}</Text></View>
							</View>
							<View style={styles.cardBody}>
								<Text style={styles.cardInfo}>{item.marca} - {item.modelo}</Text>
								<Text style={styles.cardInfoDetail}>Rodado: {item.rodado} • {item.eixos} Eixos</Text>
								<Text style={styles.cardInfoDetail}>Prop: {item.proprietario || 'N/A'}</Text>
							</View>
							<View style={styles.cardActions}>
								<TouchableOpacity style={styles.btnAcao} onPress={() => handleEditar(item)}>
									<Feather name="edit" size={16} color="#555" />
									<Text style={styles.btnAcaoText}>Modificar</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}
				/>
			)}

			<Modal visible={modalVisible} animationType="slide">
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#fff' }}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setModalVisible(false)}><Feather name="arrow-left" size={24} color="#333" /></TouchableOpacity>
						<Text style={styles.modalTitle}>{isEditing ? 'Editar Veículo' : 'Cadastro de Veículos'}</Text>
						<View style={{ width: 24 }} />
					</View>

					<ScrollView contentContainerStyle={{ padding: 20 }}>
						<Text style={styles.groupTitle}>1. Informações do Veículo</Text>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Código Interno</Text><TextInput style={styles.input} value={form.codigo} onChangeText={t => setForm({ ...form, codigo: t })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Placa</Text><MaskedTextInput mask="AAA-9*99" style={styles.input} value={form.placa} onChangeText={(t, raw) => setForm({ ...form, placa: raw })} autoCapitalize="characters" /></View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Espécie</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '' }} value={form.especie} onValueChange={v => setForm({ ...form, especie: v })} items={[{ label: '1 - Passageiros', value: '1' }, { label: '2 - Carga', value: '2' }, { label: '3 - Misto', value: '3' }, { label: '4 - Tração', value: '4' }, { label: '5 - Competição', value: '5' }, { label: '6 - Especial', value: '6' }, { label: '7 - Coleção', value: '7' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Tipo Veículo</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '' }} value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })} items={[{ label: 'Hatch', value: 'Hatch' }, { label: 'Sedan', value: 'Sedan' }, { label: 'Micro-Ônibus', value: 'Micro-Ônibus' }, { label: 'Ônibus', value: 'Ônibus' }, { label: 'Picape', value: 'Picape' }, { label: 'Van', value: 'Van' }, { label: 'Cavalo', value: 'Cavalo' }, { label: 'Caminhão', value: 'Caminhão' }, { label: 'Utilitario', value: 'Utilitario' }, { label: 'Implemento', value: 'Implemento' }, { label: 'Motocicleta', value: 'Motocicleta' }, { label: 'Doblo', value: 'Doblo' }, { label: 'SUV', value: 'SUV' }, { label: 'Carreta', value: 'Carreta' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>UF</Text><RNPickerSelect placeholder={{ label: 'UF', value: '' }} value={form.uf} onValueChange={v => setForm({ ...form, uf: v })} items={UFS.map(u => ({ label: u, value: u }))} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Renavam</Text><TextInput style={styles.input} value={form.renavam} onChangeText={t => setForm({ ...form, renavam: t })} keyboardType="numeric" /></View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>* Marca</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('marca')}>
									<Text style={{ color: form.marca ? '#000' : '#999' }}>{form.marca || 'Selecionar...'}</Text>
									<Feather name="search" size={16} color="#999" />
								</TouchableOpacity>
							</View>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>* Modelo</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('modelo')}>
									<Text style={{ color: form.modelo ? '#000' : '#999' }}>{form.modelo || 'Selecionar...'}</Text>
									<Feather name="search" size={16} color="#999" />
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Ano Fab.</Text><TextInput style={styles.input} value={form.ano} onChangeText={t => setForm({ ...form, ano: t })} keyboardType="numeric" maxLength={4} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Ano Mod.</Text><TextInput style={styles.input} value={form.anoModelo} onChangeText={t => setForm({ ...form, anoModelo: t })} keyboardType="numeric" maxLength={4} /></View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Cor</Text><TextInput style={styles.input} value={form.cor} onChangeText={t => setForm({ ...form, cor: t })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Combustível</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '' }} value={form.combustivel} onValueChange={v => setForm({ ...form, combustivel: v })} items={[{ label: 'ARLA', value: 'ARLA' }, { label: 'Gasolina', value: 'Gasolina' }, { label: 'Etanol', value: 'Etanol' }, { label: 'GNV', value: 'GNV' }, { label: 'Diesel', value: 'Diesel' }, { label: 'Diesel S10', value: 'Diesel S10' }, { label: 'Diesel S50', value: 'Diesel S50' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Tanque (L)</Text><TextInput style={styles.input} value={form.tanque} onChangeText={t => setForm({ ...form, tanque: t })} keyboardType="numeric" /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Passageiros</Text><TextInput style={styles.input} value={form.qtde_passageiros} onChangeText={t => setForm({ ...form, qtde_passageiros: t })} keyboardType="numeric" /></View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Estepes</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '' }} value={form.estepe} onValueChange={v => setForm({ ...form, estepe: v })} items={[{ label: '0', value: '0' }, { label: '1', value: '1' }, { label: '2', value: '2' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Calib. Orig.</Text><TextInput style={styles.input} value={form.calibragem_original} onChangeText={t => setForm({ ...form, calibragem_original: t })} keyboardType="numeric" /></View>
						</View>

						<Text style={styles.groupTitle}>2. Informações da Carga</Text>
						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Tipo Carroceria</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '' }} value={form.tipoCarroceria} onValueChange={v => setForm({ ...form, tipoCarroceria: v })} items={[{ label: '00 - nao aplicavel', value: '00' }, { label: '01 - Aberta', value: '01' }, { label: '02 - Fechada/Bau', value: '02' }, { label: '03 - Granelera', value: '03' }, { label: '04 - Porta Container', value: '04' }, { label: '05 - Sider', value: '05' }, { label: '06 - Tanque', value: '06' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Tipo Rodado</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '' }} value={form.tipoRodado} onValueChange={v => setForm({ ...form, tipoRodado: v })} items={[{ label: '3/4', value: '3/4' }, { label: 'Toco', value: 'Toco' }, { label: 'Truck', value: 'Truck' }, { label: 'Bitruck', value: 'Bitruck' }, { label: 'Carreta', value: 'Carreta' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Eixos</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '' }} value={form.eixos} onValueChange={v => setForm({ ...form, eixos: v })} items={eixosPermitidos.map(e => ({ label: `${e}`, value: e }))} style={pickerStyles} useNativeAndroidPickerStyle={false} disabled={eixosPermitidos.length === 1} Icon={PickerIcon} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Tara Kg</Text><TextInput style={styles.input} value={form.taraKg} onChangeText={t => setForm({ ...form, taraKg: t })} keyboardType="numeric" /></View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Capacidade Kg</Text><TextInput style={styles.input} value={form.capacidadeKg} onChangeText={t => setForm({ ...form, capacidadeKg: t })} keyboardType="numeric" /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Capacidade M3</Text><TextInput style={styles.input} value={form.capacidadeM3} onChangeText={t => setForm({ ...form, capacidadeM3: t })} keyboardType="numeric" /></View>
						</View>

						<Text style={styles.groupTitle}>3. Informações do Proprietário</Text>
						<View style={styles.row}>
							<View style={{ width: '100%', marginBottom: 15 }}>
								<Text style={styles.label}>Proprietário</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('entidade')}>
									<Text style={{ color: form.proprietario ? '#000' : '#999' }}>{form.proprietario || 'Selecionar Proprietário...'}</Text>
									<Feather name="search" size={16} color="#999" />
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Tipo Proprietário</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '' }} value={form.tipoProprietario} onValueChange={v => setForm({ ...form, tipoProprietario: v })} items={[{ label: '0 - AC Agregado', value: '0' }, { label: '1 - Tac Independente', value: '1' }, { label: '2 - Outros', value: '2' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>RNTRC</Text><TextInput style={styles.input} value={form.rntrc} onChangeText={t => setForm({ ...form, rntrc: t })} /></View>
						</View>
						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>UF</Text><RNPickerSelect placeholder={{ label: 'UF', value: '' }} value={form.proprietarioUf} onValueChange={v => setForm({ ...form, proprietarioUf: v })} items={UFS.map(u => ({ label: u, value: u }))} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
						</View>

						<Text style={styles.groupTitle}>4. Vencimento de Documentos</Text>
						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Venc. CRLV</Text><MaskedTextInput mask="99/99/9999" style={styles.input} placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.vencimento_crlv} onChangeText={(t, raw) => setForm({ ...form, vencimento_crlv: t })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Venc. CIV</Text><MaskedTextInput mask="99/99/9999" style={styles.input} placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.vencimento_civ} onChangeText={(t, raw) => setForm({ ...form, vencimento_civ: t })} /></View>
						</View>
						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Venc. CIPP</Text><MaskedTextInput mask="99/99/9999" style={styles.input} placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.vencimento_cipp} onChangeText={(t, raw) => setForm({ ...form, vencimento_cipp: t })} /></View>
						</View>

						<Text style={styles.groupTitle}>5. Fotos do Veículo</Text>
						<TouchableOpacity style={styles.btnFoto} onPress={tirarFoto}>
							<Feather name="camera" size={20} color="#666" />
							<Text style={styles.btnFotoText}>Tirar Foto do Caminhão</Text>
						</TouchableOpacity>

						<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
							{fotos.map((uri, index) => (
								<View key={index} style={styles.fotoContainer}>
									<Image source={{ uri }} style={styles.fotoPreview} />
									<TouchableOpacity style={styles.btnRemoveFoto} onPress={() => removerFoto(index)}>
										<Feather name="x" size={12} color="#fff" />
									</TouchableOpacity>
								</View>
							))}
						</ScrollView>

						<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }]} onPress={salvarVeiculo} disabled={isSaving}>
							{isSaving ? <ActivityIndicator color="#fff" /> : (
								<>
									<Feather name="save" size={20} color="#fff" />
									<Text style={styles.btnSalvarText}>Gravar Cadastro Completo</Text>
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
	inputIOS: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', marginBottom: 15, paddingRight: 30, minHeight: 48 },
	inputAndroid: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', marginBottom: 15, paddingRight: 30, minHeight: 48 },
});

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	headerBusca: { backgroundColor: '#fff', padding: 20, paddingTop: 30, borderBottomWidth: 1, borderColor: '#eee', elevation: 2 },
	title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputBusca: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 15, height: 45, marginRight: 10 },
	btnBuscar: { backgroundColor: '#333', width: 45, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnNovo: { flexDirection: 'row', backgroundColor: '#ffe5e6', borderWidth: 1, borderColor: '#ED1C24', borderRadius: 8, paddingVertical: 12, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
	btnNovoText: { color: '#ED1C24', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
	card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#eee' },
	cardHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 10 },
	cardPlaca: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 10, flex: 1 },
	badgeCode: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
	badgeCodeText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
	cardBody: { marginBottom: 10 },
	cardInfo: { fontSize: 15, color: '#333', fontWeight: '600' },
	cardInfoDetail: { fontSize: 13, color: '#888', marginTop: 2 },
	cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
	btnAcao: { flexDirection: 'row', alignItems: 'center', padding: 5 },
	btnAcaoText: { marginLeft: 5, fontSize: 13, color: '#555', fontWeight: '600' },
	modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, borderBottomWidth: 1, borderColor: '#eee' },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#ED1C24', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#ffe5e6', paddingBottom: 5, backgroundColor: '#fff' },
	inputGroupH: { width: '48%' },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },
	fakeInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
	btnSalvar: { backgroundColor: '#ED1C24', flexDirection: 'row', paddingVertical: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },

	btnFoto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 15, backgroundColor: '#f9f9f9' },
	btnFotoText: { marginLeft: 10, color: '#666', fontWeight: 'bold' },
	fotoContainer: { marginRight: 10, position: 'relative' },
	fotoPreview: { width: 100, height: 100, borderRadius: 8 },
	btnRemoveFoto: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ED1C24', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

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