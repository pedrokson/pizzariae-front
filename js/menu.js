function alterarQuantidade(btn, delta) {
  const input = btn.parentElement.querySelector('.quantidade-pizza');
  let valor = parseInt(input.value) || 1;
  valor += delta;
  if (valor < 1) valor = 1;
  input.value = valor;
}

function mostrarTamanhos(botao) {
  // Esconde todos os outros botoes-tamanho abertos
  document.querySelectorAll('.botoes-tamanho').forEach(div => div.style.display = 'none');
  // Mostra o container de tamanhos do card clicado
  botao.nextElementSibling.style.display = 'block';
}

function adicionarCarrinho(nome, tamanho, preco, btn) {
  console.log('🛒 [DEBUG] Iniciando adição ao carrinho');
  console.log('📝 [DEBUG] Parâmetros:', { nome, tamanho, preco });
  
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
    
    console.log('🔢 [DEBUG] Quantidade:', quantidade, 'Borda:', borda);
    
    // Soma o preço da borda, se houver
    let precoFinal = preco;
    if (borda) precoFinal += 13.90;
    
    // Pegar carrinho atual
    let carrinho = [];
    try {
      const carrinhoAtual = localStorage.getItem("carrinho");
      console.log('📦 [DEBUG] Carrinho atual (string):', carrinhoAtual);
      carrinho = carrinhoAtual ? JSON.parse(carrinhoAtual) : [];
      console.log('📦 [DEBUG] Carrinho atual (array):', carrinho);
    } catch (e) {
      console.error('❌ [DEBUG] Erro ao ler carrinho:', e);
      carrinho = [];
    }
    
    const item = {
      nome: nome + " (" + tamanho + ")",
      preco: precoFinal,
      quantidade: quantidade,
      borda_recheada: borda,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    console.log('📋 [DEBUG] Item a ser adicionado:', item);
    
    carrinho.push(item);
    
    // Salvar no localStorage
    const carrinhoString = JSON.stringify(carrinho);
    localStorage.setItem("carrinho", carrinhoString);
    
    console.log('💾 [DEBUG] Carrinho salvo:', carrinhoString);
    
    // Verificar se foi salvo
    const verificacao = localStorage.getItem("carrinho");
    console.log('✅ [DEBUG] Verificação de salvamento:', verificacao);
    
    // Atualizar contador
    atualizarContadorCarrinho();
    
    // Feedback visual
    btn.style.background = '#228b22';
    btn.textContent = '✓ Adicionado!';
    
    setTimeout(() => {
      btn.style.background = '#b22222';
      btn.textContent = 'Adicionar';
    }, 2000);
    
    console.log('✅ [DEBUG] Item adicionado com sucesso!');
    
    // Mostrar alerta de sucesso
    alert(`✅ ${quantidade}x ${nome} (${tamanho}) adicionado ao carrinho!`);
    
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao adicionar:', error);
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
  
  console.log('🔢 Contador atualizado:', total);
}

// Inicializar contador ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  atualizarContadorCarrinho();
  console.log('📋 Menu carregado, contador inicializado');
});