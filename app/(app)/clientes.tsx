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

interface Combustivel {
	id: number;
	tipo: string;
	volume: string;
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
	const [formLead, setFormLead] = useState({
		cnpj: '', identificacao: '', cidade: '', contato: '',
		fone1: '', fone2: '', email: '', tipoCliente: '', situacao: ''
	});
	const [listaCombustiveis, setListaCombustiveis] = useState<Combustivel[]>([
		{ id: Date.now(), tipo: '', volume: '' }
	]);

	const [modalAtendimentoVisible, setModalAtendimentoVisible] = useState(false);
	const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
	const [formAtendimento, setFormAtendimento] = useState({ tipoVisita: '', descricao: '' });

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
		setFormLead({ cnpj: '', identificacao: '', cidade: '', contato: '', fone1: '', fone2: '', email: '', tipoCliente: '', situacao: '' });
		setFotos([]);
		setListaCombustiveis([{ id: Date.now(), tipo: '', volume: '' }]);
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
			setFormLead({
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

			if (dados.combustiveis && dados.combustiveis.length > 0) {
				setListaCombustiveis(dados.combustiveis);
			} else {
				setListaCombustiveis([{ id: Date.now(), tipo: '', volume: '' }]);
			}

			setFotos([]);
			setIsEditing(true);
			setIdEditando(cliente.id);
			setModalInserirVisible(true);
		} else {
			Alert.alert('Erro', res?.message || 'Não foi possível carregar os detalhes do cliente.');
		}
	};

	const adicionarLinhaCombustivel = () => setListaCombustiveis([...listaCombustiveis, { id: Date.now(), tipo: '', volume: '' }]);

	const removerLinhaCombustivel = (id: number) => {
		if (listaCombustiveis.length > 1) setListaCombustiveis(listaCombustiveis.filter(item => item.id !== id));
	};

	const atualizarCombustivel = (id: number, campo: keyof Combustivel, valor: string) => {
		setListaCombustiveis(listaCombustiveis.map(item => item.id === id ? { ...item, [campo]: valor } : item));
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

	const handleSalvarLead = async () => {
		if (!formLead.cnpj || !formLead.identificacao) {
			Alert.alert('Atenção', 'Preencha pelo menos o CNPJ e a Identificação.');
			return;
		}

		const dadosFinais: any = { ...formLead, combustiveis: listaCombustiveis, fotos };

		try {
			let response;
			if (isEditing) {
				dadosFinais.id = idEditando;
				response = await apiService.modificarCliente(dadosFinais, user?.id);
			} else {
				response = await apiService.cadastrarCliente(dadosFinais, user?.id);
			}

			if (response && response.success) {
				Alert.alert('Sucesso', isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado como LEAD no funil.');
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

	const handleAbrirAtendimento = (cliente: Cliente) => {
		setClienteSelecionado(cliente);
		setFormAtendimento({ tipoVisita: '', descricao: '' });
		setModalAtendimentoVisible(true);
	};

	const handleSalvarAtendimento = async () => {
		if (!formAtendimento.descricao) {
			Alert.alert('Atenção', 'Por favor, digite a descrição do atendimento.');
			return;
		}

		const payload = {
			cliente_id: clienteSelecionado?.id,
			user_id: user?.id,
			tipoVisita: formAtendimento.tipoVisita,
			descricao: formAtendimento.descricao
		};

		const response = await apiService.cadastrarAtendimento(payload);
		if (response && response.success) {
			Alert.alert('Sucesso', 'Atendimento registado com sucesso no histórico do cliente!');
			setModalAtendimentoVisible(false);
		} else {
			Alert.alert('Atenção', response?.message || 'Erro ao gravar atendimento.');
		}
	};

	const getBadgeStyle = (situacao: string) => {
		switch (situacao) {
			case 'LEAD': return { bg: '#0d6efd', text: '#ffffff' };
			case 'DOCUMENTAÇÃO': return { bg: '#f3e5f5', text: '#4a148c' };
			case 'CADASTRO': return { bg: '#fff3e0', text: '#e65100' };
			case 'FINANCEIRO/JURÍDICO': return { bg: '#ffebee', text: '#b71c1c' };
			case 'VALIDAÇÃO': return { bg: '#e0f2f1', text: '#004d40' };
			case 'APROVAÇÃO': return { bg: '#fffde7', text: '#f57f17' };
			case 'CONTRATO': return { bg: '#e8eaf6', text: '#1a237e' };
			case 'RELACIONAMENTO': return { bg: '#e6f4ea', text: '#28a745' };
			default: return { bg: '#f4f6f8', text: '#666' };
		}
	};

	const renderItem = ({ item }: { item: Cliente }) => {
		const badgeInfo = getBadgeStyle(item.situacao);
		return (
			<View style={styles.card}>
				<View style={styles.cardHeader}>
					<Text style={styles.cardClient} numberOfLines={1}>#{item.codigo} - {item.nome}</Text>
					<View style={[styles.statusBadge, { backgroundColor: badgeInfo.bg }]}>
						<Text style={[styles.statusText, { color: badgeInfo.text }]}>{item.situacao}</Text>
					</View>
				</View>

				<View style={styles.cardInfoBox}>
					<View style={styles.cardInfoRow}>
						<Feather name="file-text" size={14} color="#666" />
						<Text style={styles.cardInfoText}>{item.cnpj}</Text>
					</View>
					<View style={styles.cardInfoRow}>
						<Feather name="briefcase" size={14} color="#666" />
						<Text style={styles.cardInfoText}>{item.assessor}</Text>
					</View>
				</View>

				<View style={styles.cardActions}>
					<TouchableOpacity style={styles.actionBtn} onPress={() => handleActionModificar(item)}>
						<Feather name="edit" size={18} color="#555" />
						<Text style={styles.actionBtnText}>Modificar</Text>
					</TouchableOpacity>
					<View style={styles.dividerVertical} />
					<TouchableOpacity style={styles.actionBtn} onPress={() => handleAbrirAtendimento(item)}>
						<Feather name="check-square" size={18} color="#ED1C24" />
						<Text style={[styles.actionBtnText, { color: '#ED1C24' }]}>Atendimento</Text>
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
						<Text style={styles.modalTitle}>{isEditing ? 'Editar Cliente' : 'Cadastro de Lead'}</Text>
						<View style={{ width: 24 }} />
					</View>

					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

						<Text style={styles.groupTitle}>1. Dados Principais</Text>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>CNPJ</Text>
							<MaskedTextInput
								mask="99.999.999/9999-99" style={styles.input} placeholder="00.000.000/0000-00" keyboardType="numeric"
								value={formLead.cnpj} onChangeText={(t, raw) => setFormLead({ ...formLead, cnpj: raw })}
							/>
						</View>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Identificação (Razão/Fantasia)</Text>
							<TextInput
								style={styles.input} placeholder="Nome do posto ou empresa"
								value={formLead.identificacao} onChangeText={(t) => setFormLead({ ...formLead, identificacao: t })}
							/>
						</View>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Cidade</Text>
							<TextInput
								style={styles.input} placeholder="Ex: Mossoró - RN"
								value={formLead.cidade} onChangeText={(t) => setFormLead({ ...formLead, cidade: t })}
							/>
						</View>

						<Text style={styles.groupTitle}>2. Contato</Text>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Pessoa de Contato</Text>
							<TextInput
								style={styles.input} placeholder="Nome do gerente/dono"
								value={formLead.contato} onChangeText={(t) => setFormLead({ ...formLead, contato: t })}
							/>
						</View>
						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Telefone 1</Text>
								<MaskedTextInput
									mask="(99) 99999-9999" style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad"
									value={formLead.fone1} onChangeText={(text, raw) => setFormLead({ ...formLead, fone1: raw })}
								/>
							</View>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Telefone 2</Text>
								<MaskedTextInput
									mask="(99) 99999-9999" style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad"
									value={formLead.fone2} onChangeText={(text, raw) => setFormLead({ ...formLead, fone2: raw })}
								/>
							</View>
						</View>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>E-mail</Text>
							<TextInput
								style={styles.input} placeholder="contato@empresa.com" keyboardType="email-address" autoCapitalize="none"
								value={formLead.email} onChangeText={(t) => setFormLead({ ...formLead, email: t })}
							/>
						</View>

						<Text style={styles.groupTitle}>3. Perfil do Cliente</Text>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Tipo de Cliente</Text>
							<RNPickerSelect
								placeholder={{ label: 'Selecione o tipo...', value: '', color: '#999' }}
								onValueChange={(value) => setFormLead({ ...formLead, tipoCliente: value })}
								value={formLead.tipoCliente}
								items={[
									{ label: 'REVENDEDOR', value: 'REVENDEDOR' },
									{ label: 'CONSUMIDOR FINAL', value: 'CONSUMIDOR FINAL' },
									{ label: 'BANDEIRAMENTO', value: 'BANDEIRAMENTO' },
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
								onValueChange={(value) => setFormLead({ ...formLead, situacao: value })}
								value={formLead.situacao}
								items={[
									{ label: 'POSTO PRÓPRIO', value: 'POSTO PRÓPRIO' },
									{ label: 'POSTO ARRENDADO', value: 'POSTO ARRENDADO' },
								]}
								style={pickerSelectStyles}
								useNativeAndroidPickerStyle={false}
								Icon={() => <Feather name="chevron-down" size={20} color="#000" style={{ marginTop: 15, marginRight: 15 }} />}
							/>
						</View>

						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 10 }}>
							<Text style={[styles.groupTitle, { marginTop: 0, marginBottom: 0 }]}>4. Combustíveis</Text>
							<TouchableOpacity onPress={adicionarLinhaCombustivel} style={styles.btnAddMini}>
								<Feather name="plus" size={16} color="#fff" />
								<Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>Adicionar</Text>
							</TouchableOpacity>
						</View>

						{listaCombustiveis.map((item) => (
							<View key={item.id} style={styles.rowCombustivel}>
								<View style={{ flex: 2, marginRight: 10 }}>
									<Text style={styles.label}>Produto</Text>
									<RNPickerSelect
										placeholder={{ label: 'Selecione...', value: '', color: '#999' }}
										onValueChange={(value) => atualizarCombustivel(item.id, 'tipo', value)}
										value={item.tipo}
										items={[
											{ label: 'Gasolina Comum', value: 'Gasolina Comum' },
											{ label: 'Gasolina Aditivada', value: 'Gasolina Aditivada' },
											{ label: 'Óleo Diesel S500', value: 'Óleo Diesel S500' },
											{ label: 'Óleo Diesel S10', value: 'Óleo Diesel S10' },
											{ label: 'Etanol Hidratado', value: 'Etanol Hidratado' },
										]}
										style={pickerSelectMiniStyles}
										useNativeAndroidPickerStyle={false}
										Icon={() => <Feather name="chevron-down" size={16} color="#000" style={{ marginTop: 12, marginRight: 10 }} />}
									/>
								</View>
								<View style={{ flex: 1, marginRight: 10 }}>
									<Text style={styles.label}>Volume (L)</Text>
									<TextInput
										style={[styles.input, { paddingVertical: 10, fontSize: 13, marginBottom: 0 }]}
										placeholder="0" keyboardType="numeric"
										value={item.volume} onChangeText={(t) => atualizarCombustivel(item.id, 'volume', t)}
									/>
								</View>
								{listaCombustiveis.length > 1 && (
									<TouchableOpacity onPress={() => removerLinhaCombustivel(item.id)} style={styles.btnRemoveMini}>
										<Feather name="trash-2" size={18} color="#ED1C24" />
									</TouchableOpacity>
								)}
							</View>
						))}

						<Text style={styles.groupTitle}>5. Anexos / Fotos</Text>
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

						<TouchableOpacity style={styles.btnSalvar} onPress={handleSalvarLead}>
							<Feather name="save" size={20} color="#fff" style={{ marginRight: 10 }} />
							<Text style={styles.btnText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente (Lead)'}</Text>
						</TouchableOpacity>

						<View style={{ height: 40 }} />
					</ScrollView>
				</KeyboardAvoidingView>
			</Modal>

			<Modal visible={modalAtendimentoVisible} animationType="slide" transparent={true}>
				<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>

						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
							<Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Novo Atendimento</Text>
							<TouchableOpacity onPress={() => setModalAtendimentoVisible(false)}>
								<Feather name="x" size={24} color="#333" />
							</TouchableOpacity>
						</View>

						<Text style={{ color: '#666', marginBottom: 15 }}>
							Cliente: <Text style={{ fontWeight: 'bold', color: '#333' }}>{clienteSelecionado?.nome}</Text>
						</Text>

						<ScrollView showsVerticalScrollIndicator={false}>
							<View style={styles.inputGroup}>
								<Text style={styles.label}>Tipo de Contato/Visita</Text>
								<RNPickerSelect
									placeholder={{ label: 'Selecione o tipo...', value: '', color: '#999' }}
									onValueChange={(value) => setFormAtendimento({ ...formAtendimento, tipoVisita: value })}
									value={formAtendimento.tipoVisita}
									items={[
										{ label: 'VISITA LOJISTA', value: 'VISITA LOJISTA' },
										{ label: 'DESLOCAMENTO', value: 'DESLOCAMENTO' },
										{ label: 'LIGAÇÃO TELEFÔNICA', value: 'LIGAÇÃO TELEFÔNICA' },
										{ label: 'WHATSAPP', value: 'WHATSAPP' },
										{ label: 'E-MAIL', value: 'E-MAIL' },
									]}
									style={pickerSelectStyles}
									useNativeAndroidPickerStyle={false}
									Icon={() => <Feather name="chevron-down" size={20} color="#000" style={{ marginTop: 15, marginRight: 15 }} />}
								/>
							</View>

							<View style={styles.inputGroup}>
								<Text style={styles.label}>Resumo / Observação</Text>
								<TextInput
									style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
									placeholder="Digite como foi o atendimento..."
									multiline={true}
									numberOfLines={4}
									value={formAtendimento.descricao}
									onChangeText={(t) => setFormAtendimento({ ...formAtendimento, descricao: t })}
								/>
							</View>

							<TouchableOpacity style={styles.btnSalvar} onPress={handleSalvarAtendimento}>
								<Feather name="check" size={20} color="#fff" style={{ marginRight: 10 }} />
								<Text style={styles.btnText}>Gravar Atendimento</Text>
							</TouchableOpacity>
							<View style={{ height: 40 }} />
						</ScrollView>

					</KeyboardAvoidingView>
				</View>
			</Modal>

		</View>
	);
}

const pickerSelectStyles = StyleSheet.create({
	inputIOS: { fontSize: 14, paddingVertical: 14, paddingHorizontal: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, color: '#000000', paddingRight: 30, backgroundColor: '#f9f9f9', marginBottom: 15 },
	inputAndroid: { fontSize: 14, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, color: '#000000', paddingRight: 30, backgroundColor: '#f9f9f9', marginBottom: 15 },
});

const pickerSelectMiniStyles = StyleSheet.create({
	inputIOS: { fontSize: 13, paddingVertical: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, color: '#000000', paddingRight: 25, backgroundColor: '#fff' },
	inputAndroid: { fontSize: 13, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, color: '#000000', paddingRight: 25, backgroundColor: '#fff' },
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
	dividerVertical: { width: 1, backgroundColor: '#f0f0f0' },

	modalHeaderFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#ED1C24', marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ffe5e6', paddingBottom: 5 },

	rowCombustivel: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f6f8', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
	btnAddMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#28a745', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
	btnRemoveMini: { padding: 10, marginTop: 10 },

	fotosGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
	fotoThumbContainer: { position: 'relative', marginRight: 10, marginBottom: 10 },
	fotoThumb: { width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
	btnRemoverFoto: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ED1C24', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

	fotoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
	btnFoto: { flex: 1, backgroundColor: '#f0f0f0', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 20, marginHorizontal: 5 },
	btnFotoText: { marginTop: 8, fontSize: 14, color: '#666', fontWeight: '500' },
	avisoLead: { flexDirection: 'row', backgroundColor: '#e0f7fa', padding: 15, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
	avisoText: { color: '#006064', fontSize: 13, marginLeft: 10, flex: 1, lineHeight: 18 },
	btnSalvar: { backgroundColor: '#ED1C24', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
});