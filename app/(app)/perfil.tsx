import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';

export default function PerfilScreen() {
	const { user, signOut, updateUser } = useAuth();

	const URL_FOTOS = 'https://sistemascactus.com/apicactus/akipneus/fotos/';

	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	const [isUploading, setIsUploading] = useState(false);
	const [modalSenhaVisible, setModalSenhaVisible] = useState(false);
	const [novaSenha, setNovaSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [isSalvandoSenha, setIsSalvandoSenha] = useState(false);

	const handleLogout = () => {
		Alert.alert(
			"Sair da Conta",
			"Tem certeza que deseja sair do aplicativo?",
			[
				{ text: "Cancelar", style: "cancel" },
				{ text: "Sim, Sair", onPress: signOut, style: 'destructive' }
			]
		);
	};

	const handlePickImage = () => {
		Alert.alert(
			"Alterar Foto de Perfil",
			"Escolha a origem da imagem:",
			[
				{ text: "Câmera", onPress: abrirCamera },
				{ text: "Galeria", onPress: abrirGaleria },
				{ text: "Cancelar", style: "cancel" }
			]
		);
	};

	const abrirCamera = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Atenção', 'Precisamos da permissão da câmera para tirar a foto.');
			return;
		}

		let result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.2,
			base64: true,
		});

		if (!result.canceled && result.assets[0].base64) {
			enviarFoto(result.assets[0].base64);
		}
	};

	const abrirGaleria = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Atenção', 'Precisamos da permissão da galeria para selecionar a foto.');
			return;
		}

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.2,
			base64: true,
		});

		if (!result.canceled && result.assets[0].base64) {
			enviarFoto(result.assets[0].base64);
		}
	};

	const enviarFoto = async (base64Image: string) => {
		setIsUploading(true);
		try {
			const res = await apiService.atualizarFoto(user?.id, base64Image);

			if (!isMounted.current) return;

			if (res && res.success) {
				if (updateUser) {
					updateUser({ ...user, foto: res.foto_nome });
				}
				Alert.alert('Sucesso', 'Sua foto de perfil foi atualizada com sucesso!');
			} else {
				Alert.alert('Erro', res?.message || 'Falha ao atualizar a foto.');
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha na comunicação com o servidor.');
		} finally {
			if (isMounted.current) setIsUploading(false);
		}
	};

	const salvarSenha = async () => {
		if (!novaSenha || !confirmarSenha) {
			Alert.alert('Atenção', 'Preencha todos os campos da nova senha.');
			return;
		}
		if (novaSenha !== confirmarSenha) {
			Alert.alert('Atenção', 'As senhas não coincidem. Digite novamente.');
			return;
		}
		if (novaSenha.length < 4) {
			Alert.alert('Atenção', 'Sua senha deve ter pelo menos 4 caracteres.');
			return;
		}

		setIsSalvandoSenha(true);
		try {
			const res = await apiService.alterarSenha(user?.id, novaSenha);

			if (!isMounted.current) return;

			if (res && res.success) {
				Alert.alert('Sucesso', 'Sua senha foi alterada com segurança!');
				setModalSenhaVisible(false);
				setNovaSenha('');
				setConfirmarSenha('');
			} else {
				Alert.alert('Erro', res?.message || 'Falha ao alterar a senha.');
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha na comunicação com o servidor.');
		} finally {
			if (isMounted.current) setIsSalvandoSenha(false);
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

				<View style={styles.headerSection}>
					<TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer} disabled={isUploading}>
						{user?.foto ? (
							<Image source={{ uri: `${URL_FOTOS}${user.foto}` }} style={styles.avatar} />
						) : (
							<View style={[styles.avatar, styles.avatarPlaceholder]}>
								<Feather name="user" size={50} color="#999" />
							</View>
						)}

						{isUploading ? (
							<View style={styles.uploadingOverlay}>
								<ActivityIndicator size="large" color="#fff" />
							</View>
						) : (
							<View style={styles.editBadge}>
								<Feather name="camera" size={14} color="#fff" />
							</View>
						)}
					</TouchableOpacity>

					<Text style={styles.userName}>{user?.nome || 'Usuário SmartPneus'}</Text>
					<View style={styles.nivelBadge}>
						<Text style={styles.nivelText}>{user?.nivel || 'Analista'}</Text>
					</View>
				</View>

				<Text style={styles.sectionTitle}>Informações da Conta</Text>
				<View style={styles.cardInfo}>
					<View style={styles.infoRow}>
						<View style={styles.iconBox}>
							<Feather name="mail" size={20} color="#0c6ead" />
						</View>
						<View>
							<Text style={styles.infoLabel}>Login / E-mail</Text>
							<Text style={styles.infoValue}>{user?.login || user?.email || 'Não informado'}</Text>
						</View>
					</View>
					<View style={styles.divider} />
					<View style={styles.infoRow}>
						<View style={styles.iconBox}>
							<Feather name="shield" size={20} color="#0c6ead" />
						</View>
						<View>
							<Text style={styles.infoLabel}>Nível de Acesso</Text>
							<Text style={styles.infoValue}>{user?.nivel || 'Acesso Padrão'}</Text>
						</View>
					</View>
				</View>

				<Text style={styles.sectionTitle}>Segurança</Text>
				<TouchableOpacity style={styles.actionButton} onPress={() => setModalSenhaVisible(true)}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Feather name="lock" size={22} color="#555" />
						<Text style={styles.actionButtonText}>Alterar Senha de Acesso</Text>
					</View>
					<Feather name="chevron-right" size={20} color="#ccc" />
				</TouchableOpacity>

				<TouchableOpacity style={[styles.actionButton, { marginTop: 15 }]} onPress={handleLogout}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Feather name="log-out" size={22} color="#ED1C24" />
						<Text style={[styles.actionButtonText, { color: '#ED1C24' }]}>Sair da Conta</Text>
					</View>
				</TouchableOpacity>

			</ScrollView>

			<Modal visible={modalSenhaVisible} transparent={true} animationType="fade">
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<View style={styles.modalHeader}>
								<Text style={styles.modalTitle}>Alterar Senha</Text>
								<TouchableOpacity onPress={() => setModalSenhaVisible(false)}>
									<Feather name="x" size={24} color="#333" />
								</TouchableOpacity>
							</View>

							<Text style={styles.modalLabel}>Nova Senha</Text>
							<TextInput
								style={styles.modalInput}
								placeholder="Digite a nova senha"
								secureTextEntry
								value={novaSenha}
								onChangeText={setNovaSenha}
								autoCapitalize="none"
							/>

							<Text style={styles.modalLabel}>Confirmar Nova Senha</Text>
							<TextInput
								style={styles.modalInput}
								placeholder="Repita a nova senha"
								secureTextEntry
								value={confirmarSenha}
								onChangeText={setConfirmarSenha}
								autoCapitalize="none"
							/>

							<TouchableOpacity
								style={[styles.btnSalvar, isSalvandoSenha && { opacity: 0.7 }]}
								onPress={salvarSenha}
								disabled={isSalvandoSenha}
							>
								{isSalvandoSenha ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text style={styles.btnSalvarText}>Gravar</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8', paddingHorizontal: 20 },

	headerSection: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
	avatarContainer: { position: 'relative', marginBottom: 15 },
	avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#fff' },
	avatarPlaceholder: { backgroundColor: '#e1e4e8', justifyContent: 'center', alignItems: 'center' },
	uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
	editBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#0c6ead', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', elevation: 3 },
	nivelBadge: { backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
	nivelText: { color: '#0c6ead', fontSize: 12, fontWeight: 'bold' },
	btnSalvar: { backgroundColor: '#0c6ead', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
	userName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },

	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 10, marginTop: 15 },

	cardInfo: { backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2.22, elevation: 2, marginBottom: 20 },
	infoRow: { flexDirection: 'row', alignItems: 'center' },
	iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
	infoLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
	infoValue: { fontSize: 15, fontWeight: '500', color: '#333' },
	divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12, marginLeft: 55 },

	actionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2.22, elevation: 2 },
	actionButtonText: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 15 },

	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalContent: { backgroundColor: '#fff', width: '85%', borderRadius: 12, padding: 20 },
	modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	modalLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
	modalInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 50, fontSize: 15, color: '#333', marginBottom: 20 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});