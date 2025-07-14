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
  adicionarItem(produtoId, tamanho = null, quantidade = 1, observacoes = '', tipo = null, metade1 = null, metade2 = null, borda = null) {
    // Se for pizza personalizada, salva todos os dados necessários
    let item;
    if (tipo === 'personalizada') {
      item = {
        id: Date.now(),
        tipo,
        metade1,
        metade2,
        borda: borda && borda !== '' ? borda : 'Sem borda',
        tamanho,
        quantidade,
        observacoes,
        timestamp: new Date().toISOString()
      };
    } else {
      item = {
        id: Date.now(),
        produtoId,
        tamanho,
        quantidade,
        observacoes,
        timestamp: new Date().toISOString()
      };
    }
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


    // Buscar dados dos produtos e renderizar
    for (const item of this.carrinho) {
      // Pizza personalizada
      if (item.tipo === 'personalizada') {
        // Buscar preço das duas metades
        let precoMetade1 = await this.buscarPrecoSabor(item.metade1, item.tamanho);
        let precoMetade2 = await this.buscarPrecoSabor(item.metade2, item.tamanho);
        // Valor da borda
        let precoBorda = await this.buscarPrecoBorda(item.borda, item.tamanho);
        // Preço final: metade de cada sabor + borda
        let precoPizza = (parseFloat(precoMetade1) / 2) + (parseFloat(precoMetade2) / 2) + parseFloat(precoBorda);
        let subtotalItem = precoPizza * item.quantidade;
        total += subtotalItem;
        itensHTML.push(`
          <li class="carrinho-item" data-item-id="${item.id}">
            <div class="item-info">
              <h4>Pizza Personalizada</h4>
              <p>Metade 1: ${this.formatarNomeSabor(item.metade1)}</p>
              <p>Metade 2: ${this.formatarNomeSabor(item.metade2)}</p>
              <p>Tamanho: ${item.tamanho}</p>
              <p>Borda: ${item.borda && item.borda !== '' && item.borda !== 'Sem borda' ? item.borda : 'Sem borda'}</p>
              <p class="preco">R$ ${precoPizza.toFixed(2)} x ${item.quantidade} = R$ ${subtotalItem.toFixed(2)}</p>
            </div>
            <div class="item-controles">
              <button onclick="carrinhoManager.atualizarQuantidade(${item.id}, ${item.quantidade - 1})" ${item.quantidade <= 1 ? 'disabled' : ''}>-</button>
              <span class="quantidade">${item.quantidade}</span>
              <button onclick="carrinhoManager.atualizarQuantidade(${item.id}, ${item.quantidade + 1})">+</button>
              <button class="remover" onclick="carrinhoManager.removerItem(${item.id})">🗑️</button>
            </div>
          </li>
        `);
      } else {
        // Produto normal
        try {
          const produto = await buscarProdutoPorId(item.produtoId);
          let preco = produto.preco;
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
          this.removerItem(item.id);
        }
      }
    }

    lista.innerHTML = itensHTML.join('');

  // Buscar preço do sabor pelo nome e tamanho
  buscarPrecoSabor = async (nomeSabor, tamanho) => {
    // Mapeamento dos nomes para IDs ou busca por nome
    let produtos = [];
    if (window.listarProdutos) {
      produtos = await window.listarProdutos();
    }
    let produto = produtos.find(p => p.nome.toLowerCase().includes(nomeSabor.toLowerCase()));
    if (!produto) {
      // fallback: preço padrão
      return 49.9;
    }
    if (tamanho && produto.tamanhos && produto.tamanhos.length > 0) {
      const tamanhoInfo = produto.tamanhos.find(t => t.nome === tamanho);
      if (tamanhoInfo) return tamanhoInfo.preco;
    }
    return produto.preco;
  }

  // Buscar preço da borda
  buscarPrecoBorda = async (borda, tamanho) => {
    if (!borda || borda === '' || borda === 'Sem borda') return 0;
    // Defina os valores das bordas aqui
    const precosBorda = {
      'Catupiry': 7,
      'Cheddar': 7,
      'Chocolate': 8,
      'Cream Cheese': 8
    };
    return precosBorda[borda] || 7;
  }

  // Formatar nome do sabor para exibição
  formatarNomeSabor = (sabor) => {
    const nomes = {
      'bacon': 'Bacon',
      'portuguesa': 'Portuguesa',
      '4queijos': '4 Queijos',
      'calabresa': 'Calabresa',
      'palmito': 'Palmito',
      'frango': 'Frango com Catupiry ou Cheddar',
      'baiana': 'Baiana',
      'americana': 'Americana',
      'catubresa': 'Catubresa',
      'marguerita': 'Marguerita',
      'napolitana': 'Napolitana',
      'dacasa': 'Da Casa',
      'canadense': 'Canadense',
      'brocolis': 'Brócolis com Bacon',
      'rucula': 'Rúcula com Tomate Seco',
      'jeronimus': 'Jerônimus',
      'caipira': 'Caipira',
      'garden': 'Garden',
      'padoguesa': 'Padoguesa',
      'pizzaiolo': 'Pizzaiolo',
      'pepperoni': 'Pepperoni',
      'romeujulieta': 'Romeu e Julieta',
      'sonhovalsa': 'Sonho de Valsa',
      'mm': 'M & M',
      'prestigio': 'Prestígio',
      'doisamores': 'Dois Amores',
      'bananachocobranco': 'Banana com Chocolate Branco',
      'banoffe': 'Banoffe',
      'bis': 'Bis ao Leite',
      'abacaxi': 'Abacaxi'
    };
    return nomes[sabor] || sabor;
  }
    
    // Calcular valores com taxa de entrega
    // Calcular valores reais dos itens para o modal
    const itensValores = [];
    for (const item of this.carrinho) {
      let precoUnitario = 0;
      if (item.tipo === 'personalizada') {
        let precoMetade1 = await this.buscarPrecoSabor(item.metade1, item.tamanho);
        let precoMetade2 = await this.buscarPrecoSabor(item.metade2, item.tamanho);
        let precoBorda = await this.buscarPrecoBorda(item.borda, item.tamanho);
        precoUnitario = (parseFloat(precoMetade1) / 2) + (parseFloat(precoMetade2) / 2) + parseFloat(precoBorda);
      } else {
        try {
          const produto = await buscarProdutoPorId(item.produtoId);
          precoUnitario = produto.preco;
          if (item.tamanho && produto.tamanhos && produto.tamanhos.length > 0) {
            const tamanhoInfo = produto.tamanhos.find(t => t.nome === item.tamanho);
            if (tamanhoInfo) {
              precoUnitario = tamanhoInfo.preco;
            }
          }
        } catch (error) {
          precoUnitario = 0;
        }
      }
      precoUnitario = isNaN(precoUnitario) ? 0 : precoUnitario;
      itensValores.push({ quantidade: item.quantidade, precoUnitario });
    }
    const valores = calcularValoresPedido(itensValores, 'delivery');
    if (document.getElementById('subtotal-modal')) {
      document.getElementById('subtotal-modal').textContent = `R$ ${valores.subtotal}`;
    }
    if (document.getElementById('total-final-modal')) {
      document.getElementById('total-final-modal').textContent = `R$ ${valores.total}`;
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
        if (item.tipo === 'personalizada') {
          itens.push({
            tipo: 'personalizada',
            metade1: item.metade1,
            metade2: item.metade2,
            tamanho: item.tamanho,
            borda: item.borda,
            quantidade: item.quantidade,
            observacoes: item.observacoes
          });
        } else {
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
// Função global para adicionar ao carrinho (chamada pelos botões dos produtos)
// Agora aceita argumentos extras para pizza personalizada
window.adicionarAoCarrinho = (produtoId, tamanho = null, quantidade = 1, observacoes = '', tipo = null, metade1 = null, metade2 = null, borda = null) => {
  if (!carrinhoManager) {
    carrinhoManager = new CarrinhoManager();
  }
  carrinhoManager.adicionarItem(produtoId, tamanho, quantidade, observacoes, tipo, metade1, metade2, borda);
  alert('Item adicionado ao carrinho!');
};

// Exportar para uso em outros módulos
export { CarrinhoManager };