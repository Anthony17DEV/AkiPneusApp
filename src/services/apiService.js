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

	buscarVeiculo: async (filtros) => {
		try {
			const payload = typeof filtros === 'string' ? { busca: filtros } : filtros;
			const response = await api.post('api_veiculo_buscar.php', payload);
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
	},

	buscarPneusVeiculo: async (checklistId) => {
		try {
			const response = await api.post('api_pneus_buscar.php', { checklist_id: checklistId });
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao buscar pneus:', error);
			return { success: false, message: 'Erro de conexão.' };
		}
	},

	salvarInspecaoPneu: async (dadosPneu) => {
		try {
			const response = await api.post('api_pneu_salvar.php', dadosPneu);
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao salvar pneu:', error);
			return { success: false, message: 'Erro de conexão ao salvar.' };
		}
	},

	listarDanos: async (busca = '') => {
		try {
			const response = await api.post('api_motivo_recusa.php', { acao: 'listar', busca });
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao listar danos:', error);
			return { success: false, data: [] };
		}
	},
	salvarDano: async (dano) => {
		try {
			const response = await api.post('api_motivo_recusa.php', dano);
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao salvar dano:', error);
			return { success: false, message: 'Erro de conexão.' };
		}
	},
	excluirDano: async (id) => {
		try {
			const response = await api.post('api_motivo_recusa.php', { acao: 'excluir', id });
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao excluir dano:', error);
			return { success: false, message: 'Erro de conexão.' };
		}
	},

	salvarVeiculo: async (dadosVeiculo) => {
		try {
			const response = await api.post('api_veiculo_salvar.php', dadosVeiculo);
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao salvar veículo:', error);
			return { success: false, message: 'Erro de conexão ao salvar veículo.' };
		}
	},

	buscarDinamica: async (tipo, busca, extras = {}) => {
		try {
			const payload = { tipo, busca, ...extras };

			const response = await api.post('api_busca_dinamica.php', payload);
			return parseData(response.data);
		} catch (error) {
			return { success: false, data: [] };
		}
	},

	listarChecklists: async (veiculoId) => {
		try {
			const response = await api.post('api_checklist.php', { acao: 'listar', veiculo_id: veiculoId });
			return parseData(response.data);
		} catch (error) { return { success: false, data: [] }; }
	},

	iniciarChecklist: async (dados) => {
		try {
			const response = await api.post('api_checklist.php', { acao: 'iniciar', ...dados });
			return parseData(response.data);
		} catch (error) { return { success: false, message: 'Erro de conexão.' }; }
	},

	recuperarSenha: async (usuarioOuEmail) => {
		try {
			console.log("📤 Pedindo pra recuperar:", usuarioOuEmail);

			const response = await api.post('api_recuperar_senha.php', { usuario: usuarioOuEmail });

			console.log("📥 Resposta BRUTA do servidor:", response.data);

			if (typeof response.data === 'string' && !response.data.includes('"success"')) {
				return { success: false, message: "O PHP deu erro: " + response.data.substring(0, 100) };
			}

			return parseData(response.data);
		} catch (error) {
			console.error('❌ Erro no catch:', error);
			return {
				success: false,
				message: error.response?.data?.message || 'Erro de conexão com o servidor.'
			};
		}
	},

	buscarPneusGrid: async (filtros) => {
		try {
			const response = await api.post('api_pneus_buscar_grid.php', filtros);
			return parseData(response.data);
		} catch (error) {
			console.error('Erro na busca de pneus:', error);
			return { success: false, data: [] };
		}
	},

	salvarPneuGeral: async (dadosPneu) => {
		try {
			const response = await api.post('api_pneus_salvar.php', dadosPneu);
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao salvar pneu:', error);
			return { success: false, message: 'Erro ao conectar com o servidor.' };
		}
	},

	salvarLaudoPneu: async (dadosLaudo) => {
		try {
			const response = await api.post('api_pneu_salvar_laudo.php', dadosLaudo);
			return parseData(response.data);
		} catch (error) {
			console.error('Erro ao salvar laudo:', error);
			return { success: false, message: 'Erro ao conectar com o servidor.' };
		}
	},
};