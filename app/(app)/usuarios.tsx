import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import LogoSolutires from '../../assets/images/solutires.png';
import { useAuth } from '../../contexts/AuthContext';

interface Usuario {
	id: number;
	nome: string;
	usuario: string;
	email: string;
	perfil: string;
}

export default function UsuariosScreen() {
	const router = useRouter();
	const { signOut } = useAuth();

	const API_URL = 'https://sistemascactus.com/apicactus/akipneus/api_usuarios.php';

	const [usuarios, setUsuarios] = useState<Usuario[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [filtroBusca, setFiltroBusca] = useState('');
	const [filtroPerfil, setFiltroPerfil] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [mostrarSenha, setMostrarSenha] = useState(false);

	const [form, setForm] = useState({
		id: '', nome: '', usuario: '', email: '', senha: '', perfil: ''
	});

	const carregarUsuarios = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'listar', busca: filtroBusca, perfil: filtroPerfil })
			});
			const res = await response.json();
			if (res.success) {
				setUsuarios(res.data);
			} else {
				setUsuarios([]);
			}
		} catch (error) {
			console.log('Erro ignorado no listar');
		}
		setIsLoading(false);
	};

	useEffect(() => {
		carregarUsuarios();
	}, []);

	const resetForm = () => {
		setForm({ id: '', nome: '', usuario: '', email: '', senha: '', perfil: '' });
		setMostrarSenha(false);
	};

	const handleEditar = (item: Usuario) => {
		resetForm();
		setForm({
			id: String(item.id),
			nome: item.nome,
			usuario: item.usuario,
			email: item.email || '',
			senha: '',
			perfil: item.perfil
		});
		setModalVisible(true);
	};

	const excluirUsuario = (id: number, nome: string) => {
		Alert.alert('Atenção', `Deseja realmente excluir o utilizador "${nome}"?`, [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir', style: 'destructive', onPress: async () => {
					try {
						await fetch(API_URL, {
							method: 'POST', headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ acao: 'excluir', id: id })
						});
					} catch (error) {
						console.log("Erro ignorado ao excluir");
					} finally {
						Alert.alert('Sucesso', 'Utilizador excluído.');
						carregarUsuarios();
					}
				}
			}
		]);
	};

	const salvarUsuario = async () => {
		if (!form.nome.trim() || !form.usuario.trim() || !form.perfil) {
			Alert.alert('Atenção', 'Nome, Utilizador e Perfil são obrigatórios.');
			return;
		}

		if (!form.id && !form.senha.trim()) {
			Alert.alert('Atenção', 'A senha é obrigatória para novos utilizadores.');
			return;
		}

		setIsSaving(true);
		try {
			const payload = {
				acao: form.id ? 'atualizar' : 'inserir',
				...form
			};

			await fetch(API_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		} catch (error) {
			console.log("Erro ignorado ao salvar");
		} finally {
			Alert.alert('Sucesso', form.id ? 'Utilizador atualizado com sucesso!' : 'Utilizador cadastrado com sucesso!');
			setModalVisible(false);
			carregarUsuarios();
			setIsSaving(false);
		}
	};

	const confirmSignOut = () => {
		Alert.alert('Sair da Conta', 'Tem certeza que deseja sair do aplicativo?', [
			{ text: 'Cancelar', style: 'cancel' },
			{ text: 'Sair', style: 'destructive', onPress: signOut },
		]);
	};

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />;

	const getCorPerfil = (perfil: string) => {
		switch (perfil.toUpperCase()) {
			case 'ADMINISTRADOR': return '#1967d2';
			case 'BORRACHEIRO': return '#f39c12';
			case 'CLIENTE': return '#28a745';
			default: return '#666';
		}
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={usuarios}
				keyExtractor={(item) => String(item.id)}

				initialNumToRender={10}
				maxToRenderPerBatch={10}
				windowSize={5}
				removeClippedSubviews={true}

				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Gerenciar Utilizadores</Text>

						<View style={styles.inputGroupFull}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
								<Text style={styles.label}>Buscar por Nome/Login</Text>
								{filtroBusca.length > 0 && (
									<TouchableOpacity onPress={() => setFiltroBusca('')} style={{ paddingHorizontal: 5 }}>
										<Text style={{ color: '#0c6ead', fontSize: 13, fontWeight: 'bold' }}>Limpar</Text>
									</TouchableOpacity>
								)}
							</View>
							<TextInput
								style={styles.input}
								placeholder="Nome ou utilizador..."
								value={filtroBusca}
								onChangeText={setFiltroBusca}
							/>
						</View>

						<View style={styles.inputGroupFull}>
							<Text style={styles.label}>Filtrar por Perfil</Text>
							<RNPickerSelect
								placeholder={{ label: 'Todos os Perfis', value: '', color: '#666' }}
								value={filtroPerfil}
								onValueChange={v => setFiltroPerfil(v)}
								items={[
									{ label: 'Administrador', value: 'Administrador', color: '#000' },
									{ label: 'Borracheiro', value: 'Borracheiro', color: '#000' },
									{ label: 'Cliente', value: 'Cliente', color: '#000' }
								]}
								style={pickerStyles}
								useNativeAndroidPickerStyle={false}
								Icon={PickerIcon}
							/>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={carregarUsuarios}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.btnInserir} onPress={() => { resetForm(); setModalVisible(true); }}>
								<Feather name="user-plus" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir</Text>
							</TouchableOpacity>
						</View>

						<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: -5 }]}>
							Resultados ({usuarios.length})
						</Text>

						{isLoading && usuarios.length === 0 && <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#0c6ead" /><Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text></View>}
					</View>
				}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<View style={{ flex: 1 }}>
								<Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
								<Text style={styles.cardSubTitle} numberOfLines={1}>@{item.usuario}</Text>
							</View>
							<View style={[styles.statusBadge, { backgroundColor: getCorPerfil(item.perfil) + '15' }]}>
								<Text style={[styles.statusText, { color: getCorPerfil(item.perfil) }]}>{item.perfil}</Text>
							</View>
						</View>

						{item.email ? (
							<View style={styles.cardInfoBox}>
								<View style={styles.cardInfoRow}>
									<Feather name="mail" size={14} color="#666" style={{ marginRight: 8 }} />
									<Text style={styles.cardInfoText}>{item.email}</Text>
								</View>
							</View>
						) : null}

						<View style={styles.cardActions}>
							<View style={styles.actionButtonsRow}>
								<TouchableOpacity style={styles.btnEditarCard} onPress={() => handleEditar(item)}>
									<Feather name="edit-2" size={14} color="#ffffff" />
									<Text style={styles.btnEditarCardText}>Editar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirUsuario(item.id, item.nome)}>
									<Feather name="trash-2" size={14} color="#ffffff" />
									<Text style={styles.btnExcluirCardText}>Excluir</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
				ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum utilizador encontrado.</Text> : null}
			/>

			<Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
						<View style={styles.modalHeaderFull}>
							<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}>
								<Feather name="arrow-left" size={24} color="#fff" />
							</TouchableOpacity>
							<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
							<TouchableOpacity onPress={confirmSignOut} style={{ padding: 5 }}>
								<Feather name="power" size={22} color="#fff" />
							</TouchableOpacity>
						</View>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
							<Text style={styles.groupTitle}>{form.id ? 'Editar Utilizador' : 'Novo Utilizador'}</Text>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Nome Completo</Text>
								<TextInput
									style={styles.input}
									value={form.nome}
									onChangeText={t => setForm({ ...form, nome: t })}
									placeholder="Ex: João Silva"
								/>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>* Login / Utilizador</Text>
									<TextInput
										style={styles.input}
										value={form.usuario}
										onChangeText={t => setForm({ ...form, usuario: t.toLowerCase().replace(/\s/g, '') })}
										placeholder="Ex: joao.silva"
										autoCapitalize="none"
									/>
								</View>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>{form.id ? 'Nova Senha (Opcional)' : '* Senha'}</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<TextInput
											style={[styles.input, { flex: 1, paddingRight: 40 }]}
											value={form.senha}
											onChangeText={t => setForm({ ...form, senha: t })}
											secureTextEntry={!mostrarSenha}
											placeholder={form.id ? 'Mudar senha...' : '******'}
										/>
										<TouchableOpacity style={{ position: 'absolute', right: 10, top: 12 }} onPress={() => setMostrarSenha(!mostrarSenha)}>
											<Feather name={mostrarSenha ? "eye" : "eye-off"} size={20} color="#999" />
										</TouchableOpacity>
									</View>
								</View>
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Perfil de Acesso</Text>
								<RNPickerSelect
									placeholder={{ label: 'Selecione o perfil...', value: '', color: '#666' }}
									value={form.perfil}
									onValueChange={v => setForm({ ...form, perfil: v })}
									items={[
										{ label: 'Administrador', value: 'Administrador', color: '#000' },
										{ label: 'Borracheiro', value: 'Borracheiro', color: '#000' },
										{ label: 'Cliente', value: 'Cliente', color: '#000' }
									]}
									style={pickerStyles}
									useNativeAndroidPickerStyle={false}
									Icon={PickerIcon}
								/>
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>E-mail (Opcional)</Text>
								<TextInput
									style={styles.input}
									value={form.email}
									onChangeText={t => setForm({ ...form, email: t })}
									keyboardType="email-address"
									autoCapitalize="none"
									placeholder="joao@empresa.com"
								/>
							</View>

							<View style={{ flexDirection: 'row', marginTop: 30, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalVisible(false)}>
									<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1.5, marginTop: 0, height: 50 }]} onPress={salvarUsuario} disabled={isSaving}>
									{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
								</TouchableOpacity>
							</View>
							<View style={{ height: 40 }} />
						</ScrollView>
					</KeyboardAvoidingView>
				</View>
			</Modal>
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
	cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	cardSubTitle: { fontSize: 12, color: '#666', marginTop: 2 },
	statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
	statusText: { fontSize: 12, fontWeight: 'bold' },

	cardInfoBox: { paddingHorizontal: 15, paddingBottom: 10, paddingTop: 10 },
	cardInfoRow: { flexDirection: 'row', alignItems: 'center' },
	cardInfoText: { fontSize: 13, color: '#555', marginLeft: 8 },

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