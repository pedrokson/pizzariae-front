// Fazer login
export async function fazerLogin(email, senha) {
  try {
    const response = await window.apiRequest('/api/clientes/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
    
    if (response.sucesso) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
      return { sucesso: true, usuario: response.usuario };
    } else {
      return { sucesso: false, erro: response.erro };
    }
  } catch (error) {
    return { sucesso: false, erro: 'Erro de conexão' };
  }
}

// Fazer cadastro
export async function fazerCadastro(dadosCadastro) {
  try {
    // Validar dados antes de enviar
    if (!dadosCadastro.endereco || typeof dadosCadastro.endereco === 'string') {
      return { sucesso: false, erro: 'Endereço deve ser um objeto completo' };
    }
    
    const response = await window.apiRequest('/api/clientes/cadastro', {
      method: 'POST',
      body: JSON.stringify(dadosCadastro)
    });
    
    if (response.sucesso) {
      // Fazer login automaticamente após cadastro
      return await fazerLogin(dadosCadastro.email, dadosCadastro.senha);
    }
    
    return response;
  } catch (error) {
    return { sucesso: false, erro: 'Erro de conexão' };
  }
}

// Verificar se está logado
export function verificarAutenticacao() {
  return window.isLoggedIn ? window.isLoggedIn() : false;
}
// Expor para escopo global
window.verificarAutenticacao = verificarAutenticacao;

// Obter dados do usuário logado
export function obterUsuario() {
  return window.getUser ? window.getUser() : null;
}

// Fazer logout
export function sair() {
  if (window.logout) {
    window.logout();
  } else {
    // fallback: limpar localStorage e redirecionar
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
  }
}

// Atualizar dados do usuário
export async function atualizarPerfil(dadosAtualizados) {
  try {
    const usuario = getUser();
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    
    const response = await apiRequest(`/clientes/${usuario.id}`, {
      method: 'PUT',
      body: JSON.stringify(dadosAtualizados)
    });
    
    if (response && !response.error) {
      // Atualizar dados no localStorage
      localStorage.setItem('usuario', JSON.stringify(response));
      return { sucesso: true, usuario: response };
    }
    
    return { sucesso: false, erro: response.error || 'Erro ao atualizar perfil' };
  } catch (error) {
    return { sucesso: false, erro: error.message };
  }
}

// Validar formulário de cadastro
export function validarCadastro(dados) {
  const erros = [];
  
  if (!dados.nome || dados.nome.length < 2) {
    erros.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  if (!dados.email || !dados.email.includes('@')) {
    erros.push('Email inválido');
  }
  
  if (!dados.senha || dados.senha.length < 6) {
    erros.push('Senha deve ter pelo menos 6 caracteres');
  }
  
  if (!dados.telefone || !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(dados.telefone)) {
    erros.push('Telefone deve estar no formato (11) 99999-9999');
  }
  
  if (!dados.endereco) {
    erros.push('Endereço é obrigatório');
  } else {
    if (!dados.endereco.rua) erros.push('Rua é obrigatória');
    if (!dados.endereco.numero) erros.push('Número é obrigatório');
    if (!dados.endereco.bairro) erros.push('Bairro é obrigatório');
    if (!dados.endereco.cidade) erros.push('Cidade é obrigatória');
    if (!dados.endereco.cep || !/^\d{5}-?\d{3}$/.test(dados.endereco.cep)) {
      erros.push('CEP inválido');
    }
    if (!dados.endereco.estado || dados.endereco.estado.length !== 2) {
      erros.push('Estado inválido');
    }
  }
  
  return erros;
}

// Aplicar máscara de telefone
export function mascaraTelefone(valor) {
  valor = valor.replace(/\D/g, '');
  valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
  valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
  return valor;
}

// Aplicar máscara de CEP
export function mascaraCEP(valor) {
  valor = valor.replace(/\D/g, '');
  valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
  return valor;
}
