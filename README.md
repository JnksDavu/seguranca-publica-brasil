* **Título do Projeto**: Segurança pública Brasil
* **Nome do Estudante**: Davi Andrzejewski Junkes
* **Curso**: Engenharia de Software

# Glossário e Navegação

- [Descrição do projeto](#descrição)
- [Motivação](#motivação)
- [Objetivos](#objetivos)
- [Requisitos](#3-especificação-técnica)
- [Arquitetura](#arquitetura)
- [Infraestrutura Cloud](#infraestrutura)
- [Guia do repositório](#guia-do-repositório)
- [Dados](#dados)
- [Back-end](#back-end)
- [Front-end](#front-end)
- [Testes](#testes)
- [Observabilidade](#observabilidade)
- [Qualidade e segurança do código](#Qualidade-e-segurança-do-código)
- [Instruções de Execução](#instruções-de-execução)
- [Registro de Decisões (ADR/RFC)](#registro-de-decisões-adr-rfc)
- [Metodologia Ágil](#metodologia-agil)
- [Resultados](#resultados)
- [Conclusão](#conclusão)
- [Referências](#referências)

<a id="descrição"></a>
# Descrição

...

### Contexto
...

### Justificativa
...

### Motivação
Descreva a motivação do projeto, problemas enfrentados e impacto esperado.

### Objetivos
...

### Escopo
- Escopo: funcionalidades principais e entregáveis.

## 2. Documentação

### Visão Geral do Repositório
- Conteúdo: motivação, requisitos, modelagem, arquitetura, instruções de uso.
- Mapa dos diretórios e arquivos relevantes.

### Clareza e Organização
- Convenções de escrita, formatação e diagramas.
- Coerência entre código-fonte e diagramas.

<a id="3-especificação-técnica"></a>
## 3. Especificação Técnica

### 3.1. Requisitos de Software
...

### 3.2. Considerações de Design
...

### 3.3. Stack Tecnológica
...

### 3.4. Considerações de Segurança
...

## Arquitetura

### Visão C4
- Contexto: atores e sistemas.
- Contêineres: Front-end, API, ETL, DB, Kafka.
- Componentes: principais módulos.
- Código: referência cruzada para diretórios.

### Diagrama de Arquitetura
- Imagem/mermaid do diagrama.
- Breve explicação dos fluxos (ingestão, processamento, acesso).

<a id="infraestrutura"></a>
### Infraestrutura Cloud

...

## Dados (ETL)

## Extração dos dados

    ## Extração de dados

      # WebScrapping

      # APIs

## Banco de dados

## Modelagem de Dados

# Schemas

   # Medallion Architecture

    # Bronze

    # Silver

    # Gold

- Esquema do PostgreSQL (tabelas, chaves, normalização).
- Dicionário de dados (principais entidades e campos).
- Estratégias de padronização (normalização de fontes públicas).

## Back-end

- API REST (Express/Node.js) e padrões.
- Autenticação JWT.
- Endpoints principais.
- Integração com DB e serviços.

## Front-end

- Framework: Next.js, Tailwind CSS.
- Páginas e rotas principais.
- Visualizações: mapas (Leaflet), dashboards (Recharts).
- Filtros e UX.

## Testes

- Tipos de testes (unitários, integração, e2e).
- Como rodar os testes no VS Code e terminal.
- Cobertura e relatórios.

<a id="observabilidade"></a>
## Observabilidade
...

<a id="Qualidade-e-segurança-do-código"></a>
## Qualidade e segurança do código
...


<a id="instruções-de-execução"></a>
## Instruções de Execução

### Pré-requisitos
- Node.js, PostgreSQL, Docker (opcional), Airflow, Kafka.

### Setup local
- Instalação e configuração.
- Variáveis de ambiente.
- Migrações de banco.

### Executando
- Backend: comandos de start.
- Frontend: comandos de start.
- ETL: inicialização dos pipelines.
- Kafka: tópicos e serviços.

<a id="registro-de-decisões-adr-rfc"></a>
## Registro de Decisões (ADR/RFC)

- Local dos ADRs/RFCs no repositório.
- Como propor e registrar novas decisões.
- Links para issues relevantes.

<a id="metodologia-agil"></a>
## Metodologia Ágil
...

<a id="resultados"></a>
## Resultados
...

<a id="conclusão"></a>
## Conclusão
...

## Histórico de Mudanças

- Changelog resumido por versão/entrega.
- Principais alterações e justificativas.

<a id="referências"></a>
## Referências

