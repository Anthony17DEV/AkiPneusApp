import axios from 'axios';

const BASE_URL = 'https://sistemascactus.com/apicactus/akipneus/';

export const api = axios.create({
	baseURL: BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	}
});

const parseData = (data) => {
	if (typeof data === 'string') {
		try { return JSON.parse(data.trim()); } catch (e) { return data; }
	}
	return data;
};

export const apiService = {
	login: async (usuario, senha) => {
		const cacheBuster = new Date().getTime();
		const response = await api.post(`api_login.php?v=${cacheBuster}`, { login: usuario, senha });
		return parseData(response.data);
	},

	buscarVeiculo: async (termo) => {
		try {
			const response = await api.post('api_veiculo_buscar.php', { busca: termo });
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro ao buscar veículo.' };
		}
	}
};