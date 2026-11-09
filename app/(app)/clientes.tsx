import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView,
	Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput,
	TouchableOpacity, View
} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import RNPickerSelect from 'react-native-picker-select';

import LogoSolutires from '../../assets/images/smart_pneus.png';
import { useAuth } from '../../contexts/AuthContext';
import { ModalBuscaDinamica } from '../../src/components/ModalBuscaDinamica'; // Importado com sucesso!
import { apiService } from '../../src/services/apiService';

const URL_FOTOS = 'https://sistemascactus.com.br/apicactus/akipneus/fotos/';

interface Cliente {
	id: number;
	codigo: string;
	nome: string;
	cnpj: string;
	situacao: string;
	tipoCliente?: string;
	fone1?: string;
	qtde_veiculos?: number;
}

interface Contato {
	nome: string;
	fone1: string;
	fone2: string;
	email: string;
}

export default function ClientesScreen() {
	const { user, signOut } = useAuth();
	const router = useRouter();

	const isMounted = useRef(true);

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
	const [fotosAntigas, setFotosAntigas] = useState<string[]>([]);
	const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

	const [formCliente, setFormCliente] = useState({
		cnpj: '', identificacao: '',
		cidade: '', cidade_id: '',
		tipoCliente: '', situacao: ''
	});

	const [contatos, setContatos] = useState<Contato[]>([
		{ nome: '', fone1: '', fone2: '', email: '' }
	]);

	// Estados do Modal de Busca Genérico
	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const carregarClientes = async (pageToLoad = 1) => {
		if (pageToLoad === 1) setIsLoading(true); else setIsFetchingMore(true);

		try {
			const filtros = { codigo: filtroCodigo, cnpj: filtroCnpj, nome: filtroNome };
			const response = await apiService.buscarClientes(user?.id, user?.nivel, filtros, pageToLoad);

			if (!isMounted.current) return;

			if (response && response.success) {
				const dataArray = response.data || [];
				if (pageToLoad === 1) { setClientes(dataArray); } else { setClientes(prev => [...prev, ...dataArray]); }
				setHasMore(dataArray.length === 20); setPagina(pageToLoad);
			}
		} catch (error) {
			if (isMounted.current) console.log("Erro ao carregar clientes", error);
		} finally {
			if (isMounted.current) {
				setIsLoading(false);
				setIsFetchingMore(false);
			}
		}
	};

	useEffect(() => {
		isMounted.current = true;
		carregarClientes(1);

		return () => {
			isMounted.current = false;
		};
	}, []);

	const loadMore = () => { if (!isLoading && !isFetchingMore && hasMore) carregarClientes(pagina + 1); };

	const resetForm = () => {
		setFormCliente({ cnpj: '', identificacao: '', cidade: '', cidade_id: '', tipoCliente: '', situacao: '' });
		setContatos([{ nome: '', fone1: '', fone2: '', email: '' }]);
		setFotos([]);
		setFotosAntigas([]);
		setIsEditing(false);
		setIdEditando(null);
		setFotoAmpliada(null);
	};

	const abrirModalNovo = () => { resetForm(); setModalInserirVisible(true); };

	const handleActionModificar = async (cliente: Cliente) => {
		setIsLoading(true);
		try {
			const res = await apiService.buscarClientePorId(cliente.id);

			if (!isMounted.current) return;
			setIsLoading(false);

			if (res && res.success) {
				const dados = res.data;
				setFormCliente({
					cnpj: dados.cnpj || '', identificacao: dados.identificacao || '',
					cidade: dados.cidade || '', cidade_id: dados.cidade_id || '',
					tipoCliente: dados.tipoCliente || '', situacao: dados.situacao || ''
				});

				if (dados.contatos && dados.contatos.length > 0) {
					setContatos(dados.contatos);
				} else {
					setContatos([{ nome: '', fone1: '', fone2: '', email: '' }]);
				}

				setFotosAntigas(dados.foto ? dados.foto.split(',').map((f: string) => `${URL_FOTOS}${f}`) : []);
				setFotos([]);
				setIsEditing(true);
				setIdEditando(cliente.id);
				setModalInserirVisible(true);
			} else {
				Alert.alert('Erro', res?.message || 'Não foi possível carregar os detalhes.');
			}
		} catch (error) {
			if (isMounted.current) {
				setIsLoading(false);
				Alert.alert('Erro', 'Falha na comunicação com o servidor.');
			}
		}
	};

	const excluirCliente = (id: number, nome: string) => {
		Alert.alert(
			'Excluir Cliente',
			`Tem certeza que deseja excluir o cliente "${nome}"?\n\nEle não aparecerá mais no sistema.`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir',
					style: 'destructive',
					onPress: async () => {
						try {
							await apiService.excluirCliente(id);
						} catch (error) {
							console.log('Erro ignorado ao excluir cliente');
						} finally {
							if (isMounted.current) {
								Alert.alert(
									'Sucesso',
									'Cliente excluído com sucesso.',
									[{ text: 'OK', onPress: () => carregarClientes(1) }]
								);
							}
						}
					}
				}
			]
		);
	};

	const adicionarContato = () => setContatos([...contatos, { nome: '', fone1: '', fone2: '', email: '' }]);
	const removerContato = (index: number) => {
		const novos = [...contatos];
		novos.splice(index, 1);
		setContatos(novos);
	};
	const atualizarContato = (index: number, campo: keyof Contato, valor: string) => {
		const novos = [...contatos];
		novos[index][campo] = valor;
		setContatos(novos);
	};

	const confirmSignOut = () => {
		Alert.alert(
			'Sair da Conta',
			'Tem certeza que deseja sair do aplicativo?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{ text: 'Sair', style: 'destructive', onPress: signOut },
			]
		);
	};

	const abrirBuscaCidade = () => {
		setResultadosBusca([]);
		setModalBuscaVisible(true);
		buscarCidadesNoBanco('');
	};

	const buscarCidadesNoBanco = async (termo: string) => {
		setIsSearching(true);
		try {
			const res = await apiService.buscarDinamica('cidade', termo, null as any);
			if (!isMounted.current) return;
			if (res && res.success) { setResultadosBusca(res.data); } else { setResultadosBusca([]); }
		} catch (error) {
			if (isMounted.current) setResultadosBusca([]);
		} finally {
			if (isMounted.current) setIsSearching(false);
		}
	};

	const selecionarCidade = (item: any) => {
		setFormCliente({ ...formCliente, cidade: item.nome, cidade_id: item.id });
		setModalBuscaVisible(false);
	};

	const abrirCamera = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') { Alert.alert('Permissão negada'); return; }
		let result = await ImagePicker.launchCameraAsync({ quality: 0.2, base64: true });
		if (!result.canceled && result.assets[0].base64) {
			setFotos([...fotos, `data:image/jpeg;base64,${result.assets[0].base64}`]);
		}
	};

	const abrirGaleria = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			quality: 0.2,
			base64: true
		});

		if (!result.canceled) {
			const novasFotos = result.assets.map(asset => `data:image/jpeg;base64,${asset.base64}`);
			setFotos([...fotos, ...novasFotos]);
		}
	};

	const removerFoto = (uriRemover: string) => setFotos(fotos.filter(uri => uri !== uriRemover));
	const removerFotoAntiga = (indexRemover: number) => {
		setFotosAntigas(fotosAntigas.filter((_, index) => index !== indexRemover));
	};

	const handleSalvarCliente = async () => {
		if (!formCliente.cnpj || !formCliente.identificacao) { Alert.alert('Atenção', 'Preencha pelo menos o CNPJ e a Identificação.'); return; }

		const dadosFinais: any = {
			...formCliente,
			contatos: contatos,
			fotos,
			fotosAntigas: fotosAntigas.map(url => url.substring(url.lastIndexOf('/') + 1))
		};

		try {
			setIsLoading(true);
			let response;
			if (isEditing) { dadosFinais.id = idEditando; response = await apiService.modificarCliente(dadosFinais, user?.id); }
			else { response = await apiService.cadastrarCliente(dadosFinais, user?.id); }

			if (!isMounted.current) return;

			if (response && response.success) {
				Alert.alert('Sucesso', isEditing ? 'Cliente atualizado!' : 'Novo cliente cadastrado.');
				setModalInserirVisible(false); resetForm(); carregarClientes(1);
			} else {
				Alert.alert('Atenção', response?.message || 'Erro no servidor.');
			}
		} catch (e: any) {
			if (isMounted.current) Alert.alert('Erro Fatal', e.message);
		} finally {
			if (isMounted.current) setIsLoading(false);
		}
	};

	const aplicarMascaraTelefoneInput = (text: string) => {
		let v = text.replace(/\D/g, '');
		if (v.length <= 10) {
			v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
			v = v.replace(/(\d{4})(\d)/, '$1-$2');
		} else {
			v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
			v = v.replace(/(\d{5})(\d)/, '$1-$2');
		}
		return v.substring(0, 15);
	};

	const formatarTelefone = (tel?: string) => {
		if (!tel) return 'Sem telefone';
		const limpo = tel.replace(/\D/g, '');

		if (limpo.length === 11) return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
		if (limpo.length === 10) return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
		if (limpo.length === 9) return limpo.replace(/(\d{5})(\d{4})/, '$1-$2');
		if (limpo.length === 8) return limpo.replace(/(\d{4})(\d{4})/, '$1-$2');

		return tel;
	};

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#000" style={{ marginTop: 15, marginRight: 15 }} />;

	const renderItem = ({ item }: { item: Cliente }) => {
		return (
			<View style={styles.card}>
				<View style={styles.cardHeader}>
					<Text style={styles.cardClient} numberOfLines={1}>#{item.codigo || item.id} - {item.nome}</Text>
					<View style={[styles.statusBadge, { backgroundColor: '#e8f0fe' }]}>
						<Text style={[styles.statusText, { color: '#1967d2' }]}>
							{item.qtde_veiculos ? `${item.qtde_veiculos} VEÍCULOS` : '0 VEÍCULOS'}
						</Text>
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
					<View style={styles.actionButtonsRow}>
						<TouchableOpacity style={styles.btnActionSecondary} onPress={() => router.push({ pathname: '/veiculos', params: { cliente_id: item.id, cliente_nome: item.nome } } as any)}>
							<Feather name="truck" size={12} color="#333" />
							<Text style={styles.btnActionTextSecondary} numberOfLines={1} adjustsFontSizeToFit>Veículos</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.btnActionSecondary} onPress={() => router.push({ pathname: '/pneus', params: { cliente_id: item.id, cliente_nome: item.nome } } as any)}>
							<MaterialCommunityIcons name="tire" size={13} color="#333" />
							<Text style={styles.btnActionTextSecondary} numberOfLines={1} adjustsFontSizeToFit>Pneus</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.btnEditarCard} onPress={() => handleActionModificar(item)}>
							<Feather name="edit-2" size={12} color="#ffffff" />
							<Text style={styles.btnEditarCardText} numberOfLines={1} adjustsFontSizeToFit>Editar</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirCliente(item.id, item.nome)}>
							<Feather name="trash-2" size={12} color="#ffffff" />
							<Text style={styles.btnExcluirCardText} numberOfLines={1} adjustsFontSizeToFit>Excluir</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>

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
				<Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: -10 }]}></Text>

				{isLoading && clientes.length === 0 && (
					<View style={{ paddingVertical: 20, alignItems: 'center' }}>
						<ActivityIndicator size="large" color="#0c6ead" />
						<Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text>
					</View>
				)}
			</View>

			<FlatList
				data={clientes}
				keyExtractor={(item, index) => String(item?.id || index)}

				initialNumToRender={8}
				maxToRenderPerBatch={8}
				windowSize={5}
				removeClippedSubviews={true}

				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
				onEndReached={loadMore}
				onEndReachedThreshold={0.3}

				ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color="#0c6ead" style={{ marginVertical: 20 }} /> : !hasMore && clientes.length > 0 ? <Text style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>Fim da lista.</Text> : undefined}
				ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum cliente encontrado.</Text> : undefined}
			/>

			<Modal visible={modalInserirVisible} animationType="slide" transparent={false}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#fff' }}>

					<View style={styles.modalHeaderFullScreen}>
						<TouchableOpacity onPress={() => setModalInserirVisible(false)} style={{ padding: 5 }}>
							<Feather name="arrow-left" size={24} color="#fff" />
						</TouchableOpacity>

						<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />

						<TouchableOpacity onPress={confirmSignOut} style={{ padding: 5 }}>
							<Feather name="power" size={22} color="#fff" />
						</TouchableOpacity>
					</View>

					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
						<Text style={styles.groupTitle}>1. Dados Principais</Text>
						<View style={styles.inputGroup}><Text style={styles.label}>CNPJ</Text><MaskedTextInput mask="99.999.999/9999-99" style={styles.input} placeholder="00.000.000/0000-00" keyboardType="numeric" value={formCliente.cnpj} onChangeText={(t) => setFormCliente({ ...formCliente, cnpj: t })} /></View>
						<View style={styles.inputGroup}><Text style={styles.label}>Razão Social / Nome Fantasia</Text><TextInput style={styles.input} placeholder="Nome do Cliente" value={formCliente.identificacao} onChangeText={(t) => setFormCliente({ ...formCliente, identificacao: t })} /></View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Cidade</Text>
							<TouchableOpacity style={styles.fakeInput} onPress={abrirBuscaCidade}>
								<Text style={{ color: formCliente.cidade ? '#000' : '#999' }}>{formCliente.cidade || 'Selecionar Cidade...'}</Text>
								<Feather name="search" size={16} color="#999" />
							</TouchableOpacity>
						</View>

						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 5 }}>
							<Text style={[styles.groupTitle, { marginTop: 0, marginBottom: 0, borderBottomWidth: 0 }]}>2. Pessoas de Contato</Text>
							<TouchableOpacity style={styles.btnAddContato} onPress={adicionarContato}>
								<Feather name="plus" size={14} color="#fff" />
								<Text style={styles.btnAddContatoText}>Adicionar</Text>
							</TouchableOpacity>
						</View>
						<View style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 15 }} />

						{contatos.map((contato, index) => (
							<View key={index} style={styles.contatoBox}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
									<Text style={styles.contatoIndexTitle}>Contato {index + 1}</Text>
									{contatos.length > 1 && (
										<TouchableOpacity onPress={() => removerContato(index)}>
											<Feather name="trash-2" size={16} color="#E53935" />
										</TouchableOpacity>
									)}
								</View>

								<View style={styles.inputGroup}>
									<Text style={styles.label}>Nome</Text>
									<TextInput style={styles.input} placeholder="Ex: João da Silva" value={contato.nome} onChangeText={(t) => atualizarContato(index, 'nome', t)} />
								</View>

								<View style={styles.row}>
									<View style={styles.inputGroupH}>
										<Text style={styles.label}>Telefone 1</Text>
										<TextInput
											style={styles.input}
											placeholder="(00) 00000-0000"
											keyboardType="phone-pad"
											value={contato.fone1}
											onChangeText={(t) => atualizarContato(index, 'fone1', aplicarMascaraTelefoneInput(t))}
										/>
									</View>
									<View style={styles.inputGroupH}>
										<Text style={styles.label}>Telefone 2</Text>
										<TextInput
											style={styles.input}
											placeholder="(00) 00000-0000"
											keyboardType="phone-pad"
											value={contato.fone2}
											onChangeText={(t) => atualizarContato(index, 'fone2', aplicarMascaraTelefoneInput(t))}
										/>
									</View>
								</View>

								<View style={styles.inputGroup}>
									<Text style={styles.label}>E-mail</Text>
									<TextInput style={styles.input} placeholder="contato@empresa.com" keyboardType="email-address" autoCapitalize="none" value={contato.email} onChangeText={(t) => atualizarContato(index, 'email', t)} />
								</View>
							</View>
						))}

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
									{ label: 'AUTÔNOMO', value: 'AUTÔNOMO', color: '#000' }
								]}
								style={pickerSelectStyles}
								useNativeAndroidPickerStyle={false}
								Icon={PickerIcon}
							/>
						</View>

						<Text style={[styles.groupTitle, { zIndex: -1, elevation: -1 }]}>4. Anexos / Fotos</Text>

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

						{(fotosAntigas.length > 0 || fotos.length > 0) && (
							<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15, zIndex: -1, elevation: -1 }}>

								{fotosAntigas.map((uri, index) => (
									<View key={`antiga-${index}`} style={styles.fotoThumbContainer}>
										<TouchableOpacity onPress={() => setFotoAmpliada(uri)}>
											<Image source={{ uri }} style={styles.fotoThumb} />
										</TouchableOpacity>
										<TouchableOpacity style={styles.btnRemoverFoto} onPress={() => removerFotoAntiga(index)}>
											<Feather name="x" size={14} color="#fff" />
										</TouchableOpacity>
									</View>
								))}

								{fotos.map((uri, index) => (
									<View key={`nova-${index}`} style={styles.fotoThumbContainer}>
										<TouchableOpacity onPress={() => setFotoAmpliada(uri)}>
											<Image source={{ uri }} style={styles.fotoThumb} />
										</TouchableOpacity>
										<TouchableOpacity style={styles.btnRemoverFoto} onPress={() => removerFoto(uri)}>
											<Feather name="x" size={14} color="#fff" />
										</TouchableOpacity>
									</View>
								))}
							</ScrollView>
						)}

						<TouchableOpacity style={[styles.btnSalvar, { zIndex: -1, elevation: -1 }]} onPress={handleSalvarCliente}>
							<Text style={styles.btnText}>{isEditing ? 'Gravar' : 'Gravar'}</Text>
						</TouchableOpacity>
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

					<ModalBuscaDinamica
						visible={modalBuscaVisible}
						onClose={() => setModalBuscaVisible(false)}
						titulo="Selecionar Cidade"
						dados={resultadosBusca}
						onSelect={selecionarCidade}
						isLoading={isSearching}
						onSearchChange={buscarCidadesNoBanco}
						placeholderBusca="Buscar cidade..."
					/>
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

	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa', alignItems: 'center' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 4 },

	btnActionSecondary: { flex: 1, backgroundColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 6, paddingHorizontal: 2 },
	btnActionTextSecondary: { color: '#333', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },

	btnEditarCard: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 6, paddingHorizontal: 2 },
	btnEditarCardText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },

	btnExcluirCard: { flex: 1, backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 6, paddingHorizontal: 2 },
	btnExcluirCardText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },

	modalHeaderFullScreen: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#0c6ead',
		paddingHorizontal: 15,
		paddingBottom: 15,
		paddingTop: Platform.OS === 'ios' ? 65 : (StatusBar.currentHeight ? StatusBar.currentHeight + 15 : 50),
		elevation: 4,
	},
	modalTitleHeader: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c6ead', marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 5 },

	contatoBox: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 15 },
	contatoIndexTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
	btnAddContato: { backgroundColor: '#28a745', flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
	btnAddContatoText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

	btnRemoverFoto: { position: 'absolute', top: 5, right: 5, backgroundColor: '#E53935', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 5 },

	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 10 },

	fotoThumbContainer: { position: 'relative', marginRight: 15, marginBottom: 10 },
	fotoThumb: { width: 100, height: 100, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f0f0f0' },
	fotoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
	btnFoto: { flex: 1, backgroundColor: '#f0f0f0', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 20, marginHorizontal: 5 },
	btnFotoText: { marginTop: 8, fontSize: 14, color: '#666', fontWeight: '500' },

	fullScreenOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 99999, elevation: 99999 },
	closeFullBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, zIndex: 100000, elevation: 100000, padding: 10 },
	fullScreenImage: { width: '100%', height: '80%' },
});