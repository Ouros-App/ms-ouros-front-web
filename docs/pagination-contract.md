# Contrato de integração da paginação (P8 / P22)

Esta PR implementa o consumidor front. As rotas Spring `/paged` ainda não existem no checkout local do backend; sua implantação depende do P22. Não implantar esta PR antes de validar o contrato abaixo no backend.

## Spring

Rotas: `/lots/production-summaries/paged`, `/state-goals/paged`, `/farms/simulations/paged`, `/farms/rankings/paged`.

Query: `page` a partir de zero, `size` (10, 25 ou 50), `search`, `sort` e `direction`. Filtros existentes `id_enterprise` e `id_farm` são preservados nos adapters. A autorização continua no servidor. Busca e ordenação devem ocorrer antes de contar e paginar; nunca se aplica filtro ou sort no segmento recebido.

O front mapeia os seletores para os campos JSON aceitos pelo Spring: `atuais` para `galinhas_atuais`; `consumoAtual` para `current_cgi`; `consumoAlvo` para `target_cgi`; `precoAgua` para `water_price`; `precoEnergia` para `energy_price`; `quantidadeAves` para `poultry_quantity`; `gastoAlvoEnergia` para `target_energy_kwh`; `nome` para `farm_name`; `pontuacao` para `score`. Também envia `direction`; registros e simulações usam `desc`, ranking por nome e score usa `asc`. O backend acrescenta ID como desempate nas consultas relacionais. Ranking não tem data de atualização persistida, então essa opção foi removida.

Envelope: `{ content, totalElements, totalPages, page, size }`. `content` preserva os nomes dos DTOs atuais, com os agregados adicionais abaixo necessários à apresentação correta:

- Metas: o envelope inclui `statusCounts`, contagem global por status para o conjunto filtrado. O front calcula o resumo geral a partir dessas contagens (concluídas são status `CONCLUIDA`), independente da página. Os DTOs atuais não retornam total de granjas concluídas por estado; as colunas legadas continuam usando `target_value` no mapeamento já existente.
- Ranking: `rank_position` corresponde ao conjunto filtrado completo; `totalElements` é também esse total, e serve para manter a classificação por liga entre páginas. Não há `rankingTotalElements` adicional.

Contrato confirmado contra a documentação da PR Spring #74.

As rotas antigas são preservadas para detalhes e outros consumidores. A implementação existente das mutações de metas e participantes continua local/simulada; conectar essas operações ao backend é uma dependência anterior que esta PR não transforma em persistência real. Após a mutação, a listagem sempre é recarregada do servidor.

## Telemetria

As duas rotas existentes usam `page` a partir de 1 e `limit`. Os adapters convertem para o envelope comum de página zero. Sessões usam os campos reais `session_id`, `user_name`, `total_tokens`, `latency_ms`, `cost_brl`, e mantêm o filtro `enterprise_id`. As sessões carregam e permitem retry independentemente dos KPIs e gráficos.

## Validação

`npm run build`, `npm run lint`, `npm test -- --maxWorkers=2`. Testes cobrem consulta no servidor, isolamento por empresa, mudanças de tamanho/filtros, exclusão na última página, cancelamento, respostas atrasadas, resumo global e os dois protocolos de paginação.

A validação com APIs reais e confirmação do RBAC Spring ficam pendentes da implementação/implantação do P22; mocks verificam apenas o contrato proposto.
