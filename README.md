# Segurança Pública Brasil

**Nome do Estudante**: Davi Andrzejewski Junkes

**Curso**: Engenharia de Software

![Badge em Desenvolvimento](http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge)
![Badge Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Badge React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Badge Oracle Cloud](https://img.shields.io/badge/Oracle_Cloud-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Badge Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black)

---

# Glossário e Navegação

- [Descrição do projeto](#descrição)
- [Especificação Técnica](#3-especificação-técnica)
- [Metodologia Ágil](#metodologia-agil)
- [Registro de Decisões (ADR/RFC)](#registro-de-decisões-adr-rfc)
- [Arquitetura](#arquitetura)
- [Infraestrutura Cloud](#infraestrutura)
- [Dados (ETL)](#dados-etl)
- [Back-end](#back-end)
- [Front-end](#front-end)
- [Testes](#testes)
- [CI/CD](#cicd)
- [Observabilidade](#observabilidade)
- [Qualidade e Segurança](#qualidade-e-segurança-do-código)
- [Instruções de Execução](#instruções-de-execução)
- [Resultados](#resultados)
- [Conclusão](#conclusão)
- [Referências](#referências)

<a id="descrição"></a>
# Descrição

A plataforma **Segurança Pública Brasil** é uma solução web completa para centralização, análise e visualização de dados de órgãos públicos relacionados à segurança e demografia no Brasil.O sistema integra dados heterogêneos (PRF, IBGE, FIPE, SINESP) para fornecer insights sobre criminalidade, acidentes e indicadores sociais.
   
Tendo a segmentação entre gráficos, relatórios e mapas analíticos a aplicação conta com a ajuda de filtros personalizados com tabelas auxilires como o da IBGE e FIPE para contextualização     com o mundo real.
   
O grande diferencial do projeto é a **democratização dos dados tratados**: além dos dashboards visuais, a aplicação oferece uma **API Pública Documentada via Swagger**, permitindo que
outros desenvolvedores e pesquisadores consumam os dados já higienizados e organizados na arquitetura Medallion.

### Contexto
No cenário atual, os dados de segurança pública encontram-se fragmentados em diversas fontes governamentais, muitas vezes em formatos de difícil leitura (arquivos soltos, CSV's mal
formatados e pdf's de atualização mensal), dificultando uma análise cruzada e estratégica.

### Justificativa
A centralização desses dados em uma arquitetura moderna permite a aplicação de inteligência de dados para identificar padrões e zonas de risco. A exposição desses dados via API facilita a criação de um ecossistema de segurança pública mais transparente.

### Motivação
Este projeto nasce da necessidade acadêmica e prática de aplicar conceitos de Engenharia de Software, Engenharia de Dados e DevOps em um produto real que possa impactar positivamente a 
transparência da informação pública.

### Objetivos
Disponibilizar uma interface interativa com mapas de calor e dashboards analíticos, sustentada por um pipeline de dados robusto e uma API de alta performance acessível publicamente.

### Escopo
- **Visualização de Dados:** Mapas de calor interativos e gráficos dinâmicos filtráveis por região, data e tipo de ocorrência.
- **API Pública (Diferencial):** Swagger UI "embeddado" na aplicação para consumo direto dos dados da camada Gold.
- **Integração de Dados:** Cruzamento de fontes da PRF, SINESP, SENAPPEN ,IBGE e FIPE.

## 2. Documentação

### Visão Geral do Repositório

A estrutura do projeto segue uma organização modular, separando responsabilidades de infraestrutura, backend, frontend e engenharia de dados.

```

├── .github/workflows      # Pipelines CI/CD (GitHub Actions)
├── client                 # Frontend (React + Vite)
├── server                 # Backend (Node.js + Express)
├── n8n/workflows          # Orquestração de ETL
├── data_processing        # Scripts Python (Bronze/Silver/Gold)
├── dataset                # Dados brutos
├── docs                   # Documentação auxiliar (RFCs, Assets)
└── ecosystem.config.js    # Orquestração de processos PM2 (Runtime Production)

```

### Clareza e Organização
O projeto utiliza **RFCs (Request for Comments)** para documentar decisões arquiteturais importantes e segue padrões de código definidos via ESLint e SonarQube. Diagramas C4 são utilizados 
para alinhar o código à arquitetura.

<a id="3-especificação-técnica"></a>
## 3. Especificação Técnica

### 3.1. Requisitos de Software
* O sistema deve suportar carga de dados massiva via ETL.
* Tempo de resposta da API deve ser otimizado para consultas analíticas.
* A documentação da API deve ser interativa (*Try it out*).

### 3.2. Considerações de Design
Utilização de Design System baseado em componentes **Radix UI** e **Tailwind CSS** para garantir acessibilidade, consistência visual e responsividade em diferentes dispositivos.

## Paleta de cores

    Utilizado a seguinte paleta de cores para o estilo das paginas:

    #1E75A7

    #5757E6

    #5784E6

    #57DEE6

    #8657E6

<img width="1600" height="1200" alt="Cores" src="https://github.com/user-attachments/assets/d5f8cd7d-6389-49fd-a5f2-bb47bab32d30" />

### 3.3. Stack Tecnológica
* **Front-end:** React, Vite, Tailwind, Leaflet, Swagger UI React, TypeScript.
* **Back-end:** Node.js, Express, PostgreSQL, Swagger JSDoc.
* **Dados:** Python, PostgreSQL, n8n.
* **Infra:** Oracle Cloud (VM ARM), PM2.

### 3.4. Considerações de Segurança
* Autenticação via JWT (JSON Web Tokens).
* Criptografia de senhas com Bcrypt.
* Configuração de CORS restritiva.
* Análise estática de vulnerabilidades (SAST) com SonarCloud.

<a id="metodologia-agil"></a>
## Metodologia Ágil
O gerenciamento do projeto foi realizado utilizando a metodologia Ágil/Kanban, com tarefas segregadas entre Dados, Back-end e Front-end.

* **Ferramenta de Gestão:** [ClickUp - Quadro do Projeto](https://app.clickup.com/90132140836/v/s/901312065003)

<img width="570" height="244" alt="image" src="https://github.com/user-attachments/assets/2e08a84c-23f1-4b3b-a17e-e0fc1401d985" />

<img width="2362" height="1394" alt="image" src="https://github.com/user-attachments/assets/bb9108b9-d80d-48aa-a78e-e39ea901458a" />


<a id="registro-de-decisões-adr-rfc"></a>
## Registro de Decisões (ADR/RFC)
As decisões arquiteturais são registradas no formato de RFCs para manter o histórico de evolução do software e justificar escolhas técnicas.

* [RFC-001: Escolha da Arquitetura Medallion](./RFC.md)

<a id="arquitetura"></a>
## Arquitetura

<img width="1413" height="527" alt="download" src="https://github.com/user-attachments/assets/19dc3d55-dcf3-4ad2-9a77-7bc6ce30596b" />

### Visão C4
A arquitetura segue o modelo Client-Server com uma camada dedicada de Engenharia de Dados que alimenta a base analítica.

![Diagrama C4](caminho/para/imagem.png)

### Fluxo de Dados
1.  **Ingestão:** n8n e scripts Python coletam dados (Web Scraping/APIs).
2.  **Processamento:** Dados fluem pelas camadas Bronze (Bruto) -> Silver (Limpo) -> Gold (Agregado).
3.  **API:** Node.js serve os dados da camada Gold via API REST.
4.  **Cliente:** React consome a API para renderizar gráficos e exibe a documentação Swagger para uso externo.

<a id="infraestrutura"></a>
### Infraestrutura Cloud
O projeto está hospedado na **Oracle Cloud Infrastructure (OCI)** na região de São Paulo (`sa-saopaulo-1`), garantindo alta disponibilidade e performance.

**Regras Firewall VM:**

<img width="2904" height="1528" alt="image" src="https://github.com/user-attachments/assets/df508c3c-71ee-4481-86e6-e3fb229997e5" />

**Especificações da VM (Compute Instance):**
* **Shape:** VM.Standard.A1.Flex (ARM)
* **OCPU count:** 4
* **Memória RAM:** 24 GB
* **Sistema Operacional:** Ubuntu 24.04 Minimal aarch64
* **Rede:** 4 Gbps de largura de banda
* **Armazenamento:** Block Storage (Paravirtualized)
* **IP Público:** Fixo (`168.138.126.135`)

<a id="fontes-de-dados"></a>
## Fontes de Dados

O pipeline de ingestão de dados consome informações de cinco fontes oficiais distintas, utilizando métodos específicos de coleta e tratamento para cada uma.

### 1. IBGE – API SIDRA
* **URL:** [https://apisidra.ibge.gov.br](https://apisidra.ibge.gov.br)
* **Método:** Requisições HTTP (REST JSON)
* **Descrição:** Utilizada para obter dados de população municipal (estimativas e censo) para cálculo de taxas per capita.
* **Pipeline de Processamento:**
    1.  Consulta ao endpoint `/values` com parâmetros definidos (tabela, variável, período, nível territorial).
    2.  Limpeza de nomes de municípios e normalização de códigos UF.
    3.  Persistência na camada Bronze para posterior enriquecimento.

### 2. SINESP – Bases Estaduais
* **URL:** [Ministério da Justiça - SINESP](https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/estatistica/dados-nacionais-1/base-de-dados-e-notas-metodologicas-dos-gestores-estaduais-sinesp-vde-2022-e-2023)
* **Método:** Download direto / Web Scraping controlado
* **Descrição:** Planilhas públicas com indicadores consolidados de segurança. Dados apenas agregados, sem identificação pessoal.
* **Pipeline de Processamento:**
    1.  Automação de download ou script de captura HTTP.
    2.  Conversão de encoding para UTF-8.
    3.  Padronização de cabeçalhos e remoção de metadados de formatação.

### 3. PRF – Acidentes em Rodovias
* **URL:** [Dados Abertos da PRF](https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-da-prf)
* **Método:** Web Scraping de página de dados abertos + Ingestão CSV
* **Descrição:** Arquivos históricos detalhando acidentes, localização (lat/long), tipos e severidade.
* **Pipeline de Processamento:**
    1.  Extração da lista de arquivos disponíveis (CSV).
    2.  Parse e normalização de colunas (tratamento de datas e coordenadas geográficas).
    3.  Agrupamento e limpeza de dados inconsistentes.

### 4. SENAPPEN – Ciclos População Carcerária
* **URL:** [SISDEPEN - Bases de Dados](https://www.gov.br/senappen/pt-br/servicos/sisdepen/bases-de-dados)
* **Método:** Download público (CSV)
* **Descrição:** Dados agregados de população carcerária por ciclos de levantamento (ex.: 14º, 15º ciclo).
* **Pipeline de Processamento:**
    1.  Download automatizado dos arquivos CSV.
    2.  Validação de delimitadores e tipagem de dados.
    3.  Remoção de colunas não utilizadas e carga em tabelas auxiliares.

### 5. FIPE – Indicadores Econômicos
* **URL:** [FIPE Online](https://fipe.online/)
* **Método:** Dados via assinatura (CSV e API)
* **Descrição:** Referências para marcas e modelos reais, por conta da falta de padrão desses valores na base de dados da PRF.
* **Pipeline de Processamento:**
    1.  Coleta pontual de séries públicas.
    2.  Integração estrita como dimensão complementar (sem dados sensíveis).


### Base Legal e Conformidade

A aplicação utiliza estritamente dados públicos ou anonimizados, concentrando estatísticas para análise exploratória. **Não são armazenados nomes, CPFs ou quaisquer identificadores diretos**, em total conformidade com os princípios de minimização e finalidade.

### Leis que nos asseguram.

* **Lei de Acesso à Informação (Lei 12.527/2011):** Autoriza a obtenção e reutilização de dados públicos disponibilizados oficialmente, garantindo transparência.
* **Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018):** Aplicação mitigada devido à ausência de dados pessoais identificáveis. O uso é estritamente estatístico.
* **Política de Dados Abertos (Decreto 8.777/2016):** Incentiva a padronização e abertura de bases governamentais, legitimando a integração multibase realizada neste projeto.

<a id="dados-etl"></a>
## Dados (ETL)
A arquitetura de dados segue rigorosamente o padrão **Medallion Architecture** para garantir integridade e rastreabilidade.

## Fluxos de trabalho

** Scripts sendo executados no n8n com códigos em python **

Localizados no diretório *data_processing* se encontram todos os processos de ETL deste projeto, sendo separados em:

```

├── datasets      # Dados brutos (WebScrapping)
├── queries       # Queries para construção das tabelas (separados em Bronze/Silver/Gold)
└── scripts       # Códigos python e bash para execusão das cargas das tabelas          

```

### Extração dos dados
* **Fontes:** PRF (Polícia Rodoviária Federal), IBGE, FIPE, SINESP.
* **Automação:** Workflows no **n8n** orquestram os scripts de extração localizados em `data_processing/`.

### Modelagem de Dados

#### Medallion Architecture
* **Bronze:** Dados brutos (Raw) armazenados conforme extraídos das fontes públicas.
* **Silver:** Dados limpos, tipados, com tratamento de nulos e remoção de duplicatas.
* **Gold:** Modelagem dimensional (Star Schema) pronta para consumo da API.

**Esquema do Banco de Dados (PostgreSQL):**
* **Dimensões:** `dim_calendario`, `dim_localidade`, `dim_tipo_acidente`, `dim_veiculos`.
* **Fatos:** `fato_ocorrencias`, `fato_populacao`, `fato_rodovias`.
* **Queries:** As consultas Gold são otimizadas para leitura rápida nos dashboards.

<a id="back-end"></a>
## Back-end

<img width="976" height="666" alt="image" src="https://github.com/user-attachments/assets/19d22feb-c990-4f0f-9f47-8f6d0ad3dc94" />

Desenvolvido em **Node.js** com **Express**, priorizando a documentação e a padronização das respostas.

* **Framework:** Express v5.
* **Segurança:** `bcrypt`, `jsonwebtoken`, `cors`, `dotenv`.
* **Banco de Dados:** `pg` (Cliente PostgreSQL).
* **Documentação:** `swagger-jsdoc` e `swagger-ui-express`.

**Destaques:**
* A API segue os princípios REST.
* Documentação automática acessível via rota `/api-docs`.
* Tratamento centralizado de erros.

<a id="front-end"></a>
## Front-end

<img width="984" height="750" alt="image" src="https://github.com/user-attachments/assets/fff5798e-9ec2-4544-b08b-3f28284f6e30" />

SPA (Single Page Application) desenvolvida com **Vite** e **React**, focada em performance e visualização de dados geoespaciais.

* **Core:** React 18, Vite.
* **UI Components:** `@radix-ui` (Primitives acessíveis), `sonner` (Toast notifications).
* **Estilização:** `tailwind-merge` e `clsx` para classes dinâmicas.
* **Mapas e Gráficos:** `leaflet` e `react-leaflet` (Mapas de calor), `recharts` (Gráficos estatísticos).
* **Integração API:** `swagger-ui-react` para embutir a documentação técnica diretamente no portal do usuário.

<a id="testes"></a>
## Testes
O projeto adota práticas de TDD para o backend, garantindo a estabilidade das regras de negócio.

* **Ferramenta:** Jest + Supertest.
* **Tipos de Teste:** Unitários e Integração de rotas.
* **Relatórios:** Cobertura de código gerada via `lcov` na pasta `coverage/`.
* **Cobertura Atual:** Backend > 75%

<a id="cicd"></a>
## CI/CD
Pipeline de integração e entrega contínua configurado via **GitHub Actions**.

* **Deploy to VM:** Processo de CI/CD para atualização do repositório e deploy para o servidor cloud.
* **Build:** Envio de métricas de qualidade para o SonarCloud.

<img width="3006" height="1328" alt="image" src="https://github.com/user-attachments/assets/f5fcfad3-ffb0-49c7-9e49-735ed7c05e42" />

<a id="observabilidade"></a>
## Observabilidade
Monitoramento em tempo real da aplicação em produção utilizando **PM2**.

* **Ferramenta:** PM2 Runtime & Dashboard.
* **Link do Dashboard:** [Acessar Monitoramento PM2](https://app.pm2.io/bucket/691df1b8419e0c648b717c46/backend/overview/servers)
* **Funcionalidades:** Monitoramento de CPU/Memória, Restart automático em falhas, Gerenciamento de Logs.

# OverView
<img width="3016" height="1516" alt="image" src="https://github.com/user-attachments/assets/442d8a27-86ba-43c6-bc2a-ae312ad80b97" />

# RealTime Metrics
<img width="3010" height="1636" alt="image" src="https://github.com/user-attachments/assets/1d104d96-07ec-455d-b42f-7461cd919422" />

<a id="qualidade-e-segurança-do-código"></a>
## Qualidade e segurança do código
A qualidade do código é auditada continuamente pelo **SonarCloud** (SonarQube), garantindo conformidade com padrões de segurança e manutenibilidade.

* **Dashboard de Qualidade:** [SonarCloud - Segurança Pública Brasil](https://sonarcloud.io/project/overview?id=JnksDavu_seguranca-publica-brasil)
* **Métricas Analisadas:**
* Bugs e Vulnerabilidades.
* Code Smells.
* Cobertura de Testes.
* Duplicações de código.

<img width="3004" height="1644" alt="image" src="https://github.com/user-attachments/assets/2e7f91eb-f828-4c4a-b5f7-b23d17da0f91" />


<a id="instruções-de-execução"></a>
## Instruções de Execução

### Pré-requisitos
* Node.js v20+
* PostgreSQL
* Python 3.10+ (para execução local dos pipelines de ETL)

### Setup local

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/seguranca-publica-brasil.git](https://github.com/seu-usuario/seguranca-publica-brasil.git)
   cd seguranca-publica-brasil
   
2. **Configurações:**
   - Criar .env na raiz do projeto com as credenciais.
   - Criar .env na pasta client para as credenciais do front-end
  
3. **Back-End:**
   ```bash
   cd server
   npm i
   npm run dev
   # O servidor rodará na porta definida (ex: 3000)

4. **Front-End:**
   ```bash
   cd client
   npm i
   npm run dev
   # A aplicação estará acessível em http://localhost:5173

**Pronto, sua aplicação está rodando!**

<a id="referências"></a>
## Referências

### Documentação Técnica
* [Documentação React](https://react.dev/)
* [Documentação Node.js](https://nodejs.org/)
* [Oracle Cloud Documentation](https://docs.oracle.com/en-us/iaas/)
* [Swagger OpenAPI Spec](https://swagger.io/specification/)

### Fontes de Dados Governamentais
* [Dados Abertos PRF - Acidentes](https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-da-prf)
* [IBGE - API SIDRA](https://apisidra.ibge.gov.br)
* [Ministério da Justiça - SINESP](https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/estatistica/dados-nacionais-1/base-de-dados-e-notas-metodologicas-dos-gestores-estaduais-sinesp-vde-2022-e-2023)
* [SENAPPEN - Dados Prisionais](https://www.gov.br/senappen/pt-br/servicos/sisdepen/bases-de-dados)
* [FIPE - Fundação Instituto de Pesquisas Econômicas](https://fipe.online/)

