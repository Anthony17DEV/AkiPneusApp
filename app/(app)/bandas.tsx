import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LogoSolutires from '../../assets/images/solutires.png';

interface Banda {
	id: number;
	marca: string;
	modelo: string;
	sulco: string;
	valor: string;
}

export default function BandasScreen() {
	const router = useRouter();
	const API_URL = 'https://sistemascactus.com/apicactus/akipneus/api_bandas.php';

	const [bandas, setBandas] = useState<Banda[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [filtroMarca, setFiltroMarca] = useState('');
	const [filtroModelo, setFiltroModelo] = useState('');

	const [modalVisible, setModalVisible] = useState(false);

	const [form, setForm] = useState({
		id: '', marca: '', modelo: '', sulco: '', valor: ''
	});

	const formatarMoeda = (text: string) => {
		let v = text.replace(/\D/g, '');
		if (v === '') return '';
		v = (parseInt(v, 10) / 100).toFixed(2).replace('.', ',');
		v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
		return v;
	};

	const formatarValorDB = (val: any) => {
		if (!val || val == 0) return '';
		let str = String(val).replace(',', '.');
		let num = parseFloat(str);
		if (isNaN(num)) return '';
		let formatado = num.toFixed(2).replace('.', ',');
		return formatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
	};

	const carregarBandas = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'listar', busca_marca: filtroMarca, busca_modelo: filtroModelo })
			});
			const res = await response.json();
			if (res.success) {
				setBandas(res.data);
			} else {
				setBandas([]);
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha ao buscar as bandas de rodagem.');
		}
		setIsLoading(false);
	};

	useEffect(() => {
		carregarBandas();
	}, []);

	const resetForm = () => {
		setForm({ id: '', marca: '', modelo: '', sulco: '', valor: '' });
	};

	const handleEditar = (item: Banda) => {
		resetForm();
		setForm({
			id: String(item.id),
			marca: item.marca,
			modelo: item.modelo,
			sulco: String(item.sulco),
			valor: formatarValorDB(item.valor)
		});
		setModalVisible(true);
	};

	const excluirBanda = (id: number, nome: string) => {
		Alert.alert('Atenção', `Deseja realmente excluir a banda "${nome}"?`, [
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
							Alert.alert('Sucesso', 'Banda excluída.');
							carregarBandas();
						} else {
							Alert.alert('Erro', res.message);
						}
					} catch (error) {
						Alert.alert('Erro', 'Falha ao excluir a banda.');
					}
				}
			}
		]);
	};

	const salvarBanda = async () => {
		if (!form.marca.trim() || !form.modelo.trim() || !form.sulco.trim()) {
			Alert.alert('Atenção', 'Marca, Modelo e Sulco são campos obrigatórios.');
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
				carregarBandas();
			} else {
				Alert.alert('Erro', res.message || 'Falha ao salvar.');
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha na conexão com o servidor.');
		}
		setIsSaving(false);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={bandas}
				keyExtractor={(item, index) => String(item.id || index)}
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Gerenciar Bandas de Rodagem</Text>

						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Filtro de Marca</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: Vipal, Drebor..."
									value={filtroMarca}
									onChangeText={setFiltroMarca}
								/>
							</View>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Filtro de Modelo</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: VRT3"
									value={filtroModelo}
									onChangeText={setFiltroModelo}
								/>
							</View>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={carregarBandas}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.btnInserir} onPress={() => { resetForm(); setModalVisible(true); }}>
								<Feather name="plus-circle" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir</Text>
							</TouchableOpacity>
						</View>

						<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: -5 }]}>
							Resultados ({bandas.length})
						</Text>

						{isLoading && bandas.length === 0 && <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#0c6ead" /><Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text></View>}
					</View>
				}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<View style={{ flex: 1 }}>
								<Text style={styles.cardTitle} numberOfLines={1}>{item.marca}</Text>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
									<MaterialCommunityIcons name="tire" size={14} color="#666" style={{ marginRight: 6 }} />
									<Text style={styles.cardSubTitle} numberOfLines={1}>Mod: {item.modelo}</Text>
								</View>
							</View>
							<View style={{ alignItems: 'flex-end' }}>
								<View style={styles.statusBadge}>
									<Text style={styles.statusText}>{item.sulco} mm</Text>
								</View>
								{Number(item.valor) > 0 && (
									<Text style={{ fontSize: 13, fontWeight: 'bold', color: '#2e7d32', marginTop: 5 }}>R$ {formatarValorDB(item.valor)}</Text>
								)}
							</View>
						</View>

						<View style={styles.cardActions}>
							<View style={styles.actionButtonsRow}>
								<TouchableOpacity style={styles.btnEditarCard} onPress={() => handleEditar(item)}>
									<Feather name="edit-2" size={14} color="#ffffff" />
									<Text style={styles.btnEditarCardText}>Editar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirBanda(item.id, `${item.marca} - ${item.modelo}`)}>
									<Feather name="trash-2" size={14} color="#ffffff" />
									<Text style={styles.btnExcluirCardText}>Excluir</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
				ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhuma banda de rodagem encontrada.</Text> : null}
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
							<Text style={styles.groupTitle}>{form.id ? 'Editar Banda' : 'Nova Banda de Rodagem'}</Text>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Marca da Banda</Text>
								<TextInput
									style={styles.input}
									value={form.marca}
									onChangeText={t => setForm({ ...form, marca: t })}
									placeholder="Ex: Vipal, Drebor..."
								/>
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Modelo da Banda</Text>
								<TextInput
									style={styles.input}
									value={form.modelo}
									onChangeText={t => setForm({ ...form, modelo: t })}
									placeholder="Ex: VRT3, D-902..."
								/>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>* Sulco (MM)</Text>
									<TextInput
										style={styles.input}
										keyboardType="numeric"
										value={form.sulco}
										onChangeText={t => setForm({ ...form, sulco: t.replace(/,/g, '.') })}
										placeholder="Ex: 14.5"
									/>
								</View>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>Valor (R$)</Text>
									<TextInput
										style={styles.input}
										keyboardType="numeric"
										value={form.valor}
										onChangeText={t => setForm({ ...form, valor: formatarMoeda(t) })}
										placeholder="0,00"
									/>
								</View>
							</View>

							<View style={{ flexDirection: 'row', marginTop: 30, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalVisible(false)}>
									<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1.5, marginTop: 0, height: 50 }]} onPress={salvarBanda} disabled={isSaving}>
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
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	cardSubTitle: { fontSize: 13, fontWeight: '600', color: '#666' },
	statusBadge: { backgroundColor: '#e8f0fe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
	statusText: { fontSize: 12, fontWeight: 'bold', color: '#1967d2' },

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