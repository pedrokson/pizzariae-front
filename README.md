# 🍕 Pizzaria Jerônimu's - Frontend

Interface moderna e responsiva para sistema de pedidos online da Pizzaria Jerônimu's.

## ✅ Status: Frontend Separado com Sucesso!

O frontend foi movido para pasta independente e está pronto para deploy.

## 📋 Funcionalidades Implementadas

- ✅ **Autenticação JWT**: Login e cadastro seguro
- ✅ **Cardápio Dinâmico**: Pizzas, bebidas e doces 
- ✅ **Carrinho Inteligente**: Persistente no localStorage
- ✅ **Pedidos WhatsApp**: Formatação profissional
- ✅ **PWA**: Aplicativo web progressivo
- ✅ **Responsivo**: Desktop e mobile
- ✅ **Integração API**: Backend Node.js + MongoDB

## 🚀 Como executar

### Pré-requisitos
- Node.js 14+ instalado
- Backend rodando em `https://pizzaria-backend-eueqgmb0fyb5cdbj.brazilsouth-01.azurewebsites.net`

### Instalação e execução

```bash
# Entrar na pasta do frontend
cd "c:\Users\pedro\Desktop\pizzaria-frontend"

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Ou manualmente
npx live-server --port=3000 --cors --open
```

O frontend será executado em: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
pizzaria-frontend/
├── 📄 index.html          # Página inicial
├── 🔐 login.html          # Autenticação  
├── 📝 cadastro.html       # Registro de usuários
├── 🍕 menu.html           # Cardápio principal
├── 🛒 carrinho.html       # Carrinho de compras
├── 📋 pedidos.html        # Histórico de pedidos
├── 🥤 bebidas.html        # Cardápio de bebidas
├── 🍰 doces.html          # Cardápio de doces
├── 📱 manifest.json       # Configuração PWA
├── ⚙️ service-worker.js   # Service Worker
├── 📦 package.json        # Dependências e scripts
├── 📁 config/
│   └── api.js            # Configuração da API
├── 📁 css/
│   └── styles.css        # Estilos CSS
├── 📁 js/
│   ├── auth.js           # Lógica de autenticação
│   └── menu.js           # Lógica do cardápio
└── 📁 img/               # Imagens das pizzas (71 imagens)
```

## 🔗 Integração com Backend

- **URL da API**: `https://pizzaria-backend-eueqgmb0fyb5cdbj.brazilsouth-01.azurewebsites.net/api`
- **Autenticação**: JWT Token
- **Endpoints disponíveis**:
  - `GET /produtos` - Listar produtos
  - `POST /clientes` - Cadastrar usuário
  - `POST /clientes/login` - Fazer login
  - `POST /pedidos` - Criar pedido

## 📱 Progressive Web App (PWA)

O site pode ser instalado como aplicativo:

1. **Desktop**: Ícone "Instalar" na barra de endereços
2. **Mobile**: "Adicionar à tela inicial" no menu do navegador
3. **Funciona offline**: Service Worker implementado

## 🚀 Deploy - Opções Disponíveis

### 1. Netlify (Recomendado)
```bash
# Método 1: Drag & Drop
# Arraste a pasta pizzaria-frontend para netlify.com

# Método 2: CLI
npm install -g netlify-cli
netlify deploy --prod --dir .
```

### 2. Azure Static Web Apps
```bash
# Configure no portal Azure:
# - App location: /
# - Output location: /
# - Sem build necessário
```

### 3. GitHub Pages
```bash
# Suba para GitHub e ative Pages
# Funciona diretamente (site estático)
```

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Storage**: LocalStorage para carrinho e autenticação
- **API**: Fetch API para comunicação
- **PWA**: Service Workers + Web App Manifest
- **UI/UX**: Design responsivo e moderno
- **Build**: Live-server para desenvolvimento

## 🧪 Testes Realizados

✅ **Fluxo de Autenticação**
- Cadastro de usuário
- Login com JWT
- Logout e limpeza de dados

✅ **Carrinho de Compras**
- Adicionar/remover itens
- Persistência após login
- Cálculo de totais
- Finalização via WhatsApp

✅ **Responsividade**
- Desktop (1920px+)
- Tablet (768px-1024px)
- Mobile (320px-767px)

✅ **PWA**
- Instalação em dispositivos
- Funcionamento offline básico
- Ícones e manifesto

## 📞 WhatsApp Integration

Pedidos são enviados via WhatsApp com formatação profissional:

```
🍕 *NOVO PEDIDO - JERÔNIMU'S PIZZARIA*

📋 *ITENS DO PEDIDO:*

1. *Pizza 4 Queijos* (Média)
   📦 Quantidade: 2
   💰 Valor unitário: R$ 49,90
   🔢 Subtotal: R$ 99,80

━━━━━━━━━━━━━━━━━━━━━━━━
💵 *TOTAL GERAL: R$ 99,80*

📍 *Dados do Cliente:*
Entre em contato para confirmar endereço.

⏰ Pedido feito em: 04/07/2025, 15:30:25

Obrigado pela preferência! 🙏
```

## 🎯 Próximos Passos

1. **Deploy em Produção**
   - Subir para Netlify/Azure
   - Configurar domínio personalizado
   - Configurar HTTPS

2. **Melhorias Futuras**
   - Sistema de avaliações
   - Chat ao vivo
   - Notificações push
   - Geolocalização para delivery

3. **Monitoramento**
   - Google Analytics
   - Sentry para erros
   - Performance monitoring

## 📊 Estatísticas do Projeto

- **Total de arquivos**: 71
- **Páginas HTML**: 9
- **Imagens**: 52
- **Scripts JS**: 3
- **Estilos CSS**: 1
- **Tamanho total**: ~2MB

---

**🎉 Frontend 100% funcional e pronto para deploy independente!**

*Desenvolvido com ❤️ para Pizzaria Jerônimu's*
