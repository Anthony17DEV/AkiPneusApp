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
			return { success: false, message: 'Sem conexão com a internet. A alteração de senha requer rede ativa por segurança.' };
		}
	},

	atualizarFoto: async (userId, base64Image) => {
		try {
			const response = await api.post('api_perfil_foto.php', { user_id: userId, foto_base64: base64Image });
			const res = parseData(response.data);

			if (res && res.success) {
				const stored = await SecureStore.getItemAsync('userData');
				if (stored) {
					const parsedUser = JSON.parse(stored);
					parsedUser.foto = res.foto_nome;
					await SecureStore.setItemAsync('userData', JSON.stringify(parsedUser));
				}
			}
			return res;
		} catch (error) {
			return { success: false, message: 'Sem conexão. Não foi possível atualizar a foto de perfil no servidor.' };
		}
	},

	buscarClientes: async (userId, userNivel, filtros = {}, pagina = 1) => {
		const fNome = (filtros.nome || filtros.busca || '').trim().toUpperCase();
		const fCnpj = (filtros.cnpj || '').replace(/\D/g, '').trim();
		const fCodigo = (filtros.codigo || '').trim().toUpperCase();

		return await executeReadOrCache(
			'api_clientes.php',
			{ user_id: userId, pagina, ...filtros },
			'cache_clientes',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_clientes`);

				let listaCompleta = rows.map((r) => {
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || parsed.enti_nb_id || r.id,
						nome: parsed.nome || parsed.enti_tx_nome || r.nome,
						cnpj: parsed.cnpj || parsed.enti_tx_cnpj || r.cnpj,
					};
				});

				if (fNome) {
					listaCompleta = listaCompleta.filter((c) =>
						String(c.nome || '').toUpperCase().includes(fNome)
					);
				}
				if (fCnpj) {
					listaCompleta = listaCompleta.filter((c) =>
						String(c.cnpj || '').replace(/\D/g, '').includes(fCnpj)
					);
				}
				if (fCodigo) {
					listaCompleta = listaCompleta.filter((c) =>
						String(c.codigo || c.id || '').toUpperCase().includes(fCodigo)
					);
				}

				const itensPorPagina = 20;
				const inicio = (pagina - 1) * itensPorPagina;
				return listaCompleta.slice(inicio, inicio + itensPorPagina);
			}
		);
	},

	cadastrarCliente: async (dadosCliente, userId) => {
		try {
			const response = await api.post('api_cliente_cadastrar.php', { ...dadosCliente, user_id: userId });
			const res = parseData(response.data);

			if (res && res.success) {
				const db = getDb();
				const tempId = res.id || res.data?.id || Date.now();
				const novoObj = {
					id: tempId,
					codigo: String(tempId),
					nome: dadosCliente.identificacao || '',
					identificacao: dadosCliente.identificacao || '',
					cnpj: dadosCliente.cnpj || '',
					cidade: dadosCliente.cidade || '',
					cidade_id: dadosCliente.cidade_id || '',
					tipoCliente: dadosCliente.tipoCliente || '',
					situacao: dadosCliente.situacao || 'ATIVO',
					fone1: dadosCliente.contatos?.[0]?.fone1 || '',
					contatos: dadosCliente.contatos || [],
					qtde_veiculos: 0,
				};
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_clientes (id, nome, cnpj, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?)`,
					[tempId, novoObj.nome, novoObj.cnpj, 1, JSON.stringify(novoObj)]
				);
			}

			return res;
		} catch (error) {
			return { success: false, message: 'Erro de conexão no cadastro.' };
		}
	},

	buscarClientePorId: async (clienteId) => {
		return await executeReadOrCache(
			'api_cliente_detalhes.php',
			{ cliente_id: clienteId },
			'cache_clientes',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_clientes WHERE id = ?`, [clienteId]);
				if (rows && rows.length > 0) {
					const r = rows[0];
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || r.id,
						cnpj: parsed.cnpj || r.cnpj || '',
						identificacao: parsed.identificacao || parsed.nome || r.nome || '',
						cidade: parsed.cidade || '',
						cidade_id: parsed.cidade_id || '',
						tipoCliente: parsed.tipoCliente || '',
						situacao: parsed.situacao || '',
						contatos: parsed.contatos || [
							{ nome: '', fone1: parsed.fone1 || '', fone2: '', email: '' }
						],
						foto: parsed.foto || ''
					};
				}
				return null;
			}
		);
	},

	modificarCliente: async (dadosCliente, userId) => {
		try {
			const response = await api.post('api_cliente_modificar.php', { ...dadosCliente, user_id: userId });
			const res = parseData(response.data);

			if (res && res.success && dadosCliente.id) {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_clientes WHERE id = ?`, [dadosCliente.id]);
				const anterior = rows?.[0]?.dados_json ? JSON.parse(rows[0].dados_json) : {};
				const atualizado = {
					...anterior,
					...dadosCliente,
					id: dadosCliente.id,
					nome: dadosCliente.identificacao || anterior.nome || '',
					identificacao: dadosCliente.identificacao || anterior.identificacao || '',
					cnpj: dadosCliente.cnpj || anterior.cnpj || '',
					fone1: dadosCliente.contatos?.[0]?.fone1 || anterior.fone1 || '',
				};
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_clientes (id, nome, cnpj, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?)`,
					[dadosCliente.id, atualizado.nome, atualizado.cnpj, anterior.enti_nb_empresa || 1, JSON.stringify(atualizado)]
				);
			}

			return res;
		} catch (error) {
			return { success: false, message: 'Erro na edição.' };
		}
	},

	excluirCliente: async (id) => {
		try {
			const response = await api.post('api_cliente_modificar.php', { acao: 'excluir', id });
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_clientes WHERE id = ?`, [id]);
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro ao excluir cliente.' };
		}
	},

	buscarPneusVeiculo: async (checklistId) => {
		return await executeReadOrCache(
			'api_pneus_buscar.php',
			{ checklist_id: checklistId },
			'cache_pneus_checklist',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(
					`SELECT posicao, dados_json FROM cache_pneus_checklist WHERE checklist_id = ?`,
					[checklistId]
				);
				let dadosPneusObj = {};
				rows.forEach(r => {
					dadosPneusObj[r.posicao] = JSON.parse(r.dados_json);
				});
				return { success: true, data: dadosPneusObj, posicoes_retiradas: [], pneus_recusados: [] };
			}
		);
	},

	salvarInspecaoPneu: async (dadosPneu) => {
		try {
			const response = await api.post('api_pneu_salvar.php', dadosPneu);
			const res = parseData(response.data);

			// Grava o pneu inspecionado no cache local do checklist
			if (dadosPneu.checklist_id && dadosPneu.posicao) {
				const db = getDb();
				const pneuObj = {
					pneu_nb_id: res.pneu_id || dadosPneu.id || Date.now(),
					pneu_tx_referencia: dadosPneu.referencia,
					pneu_tx_marca: dadosPneu.marca,
					pneu_tx_modelo: dadosPneu.modelo,
					pneu_tx_milimetros: dadosPneu.milimetros,
					pneu_tx_pressao: dadosPneu.pressao,
					pneu_tx_tipo: dadosPneu.tipo,
					valor_carregado: dadosPneu.valor,
					dados_completos: dadosPneu
				};
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_pneus_checklist (checklist_id, posicao, dados_json) VALUES (?, ?, ?)`,
					[dadosPneu.checklist_id, dadosPneu.posicao, JSON.stringify(pneuObj)]
				);
			}
			return res;
		} catch (error) {
			// Modo offline: guarda o pneu localmente e enfileira para sincronizar depois
			if (dadosPneu.checklist_id && dadosPneu.posicao) {
				const db = getDb();
				const pneuObj = {
					pneu_nb_id: dadosPneu.id || Date.now(),
					pneu_tx_referencia: dadosPneu.referencia,
					pneu_tx_marca: dadosPneu.marca,
					pneu_tx_modelo: dadosPneu.modelo,
					pneu_tx_milimetros: dadosPneu.milimetros,
					pneu_tx_pressao: dadosPneu.pressao,
					pneu_tx_tipo: dadosPneu.tipo,
					valor_carregado: dadosPneu.valor,
					dados_completos: dadosPneu
				};
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_pneus_checklist (checklist_id, posicao, dados_json) VALUES (?, ?, ?)`,
					[dadosPneu.checklist_id, dadosPneu.posicao, JSON.stringify(pneuObj)]
				);
			}
			return { success: true, message: 'Inspeção do pneu guardada localmente (modo offline).' };
		}
	},

	listarDanos: async (busca = '') => {
		const termo = (busca || '').trim().toUpperCase();
		return await executeReadOrCache(
			'api_motivo_recusa.php',
			{ acao: 'listar', busca },
			'cache_danos',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_danos ORDER BY id DESC`);
				let lista = rows.map((r) => {
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || parsed.moti_nb_id || r.id,
						nome: parsed.nome || parsed.descricao || parsed.moti_tx_descricao || r.descricao || ''
					};
				});

				if (termo) {
					lista = lista.filter((d) => String(d.nome || '').toUpperCase().includes(termo));
				}
				return lista;
			}
		);
	},

	salvarDano: async (dano) => {
		try {
			const response = await api.post('api_motivo_recusa.php', dano);
			const res = parseData(response.data);

			// Atualiza o cache local imediatamente
			const db = getDb();
			const idFinal = dano.id ? Number(dano.id) : (res?.id || Date.now());
			const objCache = {
				id: idFinal,
				nome: dano.nome || '',
				descricao: dano.nome || ''
			};

			await db.runAsync(
				`INSERT OR REPLACE INTO cache_danos (id, descricao, empresa_id, dados_json) VALUES (?, ?, ?, ?)`,
				[idFinal, objCache.nome, 1, JSON.stringify(objCache)]
			);

			return res;
		} catch (error) {
			// Modo offline: guarda localmente e enfileira para sincronizar quando a rede voltar
			const db = getDb();
			const idFinal = dano.id ? Number(dano.id) : Date.now();
			const objCache = {
				id: idFinal,
				nome: dano.nome || '',
				descricao: dano.nome || ''
			};

			await db.runAsync(
				`INSERT OR REPLACE INTO cache_danos (id, descricao, empresa_id, dados_json) VALUES (?, ?, ?, ?)`,
				[idFinal, objCache.nome, 1, JSON.stringify(objCache)]
			);

			return { success: true, message: 'Operação de dano guardada localmente (modo offline).' };
		}
	},

	excluirDano: async (id) => {
		try {
			const response = await api.post('api_motivo_recusa.php', { acao: 'excluir', id });
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_danos WHERE id = ?`, [id]);
			return parseData(response.data);
		} catch (error) {
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_danos WHERE id = ?`, [id]);
			return { success: true, message: 'Registro de dano removido localmente.' };
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

	buscarDinamica: async (tipo, busca = '', extras = {}) => {
		const termo = (busca || '').trim().toUpperCase();
		return await executeReadOrCache(
			'api_busca_dinamica.php',
			{ tipo, busca, ...extras },
			null,
			async () => {
				const db = getDb();
				if (tipo === 'referencia_pneu') {
					const rows = await db.getAllAsync(`SELECT * FROM cache_referencias`);
					let lista = rows.map((r) => ({
						id: r.id,
						nome: r.nome || `${r.marca || ''} ${r.modelo || ''}`.trim(),
						marca: r.marca,
						modelo: r.modelo,
						mm_original: r.mm_original,
						valor: r.valor,
					}));
					if (termo) {
						lista = lista.filter((item) =>
							String(item.nome || '').toUpperCase().includes(termo)
						);
					}
					return lista;
				}
				return [];
			}
		);
	},

	listarBandas: async (buscaMarca = '', buscaModelo = '') => {
		const fMarca = (buscaMarca || '').trim().toUpperCase();
		const fModelo = (buscaModelo || '').trim().toUpperCase();

		return await executeReadOrCache(
			'api_bandas.php',
			{ acao: 'listar', busca_marca: buscaMarca, busca_modelo: buscaModelo },
			'cache_bandas',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_bandas ORDER BY id DESC`);
				let lista = rows.map((r) => {
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || r.id,
						referencia: parsed.referencia || r.referencia || '',
						marca: parsed.marca || r.marca || '',
						modelo: parsed.modelo || r.modelo || '',
						sulco: parsed.sulco || r.sulco || '',
						valor: parsed.valor ?? r.valor ?? '',
					};
				});

				if (fMarca) {
					lista = lista.filter((b) => String(b.marca || '').toUpperCase().includes(fMarca));
				}
				if (fModelo) {
					lista = lista.filter((b) => String(b.modelo || '').toUpperCase().includes(fModelo));
				}

				return lista;
			}
		);
	},

	salvarBanda: async (form) => {
		try {
			const payload = {
				acao: form.id ? 'atualizar' : 'inserir',
				...form,
			};
			const response = await api.post('api_bandas.php', payload);
			const res = parseData(response.data);

			const db = getDb();
			const idFinal = form.id ? Number(form.id) : (res?.id || Date.now());
			const objCache = {
				id: idFinal,
				referencia: form.referencia || '',
				marca: form.marca || '',
				modelo: form.modelo || '',
				sulco: form.sulco || '',
				valor: String(form.valor || '').replace(/\./g, '').replace(',', '.'),
			};

			await db.runAsync(
				`INSERT OR REPLACE INTO cache_bandas (id, referencia, marca, modelo, sulco, valor, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					idFinal,
					objCache.referencia,
					objCache.marca,
					objCache.modelo,
					objCache.sulco,
					objCache.valor,
					1,
					JSON.stringify(objCache),
				]
			);

			return res;
		} catch (error) {
			return { success: false, message: 'Erro ao salvar banda.' };
		}
	},

	excluirBanda: async (id) => {
		try {
			const response = await api.post('api_bandas.php', { acao: 'excluir', id });
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_bandas WHERE id = ?`, [id]);
			return parseData(response.data);
		} catch (error) {
			return { success: false, message: 'Erro ao excluir banda.' };
		}
	},

	listarChecklists: async (veiculoId) => {
		return await executeReadOrCache(
			'api_checklist.php',
			{ acao: 'listar', veiculo_id: veiculoId },
			'cache_checklists',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(
					`SELECT dados_json FROM cache_checklists WHERE veiculo_id = ? ORDER BY id DESC`,
					[veiculoId]
				);
				return rows.map(r => JSON.parse(r.dados_json));
			}
		);
	},

	iniciarChecklist: async (dados) => {
		try {
			const response = await api.post('api_checklist.php', { acao: 'iniciar', ...dados });
			const res = parseData(response.data);

			if (res && res.success) {
				const db = getDb();
				const checklistId = res.checklist_id || Date.now();
				const novoCheck = {
					chec_nb_id: checklistId,
					chec_tx_dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
					chec_tx_motorista: dados.motorista || '',
					chec_tx_odometro: dados.odometro || '',
					implementos_placas: []
				};
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_checklists (id, veiculo_id, dados_json) VALUES (?, ?, ?)`,
					[checklistId, dados.veiculo_id, JSON.stringify(novoCheck)]
				);
				res.checklist_id = checklistId;
			}
			return res;
		} catch (error) {
			const db = getDb();
			const checklistId = Date.now();
			const novoCheck = {
				chec_nb_id: checklistId,
				chec_tx_dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
				chec_tx_motorista: dados.motorista || 'Offline',
				chec_tx_odometro: dados.odometro || '0',
				implementos_placas: []
			};
			await db.runAsync(
				`INSERT OR REPLACE INTO cache_checklists (id, veiculo_id, dados_json) VALUES (?, ?, ?)`,
				[checklistId, dados.veiculo_id, JSON.stringify(novoCheck)]
			);
			return { success: true, checklist_id: checklistId, message: 'Checklist iniciado em modo offline.' };
		}
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
		const fSerie = (filtros.serie || '').trim().toUpperCase();
		const fDot = (filtros.dot || '').trim();
		const fPlaca = (filtros.placa || '').trim().toUpperCase();
		const fFerro = (filtros.ferro || '').trim().toUpperCase();
		const fId = String(filtros.id || '').trim();

		return await executeReadOrCache(
			'api_pneus_buscar_grid.php',
			filtros,
			'cache_pneus_geral',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_pneus_geral ORDER BY id DESC`);
				let lista = rows.map((r) => {
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || r.id,
						serie: parsed.serie || r.serie || '',
						dot: parsed.dot || r.dot || '',
						ferro: parsed.ferro || r.ferro || '',
						placa_associada: parsed.placa_associada || parsed.placa || r.placa || '',
						cliente: parsed.cliente || parsed.proprietario || r.cliente || '',
					};
				});

				if (fId) {
					lista = lista.filter((p) => String(p.id) === fId);
				}
				if (fSerie) {
					lista = lista.filter((p) => String(p.serie || '').toUpperCase().includes(fSerie));
				}
				if (fDot) {
					lista = lista.filter((p) => String(p.dot || '').includes(fDot));
				}
				if (fPlaca) {
					lista = lista.filter((p) => String(p.placa_associada || p.placa || '').toUpperCase().includes(fPlaca));
				}
				if (fFerro) {
					lista = lista.filter((p) => String(p.ferro || '').toUpperCase().includes(fFerro));
				}
				return lista;
			}
		);
	},

	salvarPneuGeral: async (dadosPneu) => {
		try {
			const response = await api.post('api_pneus_salvar.php', dadosPneu);
			const res = parseData(response.data);

			if (res && res.success) {
				const db = getDb();
				const pneuId = res.id || dadosPneu.id || Date.now();
				const objCache = {
					...dadosPneu,
					id: pneuId,
				};
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_pneus_geral (id, serie, dot, placa, cliente, cliente_id, ferro, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						pneuId,
						dadosPneu.serie || '',
						dadosPneu.dot || '',
						dadosPneu.placa_associada || '',
						dadosPneu.cliente || '',
						dadosPneu.cliente_id || 0,
						dadosPneu.ferro || '',
						JSON.stringify(objCache)
					]
				);
			}
			return res;
		} catch (error) {
			const db = getDb();
			const pneuId = dadosPneu.id || Date.now();
			const objCache = {
				...dadosPneu,
				id: pneuId,
			};
			await db.runAsync(
				`INSERT OR REPLACE INTO cache_pneus_geral (id, serie, dot, placa, cliente, cliente_id, ferro, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					pneuId,
					dadosPneu.serie || '',
					dadosPneu.dot || '',
					dadosPneu.placa_associada || '',
					dadosPneu.cliente || '',
					dadosPneu.cliente_id || 0,
					dadosPneu.ferro || '',
					JSON.stringify(objCache)
				]
			);
			return { success: true, id: pneuId, message: 'Pneu guardado localmente (modo offline).' };
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

	listarChecklistsAvulsos: async (filtros = {}) => {
		return await executeReadOrCache(
			'api_checklist_avulso.php',
			{ acao: 'listar', ...filtros },
			'cache_checklist_avulso',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT dados_json FROM cache_checklist_avulso ORDER BY id DESC`);
				return rows.map(r => JSON.parse(r.dados_json));
			}
		);
	},

	salvarChecklistAvulso: async (payload) => {
		try {
			const response = await api.post('api_checklist_avulso.php', payload);
			const res = parseData(response.data);

			if (res && res.success && payload.acao === 'inserir') {
				const db = getDb();
				const novoId = res.id || Date.now();
				const novoObj = {
					id: novoId,
					data: payload.data ? payload.data.split('/').reverse().join('-') : new Date().toISOString().split('T')[0],
					cliente: 'Cliente Local',
					cliente_id: payload.cliente_id,
					usuario: 'Offline',
					pneus_qtd: payload.qtd_reformados || 0
				};
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_checklist_avulso (id, cliente_id, dados_json) VALUES (?, ?, ?)`,
					[novoId, payload.cliente_id, JSON.stringify(novoObj)]
				);
				res.id = novoId;
			}
			return res;
		} catch (error) {
			if (payload.acao === 'inserir') {
				const db = getDb();
				const novoId = Date.now();
				const novoObj = {
					id: novoId,
					data: new Date().toISOString().split('T')[0],
					cliente: 'Cliente Local',
					cliente_id: payload.cliente_id,
					usuario: 'Offline',
					pneus_qtd: payload.qtd_reformados || 0
				};
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_checklist_avulso (id, cliente_id, dados_json) VALUES (?, ?, ?)`,
					[novoId, payload.cliente_id, JSON.stringify(novoObj)]
				);
				return { success: true, id: novoId, message: 'Análise avulsa guardada localmente.' };
			}
			return { success: false, message: 'Erro de conexão na análise avulsa.' };
		}
	},

	listarPneusAvulsos: async (checklistId) => {
		return await executeReadOrCache(
			'api_checklist_avulso.php',
			{ acao: 'listar_pneus', checklist_id: checklistId },
			'cache_pneus_avulso',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(
					`SELECT dados_json FROM cache_pneus_avulso WHERE checklist_id = ?`,
					[checklistId]
				);
				return rows.map(r => JSON.parse(r.dados_json));
			}
		);
	},

	salvarPneuAvulso: async (payload) => {
		try {
			const response = await api.post('api_checklist_avulso.php', payload);
			const res = parseData(response.data);

			if (res && res.success) {
				const db = getDb();
				const pneuId = res.id || payload.id || Date.now();
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_pneus_avulso (checklist_id, pneu_id, dados_json) VALUES (?, ?, ?)`,
					[payload.checklist_id, pneuId, JSON.stringify({ ...payload, id: pneuId })]
				);
			}
			return res;
		} catch (error) {
			const db = getDb();
			const pneuId = payload.id || Date.now();
			await db.runAsync(
				`INSERT OR REPLACE INTO cache_pneus_avulso (checklist_id, pneu_id, dados_json) VALUES (?, ?, ?)`,
				[payload.checklist_id, pneuId, JSON.stringify({ ...payload, id: pneuId })]
			);
			return { success: true, id: pneuId, message: 'Pneu avulso guardado localmente.' };
		}
	},

	listarMarcas: async (buscaMarca = '') => {
		const fMarca = (buscaMarca || '').trim().toUpperCase();
		return await executeReadOrCache(
			'api_marcas.php',
			{ acao: 'listar', busca_marca: buscaMarca, busca_referencia: '' },
			'cache_marcas',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_marcas`);
				let lista = rows.map((r) => {
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || r.id,
						referencia: parsed.referencia || r.referencia || '',
						marca: parsed.marca || r.marca || '',
						qtd_modelos: parsed.qtd_modelos ?? r.qtd_modelos ?? 0,
					};
				});

				if (fMarca) {
					lista = lista.filter((m) => String(m.marca || '').toUpperCase().includes(fMarca));
				}
				return lista;
			}
		);
	},

	salvarMarca: async (payload) => {
		try {
			const response = await api.post('api_marcas.php', payload);
			const res = parseData(response.data);

			const db = getDb();
			const objCache = {
				id: Date.now(),
				referencia: payload.referencia_nova || '',
				marca: payload.marca_nova || '',
				qtd_modelos: 0
			};
			await db.runAsync(
				`INSERT OR REPLACE INTO cache_marcas (referencia, marca, qtd_modelos, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?)`,
				[objCache.referencia, objCache.marca, objCache.qtd_modelos, 1, JSON.stringify(objCache)]
			);
			return res;
		} catch (error) {
			const db = getDb();
			const objCache = {
				id: Date.now(),
				referencia: payload.referencia_nova || '',
				marca: payload.marca_nova || '',
				qtd_modelos: 0
			};
			await db.runAsync(
				`INSERT OR REPLACE INTO cache_marcas (referencia, marca, qtd_modelos, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?)`,
				[objCache.referencia, objCache.marca, objCache.qtd_modelos, 1, JSON.stringify(objCache)]
			);
			return { success: true, message: 'Operação de marca guardada localmente (modo offline).' };
		}
	},

	excluirMarca: async (referencia, marca) => {
		try {
			const response = await api.post('api_marcas.php', { acao: 'excluir', referencia, marca });
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_marcas WHERE marca = ?`, [marca]);
			return parseData(response.data);
		} catch (error) {
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_marcas WHERE marca = ?`, [marca]);
			return { success: true, message: 'Marca removida localmente.' };
		}
	},

	listarMarcasVeiculos: async (busca = '') => {
		const termo = (busca || '').trim().toUpperCase();
		return await executeReadOrCache(
			'api_marcas_modelos_veiculos.php',
			{ acao: 'listar_marcas', busca },
			'cache_marcas_veiculos',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_marcas_veiculos ORDER BY nome ASC`);
				let lista = rows.map((r) => {
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || r.id,
						nome: parsed.nome || r.nome || '',
						total_modelos: parsed.total_modelos ?? r.total_modelos ?? 0,
					};
				});

				if (termo) {
					lista = lista.filter((m) => String(m.nome || '').toUpperCase().includes(termo));
				}
				return lista;
			}
		);
	},

	salvarMarcaVeiculo: async (payload) => {
		try {
			const response = await api.post('api_marcas_modelos_veiculos.php', payload);
			const res = parseData(response.data);

			if (res && res.success) {
				const db = getDb();
				const marcaId = payload.id ? Number(payload.id) : (res.id || Date.now());
				const obj = { id: marcaId, nome: payload.nome, total_modelos: 0 };
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_marcas_veiculos (id, nome, total_modelos, dados_json) VALUES (?, ?, ?, ?)`,
					[marcaId, payload.nome, 0, JSON.stringify(obj)]
				);
			}
			return res;
		} catch (error) {
			const db = getDb();
			const marcaId = payload.id ? Number(payload.id) : Date.now();
			const obj = { id: marcaId, nome: payload.nome, total_modelos: 0 };
			await db.runAsync(
				`INSERT OR REPLACE INTO cache_marcas_veiculos (id, nome, total_modelos, dados_json) VALUES (?, ?, ?, ?)`,
				[marcaId, payload.nome, 0, JSON.stringify(obj)]
			);
			return { success: true, id: marcaId, message: 'Marca de veículo guardada localmente.' };
		}
	},

	excluirMarcaVeiculo: async (id) => {
		try {
			const response = await api.post('api_marcas_modelos_veiculos.php', { acao: 'excluir_marca', id });
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_marcas_veiculos WHERE id = ?`, [id]);
			await db.runAsync(`DELETE FROM cache_modelos_veiculos WHERE marca_id = ?`, [id]);
			return parseData(response.data);
		} catch (error) {
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_marcas_veiculos WHERE id = ?`, [id]);
			await db.runAsync(`DELETE FROM cache_modelos_veiculos WHERE marca_id = ?`, [id]);
			return { success: true, message: 'Marca removida localmente.' };
		}
	},

	listarModelosVeiculos: async (marcaId) => {
		return await executeReadOrCache(
			'api_marcas_modelos_veiculos.php',
			{ acao: 'listar_modelos', marca_id: marcaId },
			'cache_modelos_veiculos',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_modelos_veiculos WHERE marca_id = ?`, [marcaId]);
				return rows.map((r) => JSON.parse(r.dados_json));
			}
		);
	},

	salvarModeloVeiculo: async (payload) => {
		try {
			const response = await api.post('api_marcas_modelos_veiculos.php', payload);
			const res = parseData(response.data);

			if (res && res.success) {
				const db = getDb();
				const modeloId = payload.id ? Number(payload.id) : (res.id || Date.now());
				const obj = { id: modeloId, marca_id: payload.marca_id, nome: payload.nome };
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_modelos_veiculos (id, marca_id, nome, dados_json) VALUES (?, ?, ?, ?)`,
					[modeloId, payload.marca_id, payload.nome, JSON.stringify(obj)]
				);
			}
			return res;
		} catch (error) {
			const db = getDb();
			const modeloId = payload.id ? Number(payload.id) : Date.now();
			const obj = { id: modeloId, marca_id: payload.marca_id, nome: payload.nome };
			await db.runAsync(
				`INSERT OR REPLACE INTO cache_modelos_veiculos (id, marca_id, nome, dados_json) VALUES (?, ?, ?, ?)`,
				[modeloId, payload.marca_id, payload.nome, JSON.stringify(obj)]
			);
			return { success: true, id: modeloId, message: 'Modelo guardado localmente.' };
		}
	},

	excluirModeloVeiculo: async (id) => {
		try {
			const response = await api.post('api_marcas_modelos_veiculos.php', { acao: 'excluir_modelo', id });
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_modelos_veiculos WHERE id = ?`, [id]);
			return parseData(response.data);
		} catch (error) {
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_modelos_veiculos WHERE id = ?`, [id]);
			return { success: true, message: 'Modelo removido localmente.' };
		}
	},

	listarModelosPneus: async (buscaMarca = '', buscaModelo = '') => {
		const fMarca = (buscaMarca || '').trim().toUpperCase();
		const fModelo = (buscaModelo || '').trim().toUpperCase();

		return await executeReadOrCache(
			'api_modelos.php',
			{ acao: 'listar', busca_referencia: '', busca_marca: buscaMarca, busca_modelo: buscaModelo },
			'cache_modelos_pneus',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_modelos_pneus ORDER BY id DESC`);
				let lista = rows.map((r) => {
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || r.id,
						referencia: parsed.referencia || r.referencia || '',
						marca: parsed.marca || r.marca || '',
						modelo: parsed.modelo || r.modelo || '',
						mmOriginal: parsed.mmOriginal || parsed.mm_original || r.mm_original || '',
						valor: parsed.valor ?? r.valor ?? '',
					};
				});

				if (fMarca) {
					lista = lista.filter((m) => String(m.marca || '').toUpperCase().includes(fMarca));
				}
				if (fModelo) {
					lista = lista.filter((m) => String(m.modelo || '').toUpperCase().includes(fModelo));
				}
				return lista;
			}
		);
	},

	salvarModeloPneu: async (form) => {
		try {
			const payload = {
				acao: form.id ? 'atualizar' : 'inserir',
				...form,
			};
			const response = await api.post('api_modelos.php', payload);
			const res = parseData(response.data);

			const db = getDb();
			const idFinal = form.id ? Number(form.id) : (res?.id || Date.now());
			const objCache = {
				id: idFinal,
				referencia: form.referencia || '',
				marca: form.marca || '',
				modelo: form.modelo || '',
				mmOriginal: form.mmOriginal || '',
				valor: String(form.valor || '').replace(/\./g, '').replace(',', '.'),
			};

			await db.runAsync(
				`INSERT OR REPLACE INTO cache_modelos_pneus (id, referencia, marca, modelo, mm_original, valor, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					idFinal,
					objCache.referencia,
					objCache.marca,
					objCache.modelo,
					objCache.mmOriginal,
					objCache.valor,
					1,
					JSON.stringify(objCache),
				]
			);
			return res;
		} catch (error) {
			const db = getDb();
			const idFinal = form.id ? Number(form.id) : Date.now();
			const objCache = {
				id: idFinal,
				referencia: form.referencia || '',
				marca: form.marca || '',
				modelo: form.modelo || '',
				mmOriginal: form.mmOriginal || '',
				valor: String(form.valor || '').replace(/\./g, '').replace(',', '.'),
			};

			await db.runAsync(
				`INSERT OR REPLACE INTO cache_modelos_pneus (id, referencia, marca, modelo, mm_original, valor, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					idFinal,
					objCache.referencia,
					objCache.marca,
					objCache.modelo,
					objCache.mmOriginal,
					objCache.valor,
					1,
					JSON.stringify(objCache),
				]
			);
			return { success: true, message: 'Modelo de pneu guardado localmente.' };
		}
	},

	excluirModeloPneu: async (id) => {
		try {
			const response = await api.post('api_modelos.php', { acao: 'excluir', id });
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_modelos_pneus WHERE id = ?`, [id]);
			return parseData(response.data);
		} catch (error) {
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_modelos_pneus WHERE id = ?`, [id]);
			return { success: true, message: 'Modelo de pneu removido localmente.' };
		}
	},

	listarReferencias: async (busca = '') => {
		const termo = (busca || '').trim().toUpperCase();
		return await executeReadOrCache(
			'api_referencias.php',
			{ acao: 'listar', busca },
			'cache_referencias_pneus',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_referencias_pneus ORDER BY id DESC`);
				let lista = rows.map((r) => {
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || r.id,
						nome: parsed.nome || r.nome || '',
						qtd_marcas: parsed.qtd_marcas ?? r.qtd_marcas ?? 0,
					};
				});

				if (termo) {
					lista = lista.filter((ref) => String(ref.nome || '').toUpperCase().includes(termo));
				}
				return lista;
			}
		);
	},

	salvarReferencia: async (payload) => {
		try {
			const response = await api.post('api_referencias.php', payload);
			const res = parseData(response.data);

			if (res && res.success) {
				const db = getDb();
				const refId = res.id || Date.now();
				const obj = { id: refId, nome: payload.nome, qtd_marcas: 0 };
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_referencias_pneus (id, nome, qtd_marcas, dados_json) VALUES (?, ?, ?, ?)`,
					[refId, payload.nome, 0, JSON.stringify(obj)]
				);
			}
			return res;
		} catch (error) {
			const db = getDb();
			const refId = Date.now();
			const obj = { id: refId, nome: payload.nome, qtd_marcas: 0 };
			await db.runAsync(
				`INSERT OR REPLACE INTO cache_referencias_pneus (id, nome, qtd_marcas, dados_json) VALUES (?, ?, ?, ?)`,
				[refId, payload.nome, 0, JSON.stringify(obj)]
			);
			return { success: true, message: 'Referência guardada localmente (modo offline).' };
		}
	},

	excluirReferencia: async (nome) => {
		try {
			const response = await api.post('api_referencias.php', { acao: 'excluir', nome });
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_referencias_pneus WHERE nome = ?`, [nome]);
			return parseData(response.data);
		} catch (error) {
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_referencias_pneus WHERE nome = ?`, [nome]);
			return { success: true, message: 'Referência removida localmente.' };
		}
	},

	listarReformadores: async (busca = '') => {
		const termo = (busca || '').trim().toUpperCase();
		return await executeReadOrCache(
			'api_reformadores.php',
			{ acao: 'listar', busca },
			'cache_reformadores',
			async () => {
				const db = getDb();
				await db.execAsync(`CREATE TABLE IF NOT EXISTS cache_reformadores (id INTEGER PRIMARY KEY, nome TEXT, documento TEXT, telefone TEXT, cidade_id INTEGER, cidade_nome TEXT, dados_json TEXT);`);
				const rows = await db.getAllAsync(`SELECT * FROM cache_reformadores ORDER BY id DESC`);
				let lista = rows.map((r) => {
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || r.id,
						nome: parsed.nome || r.nome || '',
						documento: parsed.documento || r.documento || '',
						telefone: parsed.telefone || r.telefone || '',
						cidade_nome: parsed.cidade_nome || r.cidade_nome || '',
					};
				});

				if (termo) {
					lista = lista.filter((ref) => String(ref.nome || '').toUpperCase().includes(termo));
				}
				return lista;
			}
		);
	},

	salvarReformador: async (payload) => {
		try {
			const response = await api.post('api_reformadores.php', payload);
			const res = parseData(response.data);

			if (res && res.success) {
				try {
					const db = getDb();
					await db.execAsync(`CREATE TABLE IF NOT EXISTS cache_reformadores (id INTEGER PRIMARY KEY, nome TEXT, documento TEXT, telefone TEXT, cidade_id INTEGER, cidade_nome TEXT, dados_json TEXT);`);
					const refId = payload.id ? Number(payload.id) : (res.id || Date.now());
					const obj = { id: refId, ...payload };
					await db.runAsync(
						`INSERT OR REPLACE INTO cache_reformadores (id, nome, documento, telefone, cidade_id, cidade_nome, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
						[refId, payload.nome, payload.documento || '', payload.telefone || '', payload.cidade_id || 0, payload.cidade_nome || '', JSON.stringify(obj)]
					);
				} catch (cacheErr) {
					console.warn('Aviso ao atualizar cache_reformadores:', cacheErr);
				}
			}
			return res;
		} catch (error) {
			try {
				const db = getDb();
				await db.execAsync(`CREATE TABLE IF NOT EXISTS cache_reformadores (id INTEGER PRIMARY KEY, nome TEXT, documento TEXT, telefone TEXT, cidade_id INTEGER, cidade_nome TEXT, dados_json TEXT);`);
				const refId = payload.id ? Number(payload.id) : Date.now();
				const obj = { id: refId, ...payload };
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_reformadores (id, nome, documento, telefone, cidade_id, cidade_nome, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[refId, payload.nome, payload.documento || '', payload.telefone || '', payload.cidade_id || 0, payload.cidade_nome || '', JSON.stringify(obj)]
				);
				return { success: true, message: 'Reformador guardado localmente (modo offline).' };
			} catch (offlineErr) {
				return { success: false, message: 'Erro de conexão ao salvar reformador.' };
			}
		}
	},

	excluirReformador: async (id) => {
		try {
			const response = await api.post('api_reformadores.php', { acao: 'excluir', id });
			try {
				const db = getDb();
				await db.execAsync(`CREATE TABLE IF NOT EXISTS cache_reformadores (id INTEGER PRIMARY KEY, nome TEXT, documento TEXT, telefone TEXT, cidade_id INTEGER, cidade_nome TEXT, dados_json TEXT);`);
				await db.runAsync(`DELETE FROM cache_reformadores WHERE id = ?`, [id]);
			} catch (cacheErr) {
				console.warn('Aviso ao limpar cache_reformadores:', cacheErr);
			}
			return parseData(response.data);
		} catch (error) {
			try {
				const db = getDb();
				await db.execAsync(`CREATE TABLE IF NOT EXISTS cache_reformadores (id INTEGER PRIMARY KEY, nome TEXT, documento TEXT, telefone TEXT, cidade_id INTEGER, cidade_nome TEXT, dados_json TEXT);`);
				await db.runAsync(`DELETE FROM cache_reformadores WHERE id = ?`, [id]);
			} catch (e) { }
			return { success: true, message: 'Reformador removido localmente.' };
		}
	},

	listarUsuarios: async (busca = '', perfil = '') => {
		const termo = (busca || '').trim().toUpperCase();
		return await executeReadOrCache(
			'api_usuarios.php',
			{ acao: 'listar', busca, perfil },
			'cache_usuarios',
			async () => {
				const db = getDb();
				const rows = await db.getAllAsync(`SELECT * FROM cache_usuarios ORDER BY id DESC`);
				let lista = rows.map((r) => {
					const parsed = r.dados_json ? JSON.parse(r.dados_json) : {};
					return {
						...parsed,
						id: parsed.id || r.id,
						nome: parsed.nome || r.nome || '',
						usuario: parsed.usuario || r.usuario || '',
						email: parsed.email || r.email || '',
						perfil: parsed.perfil || r.perfil || 'ASSESSOR',
					};
				});

				if (termo) {
					lista = lista.filter((u) =>
						String(u.nome || '').toUpperCase().includes(termo) ||
						String(u.usuario || '').toUpperCase().includes(termo)
					);
				}
				if (perfil) {
					lista = lista.filter((u) => String(u.perfil || '').toUpperCase() === perfil.toUpperCase());
				}
				return lista;
			}
		);
	},

	salvarUsuario: async (payload) => {
		try {
			const response = await api.post('api_usuarios.php', payload);
			const res = parseData(response.data);

			if (res && res.success) {
				const db = getDb();
				const userId = payload.id ? Number(payload.id) : (res.id || Date.now());
				const obj = { id: userId, ...payload };
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_usuarios (id, nome, usuario, email, perfil, dados_json) VALUES (?, ?, ?, ?, ?, ?)`,
					[userId, payload.nome, payload.usuario, payload.email || '', payload.perfil || 'ASSESSOR', JSON.stringify(obj)]
				);
			}
			return res;
		} catch (error) {
			const db = getDb();
			const userId = payload.id ? Number(payload.id) : Date.now();
			const obj = { id: userId, ...payload };
			await db.runAsync(
				`INSERT OR REPLACE INTO cache_usuarios (id, nome, usuario, email, perfil, dados_json) VALUES (?, ?, ?, ?, ?, ?)`,
				[userId, payload.nome, payload.usuario, payload.email || '', payload.perfil || 'ASSESSOR', JSON.stringify(obj)]
			);
			return { success: true, message: 'Utilizador guardado localmente (modo offline).' };
		}
	},

	excluirUsuario: async (id) => {
		try {
			const response = await api.post('api_usuarios.php', { acao: 'excluir', id });
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_usuarios WHERE id = ?`, [id]);
			return parseData(response.data);
		} catch (error) {
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_usuarios WHERE id = ?`, [id]);
			return { success: true, message: 'Utilizador removido localmente.' };
		}
	},

	salvarVeiculoGeral: async (payload) => {
		try {
			const response = await api.post('api_veiculo_salvar.php', payload);
			const res = parseData(response.data);

			if (res && res.success) {
				const db = getDb();
				const veiculoId = payload.id ? Number(payload.id) : (res.id || Date.now());
				const obj = { id: veiculoId, ...payload };
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_veiculos_geral (id, placa, codigo, tipo, proprietario, proprietario_id, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[veiculoId, payload.placa || '', payload.codigo || '', payload.tipo || '', payload.proprietario || '', payload.proprietario_id || 0, JSON.stringify(obj)]
				);
			}
			return res;
		} catch (error) {
			const db = getDb();
			const veiculoId = payload.id ? Number(payload.id) : Date.now();
			const obj = { id: veiculoId, ...payload };
			await db.runAsync(
				`INSERT OR REPLACE INTO cache_veiculos_geral (id, placa, codigo, tipo, proprietario, proprietario_id, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[veiculoId, payload.placa || '', payload.codigo || '', payload.tipo || '', payload.proprietario || '', payload.proprietario_id || 0, JSON.stringify(obj)]
			);
			return { success: true, message: 'Veículo guardado localmente (modo offline).' };
		}
	},

	excluirVeiculoGeral: async (id) => {
		try {
			const response = await api.post('api_veiculo_salvar.php', { acao: 'excluir', id });
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_veiculos_geral WHERE id = ?`, [id]);
			return parseData(response.data);
		} catch (error) {
			const db = getDb();
			await db.runAsync(`DELETE FROM cache_veiculos_geral WHERE id = ?`, [id]);
			return { success: true, message: 'Veículo removido localmente.' };
		}
	},

};