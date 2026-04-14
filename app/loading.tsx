import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

import Fundo from '../assets/images/loaderBgDark.png';
import LoaderGif from '../assets/images/loading.gif';

export default function LoadingScreen() {
	const { usuario, senha } = useLocalSearchParams();
	const router = useRouter();
	const { signIn } = useAuth();

	useEffect(() => {
		const attemptLogin = async () => {
			if (usuario && senha) {
				try {
					const result = await signIn({
						usuario: String(usuario),
						senha: String(senha)
					});

					if (result === false) {
						throw new Error('Falha na autenticação.');
					}

				} catch (error: any) {
					router.replace({
						pathname: '/login',
						params: { error: error.message || 'Não foi possível entrar. Verifique seus dados.' }
					});
				}
			} else {
				router.replace({
					pathname: '/login',
					params: { error: 'Dados de login incompletos.' }
				});
			}
		};

		const timer = setTimeout(() => {
			attemptLogin();
		}, 500);

		return () => clearTimeout(timer);
	}, [usuario, senha]);

	return (
		<ImageBackground source={Fundo} style={styles.background}>
			<View style={styles.container}>
				<Image source={LoaderGif} style={styles.gif} transition={500} />
			</View>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	gif: { width: 150, height: 150 },
});