﻿
const API_BASE_URL = window.location.hostname.includes('azurestaticapps.net')
  ? 'https://pizzaria-backend-eueqgmb0fyb5cdbj.brazilsouth-01.azurewebsites.net'
  : 'https://pizzaria-backend-eueqgmb0fyb5cdbj.brazilsouth-01.azurewebsites.net';

console.log('🌐 API Base URL configurada:', API_BASE_URL);

const apiRequest = async (endpoint, options = {}) => {
  // Garante que o endpoint sempre começa com /api/
  let fixedEndpoint = endpoint;
  if (!fixedEndpoint.startsWith('/api/')) {
    if (fixedEndpoint.startsWith('/')) {
      fixedEndpoint = '/api' + fixedEndpoint;
    } else {
      fixedEndpoint = '/api/' + fixedEndpoint;
    }
  }

  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  console.log('📡 Fazendo requisição:', {
    url: `${API_BASE_URL}${fixedEndpoint}`,
    method: config.method || 'GET',
    headers: config.headers,
    body: config.body
  });

  try {
    const response = await fetch(`${API_BASE_URL}${fixedEndpoint}`, config);
    
    console.log('📨 Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.log('📄 Resposta em texto:', text);
      throw new Error('Resposta não é JSON válido');
    }
    
    console.log('📦 Dados da resposta:', data);
    
    // Verificar se token expirou
    if (response.status === 401 || data.error === 'Token inválido') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      if (window.location.pathname !== '/login.html' && window.location.pathname !== '/') {
        window.location.href = '/login.html';
      }
    }
    
    return data;
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    throw error;
  }
};


// Função para testar conectividade (testa a raiz do backend)
const testarConectividade = async () => {
  try {
    console.log('🔍 Testando conexão com o backend...');
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    if (response.ok) {
      console.log('✅ Backend respondendo:', response.status);
      return true;
    } else {
      console.log('⚠️ Backend retornou erro:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro de conectividade:', error.message);
    return false;
  }
};

// Lembrete: sempre use endpoints começando com /api/, por exemplo: apiRequest('/api/pedidos')

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.apiRequest = apiRequest;
  window.testarConectividade = testarConectividade;
  window.API_BASE_URL = API_BASE_URL;
}
