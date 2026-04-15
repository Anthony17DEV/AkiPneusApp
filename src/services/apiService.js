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
		try {
			const cacheBuster = new Date().getTime();
			const response = await api.post(`api_login.php?v=${cacheBuster}`, { login: usuario, senha });
			return parseData(response.data);
		} catch (error) {
			console.error('Erro no login:', error);
			return { success: false, message: 'Erro de conexão no login.' };
		}
	},

	buscarVeiculo: async (termo) => {
		try {
			const response = await api.post('api_veiculo_buscar.php', { busca: termo });
			return parseData(response.data);
		} catch (error) {
			console.error('Erro na busca de veículo:', error);
			return { success: false, message: 'Erro ao buscar veículo.' };
		}
	},

	buscarDashboard: async (userId) => {
		try {
			const response = await api.post('api_dashboard.php', { user_id: userId });
			return parseData(response.data);
		} catch (error) {
			console.error('Erro no dashboard:', error);
			return { success: false, message: 'Erro de conexão no dashboard.' };
		}
	},

	alterarSenha: async (userId, novaSenha) => {
		try {
			const response = await api.post('api_perfil_senha.php', { user_id: userId, nova_senha: novaSenha });
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao alterar senha:', error);
			return { success: false, message: 'Erro de conexão ao alterar a senha.' };
		}
	},

	atualizarFoto: async (userId, base64Image) => {
		try {
			const response = await api.post('api_perfil_foto.php', { user_id: userId, foto_base64: base64Image });
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao enviar foto:', error);
			return { success: false, message: 'Erro de conexão ao enviar a foto.' };
		}
	},

	buscarClientes: async (userId, userNivel, filtros = {}, pagina = 1) => {
		try {
			const response = await api.post('api_clientes.php', {
				user_id: userId,
				pagina: pagina,
				...filtros
			});
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao buscar clientes:', error);
			return { success: false, message: 'Erro de conexão com o servidor.' };
		}
	},

	cadastrarCliente: async (dadosCliente, userId) => {
		try {
			const response = await api.post('api_cliente_cadastrar.php', {
				...dadosCliente,
				user_id: userId
			});
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao cadastrar cliente:', error);
			return { success: false, message: 'Erro de conexão no cadastro.' };
		}
	},

	buscarClientePorId: async (clienteId) => {
		try {
			const response = await api.post('api_cliente_detalhes.php', { cliente_id: clienteId });
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao buscar detalhes:', error);
			return { success: false, message: 'Erro de conexão.' };
		}
	},

	modificarCliente: async (dadosCliente, userId) => {
		try {
			const response = await api.post('api_cliente_modificar.php', { ...dadosCliente, user_id: userId });
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao modificar cliente:', error);
			return { success: false, message: 'Erro na edição.' };
		}
	}
};