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

## Como rodar

### Pré-requisitos

- Java 21+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 13+ rodando em `localhost:5432`

### 1. Banco de dados

```sql
CREATE DATABASE aluguelcarros;
```

As tabelas são criadas automaticamente pelo Hibernate na primeira execução.

### 2. Backend

```bash
cd aluguel-carros
mvn mn:run
```

Aguarde a mensagem: `Server Running: http://localhost:8082`

Na primeira inicialização, o sistema cria automaticamente o usuário administrador:
- **Email:** `admin@driveelite.com`
- **Senha:** `admin123`

> **Importante:** sempre use `mvn mn:run` (não o botão de play da IDE). O comando recompila o projeto antes de subir, garantindo que os annotation processors do Micronaut Data sejam executados corretamente.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:3001`

---

## Configuração do banco

Editável em `aluguel-carros/src/main/resources/application.properties`:

```properties
datasources.default.url=jdbc:postgresql://localhost:5432/aluguelcarros
datasources.default.username=postgres
datasources.default.password=12345
jpa.default.properties.hibernate.hbm2ddl.auto=update
```

---

## Arquitetura

```
┌─────────────────────────────────┐
│     Frontend (React 19 / Vite)  │
│     localhost:3001              │
│                                 │
│  Landing Page  /                │
│  Login         /login           │
│  Registro      /registro        │
│  Dashboard     /dashboard       │
└────────────┬────────────────────┘
             │ HTTP + Bearer Token
             │ (Proxy Vite → 8082)
┌────────────▼────────────────────┐
│   Backend (Micronaut 4.5)       │
│   localhost:8082                │
│                                 │
│  Controllers  → Services        │
│  Services     → Repositories    │
│  Repositories → PostgreSQL      │
└────────────┬────────────────────┘
             │ JDBC / Hibernate
┌────────────▼────────────────────┐
│   PostgreSQL                    │
│   localhost:5432/aluguelcarros  │
│                                 │
│  usuario        rendimentos     │
│  clientes       automoveis      │
│  pedidos_aluguel contratos      │
│  agentes        bancos          │
│  empresas                       │
└─────────────────────────────────┘
```

### Hierarquia JPA (InheritanceType.JOINED)

```
Usuario (tabela: usuario)
├── Cliente (tabela: clientes)
└── Agente  (tabela: agentes)
      ├── Banco   (tabela: bancos)
      └── Empresa (tabela: empresas)
```

---

## Endpoints da API

### Autenticação — `/auth` (público)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Autentica e retorna JWT |
| POST | `/auth/registrar` | Cadastro público como CLIENTE |
| POST | `/auth/setup` | Cria o primeiro ADMIN (apenas uma vez) |

**Exemplo de login:**
```json
// POST /auth/login
{ "email": "admin@driveelite.com", "senha": "admin123" }

// Resposta 200
{ "token": "eyJ...", "nome": "Administrador", "email": "admin@driveelite.com", "role": "ADMIN" }
```

### Clientes — `/clientes` (autenticado)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/clientes` | Lista todos os clientes |
| GET | `/clientes/me` | Dados do cliente logado (via JWT) |
| GET | `/clientes/{id}` | Busca cliente por ID |
| POST | `/clientes` | Cadastra novo cliente |
| PUT | `/clientes/{id}` | Atualiza dados do cliente |
| DELETE | `/clientes/{id}` | Remove cliente |

### Automóveis — `/automoveis`

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| GET | `/automoveis` | Público | Lista toda a frota |
| POST | `/automoveis` | Autenticado | Cadastra novo veículo |
| GET | `/automoveis/{id}` | Autenticado | Busca veículo por ID |
| PUT | `/automoveis/{id}` | Autenticado | Atualiza dados do veículo |
| DELETE | `/automoveis/{id}` | Autenticado | Remove veículo |

### Pedidos — `/pedidos` (autenticado)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/pedidos/todos` | Lista todos os pedidos (ADMIN) |
| POST | `/pedidos` | Cria novo pedido de aluguel |
| GET | `/pedidos/cliente/{id}` | Pedidos de um cliente específico |
| DELETE | `/pedidos/{id}` | Cancela um pedido |
| POST | `/pedidos/{id}/contrato` | Aprova pedido e gera contrato |
| GET | `/pedidos/{id}/analise-financeira` | Verifica aprovação financeira |

### Contratos — `/contratos` (autenticado)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/contratos/{id}` | Busca contrato por ID |
| POST | `/contratos/{id}/assinar` | Registra assinatura digital |

### Usuários — `/usuarios` (autenticado, ADMIN)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/usuarios/me` | Dados do usuário autenticado |
| GET | `/usuarios` | Lista todos os usuários |
| POST | `/usuarios` | Cria usuário com role customizada |
| PUT | `/usuarios/{id}` | Atualiza usuário |
| DELETE | `/usuarios/{id}` | Remove usuário |

---

## Estrutura do projeto

```
aluguel-carros/src/main/java/br/puc/aluguelcarros/
│
├── Application.java               Ponto de entrada Micronaut
│
├── model/
│   ├── Usuario.java               Entidade base — email, senha (BCrypt), nome, role
│   ├── Cliente.java               Herda Usuario — cpf, endereço, profissão, rendimentos
│   ├── Agente.java                Herda Usuario — cpf, endereço, profissão
│   ├── Banco.java                 Herda Agente — instituição bancária parceira
│   ├── Empresa.java               Herda Agente — empresa parceira/locadora
│   ├── Automovel.java             Veículo da frota — placa, marca, modelo, valorDiaria
│   ├── PedidoAluguel.java         Solicitação de aluguel — datas, status, valorTotal
│   ├── Contrato.java              Contrato formal — termos, assinatura, valorFinal
│   └── Rendimento.java            Renda do cliente — tipo, valor, comprovante
│
├── dto/
│   ├── ClienteDTO.java            Cliente sem referências circulares (inclui rendimentos)
│   ├── PedidoDTO.java             Pedido com clienteId e automovelId (sem entidades)
│   └── ContratoDTO.java           Contrato com pedidoId (sem entidade PedidoAluguel)
│
├── repository/
│   ├── UsuarioRepository.java     findByEmail, count
│   ├── ClienteRepository.java     findByEmail, findById
│   ├── AutomovelRepository.java   findAll, findById, save, update, deleteById
│   ├── PedidoRepository.java      findAll, findByClienteId, findById
│   └── ContratoRepository.java    findById, save, update
│
├── service/
│   ├── AuthService.java           Login (BCrypt), registro por role, verificação de admin
│   ├── ClienteService.java        CRUD de clientes + conversão para DTO
│   ├── PedidoService.java         Criação (validação + cálculo), listagem, contrato
│   └── FinanceiroService.java     Análise financeira (renda >= 3x valor do pedido)
│
└── controller/
    ├── AuthController.java        POST /auth/login, /registrar, /setup
    ├── ClienteController.java     CRUD /clientes + GET /clientes/me
    ├── AutomovelController.java   CRUD /automoveis
    ├── PedidoController.java      /pedidos + /contrato + /analise-financeira
    ├── ContratoController.java    GET /contratos/{id}, POST /assinar
    └── UsuarioController.java     CRUD /usuarios (somente ADMIN)

frontend/src/
│
├── App.jsx                        Rotas: / → /login → /registro → /dashboard
│
├── context/
│   └── AuthContext.jsx            Estado global JWT (localStorage)
│
├── pages/
│   ├── LoginPage.jsx              Tela de login
│   ├── RegisterPage.jsx           Cadastro público de clientes
│   └── DashboardPage.jsx          Painel com sidebar por role
│
├── components/
│   ├── Navbar.jsx                 Barra de navegação da landing page
│   ├── HeroSection.jsx            Seção hero com canvas animado
│   ├── SuperiorServiceSection.jsx Seção "sobre" com cena 3D
│   ├── ServicesSection.jsx        Planos de locação com cena 3D
│   ├── FleetSection.jsx           Galeria de frota com tilt 3D
│   ├── BenefitsSection.jsx        Diferenciais da empresa
│   ├── CTASection.jsx             Call-to-action para login
│   ├── Footer.jsx                 Rodapé
│   ├── SistemaSection.jsx         CRUD de clientes (ADMIN)
│   ├── AutomoveisSection.jsx      CRUD de automóveis / visualização (CLIENTE)
│   ├── PedidosSection.jsx         Gestão de pedidos (ADMIN)
│   ├── AgentesSection.jsx         Análise financeira de pedidos (ADMIN)
│   ├── UsuariosSection.jsx        Gestão de usuários (ADMIN)
│   ├── MeuPerfilSection.jsx       Perfil do cliente logado
│   ├── MeusPedidosSection.jsx     Pedidos do cliente logado
│   ├── CriarPedidoModal.jsx       Modal de criação de pedido
│   └── ClienteModal.jsx           Modal de criação/edição de cliente
│
└── hooks/
    ├── useClientes.js             CRUD de clientes com Bearer token
    ├── useAutomoveis.js           CRUD de automóveis com Bearer token
    ├── usePedidos.js              CRUD de pedidos com Bearer token
    └── useUsuarios.js             CRUD de usuários com Bearer token
```

---

## Regras de negócio

### Pedido de aluguel

1. O automóvel deve estar com `disponivel = true`
2. `dataInicio` deve ser antes de `dataFim`
3. `valorTotal = valorDiaria × número de dias`
4. Status inicial: `PENDENTE`

### Análise financeira

- Soma de todos os rendimentos do cliente deve ser **≥ 3× o valorTotal** do pedido
- Se o cliente não tiver rendimentos cadastrados, a análise retorna `false`

### Fluxo de status do pedido

```
PENDENTE → APROVADO (via POST /pedidos/{id}/contrato)
         → CANCELADO (via DELETE /pedidos/{id})
```

### Geração de contrato

- Ao chamar `POST /pedidos/{id}/contrato`, o pedido é marcado como `APROVADO`
- Um `Contrato` é criado com os termos e o valor final
- O contrato pode ser assinado via `POST /contratos/{id}/assinar`

---

## Segurança

- Senhas armazenadas exclusivamente como hash **BCrypt** (nunca texto puro)
- Token **JWT HS256** com expiração de 24 horas
- Claims do token: `sub` (email), `id`, `nome`, `role`
- Todos os endpoints (exceto `/auth/**` e `GET /automoveis`) exigem `Authorization: Bearer <token>`
- CORS configurado para aceitar qualquer porta do `localhost` (desenvolvimento)

---

## Roles do sistema

| Role | Acesso |
|------|--------|
| `ADMIN` | Tudo: clientes, automóveis, pedidos, análise, usuários |
| `CLIENTE` | Automóveis (leitura), meus pedidos, meu perfil |
| `AGENTE` | Análise de pedidos |
| `BANCO` | Análise financeira / crédito |
| `EMPRESA` | Gestão de frota |

---

## Por que Micronaut em vez de Spring Boot?

O Micronaut processa injeção de dependência e mapeamento de rotas **em tempo de compilação** via annotation processors, enquanto o Spring Boot usa reflexão em tempo de execução. Isso resulta em startup mais rápido e menor uso de memória.

| Conceito | Spring Boot | Micronaut |
|----------|------------|-----------|
| Controller | `@RestController` | `@Controller` |
| Rota GET | `@GetMapping` | `@Get` |
| Body | `@RequestBody` | `@Body` |
| Serviço | `@Service` | `@Singleton` |
| Serialização | Jackson automático | `@Serdeable` |
| DI | Reflexão em runtime | Gerada em compile-time |

> **Atenção:** por causa dos annotation processors, sempre compile com `mvn mn:run` ou `mvn clean compile`. Rodar o `.class` diretamente pela IDE sem recompilar causa o erro `Micronaut Data method is missing compilation time query information`.

---

## 📋 Histórias de Usuário

Este documento descreve as funcionalidades do sistema sob a perspectiva dos diferentes atores envolvidos.

---

### 🚗 Módulo de Cadastro e Perfil (CRUD)

#### US01 - Auto-cadastro de Clientes
**Como:** um novo usuário,  
**Eu quero:** me cadastrar no sistema informando meus dados pessoais (RG, CPF, Endereço, Profissão) e meus rendimentos,  
**Para que:** eu possa estar habilitado a solicitar aluguéis de veículos.  

**Critérios de Aceite:**
- O sistema deve permitir no máximo 3 rendimentos por cliente.
- O CPF e RG devem ser únicos no sistema.
- Validação obrigatória de todos os campos antes da persistência.

#### US02 - Gestão de Dados Cadastrais
**Como:** um cliente cadastrado,  
**Eu quero:** alterar minhas informações de endereço e profissão,  
**Para que:** meu perfil esteja atualizado para futuras análises financeiras.

---

### 🔑 Módulo de Autenticação

#### US03 - Login de Usuário
**Como:** um usuário (Cliente ou Agente),  
**Eu quero:** realizar a autenticação utilizando e-mail e senha,  
**Para que:** eu possa acessar as funcionalidades restritas ao meu perfil.

---

### 📈 Módulo de Aluguel e Avaliação

#### US04 - Introdução de Pedido de Aluguel
**Como:** um cliente autenticado,  
**Eu quero:** selecionar um automóvel e definir o período de locação,  
**Para que:** minha solicitação seja enviada para análise dos agentes.

#### US05 - Avaliação Financeira (Parecer do Agente)
**Como:** um Agente (Banco ou Empresa),  
**Eu quero:** analisar os pedidos de aluguel e registrar um parecer (Aprovado/Rejeitado),  
**Para que:** o processo de contratação possa prosseguir ou ser encerrado.

---

### 📜 Módulo de Contratos

#### US06 - Assinatura de Contrato
**Como:** um cliente com pedido aprovado,  
**Eu quero:** visualizar os termos do contrato e registrar minha assinatura digital,  
**Para que:** o aluguel seja formalizado e o veículo reservado.

---

### 🏢 Módulo de Gestão e Parceria (Banco e Empresa)

#### US07 - Cadastro de Automóveis (Empresa)
**Como:** um funcionário da Empresa de Aluguel,  
**Eu quero:** cadastrar novos veículos informando placa, modelo, ano e valor da diária,  
**Para que:** eles fiquem disponíveis para reserva pelos clientes.  

**Critério de Aceite:** Validação de unicidade da placa e ano de fabricação compatível com as regras de negócio.

#### US08 - Análise de Crédito Detalhada (Banco)
**Como:** um analista do Banco,  
**Eu quero:** acessar o histórico de rendimentos do cliente vinculado a um pedido,  
**Para que:** eu possa emitir um parecer de aprovação financeira baseado no limite de crédito.  

**Critério de Aceite:** O Banco possui visão exclusiva dos dados financeiros, sem permissão para edição.

#### US09 - Consulta de Pedidos Pendentes (Empresa)
**Como:** um gestor da Empresa de Aluguel,  
**Eu quero:** visualizar quais pedidos já foram aprovados pelo Banco,  
**Para que:** eu possa preparar a entrega do veículo e gerar o contrato final.  

**Critério de Aceite:** Filtro funcional por status "Aprovado pelo Banco".

---

### 🛠️ Módulo de Operações e Manutenção

#### US10 - Atualização de Disponibilidade (Empresa)
**Como:** um funcionário da Empresa de Aluguel,  
**Eu quero:** alterar o status de um veículo (Ex: Em Manutenção, Disponível, Alugado),  
**Para que:** os clientes não consigam reservar carros indisponíveis.  

**Critério de Aceite:** Veículos em manutenção devem ser ocultados automaticamente da busca.

#### US11 - Registro de Devolução e Check-out
**Como:** um Agente da Empresa,  
**Eu quero:** registrar a devolução do veículo e encerrar o contrato,  
**Para que:** o automóvel volte ao estoque disponível e o histórico seja atualizado.  

**Critério de Aceite:** Cálculo automático de multas por atraso com base na data prevista.

---

### 🛡️ Módulo de Segurança e Infraestrutura (Técnica)

#### US12 - Recuperação de Acesso e Auditoria
**Como:** um usuário (Cliente ou Agente),  
**Eu quero:** solicitar a recuperação de senha via e-mail,  
**Para que:** eu possa recuperar o acesso à minha conta com segurança.  

**Critério de Aceite:** Uso de Token com expiração e registro de logs de auditoria.

---

*Desenvolvido em Java, React, Micronaut e PostgreSQL — PUC Minas 2026*
