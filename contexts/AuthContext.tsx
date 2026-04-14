import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../src/services/apiService';

interface UserData {
	id: string | number;
	login: string;
	nivel: string;
	nome: string;
	email: string;
	telefone?: string;
	cpf?: string;
	foto?: string;
	status: string;
}

interface AuthContextData {
	user: UserData | null;
	isLoading: boolean;
	signIn: (credentials: any) => Promise<boolean>;
	signOut: () => void;
	updateUser: (newUserData: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		async function loadUserFromStorage() {
			const storedUserData = await SecureStore.getItemAsync('userData');
			if (storedUserData) {
				setUser(JSON.parse(storedUserData));
			}
			setIsLoading(false);
		}
		loadUserFromStorage();
	}, []);

	const signIn = async ({ usuario, senha }: any): Promise<boolean> => {
		try {
			if (!usuario || !senha) {
				throw new Error("Por favor, preencha usuário e senha.");
			}

			const response = await apiService.login(usuario, senha);

			if (response.success) {
				const loggedUser = response.userData;

				setUser(loggedUser);
				await SecureStore.setItemAsync('userData', JSON.stringify(loggedUser));

				router.replace('/(app)');
				return true;
			} else {
				throw new Error(response.message);
			}
		} catch (error: any) {
			console.error("Erro ao fazer login:", error);
			router.replace({
				pathname: '/login',
				params: { error: error.message || 'Falha na comunicação.' },
			});
			return false;
		}
	};

	const signOut = async () => {
		setUser(null);
		await SecureStore.deleteItemAsync('userData');
		router.replace('/login');
	};

	const updateUser = async (newUserData: Partial<UserData>) => {
		if (!user) return;

		const updatedUser = { ...user, ...newUserData };
		setUser(updatedUser);

		try {
			await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
			console.log("Storage atualizado com:", newUserData);
		} catch (e) {
			console.error("Erro ao salvar no SecureStore:", e);
		}
	};

	return (
		<AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}