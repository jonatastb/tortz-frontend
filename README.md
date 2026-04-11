# 🎂 Doce Tortz — Frontend Vue 3

Front-end completo integrado com API Laravel REST.
Cores da marca: **#fc944c** (brand) · **#b46c54** (terra)

---

## 🚀 Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env
# Edite VITE_API_URL com a URL da sua API Laravel

# 3. Inicie em desenvolvimento
npm run dev

# 4. Build de produção
npm run build
```

---

## 🔌 Integração com a API Laravel

Todos os dados vêm da API real. Defina a URL em `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

### Endpoints consumidos

| Método | Endpoint              | Descrição                        | Auth |
|--------|-----------------------|----------------------------------|------|
| POST   | `/auth/login`         | Login admin                      | ❌    |
| POST   | `/auth/logout`        | Logout                           | ✅    |
| GET    | `/auth/me`            | Usuário autenticado              | ✅    |
| GET    | `/products`           | Listar produtos (`?featured=1`)  | ❌    |
| GET    | `/products/{id}`      | Detalhe do produto               | ❌    |
| POST   | `/products`           | Criar produto                    | ✅    |
| PUT    | `/products/{id}`      | Editar produto                   | ✅    |
| DELETE | `/products/{id}`      | Deletar produto                  | ✅    |
| GET    | `/categories`         | Listar categorias                | ❌    |
| POST   | `/categories`         | Criar categoria                  | ✅    |
| PUT    | `/categories/{id}`    | Editar categoria                 | ✅    |
| DELETE | `/categories/{id}`    | Deletar categoria                | ✅    |
| GET    | `/orders`             | Listar pedidos (admin)           | ✅    |
| GET    | `/orders/{id}`        | Detalhe do pedido                | ✅    |
| POST   | `/orders`             | Criar pedido (checkout público)  | ❌    |
| PUT    | `/orders/{id}/status` | Atualizar status do pedido       | ✅    |
| GET    | `/admin/stats`        | Métricas do dashboard (opcional) | ✅    |

### Formato de resposta esperado

O frontend aceita tanto arrays diretos quanto respostas paginadas do Laravel:

```json
// Array direto
[{ "id": 1, "name": "Torta de Morango", ... }]

// Paginado (padrão Laravel)
{ "data": [{ "id": 1, "name": "Torta de Morango", ... }], "meta": { ... } }
```

### Payload do Login (POST /auth/login)
```json
{ "email": "admin@docetortz.com.br", "password": "sua_senha" }
```
Resposta esperada:
```json
{ "token": "1|abc123...", "user": { "id": 1, "name": "Admin", "email": "...", "role": "admin" } }
```

---

## 🎨 Design System

| Token Tailwind    | Cor hex   | Uso                        |
|-------------------|-----------|----------------------------|
| `brand-500`       | `#fc944c` | Cor primária (botões, CTAs)|
| `terra-500`       | `#b46c54` | Cor secundária (preços)    |
| `warm-800`        | `#664838` | Texto principal            |
| `cream-50`        | `#fffdf9` | Fundo da página            |

---

## 📁 Arquitetura

```
src/
├── services/           # 🔌 API calls (Axios)
│   ├── api.js          #   Instância Axios + interceptors
│   ├── authService.js  #   Login / Logout / Me
│   ├── productService.js
│   ├── categoryService.js (exportado em productService.js)
│   └── orderService.js
│
├── stores/             # 🗄️  Estado global (Pinia)
│   ├── authStore.js    #   Token + usuário logado
│   ├── cartStore.js    #   Carrinho (localStorage)
│   ├── adminStore.js   #   Dados admin + chamadas à API
│   └── toastStore.js   #   Notificações globais
│
├── pages/
│   ├── public/         #   Home, Produto, Carrinho, Checkout
│   └── admin/          #   Dashboard, Produtos, Categorias, Pedidos
│
├── layouts/            #   PublicLayout + AdminLayout (sidebar)
├── components/         #   Header, Footer, ProductCard, UI atoms
├── router/             #   Rotas + guards de autenticação
└── composables/        #   useProducts, useOrders, useForm
```

---

## 🔒 Autenticação

O token Bearer é salvo no `localStorage` e injetado automaticamente em todas as requisições via interceptor do Axios. Ao receber um `401`, o sistema limpa o token e redireciona para `/admin/login`.

---

## ✅ Tratamento de erros

- Todos os `catch` expõem `error.userMessage` (normalizado pelo interceptor do Axios)
- Mensagens de erro da API Laravel (`message`, `error`, `errors.*`) são automaticamente extraídas
- Banners de erro inline em todas as páginas, com botão "Tentar novamente"
- Loading states com skeleton em todas as listagens
