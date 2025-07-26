function alterarQuantidade(btn, delta) {
  const input = btn.parentElement.querySelector(".quantidade-pizza");
  let valor = parseInt(input.value) || 1;
  valor += delta;
  if (valor < 1) valor = 1;
  input.value = valor;
}

function mostrarTamanhos(botao) {
  // Esconde todos os outros botoes-tamanho abertos
  document.querySelectorAll(".botoes-tamanho").forEach((div) => {
    div.style.display = "none";
  });

  // Encontrar o container de tamanhos no mesmo card
  const card = botao.closest(".menu-item");
  if (card) {
    const botoesContainer = card.querySelector(".botoes-tamanho");
    if (botoesContainer) {
      botoesContainer.style.display = "block";
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
    if (nome && nome.toLowerCase().includes("personalizada")) {
      // Tenta obter os sabores das metades do nome, ex: "Pizza Personalizada (Frango/Bacon)"
      let metade1 = "",
        metade2 = "";
      const match = nome.match(/\(([^\/]+)\/([^\)]+)\)/);
      if (match) {
        metade1 = match[1].trim();
        metade2 = match[2].trim();
      }
      // Importa a função de cálculo do carrinho.js
      if (
        window.CarrinhoManager &&
        typeof window.CarrinhoManager.prototype
          .calcularPrecoPizzaPersonalizada === "function"
      ) {
        const cm = new window.CarrinhoManager();
        // Adiciona log detalhado do cálculo
        let logDetalhado = {};
        const originalConsoleLog = console.log;
        console.log = function (...args) {
          if (
            args[0] &&
            typeof args[0] === "string" &&
            args[0].includes("[calcularPrecoPizzaPersonalizada] Dados:")
          ) {
            logDetalhado = args[1];
          }
          originalConsoleLog.apply(console, args);
        };
        precoFinal = await cm.calcularPrecoPizzaPersonalizada(
          metade1,
          metade2,
          borda,
          tamanho
        );
        console.log = originalConsoleLog;
        if (precoFinal === 49.9) {
          let msg =
            "❌ Erro: Não foi possível encontrar o preço correto para essa combinação.\n";
          msg += `Sabores: ${metade1} / ${metade2}\n`;
          msg += `Tamanho: ${tamanho}\n`;
          msg += `Borda: ${borda}\n`;
          if (logDetalhado) {
            if (logDetalhado.precoMetade1 === null)
              msg += `Sabor metade 1 não encontrado: ${metade1} (${logDetalhado.metade1Key})\n`;
            if (logDetalhado.precoMetade2 === null)
              msg += `Sabor metade 2 não encontrado: ${metade2} (${logDetalhado.metade2Key})\n`;
            if (!["Media", "Grande"].includes(logDetalhado.tamanhoKey))
              msg += `Tamanho não reconhecido: ${logDetalhado.tamanhoKey}\n`;
          }
          alert(msg);
          return;
        }
      }
    } else {
      if (borda) precoFinal += 13.9;
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
    if (
      !(
        nome &&
        nome.toLowerCase().includes("personalizada") &&
        precoFinal === 49.9
      )
    ) {
      // Buscar o ID do produto pelo nome e tamanho
      let produtoId = null;
      try {
        if (window.listarProdutos) {
          const produtos = await window.listarProdutos();
          const nomeNormalizado = nome.replace(/pizza /i, "").trim().toLowerCase();
          const tamanhoNormalizado = (tamanho || "").toLowerCase();
          console.log('[DEBUG] Buscando produto:', { nome, tamanho, nomeNormalizado, tamanhoNormalizado });
          for (const prod of produtos) {
            console.log('[DEBUG] Produto do backend:', { nome: prod.nome, tamanhos: prod.tamanhos, _id: prod._id });
            if (
              prod.nome &&
              prod.nome.trim().toLowerCase() === nomeNormalizado &&
              prod.tamanhos &&
              prod.tamanhos.some(
                (t) => t.nome.trim().toLowerCase() === tamanhoNormalizado
              )
            ) {
              produtoId = prod._id;
              console.log('[DEBUG] Produto encontrado! _id:', produtoId);
              break;
            }
          }
          if (!produtoId) {
            console.warn('[DEBUG] Nenhum produto correspondente encontrado para:', { nome, tamanho });
          }
        }
      } catch (e) {
        console.error('[DEBUG] Erro ao buscar produtoId:', e);
      }
      const item = {
        nome: tamanho ? nome + " (" + tamanho + ")" : nome,
        preco: precoFinal,
        quantidade: quantidade,
        borda_recheada: borda,
        produto: produtoId,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      };
      carrinho.push(item);
      // Salvar no localStorage
      const carrinhoString = JSON.stringify(carrinho);
      localStorage.setItem("carrinho", carrinhoString);
      // Atualizar contador
      atualizarContadorCarrinho();
      // Feedback visual universal (funciona para pizzas doces e bebidas)
      setTimeout(() => {
        if (!btn.hasAttribute('data-original-text') || btn.getAttribute('data-original-text') === '' || btn.getAttribute('data-original-text') === 'Adicionar') {
          if (tamanho && (tamanho === 'Média' || tamanho === 'Grande')) {
            btn.setAttribute('data-original-text', tamanho);
          } else {
            btn.setAttribute('data-original-text', btn.textContent);
          }
        }
        if (card && card.querySelector('h3') && card.querySelector('h3').textContent.match(/coca|fanta|sprite|guaran|água|suco|refrigerante/i)) {
          btn.textContent = 'Adicionar';
        } else if (tamanho && (tamanho === 'Média' || tamanho === 'Grande')) {
          btn.textContent = tamanho;
        } else if (btn.hasAttribute('data-original-text')) {
          btn.textContent = btn.getAttribute('data-original-text');
        } else {
          btn.textContent = 'Adicionar';
        }
        btn.style.backgroundColor = btn.getAttribute('data-original-color');
      }, 2000);
      alert(
        `✅ ${quantidade}x ${nome}$${tamanho ? ` (${tamanho})` : ""} adicionado ao carrinho!`
      );
    }
  } catch (error) {
    alert("❌ Erro ao adicionar item ao carrinho: " + error.message);
  }
}
