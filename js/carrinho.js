import { buscarProdutoPorId } from './produtos.js';
import { criarPedido, calcularValoresPedido } from './pedidos.js';
import { getUser, verificarAutenticacao } from './auth.js';

// Gerenciar carrinho
class CarrinhoManager {
  // Função centralizada para calcular preço da pizza personalizada
  async calcularPrecoPizzaPersonalizada(metade1, metade2, borda, tamanho) {
    // Importa a tabela fixa de preços
    const precosSabores = {
      bacon: { Media: 51.90, Grande: 59.90 },
      portuguesa: { Media: 51.90, Grande: 59.90 },
      '4queijos': { Media: 54.90, Grande: 64.90 },
      calabresa: { Media: 51.90, Grande: 59.90 },
      palmito: { Media: 51.90, Grande: 59.90 },
      frango: { Media: 51.90, Grande: 59.90 },
      baiana: { Media: 51.90, Grande: 59.90 },
      americana: { Media: 51.90, Grande: 59.90 },
      napolitana: { Media: 51.90, Grande: 59.90 },
      catubresa: { Media: 56.90, Grande: 64.90 },
      marguerita: { Media: 56.90, Grande: 64.90 },
      dacasa: { Media: 56.90, Grande: 64.90 },
      canadense: { Media: 56.90, Grande: 64.90 },
      brocolis: { Media: 56.90, Grande: 64.90 },
      rucula: { Media: 56.90, Grande: 64.90 },
      jeronimus: { Media: 56.90, Grande: 64.90 },
      caipira: { Media: 56.90, Grande: 64.90 },
      garden: { Media: 56.90, Grande: 64.90 },
      padoguesa: { Media: 56.90, Grande: 64.90 },
      pizzaiolo: { Media: 56.90, Grande: 64.90 },
      pepperoni: { Media: 56.90, Grande: 64.90 },
      romeujulieta: { Media: 51.90, Grande: 59.90 },
      sonhovalsa: { Media: 51.90, Grande: 59.90 },
      mm: { Media: 51.90, Grande: 59.90 },
      prestigio: { Media: 51.90, Grande: 59.90 },
      doisamores: { Media: 51.90, Grande: 59.90 },
      bananachocobranco: { Media: 51.90, Grande: 59.90 },
      banoffe: { Media: 51.90, Grande: 59.90 },
      bis: { Media: 51.90, Grande: 59.90 },
      abacaxi: { Media: 51.90, Grande: 59.90 }
    };
    const precosBorda = {
      'Catupiry': 7,
      'Cheddar': 7,
      'Chocolate': 8,
      'Cream Cheese': 8
    };
    const precoMetade1 = precosSabores[metade1] ? precosSabores[metade1][tamanho] : 51.90;
    const precoMetade2 = precosSabores[metade2] ? precosSabores[metade2][tamanho] : 51.90;
    const precoBorda = borda && borda !== '' && borda !== 'Sem borda' ? (precosBorda[borda] || 0) : 0;
    return (precoMetade1 / 2) + (precoMetade2 / 2) + precoBorda;
  }
  constructor() {
    this.carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    this.init();
  }

  init() {
    this.renderizarCarrinho();
    this.setupEventListeners();
  }

  // Adicionar item ao carrinho
  async adicionarItem(produtoId, tamanho = null, quantidade = 1, observacoes = '', tipo = null, metade1 = null, metade2 = null, borda = null) {
    let item;
    if (tipo === 'personalizada') {
      const preco = await this.calcularPrecoPizzaPersonalizada(metade1, metade2, borda, tamanho);
      item = {
        id: Date.now(),
        tipo,
        metade1,
        metade2,
        borda: borda && borda !== '' ? borda : 'Sem borda',
        tamanho,
        quantidade,
        observacoes,
        preco,
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
    return item;
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
        // Usa o preço salvo no item
        let precoPizza = item.preco;
        let subtotalItem = precoPizza * item.quantidade;
        total += subtotalItem;
        itensHTML.push(`
          <li class="carrinho-item" data-item-id="${item.id}">
            <div class="item-info">
              <h4>Pizza Personalizada</h4>
              <p>Metade 1: ${this.formatarNomeSabor(item.metade1)}</p>
              <p>Metade 2: ${this.formatarNomeSabor(item.metade2)}</p>
              <p>Tamanho: ${item.tamanho}</p>
              <p><strong>Borda:</strong> ${item.borda && item.borda !== '' ? item.borda : 'Sem borda'}</p>
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
        // Usa o preço salvo no item
        precoUnitario = item.preco;
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
            observacoes: item.observacoes,
            preco: item.preco // Garante que o preço correto vai para o pedido
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

  // Buscar preço do sabor pelo nome e tamanho
  async buscarPrecoSabor(nomeSabor, tamanho) {
    let produtos = [];
    if (window.listarProdutos) {
      produtos = await window.listarProdutos();
    }
    // Busca exata pelo nome do sabor
    let produto = produtos.find(p => p.nome.toLowerCase() === nomeSabor.toLowerCase());
    if (!produto) {
      // fallback: busca parcial
      produto = produtos.find(p => p.nome.toLowerCase().includes(nomeSabor.toLowerCase()));
    }
    if (!produto) {
      // fallback: preço padrão
      return 49.9;
    }
    if (tamanho && produto.tamanhos && produto.tamanhos.length > 0) {
      const tamanhoInfo = produto.tamanhos.find(t => t.nome === tamanho);
      if (tamanhoInfo) return tamanhoInfo.preco;
    }
    return produto.preco;
  },

  // Buscar preço da borda
  async buscarPrecoBorda(borda, tamanho) {
    if (!borda || borda === '' || borda === 'Sem borda') return 0;
    // Defina os valores das bordas aqui
    const precosBorda = {
      'Catupiry': 7,
      'Cheddar': 7,
      'Chocolate': 8,
      'Cream Cheese': 8
    };
    return precosBorda[borda] || 7;
  },
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
// Agora aceita argumentos extras para pizza personalizada
window.adicionarAoCarrinho = (produtoId, tamanho = null, quantidade = 1, observacoes = '', tipo = null, metade1 = null, metade2 = null, borda = null) => {
  if (!carrinhoManager) {
    carrinhoManager = new CarrinhoManager();
  }
  if (tipo === 'personalizada') {
    (async () => {
      const item = await carrinhoManager.adicionarItem(produtoId, tamanho, quantidade, observacoes, tipo, metade1, metade2, borda);
      alert(`Pizza personalizada adicionada ao carrinho! Preço unitário: R$ ${item.preco ? item.preco.toFixed(2) : 'Erro ao calcular preço'}`);
    })();
  } else {
    carrinhoManager.adicionarItem(produtoId, tamanho, quantidade, observacoes, tipo, metade1, metade2, borda);
    alert('Item adicionado ao carrinho!');
  }
};

// Exportar para uso em outros módulos
export { CarrinhoManager };