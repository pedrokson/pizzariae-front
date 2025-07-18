function alterarQuantidade(btn, delta) {
  const input = btn.parentElement.querySelector('.quantidade-pizza');
  let valor = parseInt(input.value) || 1;
  valor += delta;
  if (valor < 1) valor = 1;
  input.value = valor;
}

function mostrarTamanhos(botao) {
  // Esconde todos os outros botoes-tamanho abertos
  document.querySelectorAll('.botoes-tamanho').forEach(div => {
    div.style.display = 'none';
  });
  
  // Encontrar o container de tamanhos no mesmo card
  const card = botao.closest('.menu-item');
  if (card) {
    const botoesContainer = card.querySelector('.botoes-tamanho');
    if (botoesContainer) {
      botoesContainer.style.display = 'block';
    }
  }
}

async function adicionarCarrinho(nome, tamanho, preco, btn) {
  try {
    let quantidade = 1;
    let borda = "";
    const card = btn.closest(".menu-item");
    
    if (card) {
      const qInput = card.querySelector(".quantidade-pizza");
      if (qInput) quantidade = parseInt(qInput.value) || 1;
      const bordaSelect = card.querySelector(".borda-recheada");
      if (bordaSelect) borda = bordaSelect.value;
    }
    
    // Corrigir cálculo para pizza personalizada
    let precoFinal = preco;
    // Detecta se é pizza personalizada (nome contém "Personalizada" ou similar)
    if (nome && nome.toLowerCase().includes('personalizada')) {
      // Tenta obter os sabores das metades do nome, ex: "Pizza Personalizada (Frango/Bacon)"
      let metade1 = '', metade2 = '';
      const match = nome.match(/\(([^\/]+)\/([^\)]+)\)/);
      if (match) {
        metade1 = match[1].trim();
        metade2 = match[2].trim();
      }
      // Importa a função de cálculo do carrinho.js
      if (window.CarrinhoManager && typeof window.CarrinhoManager.prototype.calcularPrecoPizzaPersonalizada === 'function') {
        const cm = new window.CarrinhoManager();
        // Adiciona log detalhado do cálculo
        let logDetalhado = {};
        const originalConsoleLog = console.log;
        console.log = function(...args) {
          if (args[0] && typeof args[0] === 'string' && args[0].includes('[calcularPrecoPizzaPersonalizada] Dados:')) {
            logDetalhado = args[1];
          }
          originalConsoleLog.apply(console, args);
        };
        precoFinal = await cm.calcularPrecoPizzaPersonalizada(metade1, metade2, borda, tamanho);
        console.log = originalConsoleLog;
        if (precoFinal === 49.9) {
          let msg = '❌ Erro: Não foi possível encontrar o preço correto para essa combinação.\n';
          msg += `Sabores: ${metade1} / ${metade2}\n`;
          msg += `Tamanho: ${tamanho}\n`;
          msg += `Borda: ${borda}\n`;
          if (logDetalhado) {
            if (logDetalhado.precoMetade1 === null) msg += `Sabor metade 1 não encontrado: ${metade1} (${logDetalhado.metade1Key})\n`;
            if (logDetalhado.precoMetade2 === null) msg += `Sabor metade 2 não encontrado: ${metade2} (${logDetalhado.metade2Key})\n`;
            if (!['Media','Grande'].includes(logDetalhado.tamanhoKey)) msg += `Tamanho não reconhecido: ${logDetalhado.tamanhoKey}\n`;
          }
          alert(msg);
          return;
        }
      }
    } else {
      if (borda) precoFinal += 13.90;
    }
    
    // Pegar carrinho atual
    let carrinho = [];
    try {
      const carrinhoAtual = localStorage.getItem("carrinho");
      carrinho = carrinhoAtual ? JSON.parse(carrinhoAtual) : [];
    } catch (e) {
      carrinho = [];
    }
    
    // Só adiciona ao carrinho se não for pizza personalizada com preço fallback
    if (!(nome && nome.toLowerCase().includes('personalizada') && precoFinal === 49.9)) {
      const item = {
        nome: nome + " (" + tamanho + ")",
        preco: precoFinal,
        quantidade: quantidade,
        borda_recheada: borda,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      carrinho.push(item);
      // Salvar no localStorage
      const carrinhoString = JSON.stringify(carrinho);
      localStorage.setItem("carrinho", carrinhoString);
      // Atualizar contador
      atualizarContadorCarrinho();
      // Feedback visual
      btn.style.background = '#228b22';
      btn.textContent = '✓ Adicionado!';
      setTimeout(() => {
        btn.style.background = '#b22222';
        btn.textContent = 'Adicionar';
      }, 2000);
      // Mostrar alerta de sucesso
      alert(`✅ ${quantidade}x ${nome} (${tamanho}) adicionado ao carrinho!`);
    }
    
  } catch (error) {
    alert('❌ Erro ao adicionar item ao carrinho: ' + error.message);
  }
}

function atualizarContadorCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
  
  // Buscar elemento do contador (pode estar no header)
  const contador = document.querySelector('.cart-count, .carrinho-count, #carrinho-count');
  if (contador) {
    contador.textContent = total;
    contador.style.display = total > 0 ? 'inline' : 'none';
  }
}

// Inicializar contador ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  atualizarContadorCarrinho();
});