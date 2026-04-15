# 🚗 Aluguel de Carros - Projeto de Software

Sistema desenvolvido em **Java/Spring Boot** utilizando arquitetura **MVC**. O projeto contempla o gerenciamento completo de locações, incluindo CRUD de clientes com validação de rendimentos, autenticação de usuários (Clientes/Agentes) e fluxo de análise financeira, seguindo padrões de Engenharia de Software e modelagem UML.

---

## 👥 Equipe e Integrantes
* **Integrantes:**
  * Josué Carlos Goulart dos Reis
  * Karen Joilly Araujo Gregorio de Almeida
  * Luiz Fernando Batista Moreira
* **Professor Responsável:** João Paulo Carneiro Aramuni
* **Instituição:** PUC Minas - Laboratório de Engenharia de Software

---

## 📋 Histórias de Usuário 

Este documento descreve as funcionalidades do sistema sob a perspectiva dos diferentes atores envolvidos.

### 🚗 Módulo de Cadastro e Perfil (CRUD)

#### **US01 - Auto-cadastro de Clientes**
* **Como:** um novo usuário,
* **Eu quero:** me cadastrar no sistema informando meus dados pessoais (RG, CPF, Endereço, Profissão) e meus rendimentos,
* **Para que:** eu possa estar habilitado a solicitar aluguéis de veículos.
* **Critérios de Aceite:**
    * O sistema deve permitir no máximo 3 rendimentos por cliente.
    * O CPF e RG devem ser únicos no sistema.
    * Validação obrigatória de todos os campos antes da persistência.

#### **US02 - Gestão de Dados Cadastrais**
* **Como:** um cliente cadastrado,
* **Eu quero:** alterar minhas informações de endereço e profissão,
* **Para que:** meu perfil esteja atualizado para futuras análises financeiras.

---

### 🔑 Módulo de Autenticação

#### **US03 - Login de Usuário**
* **Como:** um usuário (Cliente ou Agente),
* **Eu quero:** realizar a autenticação utilizando e-mail e senha,
* **Para que:** eu possa acessar as funcionalidades restritas ao meu perfil.

---

### 📈 Módulo de Aluguel e Avaliação

#### **US04 - Introdução de Pedido de Aluguel**
* **Como:** um cliente autenticado,
* **Eu quero:** selecionar um automóvel e definir o período de locação,
* **Para que:** minha solicitação seja enviada para análise dos agentes.

#### **US05 - Avaliação Financeira (Parecer do Agente)**
* **Como:** um Agente (Banco ou Empresa),
* **Eu quero:** analisar os pedidos de aluguel e registrar um parecer (Aprovado/Rejeitado),
* **Para que:** o processo de contratação possa prosseguir ou ser encerrado.

---

### 📜 Módulo de Contratos

#### **US06 - Assinatura de Contrato**
* **Como:** um cliente com pedido aprovado,
* **Eu quero:** visualizar os termos do contrato e registrar minha assinatura digital,
* **Para que:** o aluguel seja formalizado e o veículo reservado.

---

### 🏢 Módulo de Gestão e Parceria (Banco e Empresa)

#### **US07 - Cadastro de Automóveis (Empresa)**
* **Como:** um funcionário da Empresa de Aluguel,
* **Eu quero:** cadastrar novos veículos informando placa, modelo, ano e valor da diária,
* **Para que:** eles fiquem disponíveis para reserva pelos clientes.
* **Critério de Aceite:** Validação de unicidade da placa e ano de fabricação compatível com as regras de negócio.

#### **US08 - Análise de Crédito Detalhada (Banco)**
* **Como:** um analista do Banco,
* **Eu quero:** acessar o histórico de rendimentos do cliente vinculado a um pedido,
* **Para que:** eu possa emitir um parecer de aprovação financeira baseado no limite de crédito.
* **Critério de Aceite:** O Banco possui visão exclusiva dos dados financeiros, sem permissão para edição.

#### **US09 - Consulta de Pedidos Pendentes (Empresa)**
* **Como:** um gestor da Empresa de Aluguel,
* **Eu quero:** visualizar quais pedidos já foram aprovados pelo Banco,
* **Para que:** eu possa preparar a entrega do veículo e gerar o contrato final.
* **Critério de Aceite:** Filtro funcional por status "Aprovado pelo Banco".

---

### 🛠️ Módulo de Operações e Manutenção

#### **US10 - Atualização de Disponibilidade (Empresa)**
* **Como:** um funcionário da Empresa de Aluguel,
* **Eu quero:** alterar o status de um veículo (Ex: Em Manutenção, Disponível, Alugado),
* **Para que:** os clientes não consigam reservar carros indisponíveis.
* **Critério de Aceite:** Veículos em manutenção devem ser ocultados automaticamente da busca.

#### **US11 - Registro de Devolução e Check-out**
* **Como:** um Agente da Empresa,
* **Eu quero:** registrar a devolução do veículo e encerrar o contrato,
* **Para que:** o automóvel volte ao estoque disponível e o histórico seja atualizado.
* **Critério de Aceite:** Cálculo automático de multas por atraso com base na data prevista.

---

### 🛡️ Módulo de Segurança e Infraestrutura (Técnica)

#### **US12 - Recuperação de Acesso e Auditoria**
* **Como:** um usuário (Cliente ou Agente),
* **Eu quero:** solicitar a recuperação de senha via e-mail,
* **Para que:** eu possa recuperar o acesso à minha conta com segurança.
* **Critério de Aceite:** Uso de Token com expiração e registro de logs de auditoria.

---

## 🛠️ Implementação Técnica — Sprint Atual

> Esta seção documenta tudo que foi construído e integrado até o momento. O conteúdo acima (histórias de usuário) representa o escopo completo do projeto; o que está descrito abaixo é o que já está funcionando.

---

### 🏗️ Arquitetura Geral

O projeto foi reestruturado para separar completamente frontend e backend, eliminando o frontend estático que existia dentro do Micronaut.

```
Aluguel-de-Carros-Projeto-de-Software/
├── aluguel-carros/          ← Backend Java (Micronaut)  — porta 8082
│   ├── src/main/java/...
│   │   ├── controller/      ← AuthController, ClienteController
│   │   ├── service/         ← AuthService, ClienteService
│   │   ├── model/           ← Usuario, Cliente, Rendimento, EntidadeEmpregadora
│   │   ├── repository/      ← UsuarioRepository, ClienteRepository
│   │   └── dto/             ← LoginRequestDTO, LoginResponseDTO, ClienteRequestDTO, ClienteResponseDTO, RendimentoDTO
│   ├── src/main/resources/
│   │   └── application.yml  ← Configuração Micronaut (JWT, CORS, banco)
│   └── .env                 ← Variáveis de ambiente (não versionado)
│
└── frontend/                ← Frontend React + Vite  — porta 3000
    ├── src/
    │   ├── pages/           ← LoginPage, DashboardPage
    │   ├── components/      ← Navbar, HeroSection, ServicesSection, FleetSection,
    │   │                       BenefitsSection, CTASection, SistemaSection, ClienteModal, ...
    │   ├── context/         ← AuthContext (JWT no localStorage)
    │   ├── hooks/           ← useClientes (CRUD completo com token)
    │   └── App.jsx          ← Rotas: / → /login → /dashboard
    ├── vite.config.js       ← Proxy /auth e /clientes → localhost:8082
    └── .env                 ← Variáveis de ambiente (não versionado)
```

**Fluxo de navegação:**
```
Landing Page (/)  →  Login (/login)  →  Dashboard (/dashboard)
     ↑                                         |
     └─────────────── logout ──────────────────┘
```

---

### ⚙️ Backend — Micronaut (Java 21)

#### Por que Micronaut em vez de Spring Boot?

O projeto foi desenvolvido com **Micronaut** como exigência acadêmica para comparação com Spring Boot. A principal diferença é que o Micronaut processa injeção de dependência e mapeamento de rotas **em tempo de compilação** (via annotation processors), enquanto o Spring Boot usa reflexão em tempo de execução. Isso resulta em startup mais rápido e menor uso de memória.

| Conceito | Spring Boot | Micronaut |
|---|---|---|
| Controller | `@RestController` | `@Controller` |
| Rota GET | `@GetMapping` | `@Get` |
| Rota POST | `@PostMapping` | `@Post` |
| Body | `@RequestBody` | `@Body` |
| Serviço | `@Service` | `@Singleton` |
| Repositório | `extends JpaRepository` + `@Repository` (Spring) | `extends JpaRepository` + `@Repository` (Micronaut Data) |
| Segurança | Spring Security | `micronaut-security-jwt` |
| Serialização | Jackson (automático) | `@Serdeable` + `micronaut-serde-jackson` |
| Injeção | `@Autowired` / construtor | construtor (JSR-330) |

#### Entidades JPA

**`Usuario`** — credenciais de acesso ao sistema
- Campos: `id`, `email` (único), `senhaHash` (BCrypt), `nome`, `role`
- Criado automaticamente na primeira inicialização: `admin@driveelite.com` / `admin123`

**`Cliente`** — dados cadastrais do cliente
- Campos: `id`, `nome`, `cpf` (único), `rg` (único), `endereco`, `profissao`
- Relacionamentos: `@OneToMany` com `EntidadeEmpregadora` e `Rendimento` (máximo 3 de cada, `CascadeType.ALL`, `orphanRemoval = true`)

**`EntidadeEmpregadora`** — empresa empregadora vinculada ao cliente
- Campos: `id`, `nome`, `cnpj`, `setor`
- Relacionamento: `@ManyToOne` com `Cliente`

**`Rendimento`** — fonte de renda do cliente
- Campos: `id`, `valor` (BigDecimal), `tipoVinculo` (CLT, PJ, Autônomo...)
- Relacionamentos: `@ManyToOne` com `Cliente` e `EntidadeEmpregadora`

#### Endpoints REST

**`POST /auth/login`** — público (`@Secured(IS_ANONYMOUS)`)
```json
// Request
{ "email": "admin@driveelite.com", "senha": "admin123" }

// Response 200
{ "token": "eyJ...", "nome": "Administrador", "email": "admin@driveelite.com", "role": "ADMIN" }

// Response 401
{ "message": "Email ou senha inválidos" }
```

**`GET /auth/me`** — autenticado (`Bearer token`)
```json
// Response 200
{ "email": "admin@driveelite.com", "nome": "Administrador", "role": "ADMIN" }
```

**`GET /clientes`** — autenticado — lista todos os clientes com rendimentos
**`POST /clientes`** — autenticado — cadastra novo cliente (201 Created)
**`GET /clientes/{id}`** — autenticado — busca cliente por ID
**`PUT /clientes/{id}`** — autenticado — atualiza dados do cliente
**`DELETE /clientes/{id}`** — autenticado — remove cliente (204 No Content)

#### Segurança JWT

- Algoritmo: **HS256**
- Expiração: **86400 segundos** (24 horas)
- Chave configurada via variável de ambiente `JWT_SECRET`
- Claims do token: `sub` (email), `nome`, `role`, `id`
- Senhas armazenadas com **BCrypt** via biblioteca `jbcrypt 0.4`

#### CORS

Configurado para aceitar qualquer porta do `localhost` via regex (`http://localhost:[0-9]+`), cobrindo qualquer porta que o Vite escolher durante o desenvolvimento (3000–3010+).

Headers permitidos: `Content-Type`, `Accept`, `Authorization`
Métodos permitidos: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

#### Banco de Dados

- **PostgreSQL** na porta padrão `5432`
- Database: `aluguelcarros`
- Schema gerenciado pelo Hibernate com `hbm2ddl.auto: update` (cria/atualiza tabelas automaticamente)
- Tabelas criadas: `usuario`, `cliente`, `entidade_empregadora`, `rendimento`

#### Variáveis de Ambiente (`.env`)

O arquivo `aluguel-carros/.env` **não é versionado** (está no `.gitignore`). Crie-o manualmente:

```env
DB_URL=jdbc:postgresql://localhost:5432/aluguelcarros
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_aqui
JWT_SECRET=sua_chave_secreta_aqui
```

O `application.yml` lê essas variáveis com fallback para valores padrão de desenvolvimento:
```yaml
password: "${DB_PASSWORD:12345}"
secret: "${JWT_SECRET:DriveEliteSecretKey2024XYZ987654321ABCDEF0123}"
```

---

### 💻 Frontend — React + Vite

#### Stack

- **React 18** com hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`)
- **Vite** como bundler (porta 3000 em desenvolvimento)
- **React Router v6** para roteamento SPA
- **Framer Motion** para todas as animações (scroll-driven, spring physics, AnimatePresence)
- **CSS puro** (sem Tailwind) com variáveis CSS customizadas (`--blue`, `--bg`, `--text-primary`...)

#### Páginas

**Landing Page (`/`)** — pública, apresentação da DriveElite
- `HeroSection` — vídeo de fundo em loop (`hero.webm`), título animado com parallax no scroll, fade-out da UI ao rolar
- `ServicesSection` — accordion interativo com 4 planos (Diária, Semanal, Mensal, Corporativo), cena 3D de peças automotivas (React Three Fiber)
- `FleetSection` — 4 cards de veículos com efeito de tilt 3D rastreando o mouse (Framer Motion `useMotionValue` + `useSpring`)
- `BenefitsSection` — 6 benefícios numerados editorialmente (01–06), sem ícones genéricos
- `CTASection` — card com layout dois-colunas, link para `/login`

**Login Page (`/login`)** — redireciona para `/dashboard` se já autenticado
- Formulário de email/senha
- Chamada real para `POST /auth/login` via proxy Vite
- Armazena `{ token, nome, email, role }` no `localStorage` sob a chave `driveelite_user`
- Mensagem de erro inline em caso de credencial inválida

**Dashboard (`/dashboard`)** — protegido, redireciona para `/login` se não autenticado
- Sidebar fixa (240px) com monograma "DE", navegação e botão de logout
- Topbar com avatar do usuário (inicial do nome) e nome/role
- Responsivo: sidebar vira drawer com overlay em mobile
- Conteúdo principal: `SistemaSection` (CRUD de clientes)

#### Autenticação (AuthContext)

```
AuthContext
├── user       → { token, nome, email, role } | null
├── token      → string | null  (atalho para user.token)
├── login()    → POST /auth/login → salva no localStorage → atualiza state
└── logout()   → remove do localStorage → limpa state
```

Persistência entre recarregamentos: o estado é inicializado lendo o `localStorage`, então o usuário permanece logado ao atualizar a página.

**Rotas protegidas:**
- `PrivateRoute` — se não autenticado, redireciona para `/login`
- `PublicOnlyRoute` — se já autenticado, redireciona para `/dashboard`

#### CRUD de Clientes (SistemaSection + useClientes)

Interface administrativa completa integrada ao backend:

- **Tabela paginada** com colunas: ID, Nome, CPF (formatado), RG, Profissão, Rendimentos (total de fontes + valor somado)
- **Busca em tempo real** por nome, CPF ou RG (filtro no frontend)
- **Modal de cadastro/edição** (`ClienteModal`) com:
  - Máscara automática de CPF (000.000.000-00)
  - CPF e RG bloqueados para edição após cadastro (imutabilidade de identificação)
  - Seção de rendimentos dinâmica: adicionar/remover até 3, com campos valor, tipo de vínculo, nome e CNPJ da empregadora
  - Validação local antes de enviar para a API
  - Tratamento de erro 409 (CPF/RG duplicado)
- **Modal de confirmação de exclusão** com botão destrutivo
- **Toast notifications** para sucesso e erro (desaparecem em 3,5s)
- **Badge de status da API** — mostra "online · porta 8082" ou "offline — inicie o backend"
- **3 cards de métricas**: total de clientes, total de rendimentos, renda total na base

O hook `useClientes(token)` encapsula todas as chamadas REST. Todas as requisições incluem automaticamente o header `Authorization: Bearer {token}`.

#### Proxy Vite

```js
// vite.config.js
proxy: {
  '/clientes': { target: 'http://localhost:8082', changeOrigin: true },
  '/auth':     { target: 'http://localhost:8082', changeOrigin: true },
}
```

Isso permite que o frontend use URLs relativas (`/auth/login`, `/clientes`) sem expor o endereço do backend nem ter problemas de CORS em desenvolvimento.

#### Variáveis de Ambiente (`.env`)

O arquivo `frontend/.env` **não é versionado**. Crie-o manualmente:

```env
VITE_API_URL=http://localhost:8082
```

#### Otimizações de Rendering e Performance

Para garantir a fluidez do frontend e diminuir o uso excessivo da CPU, as seguintes soluções foram adotadas na interface:

- **Renderização Sequencial via Canvas**: A tag `<video>` convencional na seção Hero foi substituída pelo componente `HeroCanvas.jsx`. Ele converte a reprodução contínua em uma matriz de 192 imagens pré-carregadas e as desenha em um `<canvas>` 2D. O frame exato é pareado com o hook `useScroll` do Framer Motion.
- **Controle de Seção (Sticky Scroll)**: A altura útil da seção foi definida em `250vh` com um container wrapper em `position: sticky`. Isso garante o tempo de leitura dos elementos da tela antes de iniciar os steps da animação e liberá-la para o próximo contexto da página.
- **Anti-Aliasing Direto**: Ativação direta de `imageSmoothingEnabled = true` no contexto de renderização para preservar as bordas dos frames escalados em resoluções 4K ou ultrawide sem serrilhamento perceptível.
- **Code Splitting Dinâmico**: Cenas pesadas em WebGL utilizando `@react-three/fiber` (`PartsScene.jsx` e `SuperiorServiceScene.jsx`) foram encapsuladas com `React.lazy` e `Suspense`. Essa medida fracionou a compilação do Vite, evitando que a library inteira do Three.js travasse o layout inicial.

---

### 🚀 Como Rodar o Projeto

#### Pré-requisitos

- Java 21+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 14+ rodando localmente

#### 1. Banco de dados

Crie o banco no PostgreSQL:
```sql
CREATE DATABASE aluguelcarros;
```

As tabelas são criadas automaticamente pelo Hibernate ao subir o backend.

#### 2. Variáveis de ambiente

Crie os arquivos `.env` (não estão no repositório):

```bash
# aluguel-carros/.env
DB_URL=jdbc:postgresql://localhost:5432/aluguelcarros
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=DriveEliteSecretKey2024XYZ987654321ABCDEF0123
```

```bash
# frontend/.env
VITE_API_URL=http://localhost:8082
```

#### 3. Backend

```bash
cd aluguel-carros

# Exportar variáveis do .env (Linux/Mac)
export $(grep -v '#' .env | xargs)

# Windows (PowerShell)
Get-Content .env | Where-Object { $_ -notmatch '^#' } | ForEach-Object { $v = $_ -split '=',2; [System.Environment]::SetEnvironmentVariable($v[0], $v[1]) }

# Rodar
mvn mn:run
```

O backend sobe na porta **8082**. Na primeira inicialização, cria automaticamente o usuário admin:
- Email: `admin@driveelite.com`
- Senha: `admin123`

#### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe na porta **3000**. Acesse `http://localhost:3000`.

#### 5. Fluxo de acesso

1. Abra `http://localhost:3000` — landing page pública
2. Clique em **Entrar** ou acesse `/login`
3. Use as credenciais do admin para entrar
4. O dashboard abre com o CRUD de clientes integrado ao backend

---

### 📁 Estrutura de Arquivos Relevante

```
backend:
  controller/AuthController.java       POST /auth/login, GET /auth/me
  controller/ClienteController.java    CRUD completo /clientes/**
  service/AuthService.java             BCrypt + geração de JWT
  service/ClienteService.java          Regras de negócio do CRUD
  model/Usuario.java                   Entidade de autenticação
  model/Cliente.java                   Entidade principal do CRUD
  model/Rendimento.java                Rendimento vinculado ao cliente
  model/EntidadeEmpregadora.java       Empresa empregadora
  repository/UsuarioRepository.java    findByEmail
  repository/ClienteRepository.java    findByIdWithDetails, findAllWithDetails
  dto/LoginRequestDTO.java             { email, senha }
  dto/ClienteRequestDTO.java           Dados de entrada do cliente
  dto/ClienteResponseDTO.java          Dados de saída (sem dados sensíveis)
  dto/RendimentoDTO.java               Dados de rendimento
  resources/application.yml           Toda a configuração do Micronaut

frontend:
  src/context/AuthContext.jsx          Estado global de autenticação
  src/hooks/useClientes.js             CRUD de clientes com token
  src/pages/LoginPage.jsx              Tela de login
  src/pages/DashboardPage.jsx          Painel administrativo
  src/components/SistemaSection.jsx    Tabela + modals do CRUD
  src/components/ClienteModal.jsx      Formulário de cadastro/edição
  src/App.jsx                          Rotas e guards de autenticação
  src/App.css                          Todos os estilos (CSS Variables)
  vite.config.js                       Proxy para o backend
```

---

### 🔒 Segurança

- Senhas **nunca** armazenadas em texto puro — sempre BCrypt
- JWT assinado com HS256, expiração de 24h
- Rotas `/clientes/**` exigem token válido no header `Authorization: Bearer`
- Arquivos `.env` no `.gitignore` de backend e frontend
- `application.yml` usa placeholders `${VARIAVEL:fallback}` — sem credenciais reais no código

### ⚠️ Módulos Pendentes (próximas sprints)

As entidades `Carro`, `Contrato` e `Reserva` ainda não foram implementadas no backend. O dashboard exibe um aviso informando isso. As US04–US11 referentes ao fluxo de aluguel, análise financeira e contratos serão desenvolvidas nas próximas iterações.
