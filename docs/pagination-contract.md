# Contrato de integração da paginação (P8 / P22)

Esta PR implementa o consumidor front. As rotas Spring `/paged` ainda não existem no checkout local do backend; sua implantação depende do P22. Não implantar esta PR antes de validar o contrato abaixo no backend.

## Spring

Rotas: `/lots/production-summaries/paged`, `/state-goals/paged`, `/farms/simulations/paged`, `/farms/rankings/paged`.

Query: `page` a partir de zero, `size` (10, 25 ou 50), `search`, `sort`. Filtros existentes `id_enterprise` e `id_farm` são preservados nos adapters. A autorização continua no servidor. Busca e ordenação devem ocorrer antes de contar e paginar; nunca se aplica filtro ou sort no segmento recebido.

`sort` aceita os valores dos seletores existentes: registros (`padrao`, `hidrometro`, `custo`, `entraram`, `sairam`, `atuais`); simulações (`padrao`, `consumoAtual`, `consumoAlvo`, `precoAgua`, `precoEnergia`, `quantidadeAves`, `gastoAlvoEnergia`); ranking (`padrao`, `nome`, `pontuacao`, `atualizacao`). Os rótulos existentes definem a direção; o backend deve desempatar por ID.

Envelope: `{ content, totalElements, totalPages, page, size }`. `content` preserva os nomes dos DTOs atuais, com os agregados adicionais abaixo necessários à apresentação correta:

- Metas: cada item requer `total_farms` e `completed_farms`, contagens reais de granjas vinculadas. `target_value` não é quantidade de granjas. O envelope requer `summary: { percentual, concluidas, total }`, agregado global independente de página e busca, dentro do escopo autorizado. Ausência de agregado deve resultar em erro visível, nunca resumo da página ou estimativas.
- Ranking: `rank_position` é global e permanece estável sob busca e ordenação. O envelope requer `rankingTotalElements`, número total de granjas do ranking dentro do escopo da empresa antes da busca textual, para preservar as faixas de liga. `totalElements` continua sendo o total filtrado para navegação. Ausência desses dados produz erro visível.

Esses nomes dos agregados e de `search`/`sort` são a proposta concreta do consumidor e precisam ser alinhados ao implementar P22; os planos originais não os especificam.

As rotas antigas são preservadas para detalhes e outros consumidores. A implementação existente das mutações de metas e participantes continua local/simulada; conectar essas operações ao backend é uma dependência anterior que esta PR não transforma em persistência real. Após a mutação, a listagem sempre é recarregada do servidor.

## Telemetria

As duas rotas existentes usam `page` a partir de 1 e `limit`. Os adapters convertem para o envelope comum de página zero. Sessões usam os campos reais `session_id`, `user_name`, `total_tokens`, `latency_ms`, `cost_brl`, e mantêm o filtro `enterprise_id`. As sessões carregam e permitem retry independentemente dos KPIs e gráficos.

## Validação

`npm run build`, `npm run lint`, `npm test -- --maxWorkers=2`. Testes cobrem consulta no servidor, isolamento por empresa, mudanças de tamanho/filtros, exclusão na última página, cancelamento, respostas atrasadas, resumo global e os dois protocolos de paginação.

A validação com APIs reais e confirmação do RBAC Spring ficam pendentes da implementação/implantação do P22; mocks verificam apenas o contrato proposto.
