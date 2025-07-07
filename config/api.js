const API_BASE_URL = window.location.hostname.includes('azurestaticapps.net')
  ? 'https://pizzaria-backend-eueqgmb0fyb5cdbj.brazilsouth-01.azurewebsites.net/api'
  : 'http://localhost:3001/api';

console.log('🌐 API Base URL configurada:', API_BASE_URL);

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  console.log('📡 Fazendo requisição:', {
    url: `${API_BASE_URL}${endpoint}`,
    method: config.method || 'GET',
    headers: config.headers,
    body: config.body
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log('📥 Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const data = await response.json();
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
    console.error('Erro na API:', error);
    throw error;
  }
};

// Funções de autenticação
const isLoggedIn = () => {
  return localStorage.getItem('token') && localStorage.getItem('usuario');
};

const getUser = () => {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login.html';
};

export { API_BASE_URL, apiRequest, isLoggedIn, getUser, logout };