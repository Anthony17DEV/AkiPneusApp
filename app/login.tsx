import { Feather, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

import FundoLogin from '../assets/images/fundo_distribuidora.png';
import Logo from '../assets/images/logo_akipneus.png';
import { FooterText } from '../components/FooterText';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
	const [usuario, setUsuario] = useState('');
	const [senha, setSenha] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { signIn } = useAuth();
	const router = useRouter();
	const params = useLocalSearchParams();

	useEffect(() => {
		if (params.error) {
			Alert.alert('Erro de Login', params.error as string);
		}
	}, [params.error]);

	const handleLogin = async () => {
		if (!usuario.trim() || !senha.trim()) {
			Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
			return;
		}

		setIsLoading(true);

		const sucesso = await signIn({ usuario, senha });

		setIsLoading(false);

		if (sucesso) {
			router.replace('/(app)');
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

					<Text style={styles.title}>Acesso ao Sistema</Text>

					<View style={styles.inputContainer}>
						<FontAwesome name="user" size={20} color="#888" style={styles.icon} />
						<TextInput
							style={styles.input}
							value={usuario}
							onChangeText={setUsuario}
							placeholder="Usuário"
							placeholderTextColor="#BBB"
							autoCapitalize="none"
						/>
					</View>

					<View style={styles.inputContainer}>
						<FontAwesome name="lock" size={20} color="#888" style={styles.icon} />
						<TextInput
							style={styles.input}
							value={senha}
							onChangeText={setSenha}
							secureTextEntry={!isPasswordVisible}
							placeholder="Senha"
							placeholderTextColor="#BBB"
							autoCapitalize="none"
							onSubmitEditing={handleLogin}
						/>
						<TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
							<Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#888" />
						</TouchableOpacity>
					</View>

					<View style={styles.actionsContainer}>
						<TouchableOpacity
							style={[styles.button, isLoading && styles.buttonDisabled]}
							onPress={handleLogin}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>Entrar</Text>
							)}
						</TouchableOpacity>
						<TouchableOpacity onPress={() => router.push('./esqueci-senha')}>
							<Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
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
	title: { fontSize: 16, color: '#666', alignSelf: 'center', marginBottom: 20, fontWeight: '500' },
	inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#000000', borderRadius: 5, height: 45, backgroundColor: '#f9f9f9', marginBottom: 15 },
	icon: { padding: 10 },
	input: { flex: 1, paddingVertical: 10, paddingRight: 10, fontSize: 16, color: '#333' },
	actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
	button: { backgroundColor: '#ED1C24', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 5, minWidth: 100, alignItems: 'center', justifyContent: 'center', height: 48 },
	buttonDisabled: { opacity: 0.7 },
	buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
	forgotPasswordText: { color: '#ED1C24', fontSize: 14 },
	eyeIcon: { padding: 10 },
});