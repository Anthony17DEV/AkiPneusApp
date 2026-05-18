import { Feather, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	KeyboardAvoidingView,
	Platform,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import { apiService } from '../src/services/apiService';

import FundoLogin from '../assets/images/fundo_distribuidora.png';
import Logo from '../assets/images/solutires.png';
import { FooterText } from '../components/FooterText';

export default function EsqueciSenhaScreen() {
	const [usuario, setUsuario] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleRecuperar = async () => {
		if (!usuario.trim()) {
			Alert.alert('Atenção', 'Por favor, informe seu usuário ou e-mail.');
			return;
		}

		setIsLoading(true);

		const response = await apiService.recuperarSenha(usuario.trim());

		setIsLoading(false);

		if (response && response.success) {
			Alert.alert(
				'Sucesso!',
				response.message || 'Sua nova senha foi gerada. Verifique seu e-mail ou contate o administrador.',
				[{ text: 'Voltar ao Login', onPress: () => router.back() }]
			);
		} else {
			Alert.alert('Erro', response?.message || 'Não foi possível recuperar a senha. Verifique o usuário informado.');
		}
	};

	return (
		<View style={styles.container}>
			<Image source={FundoLogin} style={styles.backgroundImage} resizeMode="cover" />
			<StatusBar barStyle="light-content" />

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardView}
			>
				<View style={styles.formContainer}>
					<View style={styles.logoContainer}>
						<Image source={Logo} style={styles.logoImage} />
					</View>

					<Text style={styles.title}>Recuperar Senha</Text>

					<Text style={styles.description}>
						Digite seu usuário ou e-mail abaixo. Enviaremos as instruções de recuperação para você.
					</Text>

					<View style={styles.inputContainer}>
						<FontAwesome name="envelope" size={18} color="#888" style={styles.icon} />
						<TextInput
							style={styles.input}
							value={usuario}
							onChangeText={setUsuario}
							placeholder="Usuário ou Email"
							placeholderTextColor="#BBB"
							autoCapitalize="none"
							onSubmitEditing={handleRecuperar}
						/>
					</View>

					<View style={styles.actionsContainer}>
						<TouchableOpacity
							style={styles.backButton}
							onPress={() => router.back()}
							disabled={isLoading}
						>
							<Feather name="arrow-left" size={18} color="#666" style={{ marginRight: 5 }} />
							<Text style={styles.backButtonText}>Voltar</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.button, isLoading && styles.buttonDisabled]}
							onPress={handleRecuperar}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>Enviar</Text>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>

			<FooterText />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	backgroundImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
	keyboardView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	formContainer: { width: '85%', backgroundColor: 'white', borderRadius: 10, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
	logoContainer: { alignSelf: 'center', marginBottom: 20 },
	logoImage: { width: 150, height: 60, resizeMode: 'contain' },
	title: { fontSize: 18, color: '#333', alignSelf: 'center', marginBottom: 10, fontWeight: 'bold' },
	description: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
	inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#000000', borderRadius: 5, height: 45, backgroundColor: '#f9f9f9', marginBottom: 20 },
	icon: { padding: 10, paddingHorizontal: 12 },
	input: { flex: 1, paddingVertical: 10, paddingRight: 10, fontSize: 16, color: '#333' },
	actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
	button: { backgroundColor: '#0c6ead', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 5, minWidth: 110, alignItems: 'center', justifyContent: 'center', height: 48 },
	buttonDisabled: { opacity: 0.7 },
	buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
	backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10 },
	backButtonText: { color: '#666', fontSize: 15, fontWeight: '600' },
});