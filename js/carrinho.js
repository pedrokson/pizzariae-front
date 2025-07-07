import { buscarProdutoPorId } from './produtos.js';
import { criarPedido, calcularValoresPedido } from './pedidos.js';
import { getUser, verificarAutenticacao } from './auth.js';

// Gerenciar carrinho
class CarrinhoManager {
  constructor() {
    this.carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    this.init();
  }

  init() {
    this.renderizarCarrinho();
    this.setupEventListeners();
  }

  // Adicionar item ao carrinho
  adicionarItem(produtoId, tamanho = null, quantidade = 1, observacoes = '') {
    const item = {
      id: Date.now(), // ID único do item no carrinho
      produtoId,
      tamanho,
      quantidade,
      observacoes,
      timestamp: new Date().toISOString()
    };
    
    this.carrinho.push(item);
    this.salvarCarrinho();
    this.renderizarCarrinho();
  }

  // Remover item do carrinho
  removerItem(itemId) {
    this.carrinho = this.carrinho.filter(item => item.id !== itemId);
    this.salvarCarrinho();
    this.renderizarCarrinho();
  }

  // Atualizar quantidade
  atualizarQuantidade(itemId, novaQuantidade) {
    const item = this.carrinho.find(item => item.id === itemId);
    if (item && novaQuantidade > 0) {
      item.quantidade = novaQuantidade;
      this.salvarCarrinho();
      this.renderizarCarrinho();
    }
  }

  // Limpar carrinho
  limparCarrinho() {
    this.carrinho = [];
    this.salvarCarrinho();
    this.renderizarCarrinho();
  }

  // Salvar no localStorage
  salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(this.carrinho));
  }

  // Renderizar carrinho na página
  async renderizarCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    const totalElement = document.getElementById('total');
    
    if (!lista) return;

    if (this.carrinho.length === 0) {
      lista.innerHTML = "<li>Seu carrinho está vazio.</li>";
      if (totalElement) totalElement.textContent = "Total: R$ 0.00";
      return;
    }

    let total = 0;
    const itensHTML = [];

    // Buscar dados dos produtos
    for (const item of this.carrinho) {
      try {
        const produto = await buscarProdutoPorId(item.produtoId);
        
        let preco = produto.preco;
        
        // Se tem tamanho específico, buscar preço do tamanho
        if (item.tamanho && produto.tamanhos && produto.tamanhos.length > 0) {
          const tamanhoInfo = produto.tamanhos.find(t => t.nome === item.tamanho);
          if (tamanhoInfo) {
            preco = tamanhoInfo.preco;
          }
        }
        
        const subtotalItem = preco * item.quantidade;
        total += subtotalItem;

        itensHTML.push(`
          <li class="carrinho-item" data-item-id="${item.id}">
            <div class="item-info">
              <h4>${produto.nome}</h4>
              ${item.tamanho ? `<p class="tamanho">Tamanho: ${item.tamanho}</p>` : ''}
              ${item.observacoes ? `<p class="observacoes">Obs: ${item.observacoes}</p>` : ''}
              <p class="preco">R$ ${preco.toFixed(2)} x ${item.quantidade} = R$ ${subtotalItem.toFixed(2)}</p>
            </div>
            <div class="item-controles">
              <button onclick="carrinhoManager.atualizarQuantidade(${item.id}, ${item.quantidade - 1})" ${item.quantidade <= 1 ? 'disabled' : ''}>-</button>
              <span class="quantidade">${item.quantidade}</span>
              <button onclick="carrinhoManager.atualizarQuantidade(${item.id}, ${item.quantidade + 1})">+</button>
              <button class="remover" onclick="carrinhoManager.removerItem(${item.id})">🗑️</button>
            </div>
          </li>
        `);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        // Remover item inválido do carrinho
        this.removerItem(item.id);
      }
    }

    lista.innerHTML = itensHTML.join('');
    
    // Calcular valores com taxa de entrega
    const valores = calcularValoresPedido(this.carrinho.map(item => ({
      quantidade: item.quantidade,
      precoUnitario: 0 // Será calculado no backend
    })), 'delivery');
    
    if (totalElement) {
      totalElement.innerHTML = `
        <div class="resumo-valores">
          <p>Subtotal: R$ ${total.toFixed(2)}</p>
          <p>Taxa de entrega: R$ 5.00</p>
          <p class="total-final"><strong>Total: R$ ${(total + 5).toFixed(2)}</strong></p>
        </div>
      `;
    }
  }

  // Finalizar pedido
  async finalizarPedido(dadosEntrega, formaPagamento) {
    if (this.carrinho.length === 0) {
      alert('Carrinho está vazio!');
      return;
    }

    if (!verificarAutenticacao()) {
      alert('Você precisa estar logado para fazer um pedido!');
      window.location.href = '/login.html';
      return;
    }

    try {
      // Preparar itens do pedido
      const itens = [];
      
      for (const item of this.carrinho) {
        const produto = await buscarProdutoPorId(item.produtoId);
        
        let preco = produto.preco;
        if (item.tamanho && produto.tamanhos && produto.tamanhos.length > 0) {
          const tamanhoInfo = produto.tamanhos.find(t => t.nome === item.tamanho);
          if (tamanhoInfo) {
            preco = tamanhoInfo.preco;
          }
        }
        
        itens.push({
          produto: item.produtoId,
          tamanho: item.tamanho,
          quantidade: item.quantidade,
          precoUnitario: preco,
          observacoes: item.observacoes
        });
      }

      const dadosPedido = {
        itens,
        endereco: dadosEntrega,
        formaPagamento,
        entrega: {
          tipo: 'delivery',
          tempoEstimado: 45
        }
      };

      const resultado = await criarPedido(dadosPedido);
      
      if (resultado && !resultado.error) {
        alert('Pedido criado com sucesso! Número: ' + resultado.numero);
        this.limparCarrinho();
        window.location.href = '/pedidos.html';
      } else {
        alert('Erro ao criar pedido: ' + (resultado.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    }
  }

  setupEventListeners() {
    // Botão limpar carrinho
    const btnLimpar = document.getElementById('limpar-carrinho');
    if (btnLimpar) {
      btnLimpar.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar o carrinho?')) {
          this.limparCarrinho();
        }
      });
    }
  }
}

// Instanciar gerenciador do carrinho
let carrinhoManager;

// Inicializar quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  carrinhoManager = new CarrinhoManager();
});

// Função global para adicionar ao carrinho (chamada pelos botões dos produtos)
window.adicionarAoCarrinho = (produtoId, tamanho = null, quantidade = 1) => {
  if (!carrinhoManager) {
    carrinhoManager = new CarrinhoManager();
  }
  carrinhoManager.adicionarItem(produtoId, tamanho, quantidade);
  alert('Item adicionado ao carrinho!');
};

// Exportar para uso em outros módulos
export { CarrinhoManager };