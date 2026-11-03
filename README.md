# Ouros Web

<!-- REPO-METADATA:START -->
<div align="center">

[![Repo Size](https://img.shields.io/github/repo-size/Ouros-App/ms-ouros-front-web?style=flat-square&label=REPO%20SIZE)](https://github.com/Ouros-App/ms-ouros-front-web)
[![Languages](https://img.shields.io/github/languages/count/Ouros-App/ms-ouros-front-web?style=flat-square&label=LANGUAGES)](https://github.com/Ouros-App/ms-ouros-front-web/languages)
[![Forks](https://img.shields.io/github/forks/Ouros-App/ms-ouros-front-web?style=flat-square&label=FORKS)](https://github.com/Ouros-App/ms-ouros-front-web/network/members)
[![Issues](https://img.shields.io/github/issues/Ouros-App/ms-ouros-front-web?style=flat-square&label=ISSUES)](https://github.com/Ouros-App/ms-ouros-front-web/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Ouros-App/ms-ouros-front-web?style=flat-square&label=PULL%20REQUESTS)](https://github.com/Ouros-App/ms-ouros-front-web/pulls)

</div>
<!-- REPO-METADATA:END -->

Plataforma frontend web moderna para gestão, monitoramento zootécnico e controle operacional do ecossistema **Ouros**. O sistema integra acompanhamento em tempo real de granjas e fazendas, auditoria de custos e recursos essenciais (energia, água, mortalidade de lotes), gestão gamificada de metas e observabilidade técnica e financeira de Inteligência Artificial.

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
- [Execução via Docker e Deploy](#-execução-via-docker-e-deploy)
- [Contribuidores e Licença](#-contribuidores-e-licença)

---

## 🔭 Visão Geral

O **Ouros Web** foi desenvolvido para centralizar a tomada de decisão no agronegócio corporativo (foco em avicultura e integração agropecuária). Por meio de uma interface responsiva, intuitiva e performática, a aplicação oferece aos gestores, técnicos e administradores visibilidade completa sobre a eficiência das operações em campo, previsões de custos e saúde dos lotes.

### Principais Destaques:
- **Governança Corporativa e Multi-tenant:** Suporte à seleção dinâmica de empresas para administradores (`SeletorEmpresaAdm`) com bloqueio estrito de isolamento para proprietários de fazenda (`farm_owner`).
- **Observabilidade Integrada de IA (Midas):** Painel executivo e técnico com métricas consumidas diretamente do Prometheus e telemetria Midas AI (custo mensal, tokens consumidos, reais/token, latência p95 e taxas de erro).
- **Gamificação de Resultados:** Ranking competitivo dividido em 5 ligas com cálculo de conversão alimentar e ganho de peso.
- **Auditoria Operacional:** Histórico detalhado de registros de pesagem, mortalidade, água, luz e simulações financeiras preventivas.

---

## 🚀 Funcionalidades e Módulos

### 1. 📊 Dashboards Analíticos (`/dashboards`)
- **Aba Operacional:**
  - **KPIs Principais:** Indicadores consolidados de Custo Total, Consumo de Energia Elétrica (kWh), Consumo Hídrico (m³) e Taxa de Mortalidade (%).
  - **Filtros Dinâmicos:** Filtros combinados em cascata por Empresa, Fazenda, Galpão e Lote com recarregamento imediato.
  - **Gráficos Interativos:** Visualização temporal de desempenho e curvas de consumo desenvolvidas com Recharts.
  - **Tabela Comparativa de Fazendas:** Visão analítica detalhada por unidade (`DashboardFarmsTable`) com ordenação e paginação.
- **Aba Gerenciamento de IA (Visão Admin / Observabilidade Midas AI):**
  - **KPI Cards com Gradiente Exclusivo (Figma #6052:1734):**
    - *Gasto de Tokens:* Custo monetário total apurado no ano/período.
    - *Reais/Token:* Custo médio por token ou mil tokens consumidos.
    - *Usuários Ativos:* Volume instantâneo de usuários ativos via snapshot de analytics.
  - **Seletor Mensal:** Filtro temporal com seleção de mês/ano para apuração retroativa de custos.
  - **Gráficos de Telemetria:** Gasto de tokens por modelo, gasto por requisição, custo por região e evolução do custo mensal.
  - **Métricas Técnicas de LLM:** Latência percentil 95 (p95 em ms), requisições por minuto e taxas de sucesso/erro.

### 2. 📋 Gestão de Registros de Campo (`/registros` e `/registros/:id`)
- Listagem paginada e filtrável de apontamentos diários de granjas e lotes avícolas.
- Modal para inclusão de novos registros com validação de datas, galpões e indicadores biométricos.
- **Detalhes do Registro (`/registros/:id`):** Auditoria técnica aprofundada contendo dados de pesagem, consumo hídrico, consumo elétrico, taxa de mortalidade e lote associado.

### 3. 🎯 Metas e Objetivos Operacionais (`/metas`)
- Planejamento, cadastro e acompanhamento visual do cumprimento de metas de produtividade e redução de perdas.
- **Criação de Novas Metas:** Assistente dinâmico (`useNovaMeta`, `useGranjas`, `useEnvio`) integrado ao backend para vinculação inteligente de granjas, tipo de meta e período.
- Barras de progresso visual, cálculo de percentual concluído e status (`Em andamento`, `Concluída`, `Atrasada`).

### 4. 🏆 Ranking e Ligas Gamificadas (`/ranking`)
- Classificação contínua de propriedades e produtores baseada em eficiência produtiva.
- Progressão através de 5 ligas oficiais com imagens e insígnias dedicadas:
  - ⚙️ **Liga Ferro**
  - 🥉 **Liga Cobre**
  - 🥉 **Liga Bronze**
  - 🥈 **Liga Prata**
  - 🥇 **Liga Ouro**
- Pódio dos melhores desempenhos e fórmula transparente de pontuação por conversão zootécnica.

### 5. 💡 Simulações de Cenários (`/simulacao`)
- Ferramenta preditiva baseada em modelo analítico (`usePrevisaoSimulacao`).
- Projeção de impacto financeiro, custo de ração, consumo de água e energia frente a flutuações de mortalidade e peso médio por ave.
- Tabela histórica de simulações realizadas com paginação e exclusão.

### 6. 👤 Perfil do Usuário e Personalização (`/perfil`)
- Gestão de dados cadastrais, cargo, empresa e informações de contato.
- **Upload Seguro de Fotos via Cloudinary:** Envio unsigned direto com sanitização, compressão e pré-visualização.
- **Alteração de Senha Segura:** Modal dedicado com verificação de requisitos mínimos de segurança e validação via código OTP.

### 7. 🔒 Autenticação e Verificação OTP (`/login`)
- Fluxo de acesso seguro integrado ao Keycloak / `ms-auth-service`.
- Desafio de segundo fator (MFA) via código OTP de 6 dígitos com contagem regressiva para reenvio e suporte a colagem automática.
- Recuperação amigável de sessão com tratamento transparente de falhas de conexão.

---

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologias |
|---|---|
| **Core & UI** | [React 19](https://react.dev/), [TypeScript 5.8](https://www.typescriptlang.org/), [Tailwind CSS 3.4](https://tailwindcss.com/), [PostCSS](https://postcss.org/), [Autoprefixer](https://github.com/postcss/autoprefixer) |
| **Build & Tooling** | [Vite 7](https://vitejs.dev/), [ESLint 9](https://eslint.org/) |
| **Roteamento** | [React Router DOM 7](https://reactrouter.com/) (Code-splitting com `React.lazy` e `Suspense`) |
| **Gráficos & Dashboards** | [Recharts 3.10](https://recharts.org/) |
| **Segurança & Sanitização** | [DOMPurify](https://github.com/cure53/DOMPurify) |
| **Testes Automatizados** | [Vitest 3.2](https://vitest.dev/), [@testing-library/react](https://testing-library.com/), [jsdom](https://github.com/jsdom/jsdom) |
| **Armazenamento e Mídia** | [Cloudinary API](https://cloudinary.com/) (Upload unsigned) |
| **Deploy & Servidor Web** | [Docker](https://www.docker.com/), [Nginx 1.27 Alpine](https://nginx.org/), [Discloud Platform](https://discloud.app/) |

---

## 📂 Estrutura do Projeto

```text
ms-ouros-front-web/
├── docker/
│   └── nginx/
│       └── default.conf          # Configuração Nginx com fallback SPA e headers de segurança
├── public/                       # Favicons oficiais (1:1), manifest PWA e logos
│   ├── favicon.ico
│   ├── favicon.png
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── logo-ouros.png
│   └── manifest.json
├── src/
│   ├── assets/                   # Imagens institucionais, logos, mascotes e badges de ligas
│   ├── components/
│   │   ├── common/               # Componentes atômicos (Button, Input, Modal, Notification, Card)
│   │   ├── complex/              # Componentes de negócio (Sidebar, Dashboards, Modais, Tabelas, SeletorEmpresaAdm)
│   │   └── Error/                # Error Boundary e telas de fallback acessíveis
│   ├── context/                  # Contextos globais (AuthContext, AdminEnterpriseContext, AppContext)
│   ├── hooks/                    # Custom Hooks (useAuth, useNovaMeta, usePrevisaoSimulacao, usePagedList, etc.)
│   ├── pages/                    # Páginas lazy da aplicação (Dashboard, Metas, Login, Registros, Ranking, etc.)
│   ├── reducers/                 # Reducers de estado de autenticação e fluxos
│   ├── routes/                   # Configuração de rotas, redirecionamentos e PrivateRoute
│   ├── services/                 # Clientes HTTP (springClient, apiClient, authService, adminAiMetricsService, etc.)
│   ├── types/                    # Contratos de dados TypeScript e DTOs de API
│   └── utils/                    # Utilitários, máscaras, sanitizadores, formatadores e validações
├── tests/                        # Suíte completa de testes unitários e de integração (Vitest)
├── Dockerfile                    # Multi-stage build (Node 22 Alpine + Nginx 1.27 Alpine)
├── package.json                  # Dependências e scripts npm
├── run.sh                        # Script utilitário para contêiner Docker em porta dinâmica
├── run_compose.sh                # Execução automatizada com Docker Compose
└── vite.config.ts                # Configuração do Vite, portas, aliases (@/) e proxy
```

---

## 🔒 Segurança e Autenticação

A arquitetura de segurança do frontend segue as recomendações da OWASP:

- **Tokens e Cookies Seguros:** O fluxo de autenticação utiliza *refresh token* armazenado em cookie `HttpOnly` e `Secure`, enquanto o *access token* é mantido exclusivamente em memória via closure/contexto do React, eliminando riscos de vazamento via `localStorage` ou XSS.
- **Renovação Silenciosa Resiliente:** Mecanismo centralizado de renovação com controle de filas e locks em memória para prevenir condições de corrida durante requisições simultâneas.
- **Sanitização Estrita:** Limpeza de dados dinâmicos com `DOMPurify` e validação de formatos com regex em todos os formulários.
- **Isolamento de Papéis (RBAC):** Restrição de navegação e funcionalidades administrativas com base em roles (`super_admin`, `admin`, `farm_owner`).

---

## ⚙️ Configuração de Ambiente

Crie um arquivo `.env` na raiz do projeto com base nas variáveis abaixo:

```bash
cp .env.example .env
```

### Variáveis Disponíveis

| Variável | Descrição | Exemplo Padrão |
|---|---|---|
| `APP_NAME` | Nome identificador do contêiner nos scripts Docker. | `ms-ouros-front-web` |
| `VITE_APP_TITLE` | Título da aba exibido no navegador. | `Ouros` |
| `VITE_API_URL` | URL base da API principal de backend. | `http://localhost:8000/api` |
| `VITE_AUTH_API_URL` | Endpoint do microsserviço de autenticação Keycloak. | `https://ms-auth-service.discloud.app` |
| `VITE_TELEMETRY_API_URL` | Endpoint da API de telemetria e Prometheus Midas AI. | `https://ouros-dashboard.discloud.app` |
| `VITE_SPRING_API_URL` | Endpoint da API Spring corporativa (negócios e granjas). | `https://ms-spring-api.discloud.app` |
| `VITE_STORAGE_VERSION` | Versão de chaveamento para dados de cache local. | `v1` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Nome da nuvem do Cloudinary para uploads. | `mpyey2bi` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Upload preset não assinado para fotos de perfil. | `ouros_profile_photos` |
| `VITE_CLOUDINARY_FOLDER` | Pasta de destino no Cloudinary. | `ouros/profiles` |
| `PORT` | Porta usada pelo Vite para o servidor de desenvolvimento. | `5173` |

> ⚠️ **Atenção:** Variáveis prefixadas com `VITE_` são expostas ao bundle estático público. Nunca insira chaves privadas ou segredos de infraestrutura nelas.

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

A suite automatizada conta com testes unitários, de componentes e de integração com **Vitest** e **Testing Library**:

```bash
# Executa todos os testes automatizados
npm test

# Executa os testes com relatório de cobertura de código
npm run test:coverage

# Executa a verificação estática de tipos e linting com ESLint 9
npm run lint
```

---

## 🐳 Execução via Docker e Deploy

O projeto utiliza um `Dockerfile` multi-stage:
1. **Etapa 1 (Build):** Compila o projeto em `node:22-alpine`.
2. **Etapa 2 (Run):** Serve os arquivos estáticos compilados através do `nginx:1.27-alpine`.

### Scripts Utilitários de Contêiner

```bash
# Executa contêiner em porta dinâmica automática
npm run docker:run
# ou: bash ./run.sh

# Lista contêineres ativos
bash ./run.sh --list

# Reinicia um contêiner específico (ex: id 1)
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
- [@Nicolas25vlad](https://github.com/Nicolas25vlad) — Contribuições em observabilidade de IA e frontend
- [@Lucas-Cayres-Porto](https://github.com/Lucas-Cayres-Porto) — Arquitetura de software, integração e manutenção
<!-- CONTRIBUTORS:END -->

> Atualizado automaticamente pelo workflow de metadados do repositório.

### Licença

Este projeto é privado e de uso restrito do ecossistema **Ouros**. Consulte o arquivo [LICENSE](LICENSE) para mais informações.
