import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { enqueueOfflineAction, getDb } from './database';

const BASE_URL = 'https://sistemascactus.com.br/apicactus/akipneus/';

export const api = axios.create({
	baseURL: BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	}
});

api.interceptors.request.use(
	async (config) => {
		try {
			const storedUserData = await SecureStore.getItemAsync('userData');
			if (storedUserData) {
				const user = JSON.parse(storedUserData);
				if (user && user.empresa_id) {
					config.headers['X-Empresa-ID'] = user.empresa_id;
				}
			}
		} catch (error) {
			console.error("Erro ao injetar X-Empresa-ID:", error);
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
			if (
				originalRequest &&
				originalRequest.method &&
				originalRequest.method.toLowerCase() !== 'get' &&
				!originalRequest.isReadOperation &&
				!originalRequest.url?.includes('api_login.php')
			) {
				try {
					const storedUserData = await SecureStore.getItemAsync('userData');
					const user = storedUserData ? JSON.parse(storedUserData) : null;
					const empresaId = user?.empresa_id || 1;

					const endpoint = originalRequest.url ? originalRequest.url.replace(BASE_URL, '') : '';
					const payload = typeof originalRequest.data === 'string' ? JSON.parse(originalRequest.data) : (originalRequest.data || {});

					await enqueueOfflineAction(endpoint, payload, empresaId);

					console.log(`📴 [Offline-First] Requisição de escrita para '${endpoint}' salva na fila local.`);

					return {
						data: {
							success: true,
							offlineQueued: true,
							message: 'Sem conexão. Operação guardada localmente com sucesso!'
						}
					};
				} catch (queueError) {
					console.error("Erro ao enfileirar requisição offline:", queueError);
				}
			}
		}

		return Promise.reject(error);
	}
);

const parseData = (data) => {
	if (typeof data === 'string') {
		try { return JSON.parse(data.trim()); } catch (e) { return data; }
	}
	return data;
};

const executeReadOrCache = async (endpoint, payload, cacheTableName, fallbackQueryFn) => {
	try {
		const response = await api.post(endpoint, payload, { isReadOperation: true });
		return parseData(response.data);
	} catch (error) {
		console.warn(`⚠️ Falha na rede ao ler '${endpoint}'. A buscar do cache local...`);
		try {
			if (typeof fallbackQueryFn === 'function') {
				const localData = await fallbackQueryFn();
				return {
					success: true,
					offlineMode: true,
					data: localData,
					message: 'Dados carregados do cache local (modo offline).'
				};
			}
		} catch (dbError) {
			console.error("Erro ao ler do banco local:", dbError);
		}

		return { success: false, message: 'Sem conexão e sem dados locais disponíveis.' };
	}
};

export const apiService = {
	login: async (codigoEmpresa, usuario, senha) => {
		try {
			const cacheBuster = new Date().getTime();
			const formData = new FormData();
			formData.append('codigo_empresa', codigoEmpresa);
			formData.append('login', usuario);
			formData.append('senha', senha);

			const response = await api.post(`api_login.php?v=${cacheBuster}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'Accept': 'application/json'
				}
			});

			const resultado = parseData(response.data);

			if (resultado && resultado.success) {
				const dadosCache = {
					...resultado,
					cache_codigo_empresa: codigoEmpresa,
					cache_login: usuario,
					cache_senha: senha
				};
				await SecureStore.setItemAsync('offlineUserCredential', JSON.stringify(dadosCache));
			}

			return resultado;
		} catch (error) {
			console.warn('⚠️ Falha de rede no login. A verificar credenciais locais...');
			try {
				const credentialData = await SecureStore.getItemAsync('offlineUserCredential');
				if (credentialData) {
					const cachedUser = JSON.parse(credentialData);
					if (
						String(cachedUser.cache_codigo_empresa) === String(codigoEmpresa) &&
						String(cachedUser.cache_login).toLowerCase() === String(usuario).toLowerCase() &&
						String(cachedUser.cache_senha) === String(senha)
					) {
						return {
							success: true,
							offlineMode: true,
							...cachedUser,
							message: 'Login efetuado em modo offline.'
						};
					}
				}
				return { success: false, message: 'Sem internet e credenciais locais inválidas.' };
			} catch (offlineError) {
				return { success: false, message: 'ERRO DE REDE: ' + error.message };
			}
		}
	},

	buscarVeiculo: async (filtros) => {
		const payload = typeof filtros === 'string' ? { busca: filtros } : filtros;
		return await executeReadOrCache(
			'api_veiculo_buscar.php',
			payload,
			'cache_veiculos',
			async () => {
				return await getDb().getAllAsync('SELECT * FROM cache_veiculos');
			}
		);
	},

	buscarDashboard: async (userId) => {
		return await executeReadOrCache('api_dashboard.php', { user_id: userId }, null, async () => {
			return { total_veiculos: 0, total_pneus: 0, offline: true };
		});
	},

	alterarSenha: async (userId, novaSenha) => {
		try {
			const response = await api.post('api_perfil_senha.php', { user_id: userId, nova_senha: novaSenha });
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro de conexão ao alterar a senha.' };
		}
	},

	atualizarFoto: async (userId, base64Image) => {
		try {
			const response = await api.post('api_perfil_foto.php', { user_id: userId, foto_base64: base64Image });
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro de conexão ao enviar a foto.' };
		}
	},

	buscarClientes: async (userId, userNivel, filtros = {}, pagina = 1) => {
		return await executeReadOrCache('api_clientes.php', { user_id: userId, pagina, ...filtros }, null, async () => {
			return [];
		});
	},

	cadastrarCliente: async (dadosCliente, userId) => {
		try {
			const response = await api.post('api_cliente_cadastrar.php', { ...dadosCliente, user_id: userId });
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro de conexão no cadastro.' };
		}
	},

	buscarClientePorId: async (clienteId) => {
		return await executeReadOrCache('api_cliente_detalhes.php', { cliente_id: clienteId }, null, async () => {
			return null;
		});
	},

	modificarCliente: async (dadosCliente, userId) => {
		try {
			const response = await api.post('api_cliente_modificar.php', { ...dadosCliente, user_id: userId });
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro na edição.' };
		}
	},

	buscarPneusVeiculo: async (checklistId) => {
		return await executeReadOrCache('api_pneus_buscar.php', { checklist_id: checklistId }, null, async () => {
			return {};
		});
	},

	salvarInspecaoPneu: async (dadosPneu) => {
		try {
			const response = await api.post('api_pneu_salvar.php', dadosPneu);
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro de conexão ao salvar.' };
		}
	},

	listarDanos: async (busca = '') => {
		return await executeReadOrCache('api_motivo_recusa.php', { acao: 'listar', busca }, null, async () => {
			return [];
		});
	},

	salvarDano: async (dano) => {
		try {
			const response = await api.post('api_motivo_recusa.php', dano);
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro de conexão.' };
		}
	},

	excluirDano: async (id) => {
		try {
			const response = await api.post('api_motivo_recusa.php', { acao: 'excluir', id });
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro de conexão.' };
		}
	},

	salvarVeiculo: async (dadosVeiculo) => {
		try {
			const response = await api.post('api_veiculo_salvar.php', dadosVeiculo);
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro de conexão ao salvar veículo.' };
		}
	},

	buscarDinamica: async (tipo, busca, extras = {}) => {
		return await executeReadOrCache('api_busca_dinamica.php', { tipo, busca, ...extras }, null, async () => {
			return [];
		});
	},

	listarChecklists: async (veiculoId) => {
		return await executeReadOrCache('api_checklist.php', { acao: 'listar', veiculo_id: veiculoId }, null, async () => {
			return [];
		});
	},

	iniciarChecklist: async (dados) => {
		try {
			const response = await api.post('api_checklist.php', { acao: 'iniciar', ...dados });
			return parseData(response.data);
		} catch (error) { return { success: false, message: 'Erro de conexão.' }; }
	},

	recuperarSenha: async (usuarioOuEmail) => {
		try {
			const response = await api.post('api_recuperar_senha.php', { usuario: usuarioOuEmail });
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro de conexão com o servidor.' };
		}
	},

	buscarPneusGrid: async (filtros) => {
		return await executeReadOrCache('api_pneus_buscar_grid.php', filtros, null, async () => {
			return [];
		});
	},

	salvarPneuGeral: async (dadosPneu) => {
		try {
			const response = await api.post('api_pneus_salvar.php', dadosPneu);
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro ao conectar com o servidor.' };
		}
	},

	salvarLaudoPneu: async (dadosLaudo) => {
		try {
			const response = await api.post('api_pneu_salvar_laudo.php', dadosLaudo);
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro ao conectar com o servidor.' };
		}
	},
};