import { apiRequest } from '../config/api.js';
import { getUser } from './auth.js';

// Criar novo pedido
export async function criarPedido(dadosPedido) {
  try {
    const usuario = getUser();
    if (!usuario) {
      throw new Error('Usuário não está logado');
    }
    
    const pedido = {
      cliente: usuario.id,
      itens: dadosPedido.itens.map(item => ({
        produto: item.produto,
        tamanho: item.tamanho,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        observacoes: item.observacoes || ""
      })),
      endereco: dadosPedido.endereco,
      formaPagamento: {
        tipo: dadosPedido.formaPagamento.tipo,
        troco: dadosPedido.formaPagamento.troco || 0,
        statusPagamento: 'pendente'
      },
      entrega: {
        tipo: dadosPedido.entrega.tipo,
        tempoEstimado: dadosPedido.entrega.tempoEstimado || 45
      },
      observacoes: dadosPedido.observacoes || ""
    };
    
    return await apiRequest('/api/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedido)
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
}

// Buscar pedidos do usuário logado
export async function buscarMeusPedidos() {
  try {
    const usuario = getUser();
    if (!usuario) {
      throw new Error('Usuário não está logado');
    }
    
    return await apiRequest(`/api/pedidos?cliente=${usuario.id}`);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
}

// Acompanhar pedido específico
export async function acompanharPedido(pedidoId) {
  try {
    return await apiRequest(`/api/pedidos/${pedidoId}`);
  } catch (error) {
    console.error('Erro ao acompanhar pedido:', error);
    throw error;
  }
}

// Atualizar status do pedido (para admin)
export async function atualizarStatusPedido(pedidoId, novoStatus) {
  try {
    return await apiRequest(`/api/pedidos/${pedidoId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: novoStatus })
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
}

// Adicionar avaliação ao pedido
export async function avaliarPedido(pedidoId, nota, comentario) {
  try {
    return await apiRequest(`/api/pedidos/${pedidoId}/avaliacao`, {
      method: 'POST',
      body: JSON.stringify({ nota, comentario })
    });
  } catch (error) {
    console.error('Erro ao avaliar pedido:', error);
    throw error;
  }
}

// Renderizar lista de pedidos
export function renderizarPedidos(pedidos, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (pedidos.length === 0) {
    container.innerHTML = '<p>Nenhum pedido encontrado.</p>';
    return;
  }
  
  container.innerHTML = pedidos.map(pedido => {
    const statusClass = {
      'pendente': 'status-pendente',
      'confirmado': 'status-confirmado', 
      'preparando': 'status-preparando',
      'saiu_entrega': 'status-saindo',
      'entregue': 'status-entregue',
      'cancelado': 'status-cancelado'
    }[pedido.status] || '';
    
    const statusTexto = {
      'pendente': 'Pendente',
      'confirmado': 'Confirmado',
      'preparando': 'Preparando',
      'saiu_entrega': 'Saiu para Entrega',
      'entregue': 'Entregue', 
      'cancelado': 'Cancelado'
    }[pedido.status] || pedido.status;
    
    return `
      <div class="pedido-card" data-id="${pedido._id}">
        <div class="pedido-header">
          <h3>Pedido #${pedido.numero}</h3>
          <span class="status ${statusClass}">${statusTexto}</span>
        </div>
        
        <div class="pedido-info">
          <p><strong>Data:</strong> ${new Date(pedido.createdAt).toLocaleString()}</p>
          <p><strong>Total:</strong> R$ ${pedido.valores.total.toFixed(2)}</p>
          <p><strong>Entrega:</strong> ${pedido.entrega.tipo === 'delivery' ? 'Delivery' : 'Retirada'}</p>
        </div>
        
        <div class="pedido-itens">
          <h4>Itens:</h4>
          ${pedido.itens.map(item => `
            <div class="item">
              <span>${item.nome}</span>
              ${item.tamanho ? `<span class="tamanho">${item.tamanho}</span>` : ''}
              <span class="quantidade">Qtd: ${item.quantidade}</span>
              <span class="preco">R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        ${pedido.endereco ? `
          <div class="pedido-endereco">
            <h4>Endereço:</h4>
            <p>${pedido.endereco.rua}, ${pedido.endereco.numero}</p>
            <p>${pedido.endereco.bairro}, ${pedido.endereco.cidade}</p>
          </div>
        ` : ''}
        
        <div class="pedido-acoes">
          <button onclick="verDetalhesPedido('${pedido._id}')">Ver Detalhes</button>
          ${pedido.status === 'entregue' && !pedido.avaliacao ? 
            `<button onclick="avaliarPedido('${pedido._id}')">Avaliar</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Calcular valores do pedido
export function calcularValoresPedido(itens, tipoEntrega = 'delivery') {
  const subtotal = itens.reduce((total, item) => {
    return total + (item.precoUnitario * item.quantidade);
  }, 0);
  
  const taxaEntrega = tipoEntrega === 'delivery' ? 5.00 : 0;
  const total = subtotal + taxaEntrega;
  
  return {
    subtotal: subtotal.toFixed(2),
    taxaEntrega: taxaEntrega.toFixed(2),
    total: total.toFixed(2)
  };
}