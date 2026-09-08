# MS Webfront Template

<!-- REPO-METADATA:START -->
<div align="center">

[![Repo Size](https://img.shields.io/github/repo-size/Ouros-App/ms-webfront-template?style=flat-square&label=REPO%20SIZE)](https://github.com/Ouros-App/ms-webfront-template)
[![Languages](https://img.shields.io/github/languages/count/Ouros-App/ms-webfront-template?style=flat-square&label=LANGUAGES)](https://github.com/Ouros-App/ms-webfront-template/languages)
[![Forks](https://img.shields.io/github/forks/Ouros-App/ms-webfront-template?style=flat-square&label=FORKS)](https://github.com/Ouros-App/ms-webfront-template/network/members)
[![Issues](https://img.shields.io/github/issues/Ouros-App/ms-webfront-template?style=flat-square&label=ISSUES)](https://github.com/Ouros-App/ms-webfront-template/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Ouros-App/ms-webfront-template?style=flat-square&label=PULL%20REQUESTS)](https://github.com/Ouros-App/ms-webfront-template/pulls)

</div>
<!-- REPO-METADATA:END -->

Template de frontend web com React, TypeScript, Vite e Tailwind CSS. O projeto inclui os scripts de desenvolvimento, build, lint e publicação da aplicação estática com Docker e Nginx.

## Status e escopo

Este repositório é um template base para aplicações web. O pacote está marcado como privado em package.json e o código de aplicação fica em src/.

## Principais componentes

- React, React DOM e React Router DOM.
- TypeScript, Vite, Tailwind CSS, PostCSS e ESLint.
- DOMPurify declarado como dependência de runtime.
- Organização em src/components, src/context, src/hooks, src/pages, src/reducers, src/routes, src/services, src/types e src/utils.
- Dockerfile com etapa de build em Node 22 Alpine e etapa de publicação em Nginx 1.27 Alpine.
- Scripts run.sh e run_compose.sh para construir e executar contêineres.

## Pré-requisitos

- Node.js e npm para desenvolvimento local. A imagem de build do Docker usa Node 22 Alpine.
- Docker para os fluxos de contêiner.
- Docker Compose para o fluxo baseado em run_compose.sh.

## Instalação e configuração

Na raiz do repositório:

~~~bash
npm install
cp .env.example .env
~~~

Ajuste o arquivo .env conforme o ambiente:

| Variável | Uso no projeto |
| --- | --- |
| APP_NAME | Nome-base usado pelos scripts de contêiner. |
| VITE_APP_TITLE | Título configurável da aplicação. |
| VITE_API_URL | URL configurável da API. |
| VITE_STORAGE_VERSION | Versão configurável do armazenamento. |
| PORT | Porta usada pelo servidor de desenvolvimento/preview. |

O arquivo .env não deve ser versionado.

## Execução e uso

Desenvolvimento:

~~~bash
npm run dev
~~~

O servidor Vite usa a porta 5173 por padrão e aceita PORT. Para gerar e servir o build:

~~~bash
npm run build
npm run preview
~~~

O preview usa a porta 4173 por padrão.

Para Docker, os scripts definidos no package.json podem ser usados diretamente:

~~~bash
npm run docker:run
npm run docker:compose
~~~

Também é possível chamar os scripts explicitamente:

~~~bash
bash ./run.sh
bash ./run_compose.sh
~~~

Os dois fluxos exigem .env. run.sh cria uma imagem e um contêiner numerado usando APP_NAME e escolhe uma porta livre; run_compose.sh gera um arquivo docker-compose.N.yml e inicia a aplicação em uma porta livre.

## Testes e qualidade

O package.json define:

~~~bash
npm run lint
npm run build
~~~

Não há script de testes automatizados definido no package.json.

## Estrutura do projeto

~~~text
src/
  components/
  context/
  hooks/
  pages/
  reducers/
  routes/
  services/
  types/
  utils/
public/
docker/
  nginx/
Dockerfile
package.json
.env.example
run.sh
run_compose.sh
~~~

## Contribuição

Mantenha a organização existente, atualize a documentação quando alterar scripts ou variáveis de ambiente e envie a mudança em uma pull request com descrição objetiva.

## Licença

Este projeto está sob a licença MIT. Consulte LICENSE para o texto completo.


## Principais contribuidores

<!-- CONTRIBUTORS:START -->
- [@Nicolas25vlad](https://github.com/Nicolas25vlad) — 10 contribuições
<!-- CONTRIBUTORS:END -->

> Atualizado automaticamente semanalmente pelo workflow de metadados do README.
