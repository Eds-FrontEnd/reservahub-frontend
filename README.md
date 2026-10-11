# ⚡ Projeto - ReservaHub

## 🚀 Sobre o projeto

Bem-vindo ao **ReservaHub**, uma plataforma moderna de assinatura de smartphones desenvolvida com **React, TypeScript e CSS**.

O projeto foi criado com foco em boas práticas de desenvolvimento Front-end, priorizando **performance, acessibilidade, semântica, organização do código, componentização e reutilização de componentes**.

A aplicação foi projetada exclusivamente para o mercado de **assinatura de smartphones**, permitindo que clientes consultem os aparelhos disponíveis, visualizem suas características, escolham planos de assinatura e realizem a contratação de forma simples e intuitiva.

A plataforma oferece uma experiência moderna para assinatura de dispositivos móveis, com catálogo de smartphones, detalhes dos produtos, seleção de planos, carrinho e autenticação.

---

# 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de possuir instalado:

- **Node.js**
- **npm** (instalado juntamente com o Node.js)
- **Visual Studio Code**

---

# 🌍 Demonstração Online

Acesse a versão publicada da aplicação:

Em desenvolvimento.

---

# 🚀 Como executar o projeto

1. Clone o repositório

```bash
git clone https://github.com/Eds-FrontEnd/reserva-hub
```

2. Acesse a pasta

```bash
cd reserva-hub
```

3. Instale as dependências

```bash
npm install
```

---

## ▶️ Executando o projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O projeto será aberto em um servidor local.

Exemplo:

```text
http://localhost:5173/
```

---

### Observação

O projeto utiliza **React**, **TypeScript**, **Vite** e carregamento modular de componentes.

Por isso, o projeto deve ser executado através do servidor de desenvolvimento.

Utilize sempre:

```bash
npm run dev
```

---

# 🛠 Tecnologias utilizadas

- React
- TypeScript
- Vite
- React Router
- CSS
- CSS Variables
- React Hook Form
- Zod
- LocalStorage
- Fetch API
- Jest

---

# ✨ Recursos utilizados

O projeto foi desenvolvido utilizando diversos recursos modernos do ecossistema React.

- React
- TypeScript
- Componentização
- Hooks modernos
- React Router
- CSS
- CSS Variables
- Flexbox
- Grid Layout
- Componentes reutilizáveis
- Formulários controlados
- Validação de formulários
- LocalStorage
- Organização baseada em componentes
- Lazy Loading
- Responsividade
- Boas práticas de acessibilidade
- Navegação otimizada
- Arquitetura escalável
- Interface voltada para assinatura de smartphones

---

# 📱 Funcionalidades

- Catálogo de smartphones disponíveis para assinatura
- Visualização de detalhes dos smartphones
- Informações técnicas dos aparelhos
- Exibição de imagens dos smartphones
- Efeito visual 3D opcional nas imagens
- Seleção de planos de assinatura
- Planos de diferentes períodos de contratação
- Controle de disponibilidade e estoque
- Adição de smartphones ao carrinho
- Visualização do carrinho
- Atualização de itens do carrinho
- Remoção de smartphones do carrinho
- Autenticação de usuários
- Cadastro de usuários
- Login
- Logout
- Formulários com validação
- Persistência de dados no LocalStorage
- Página de contato
- Interface responsiva
- Componentes reutilizáveis

---

# 📦 Catálogo de Smartphones

O **ReservaHub** possui um catálogo dedicado exclusivamente a smartphones disponíveis para assinatura.

Cada produto pode apresentar:

- Marca
- Modelo
- Imagem
- Capacidade de armazenamento
- Especificações
- Disponibilidade
- Estoque
- Valor da assinatura
- Período de contratação

Exemplo:

```text
Smartphone

│
├── Imagem
├── Marca
├── Modelo
├── Armazenamento
├── Especificações
├── Estoque
├── Disponibilidade
└── Plano de assinatura
```

---

# 📲 Fluxo de Assinatura

O processo de assinatura foi desenvolvido para ser simples e intuitivo.

```text
① Smartphone

    ↓

② Detalhes do aparelho

    ↓

③ Plano de assinatura

    ↓

④ Carrinho

    ↓

⑤ Dados do cliente

    ↓

⑥ Confirmação
```

Fluxo completo:

```text
Cliente

   ↓

Visualiza os smartphones disponíveis

   ↓

Seleciona um aparelho

   ↓

Visualiza os detalhes do smartphone

   ↓

Escolhe o período de assinatura

   ↓

Adiciona o smartphone ao carrinho

   ↓

Confirma os dados

   ↓

Finaliza a assinatura
```

---

# 💳 Planos de Assinatura

Os smartphones podem ser associados a diferentes períodos de assinatura.

Exemplo:

```text
Smartphone

↓

Plano de assinatura

├── 1 mês
├── 12 meses
└── 24 meses
```

O usuário pode visualizar as opções disponíveis e selecionar o período desejado antes de adicionar o smartphone ao carrinho.

---

# 🛒 Carrinho

O ReservaHub possui um carrinho para gerenciamento dos smartphones selecionados para assinatura.

Principais recursos:

- Adicionar smartphone
- Alterar quantidade
- Remover smartphone
- Visualizar itens selecionados
- Visualizar valores
- Persistência do carrinho
- Validação de disponibilidade
- Acesso ao fluxo de contratação

Estrutura:

```text
Carrinho

│
├── Smartphone
├── Plano
├── Quantidade
├── Valor
└── Total
```

---

# 🔐 Autenticação

A aplicação possui uma área de autenticação para controle do acesso às funcionalidades que exigem identificação do usuário.

Recursos:

- Login
- Cadastro
- Validação de formulários
- Controle de autenticação
- Persistência do estado de autenticação
- Proteção de rotas
- Logout

Estrutura:

```text
Autenticação

│
├── Login
├── Cadastro
├── Usuário autenticado
└── Logout
```

---

# 🧩 Componentização

O projeto foi desenvolvido utilizando componentes reutilizáveis.

Principais componentes:

- Header
- Footer
- Button
- Input
- Select
- Card
- Product
- ProductCard
- Image
- Modal
- Toast
- Loading
- Skeleton
- Cart
- CartDrawer

A componentização permite reutilizar os mesmos elementos em diferentes partes da aplicação, facilitando a manutenção e evolução do projeto.

---

# ♿ Acessibilidade

O projeto será desenvolvido seguindo boas práticas de acessibilidade.

Entre elas:

- HTML semântico
- Labels associadas aos inputs
- `aria-label`
- `aria-live`
- Navegação por teclado
- Focus visível
- Contraste adequado
- Estados visuais claros
- Botões acessíveis
- Imagens com textos alternativos
- Gerenciamento de foco em modais
- Respeito à preferência `prefers-reduced-motion`

---

# 📱 Responsividade

O layout será desenvolvido seguindo uma abordagem responsiva.

A aplicação será adaptada para:

- Desktop
- Notebook
- Tablet
- Smartphone

O sistema também contará com uma experiência otimizada para dispositivos móveis, facilitando a consulta dos smartphones, seleção de planos e gerenciamento do carrinho diretamente pelo celular.

---

# ⚙️ Organização do projeto

```text
reserva-hub

│
├── public
│   └── favicon
│
├── src
│   │
│   ├── assets
│   │   │
│   │   ├── images
│   │   │   ├── smartphones
│   │   │   ├── banners
│   │   │   ├── logos
│   │   │   └── references
│   │   │
│   │   └── icons
│   │
│   ├── components
│   │   │
│   │   ├── Button
│   │   ├── Card
│   │   ├── Cart
│   │   ├── Footer
│   │   ├── Header
│   │   ├── Image
│   │   ├── Input
│   │   ├── Modal
│   │   ├── Product
│   │   └── ...
│   │
│   ├── pages
│   │   │
│   │   ├── Home
│   │   ├── ProductDetail
│   │   ├── Cart
│   │   ├── Login
│   │   ├── Register
│   │   └── Contact
│   │
│   ├── layouts
│   │   └── PublicLayout
│   │
│   ├── hooks
│   │
│   ├── services
│   │
│   ├── contexts
│   │
│   ├── types
│   │
│   ├── utils
│   │
│   ├── constants
│   │
│   ├── styles
│   │   │
│   │   ├── abstracts
│   │   ├── base
│   │   ├── components
│   │   ├── themes
│   │   └── main.css
│   │
│   ├── tests
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── .gitignore
```

---

# 📁 Estrutura de Componentes

O projeto utiliza uma arquitetura baseada em componentes reutilizáveis.

Exemplo:

```text
components

│
├── Button
│   ├── Button.tsx
│   ├── Button.css
│   └── Button.test.tsx
│
├── Image
│   ├── Image.tsx
│   ├── ImageStyle.css
│   └── Image.test.tsx
│
├── Product
│   ├── Product.tsx
│   ├── Product.css
│   └── Product.test.tsx
│
└── Modal
    ├── Modal.tsx
    ├── Modal.css
    └── Modal.test.tsx
```

---

# 🧪 Testes

O projeto utilizará **Jest** para testes unitários dos componentes.

Exemplo de componentes testados:

- Button
- Input
- Product
- Image
- Modal
- Cart

Os testes terão como objetivo garantir o funcionamento correto dos principais componentes da aplicação e reduzir regressões durante a evolução do projeto.

---

# 🎨 Padrões utilizados

- Clean Code
- SOLID
- Componentização
- Separação de responsabilidades
- Código reutilizável
- Tipagem com TypeScript
- Componentes funcionais
- Hooks modernos
- CSS organizado
- Arquitetura escalável
- Boas práticas de acessibilidade
- HTML semântico
- Lazy Loading
- Design responsivo
- Performance

---

# 🎯 Arquitetura da Aplicação

O conceito principal do ReservaHub é oferecer uma experiência completa para assinatura de smartphones.

```text
ReservaHub

│
├── Catálogo
│
├── Smartphones
│
├── Detalhes do produto
│
├── Planos de assinatura
│
├── Carrinho
│
├── Autenticação
│
├── Cliente
│
└── Contratação
```

O fluxo conecta a consulta dos smartphones ao processo de seleção do plano, carrinho e assinatura.

---

# 📱 Smartphones disponíveis

Exemplos de smartphones utilizados no catálogo:

```text
iPhone 15 Pro Max

├── Armazenamento: 256 GB
├── Assinatura: R$ 289,90
└── Estoque: 8 unidades
```

```text
Galaxy S24 Ultra

├── Armazenamento: 512 GB
└── Estoque: 5 unidades
```

Os produtos podem apresentar informações específicas de acordo com o modelo e a disponibilidade cadastrada.

---

# 🚫 .gitignore

O projeto possui arquivo `.gitignore` para evitar o versionamento de arquivos desnecessários.

Exemplo:

```gitignore
node_modules/

dist/

.vscode/

.env

.env.local

.DS_Store
```

---

# ✨ Demonstração

Abaixo está uma referência visual inicial do projeto.

<img src="src/assets/images/references/reserva-hub-layout-reference.png" alt="Preview da plataforma ReservaHub para assinatura de smartphones" />

---

# 👨‍💻 Autor

Projeto desenvolvido para fins de estudo e aprimoramento das habilidades em desenvolvimento Front-end utilizando **React**, **TypeScript** e **CSS**.

O projeto aplica conceitos modernos de **componentização, arquitetura escalável, responsividade, acessibilidade, testes automatizados, reutilização de componentes, performance e boas práticas de desenvolvimento**, com foco em uma plataforma de **assinatura de smartphones**.
