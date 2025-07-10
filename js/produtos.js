import { apiRequest } from '../config/api.js';

// Buscar todos os produtos
export async function listarProdutos(filtros = {}) {
  let url = '/produtos';
  const params = new URLSearchParams();
  
  if (filtros.categoria) params.append('categoria', filtros.categoria);
  if (filtros.disponivel !== undefined) params.append('disponivel', filtros.disponivel);
  if (filtros.destaque !== undefined) params.append('destaque', filtros.destaque);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return await apiRequest(url);
}

// Buscar produto por ID
export async function buscarProdutoPorId(id) {
  return await apiRequest(`/produtos/${id}`);
}

// Criar novo produto
export async function criarProduto(produto) {
  return await apiRequest('/api/produtos', {
    method: 'POST',
    body: JSON.stringify(produto)
  });
}

// Atualizar produto
export async function atualizarProduto(id, produto) {
  return await apiRequest(`/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(produto)
  });
}

// Deletar produto
export async function deletarProduto(id) {
  return await apiRequest(`/produtos/${id}`, {
    method: 'DELETE'
  });
}

// Buscar por categoria
export async function buscarPorCategoria(categoria) {
  return await listarProdutos({ categoria });
}

// Buscar produtos em destaque
export async function buscarDestaques() {
  return await listarProdutos({ destaque: true });
}

// Buscar apenas disponíveis
export async function buscarDisponiveis() {
  return await listarProdutos({ disponivel: true });
}

// Adicionar avaliação ao produto
export async function adicionarAvaliacao(produtoId, avaliacao) {
  return await apiRequest(`/produtos/${produtoId}/avaliacao`, {
    method: 'POST',
    body: JSON.stringify(avaliacao)
  });
}

// Função para renderizar produtos (adaptada para MongoDB)
export function renderizarProdutos(produtos, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = produtos.map(produto => {
    const precoDisplay = produto.tamanhos && produto.tamanhos.length > 0
      ? produto.tamanhos.map(t => `${t.nome}: R$ ${t.preco.toFixed(2)}`).join(' | ')
      : `R$ ${produto.preco.toFixed(2)}`;
    
    return `
      <div class="produto-card" data-id="${produto._id}">
        <div class="produto-header">
          <h3>${produto.nome}</h3>
          ${produto.destaque ? '<span class="destaque">⭐ Destaque</span>' : ''}
          ${!produto.disponivel ? '<span class="indisponivel">❌ Indisponível</span>' : ''}
        </div>
        <p class="produto-descricao">${produto.descricao}</p>
        <p class="produto-categoria">Categoria: ${produto.categoria}</p>
        <div class="produto-precos">${precoDisplay}</div>
        ${produto.mediaAvaliacoes > 0 ? `<div class="avaliacoes">⭐ ${produto.mediaAvaliacoes}/5</div>` : ''}
        <div class="produto-acoes">
          <button onclick="adicionarAoCarrinho('${produto._id}')" ${!produto.disponivel ? 'disabled' : ''}>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    `;
  }).join('');
}