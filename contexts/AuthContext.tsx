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
	empresa_id?: number;
	empresa_nome?: string;
	empresa_foto?: string;
}

interface AuthContextData {
	user: UserData | null;
	isLoading: boolean;
	signIn: (credentials: any) => Promise<{ success: boolean; message?: string }>;
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

	const signIn = async ({ codigoEmpresa, usuario, senha }: any): Promise<{ success: boolean; message?: string }> => {
		try {
			if (!codigoEmpresa || !usuario || !senha) {
				return { success: false, message: "Por favor, preencha o código da empresa, usuário e senha." };
			}

			const response = await apiService.login(codigoEmpresa, usuario, senha);

			if (response.success) {
				const loggedUser = response.userData;

				setUser(loggedUser);
				await SecureStore.setItemAsync('userData', JSON.stringify(loggedUser));

				router.replace('/(app)');
				return { success: true };
			} else {
				return { success: false, message: response.message };
			}
		} catch (error: any) {
			console.error("Erro ao fazer login:", error);
			return { success: false, message: error.message || 'Falha na comunicação.' };
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