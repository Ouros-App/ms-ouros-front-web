# Ouros Web

<!-- REPO-METADATA:START -->
<div align="center">

[![Repo Size](https://img.shields.io/github/repo-size/Ouros-App/ms-webfront-template?style=flat-square&label=REPO%20SIZE)](https://github.com/Ouros-App/ms-webfront-template)
[![Languages](https://img.shields.io/github/languages/count/Ouros-App/ms-webfront-template?style=flat-square&label=LANGUAGES)](https://github.com/Ouros-App/ms-webfront-template/languages)
[![Forks](https://img.shields.io/github/forks/Ouros-App/ms-webfront-template?style=flat-square&label=FORKS)](https://github.com/Ouros-App/ms-webfront-template/network/members)
[![Issues](https://img.shields.io/github/issues/Ouros-App/ms-webfront-template?style=flat-square&label=ISSUES)](https://github.com/Ouros-App/ms-webfront-template/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Ouros-App/ms-webfront-template?style=flat-square&label=PULL%20REQUESTS)](https://github.com/Ouros-App/ms-webfront-template/pulls)

</div>
<!-- REPO-METADATA:END -->

Plataforma frontend web moderna para gestão, monitoramento zootécnico e controle operacional do ecossistema **Ouros**. O sistema integra acompanhamento em tempo real de granjas e fazendas, auditoria de custos e recursos essenciais (energia, água, mortalidade de lotes), gestão gamificada de metas e observabilidade avançada de modelos de Inteligência Artificial.

> 🌐 **Aplicação Web em Produção:** [https://ouros-web.discloud.dev](https://ouros-web.discloud.dev)

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades e Módulos](#-funcionalidades-e-módulos)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Segurança e Autenticação](#-segurança-e-autenticação)
- [Configuração de Ambiente](#-configuração-de-ambiente)
- [Instalação e Execução Local](#-instalação-e-execução-local)
- [Testes e Qualidade de Código](#-testes-e-qualidade-de-código)
- [Execução via Docker e Contêineres](#-execução-via-docker-e-contêineres)
- [Contribuidores e Licença](#-contribuidores-e-licença)

---

## 🔭 Visão Geral

O **Ouros Web** foi desenvolvido para centralizar a tomada de decisão no agronegócio (foco em avicultura e gestão agropecuária corporativa). Por meio de uma interface responsiva, intuitiva e performática, a aplicação oferece aos gestores, técnicos e administradores visibilidade completa sobre a eficiência das operações em campo, previsões de custos e saúde dos lotes.

### Principais Destaques:
- **Visão Multi-tenant / Multi-empresa:** Suporte à seleção dinâmica de empresas para usuários administradores (`SeletorEmpresaAdm`).
- **Observabilidade Integrada:** Painel corporativo operacional e painel técnico de consumo e custos de Inteligência Artificial (LLMs).
- **Gamificação de Resultados:** Ranking competitivo dividido em ligas para incentivar boas práticas agropecuárias.
- **Auditoria Operacional:** Histórico detalhado de registros zootécnicos e simulações financeiras preventivas.

---

## 🚀 Funcionalidades e Módulos

### 1. 📊 Dashboards Analíticos (`/dashboards`)
- **Dashboard Corporativo:**
  - **KPIs Principais:** Indicadores consolidados de Custo Total, Consumo de Energia Elétrica, Consumo Hídrico e Taxa de Mortalidade.
  - **Filtros Dinâmicos:** Filtros em cascata por Empresa, Fazenda, Galpão e Lote com atualização imediata dos dados.
  - **Gráficos Interativos:** Visualização temporal de desempenho e curvas de consumo desenvolvidas com Recharts.
  - **Tabela Comparativa de Fazendas:** Visão detalhada por unidade (`DashboardFarmsTable`).
- **Dashboard de Métricas de IA (Visão Admin):**
  - KPIs mensais de custo, tokens consumidos e custo por mil tokens, com seletor de mês; usuários ativos são o snapshot Analytics atual, sem filtro mensal.
  - Custos e quantidades são exibidos conforme as unidades e a formatação retornadas pela API; latência p95 é convertida de segundos para milissegundos e taxas mostram suas unidades.

### 2. 📋 Gestão de Registros de Campo (`/registros` e `/registros/:id`)
- Listagem paginada e filtrável de registros diários de lotes e granjas.
- Detalhes aprofundados de auditoria técnica para cada ocorrência ou medição coletada.

### 3. 🎯 Metas e Objetivos Operacionais (`/metas`)
- Planejamento, cadastro e acompanhamento visual do cumprimento de metas de produtividade e redução de perdas operacionais.
- Indicadores percentuais de progresso e status de conclusão.

### 4. 🏆 Ranking e Ligas Gamificadas (`/ranking`)
- Classificação contínua de propriedades e equipes baseada em eficiência produtiva.
- Estrutura de progressão em ligas: **Ferro**, **Cobre**, **Bronze**, **Prata** e **Ouro**.

### 5. 💡 Simulações de Cenários (`/simulacao`)
- Ferramenta preditiva para projetar custos, impacto financeiro de variações na mortalidade, flutuações de insumos e consumo energético.

### 6. 👤 Perfil do Usuário e Personalização (`/perfil`)
- Gestão de dados cadastrais e preferências de conta.
- Upload seguro de fotos de perfil integrado diretamente com o serviço em nuvem **Cloudinary**.

---

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologias |
|---|---|
| **Core & UI** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS 3.4](https://tailwindcss.com/), [PostCSS](https://postcss.org/), [Autoprefixer](https://github.com/postcss/autoprefixer) |
| **Build & Tooling** | [Vite 7](https://vitejs.dev/), [ESLint 9](https://eslint.org/) |
| **Roteamento** | [React Router DOM 7](https://reactrouter.com/) (Code-splitting com `React.lazy` e `Suspense`) |
| **Gráficos & Visualização** | [Recharts](https://recharts.org/) |
| **Segurança & Sanitização** | [DOMPurify](https://github.com/cure53/DOMPurify) |
| **Testes Automatizados** | [Vitest](https://vitest.dev/), [@testing-library/react](https://testing-library.com/), [jsdom](https://github.com/jsdom/jsdom) |
| **Imagens & Mídia** | [Cloudinary API](https://cloudinary.com/) |
| **Servidor & Deploy** | [Docker](https://www.docker.com/), [Nginx 1.27 Alpine](https://nginx.org/), [Discloud Platform](https://discloud.app/) |

---

## 📂 Estrutura do Projeto

```text
ms-ouros-front-web/
├── docker/
│   └── nginx/
│       └── default.conf          # Configuração de proxy e entrega estática Nginx
├── public/                       # Favicons, manifest e recursos estáticos públicos
├── src/
│   ├── assets/                   # Imagens institucionais, logos, mascotes e badges de ligas
│   ├── components/
│   │   ├── common/               # Componentes atômicos reutilizáveis (botões, inputs, cards)
│   │   ├── complex/              # Componentes complexos de negócio (Sidebar, Dashboards, Modais)
│   │   └── Error/                # Error Boundary e telas de fallback
│   ├── context/                  # Contextos globais (Autenticação, Empresa Administradora)
│   ├── hooks/                    # Custom Hooks reutilizáveis (useAuth, useRegistros, useFiltros)
│   ├── pages/                    # Páginas da aplicação (Dashboard, Metas, Login, Ranking, etc.)
│   ├── reducers/                 # Gerenciadores de estado complexo
│   ├── routes/                   # Definição de rotas, redirecionamentos e PrivateRoute
│   ├── services/                 # Clientes HTTP e integração com microsserviços
│   ├── types/                    # Interfaces e definições de tipos TypeScript
│   └── utils/                    # Funções utilitárias, máscaras, sanitizadores e validações
├── Dockerfile                    # Multi-stage build (Node 22 Alpine + Nginx Alpine)
├── package.json                  # Dependências e scripts npm
├── run.sh                        # Automação de ciclo de vida de contêineres Docker
├── run_compose.sh                # Execução via Docker Compose com detecção de portas livres
└── vite.config.ts                # Configuração do bundler Vite e aliases (@/)
```

---

## 🔒 Segurança e Autenticação

A arquitetura de segurança do frontend adota padrões recomendados pela comunidade e OWASP:

- **Tokens Seguros:** O login web utiliza *refresh token* persistido com cookie `HttpOnly` e `Secure`, enquanto o *access token* é mantido exclusivamente em memória via closure/contexto, minimizando vulnerabilidades como XSS e Token Theft.
- **Sanitização de Dados:** Aplicação de sanitizadores estritos e `DOMPurify` para higienização de entradas dinâmicas.
- **Controle de Origem:** Requer que a variável `OUROS_WEB_ALLOWED_ORIGINS` esteja configurada no `ms-auth-service` com o domínio HTTPS exato deste frontend em produção.

---

## ⚙️ Configuração de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no modelo `.env.example`:

```bash
cp .env.example .env
```

### Variáveis Disponíveis

| Variável | Descrição | Exemplo |
|---|---|---|
| `APP_NAME` | Nome identificador do contêiner nos scripts Docker. | `ms-ouros-front-web` |
| `VITE_APP_TITLE` | Título exibido na barra de título da aplicação. | `Ouros` |
| `VITE_API_URL` | URL base da API principal do sistema. | `http://localhost:8000/api` |
| `VITE_AUTH_API_URL` | Endpoint do microsserviço de autenticação. | `https://ms-auth-service.discloud.app` |
| `VITE_TELEMETRY_API_URL` | Endpoint da API de telemetria e dados de dashboard. | `https://ouros-dashboard.discloud.app` |
| `VITE_SPRING_API_URL` | Endpoint da API Spring corporativa. | `https://ms-spring-api.discloud.app` |
| `VITE_STORAGE_VERSION` | Versão de chaveamento para dados de cache local. | `v1` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Nome da conta do Cloudinary para uploads. | `mpyey2bi` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Upload preset não assinado para avatares de perfil. | `ouros_profile_photos` |
| `VITE_CLOUDINARY_FOLDER` | Pasta de destino dos uploads no Cloudinary. | `ouros/profiles` |
| `PORT` | Porta usada pelo Vite para o servidor local ou preview. | `5173` |

> ⚠️ **Atenção:** Variáveis iniciadas com `VITE_` são expostas ao bundle público do frontend. Nunca armazene segredos privados, tokens mestres ou senhas nessas variáveis.

---

## 💻 Instalação e Execução Local

### Pré-requisitos
- **Node.js** >= 20.x (recomendado Node 22 LTS)
- Gerenciador de pacotes **npm**

### Passo a Passo

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em `http://localhost:5173`.

3. **Gerar build de produção:**
   ```bash
   npm run build
   ```

4. **Visualizar o build localmente:**
   ```bash
   npm run preview
   ```

---

## 🧪 Testes e Qualidade de Código

O repositório conta com testes unitários e de integração utilizando **Vitest** e **Testing Library**:

```bash
# Executa a suite de testes unitários
npm test

# Executa os testes com relatório de cobertura de código
npm run test:coverage

# Executa a verificação de linting com ESLint
npm run lint
```

---

## 🐳 Execução via Docker e Contêineres

O projeto utiliza um `Dockerfile` multi-stage optimizado:
1. **Etapa 1 (Build):** Compila a aplicação sobre `node:22-alpine`.
2. **Etapa 2 (Run):** Serve os artefatos compilados via `nginx:1.27-alpine`.

### Scripts Utilitários

O repositório fornece o utilitário `run.sh` para gerenciamento automatizado de contêineres:

```bash
# Inicia um novo contêiner em porta livre automática
npm run docker:run
# ou: bash ./run.sh

# Lista contêineres ativos da aplicação
bash ./run.sh --list

# Reinicia um contêiner específico (ex: contêiner 1)
bash ./run.sh --reboot 1

# Remove um contêiner específico
bash ./run.sh --remove 1
```

Para subir utilizando o Docker Compose:
```bash
npm run docker:compose
# ou: bash ./run_compose.sh
```

---

## 👥 Contribuidores e Licença

### Principais Contribuidores

<!-- CONTRIBUTORS:START -->
- [@Nicolas25vlad](https://github.com/Nicolas25vlad) — 10 contribuições
<!-- CONTRIBUTORS:END -->

> Atualizado automaticamente semanalmente pelo workflow de metadados do README.

### Licença

Este projeto é privado e de uso restrito do ecossistema **Ouros**. Consulte o arquivo `LICENSE` para maiores detalhes.
