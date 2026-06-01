import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LogoSolutires from '../../assets/images/solutires.png';
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
	const API_URL = 'https://sistemascactus.com/apicactus/akipneus/api_reformadores.php';

	const [reformadores, setReformadores] = useState<Reformador[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [filtroBusca, setFiltroBusca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);

	const [form, setForm] = useState({
		id: '', nome: '', documento: '', telefone: '', cidade_nome: '', cidade_id: ''
	});

	const [cidadesResultados, setCidadesResultados] = useState<any[]>([]);

	const aplicarMascaraDocumento = (texto: string) => {
		let v = texto.replace(/\D/g, '');
		if (v.length <= 11) {
			v = v.replace(/(\d{3})(\d)/, '$1.$2');
			v = v.replace(/(\d{3})(\d)/, '$1.$2');
			v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
		} else {
			v = v.replace(/^(\d{2})(\d)/, '$1.$2');
			v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
			v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
			v = v.replace(/(\d{4})(\d)/, '$1-$2');
		}
		return v.substring(0, 18);
	};

	const aplicarMascaraTelefone = (texto: string) => {
		let v = texto.replace(/\D/g, '');
		v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
		v = v.replace(/(\d)(\d{4})$/, '$1-$2');
		return v.substring(0, 15);
	};

	const carregarReformadores = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'listar', busca: filtroBusca })
			});
			const res = await response.json();
			if (res.success) {
				setReformadores(res.data);
			} else {
				setReformadores([]);
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha ao buscar os reformadores.');
		}
		setIsLoading(false);
	};

	useEffect(() => {
		carregarReformadores();
	}, []);

	const resetForm = () => {
		setForm({ id: '', nome: '', documento: '', telefone: '', cidade_nome: '', cidade_id: '' });
		setCidadesResultados([]);
	};

	const handleEditar = (item: Reformador) => {
		resetForm();
		setForm({
			id: String(item.id),
			nome: item.nome,
			documento: item.documento || '',
			telefone: item.telefone || '',
			cidade_nome: item.cidade_nome ? `${item.cidade_nome} - ${item.cidade_uf}` : '',
			cidade_id: item.cidade_id ? String(item.cidade_id) : ''
		});
		setModalVisible(true);
	};

	const excluirReformador = (id: number, nome: string) => {
		Alert.alert('Atenção', `Deseja realmente excluir o reformador "${nome}"?`, [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir', style: 'destructive', onPress: async () => {
					try {
						const response = await fetch(API_URL, {
							method: 'POST', headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ acao: 'excluir', id: id })
						});
						const res = await response.json();
						if (res.success) {
							Alert.alert('Sucesso', 'Reformador excluído.');
							carregarReformadores();
						} else {
							Alert.alert('Erro', res.message);
						}
					} catch (error) {
						Alert.alert('Erro', 'Falha ao excluir o reformador.');
					}
				}
			}
		]);
	};

	const salvarReformador = async () => {
		if (!form.nome.trim()) {
			Alert.alert('Atenção', 'O Nome do reformador é obrigatório.');
			return;
		}

		setIsSaving(true);
		try {
			const payload = {
				acao: form.id ? 'atualizar' : 'inserir',
				...form
			};

			const response = await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const res = await response.json();

			if (res.success) {
				Alert.alert('Sucesso', res.message);
				setModalVisible(false);
				carregarReformadores();
			} else {
				Alert.alert('Erro', res.message || 'Falha ao salvar.');
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha na conexão com o servidor.');
		}
		setIsSaving(false);
	};

	const buscarCidadeDinamica = async (termo: string) => {
		setForm({ ...form, cidade_nome: termo });

		if (termo.trim().length < 2) {
			setCidadesResultados([]);
			return;
		}

		const res = await apiService.buscarDinamica('cidade', termo);
		if (res && res.success) {
			setCidadesResultados(res.data);
		} else {
			setCidadesResultados([]);
		}
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={reformadores}
				keyExtractor={(item, index) => String(item.id || index)}
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Gerenciar Reformadores</Text>

						<View style={styles.inputGroupFull}>
							<Text style={styles.label}>Buscar Empresa</Text>
							<TextInput
								style={styles.input}
								placeholder="Nome ou CNPJ..."
								value={filtroBusca}
								onChangeText={setFiltroBusca}
							/>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={carregarReformadores}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.btnInserir} onPress={() => { resetForm(); setModalVisible(true); }}>
								<Feather name="plus-circle" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir</Text>
							</TouchableOpacity>
						</View>

						<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: -5 }]}>
							Resultados ({reformadores.length})
						</Text>

						{isLoading && reformadores.length === 0 && <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#0c6ead" /><Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text></View>}
					</View>
				}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<View style={{ flex: 1 }}>
								<Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
									<Feather name="file-text" size={14} color="#666" style={{ marginRight: 6 }} />
									<Text style={styles.cardSubTitle} numberOfLines={1}>{item.documento || 'CNPJ Não informado'}</Text>
								</View>
							</View>
							<View style={styles.statusBadge}>
								<Text style={styles.statusText}>Reformador</Text>
							</View>
						</View>

						<View style={styles.cardInfoBox}>
							<View style={styles.cardInfoRow}>
								<Feather name="map-pin" size={14} color="#666" style={{ marginRight: 8 }} />
								<Text style={styles.cardInfoText}>{item.cidade_nome ? `${item.cidade_nome} - ${item.cidade_uf}` : 'Cidade não informada'}</Text>
							</View>
							<View style={styles.cardInfoRow}>
								<Feather name="phone" size={14} color="#666" style={{ marginRight: 8 }} />
								<Text style={styles.cardInfoText}>{item.telefone || 'Sem telefone'}</Text>
							</View>
						</View>

						<View style={styles.cardActions}>
							<View style={styles.actionButtonsRow}>
								<TouchableOpacity style={styles.btnEditarCard} onPress={() => handleEditar(item)}>
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
				ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum reformador encontrado.</Text> : null}
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
							<Text style={styles.groupTitle}>{form.id ? 'Editar Reformador' : 'Novo Reformador'}</Text>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Nome da Empresa (Razão Social ou Fantasia)</Text>
								<TextInput
									style={styles.input}
									value={form.nome}
									onChangeText={t => setForm({ ...form, nome: t })}
									placeholder="Ex: Renovadora Pneus..."
								/>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>CNPJ / CPF</Text>
									<TextInput
										style={styles.input}
										keyboardType="numeric"
										value={form.documento}
										onChangeText={t => setForm({ ...form, documento: aplicarMascaraDocumento(t) })}
										placeholder="00.000.000/0001-00"
									/>
								</View>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>Telefone</Text>
									<TextInput
										style={styles.input}
										keyboardType="phone-pad"
										value={form.telefone}
										onChangeText={t => setForm({ ...form, telefone: aplicarMascaraTelefone(t) })}
										placeholder="(00) 00000-0000"
									/>
								</View>
							</View>

							<View style={[styles.inputGroupFull, { zIndex: 999 }]}>
								<Text style={styles.label}>Cidade (Opcional)</Text>
								<TextInput
									style={[styles.input, cidadesResultados.length > 0 && { marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}
									value={form.cidade_nome}
									onChangeText={buscarCidadeDinamica}
									placeholder="Digite para buscar a cidade..."
								/>

								{cidadesResultados.length > 0 && (
									<View style={{ maxHeight: 160, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderTopWidth: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, marginBottom: 15 }}>
										<ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
											{cidadesResultados.map((cid, idx) => (
												<TouchableOpacity
													key={idx}
													style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
													onPress={() => {
														setForm({ ...form, cidade_nome: cid.nome, cidade_id: cid.id });
														setCidadesResultados([]);
													}}
												>
													<Text style={{ color: '#333', fontSize: 14 }}>{cid.nome}</Text>
												</TouchableOpacity>
											))}
										</ScrollView>
									</View>
								)}
							</View>

							<View style={{ flexDirection: 'row', marginTop: 30, gap: 10, zIndex: -1 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalVisible(false)}>
									<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1.5, marginTop: 0, height: 50 }]} onPress={salvarReformador} disabled={isSaving}>
									{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
								</TouchableOpacity>
							</View>
						</ScrollView>
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
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	inputGroupFull: { width: '100%', marginBottom: 5 },
	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },

	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginRight: 10 },
	btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
	btnInserir: { flex: 1, backgroundColor: '#63c77b', borderWidth: 1, borderColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginLeft: 10 },
	btnInserirText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, marginHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2.22, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	cardSubTitle: { fontSize: 13, fontWeight: '600', color: '#666' },
	statusBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
	statusText: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32' },

	cardInfoBox: { paddingHorizontal: 15, paddingBottom: 10 },
	cardInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
	cardInfoText: { fontSize: 14, color: '#555', marginLeft: 8 },

	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa', alignItems: 'flex-end' },
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

	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});