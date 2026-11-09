import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LogoSolutires from '../../assets/images/smart_pneus.png';
import { CabecalhoListagem } from '../../src/components/CabecalhoListagem';
import { ModalBuscaDinamica } from '../../src/components/ModalBuscaDinamica'; // Componente genérico importado
import { apiService } from '../../src/services/apiService';

interface Reformador {
	id: number;
	nome: string;
	documento: string;
	telefone: string;
	cidade_id: number;
	cidade_nome: string;
	cidade_uf: string;
}

export default function ReformadoresScreen() {
	const router = useRouter();

	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	const [reformadores, setReformadores] = useState<Reformador[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [filtroBusca, setFiltroBusca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);

	const [form, setForm] = useState({
		id: '', nome: '', documento: '', telefone: '', cidade_nome: '', cidade_id: ''
	});

	// Estados do Modal de Busca Genérico para Cidades
	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const carregarReformadores = async () => {
		setIsLoading(true);
		try {
			const res = await apiService.listarReformadores(filtroBusca);
			if (!isMounted.current) return;

			if (res && res.success) {
				setReformadores(res.data || []);
			} else {
				setReformadores([]);
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha ao buscar os reformadores.');
		} finally {
			if (isMounted.current) setIsLoading(false);
		}
	};

	useEffect(() => {
		carregarReformadores();
	}, []);

	const resetForm = () => {
		setForm({ id: '', nome: '', documento: '', telefone: '', cidade_nome: '', cidade_id: '' });
		setModalVisible(true);
	};

	const editarReformador = (item: Reformador) => {
		setForm({
			id: String(item.id),
			nome: item.nome,
			documento: item.documento || '',
			telefone: item.telefone || '',
			cidade_nome: item.cidade_nome || '',
			cidade_id: item.cidade_id ? String(item.cidade_id) : ''
		});
		setModalVisible(true);
	};

	const salvarReformador = async () => {
		if (!form.nome.trim()) {
			Alert.alert('Atenção', 'O nome do reformador é obrigatório.');
			return;
		}

		setIsSaving(true);
		try {
			const payload = {
				acao: form.id ? 'atualizar' : 'inserir',
				...form
			};

			const response = await apiService.salvarReformador(payload);
			console.log("RESPOSTA CRUA DO SERVIDOR AO SALVAR REFORMADOR:", response);

			let res = response;
			if (typeof res === 'string') {
				try { res = JSON.parse(res); } catch (e) { res = { success: true }; }
			}

			if (!isMounted.current) return;

			if (res && (res.success === true || res.success === 1 || res.success === 'true')) {
				Alert.alert('Sucesso', res.message || (form.id ? 'Reformador atualizado com sucesso!' : 'Reformador cadastrado com sucesso!'));
				setModalVisible(false);
				carregarReformadores();
			} else {
				Alert.alert('Atenção', res?.message || 'Falha ao salvar reformador.');
			}
		} catch (error: any) {
			console.log("ERRO DE CONEXÃO OU EXCEÇÃO:", error?.response || error);
			if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
		} finally {
			if (isMounted.current) setIsSaving(false);
		}
	};

	const excluirReformador = (id: number, nome: string) => {
		Alert.alert(
			'Excluir Reformador',
			`Tem certeza que deseja excluir o reformador "${nome}"?`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir', style: 'destructive', onPress: async () => {
						try {
							const response = await apiService.excluirReformador(id);
							let res = response;

							if (typeof res === 'string') {
								try { res = JSON.parse(res); } catch (e) { res = { success: true }; }
							}

							if (!isMounted.current) return;

							if (res && (res.success === true || res.success === 1 || res.success === 'true' || res === true)) {
								Alert.alert('Sucesso', 'Reformador excluído com sucesso.');
								carregarReformadores();
							} else {
								Alert.alert('Erro', res?.message || 'Falha ao excluir.');
							}
						} catch (error) {
							if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
						}
					}
				}
			]
		);
	};

	const abrirBuscaCidade = () => {
		setResultadosBusca([]);
		setModalBuscaVisible(true);
		buscarDinamicaNoBanco('');
	};

	const buscarDinamicaNoBanco = async (termo: string) => {
		setIsSearching(true);
		try {
			const res = await apiService.buscarDinamica('cidade', termo);
			if (!isMounted.current) return;
			setResultadosBusca(res && res.success ? res.data : []);
		} catch (error) {
			if (isMounted.current) setResultadosBusca([]);
		} finally {
			if (isMounted.current) setIsSearching(false);
		}
	};

	const selecionarItemBusca = (item: any) => {
		setForm({ ...form, cidade_nome: item.nome, cidade_id: item.id });
		setModalBuscaVisible(false);
	};

	const aplicarMascaraTelefone = (text: string) => {
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

	return (
		<View style={styles.container}>

			<View style={styles.filterSection}>
				<Text style={styles.sectionTitle}>Gerenciar Reformadores</Text>

				{/* Cabeçalho de Listagem Componentizado */}
				<CabecalhoListagem
					busca={filtroBusca}
					setBusca={setFiltroBusca}
					onBuscar={carregarReformadores}
					onInserir={resetForm}
					labelPesquisa="Buscar Reformador"
					placeholderPesquisa="Buscar reformador pelo nome..."
					textoBotaoNovo="Inserir"
				/>

				<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: -5 }]}>Resultados ({reformadores.length})</Text>
			</View>

			{isLoading && reformadores.length === 0 ? (
				<View style={{ paddingVertical: 40, alignItems: 'center' }}>
					<ActivityIndicator size="large" color="#0c6ead" />
					<Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text>
				</View>
			) : (
				<FlatList
					data={reformadores}
					keyExtractor={(item, index) => String(item?.id || index)}

					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={5}
					removeClippedSubviews={true}

					contentContainerStyle={{ paddingBottom: 40 }}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<View style={{ flex: 1 }}>
									<Text style={styles.cardTitle} numberOfLines={2}>{item.nome}</Text>
									<Text style={styles.cardSubTitle}>{item.cidade_nome ? `${item.cidade_nome} - ${item.cidade_uf}` : 'Cidade não informada'}</Text>
								</View>
							</View>
							<View style={styles.cardBody}>
								<Text style={styles.cardText}><Text style={{ fontWeight: 'bold' }}>Doc:</Text> {item.documento || '--'}</Text>
								<Text style={styles.cardText}><Text style={{ fontWeight: 'bold' }}>Tel:</Text> {item.telefone || '--'}</Text>
							</View>

							<View style={styles.cardActions}>
								<View style={styles.actionButtonsRow}>
									<TouchableOpacity style={styles.btnEditarCard} onPress={() => editarReformador(item)}>
										<Feather name="edit-2" size={14} color="#ffffff" />
										<Text style={styles.btnEditarCardText}>Editar</Text>
									</TouchableOpacity>

									<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirReformador(item.id, item.nome)}>
										<Feather name="trash-2" size={14} color="#ffffff" />
										<Text style={styles.btnExcluirCardText}>Excluir</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					)}
					ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum reformador encontrado.</Text> : undefined}
				/>
			)}

			<Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
						<View style={styles.modalHeaderFull}>
							<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}>
								<Feather name="arrow-left" size={24} color="#fff" />
							</TouchableOpacity>
							<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
							<View style={{ width: 34 }} />
						</View>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
							<Text style={styles.groupTitle}>{form.id ? 'Editar Reformador' : 'Novo Reformador'}</Text>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Nome da Empresa</Text>
								<TextInput
									style={styles.input}
									value={form.nome}
									onChangeText={t => setForm({ ...form, nome: t })}
									placeholder="Ex: Pneus Silva LTDA"
									autoCapitalize="words"
								/>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>CNPJ / NIF</Text>
									<TextInput
										style={styles.input}
										value={form.documento}
										onChangeText={t => setForm({ ...form, documento: t })}
										placeholder="Documento"
										keyboardType="numeric"
									/>
								</View>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>Telefone</Text>
									<TextInput
										style={styles.input}
										value={form.telefone}
										onChangeText={t => setForm({ ...form, telefone: aplicarMascaraTelefone(t) })}
										placeholder="(00) 00000-0000"
										keyboardType="phone-pad"
									/>
								</View>
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>Cidade</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={abrirBuscaCidade}>
									<Text style={{ color: form.cidade_nome ? '#000' : '#999' }}>{form.cidade_nome || 'Selecionar Cidade...'}</Text>
									<Feather name="search" size={16} color="#999" />
								</TouchableOpacity>
							</View>

							<View style={{ flexDirection: 'row', marginTop: 30, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalVisible(false)}>
									<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1.5, marginTop: 0, height: 50 }]} onPress={salvarReformador} disabled={isSaving}>
									{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
								</TouchableOpacity>
							</View>
						</ScrollView>
					</KeyboardAvoidingView>

					{/* ModalBuscaDinamica genérico substituindo a busca manual de cidades */}
					<ModalBuscaDinamica
						visible={modalBuscaVisible}
						onClose={() => setModalBuscaVisible(false)}
						titulo="Selecionar Cidade"
						dados={resultadosBusca}
						onSelect={selecionarItemBusca}
						isLoading={isSearching}
						onSearchChange={buscarDinamicaNoBanco}
						placeholderBusca="Buscar cidade..."
					/>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', padding: 20, elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },

	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },
	fakeInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },

	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	inputGroupFull: { width: '100%' },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardHeader: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
	cardSubTitle: { fontSize: 13, color: '#666', marginTop: 4 },
	cardBody: { padding: 15 },
	cardText: { fontSize: 14, color: '#444', marginBottom: 4 },

	cardActions: { padding: 10, backgroundColor: '#fafafa', alignItems: 'flex-end', borderTopWidth: 1, borderColor: '#eee' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%' },

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

	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});