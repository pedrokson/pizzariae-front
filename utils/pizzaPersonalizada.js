// utils/pizzaPersonalizada.js

// Tabela de preços dos sabores (exemplo, adapte para seu banco/dados)
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

// Função para calcular preço da pizza personalizada
function calcularPrecoPersonalizada(metade1, metade2, tamanho, borda) {
  const precoMetade1 = precosSabores[metade1] ? precosSabores[metade1][tamanho] : 51.90;
  const precoMetade2 = precosSabores[metade2] ? precosSabores[metade2][tamanho] : 51.90;
  const precoBorda = borda && borda !== '' && borda !== 'Sem borda' ? (precosBorda[borda] || 0) : 0;
  // Corrigido: preço é média das metades + borda
  return (precoMetade1 / 2) + (precoMetade2 / 2) + precoBorda;
}

// Processa o item personalizado para salvar no pedido
function processarItemPersonalizado(item) {
  const precoUnitario = calcularPrecoPersonalizada(item.metade1, item.metade2, item.tamanho, item.borda);
  return {
    tipo: 'personalizada',
    metade1: item.metade1,
    metade2: item.metade2,
    tamanho: item.tamanho,
    borda: item.borda || 'Sem borda',
    quantidade: item.quantidade,
    precoUnitario,
    preco: precoUnitario * item.quantidade,
    observacoes: item.observacoes || '',
    timestamp: new Date().toISOString()
  };
}

// Função para gerar HTML (opcional)
function gerarHtmlPersonalizada(item, index) {
  return `<div style='margin-bottom:10px;border-bottom:1px solid #ccc;padding-bottom:5px;'>`
    + `<strong>${index + 1}. Pizza Personalizada</strong><br>`
    + `Metade 1: ${item.metade1}<br>`
    + `Metade 2: ${item.metade2}<br>`
    + (item.tamanho ? `Tamanho: ${item.tamanho}<br>` : '')
    + (item.borda && item.borda !== '' ? `Borda: ${item.borda}<br>` : 'Borda: Sem borda<br>')
    + `Qtd: ${item.quantidade}x &nbsp; Valor: R$ ${item.precoUnitario.toFixed(2)}<br>`
    + `Subtotal: R$ ${(item.quantidade * item.precoUnitario).toFixed(2)}<br>`
    + `</div>`;
}

// Função para gerar texto (opcional)
function gerarTextoPersonalizada(item, index, linhaPequena) {
  let texto = `${index + 1}. PIZZA PERSONALIZADA\n`;
  texto += `   METADE 1: ${item.metade1}\n`;
  texto += `   METADE 2: ${item.metade2}\n`;
  if (item.tamanho) texto += `   TAMANHO: ${item.tamanho}\n`;
  if (item.borda && item.borda !== '') {
    texto += `   BORDA: ${item.borda}\n`;
  } else {
    texto += `   BORDA: Sem borda\n`;
  }
  texto += `   QTD: ${item.quantidade}x  VALOR: R$ ${item.precoUnitario.toFixed(2)}\n`;
  texto += `   SUBTOTAL: R$ ${(item.quantidade * item.precoUnitario).toFixed(2)}\n`;
  texto += linhaPequena + "\n";
  return texto;
}

module.exports = {
  precosSabores,
  precosBorda,
  calcularPrecoPersonalizada,
  processarItemPersonalizado,
  gerarHtmlPersonalizada,
  gerarTextoPersonalizada
};
