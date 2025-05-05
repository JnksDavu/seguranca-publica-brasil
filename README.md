# Capa

* **Título do Projeto**: CrimiMap - Plataforma de Análise Integrada da Segurança Pública
* **Nome do Estudante**: Davi Andrzejewski Junkes
* **Curso**: Engenharia de Software

# Resumo

Este documento apresenta o projeto "CrimiMap", uma plataforma web destinada à centralização e visualização de dados públicos sobre segurança no Brasil. O objetivo é padronizar e disponibilizar informações de diferentes fontes governamentais, oferecendo uma interface interativa com mapas de calor, filtros e estatísticas para apoiar cidadãos, pesquisadores e gestores públicos.

## 1. Introdução

### Contexto

Atualmente, dados de segurança pública como criminalidade e acidentes estão distribuídos em diferentes plataformas governamentais com pouca padronização. Isso dificulta a análise ampla e acessível desses dados.

### Justificativa

Este projeto visa resolver a descentralização e a falta de padronização dos dados públicos relacionados à segurança, oferecendo uma solução tecnológica que facilita a visualização e o cruzamento dessas informações.

### Objetivos

* Desenvolver uma plataforma unificada para consulta de dados públicos de segurança.
* Padronizar e organizar as informações em um banco de dados relacional.
* Oferecer visualizações como mapas de calor e dashboards interativos.
* Permitir filtros por tipo de crime, cidade, data, entre outros.

## 2. Descrição do Projeto

### Tema do Projeto

Desenvolvimento de um sistema web que centraliza dados públicos de órgãos como SSP, SINESP, PRF, entre outros, permitindo análise interativa de indicadores de segurança pública.

### Problemas a Resolver

* Dados espalhados em diversas fontes e formatos.
* Falta de padronização e integração entre os dados.
* Dificuldade de acesso e interpretação dos dados pelo público geral.

### Limitações

* O sistema não permitirá denúncias nem contato com órgãos de segurança.
* Limita-se ao uso de dados abertos disponíveis oficialmente.

## 3. Especificação Técnica

### 3.1. Requisitos de Software

**Requisitos Funcionais (RF):**

* RF01: Permitir a importação de dados em CSV, JSON e APIs públicas.
* RF02: Exibir os dados em dashboards e mapas interativos.
* RF03: Aplicar filtros por cidade, data e tipo de ocorrência.
* RF04: Autenticação de usuários via JWT.

**Requisitos Não-Funcionais (RNF):**

* RNF01: Alta disponibilidade e performance.
* RNF02: Interface responsiva.
* RNF03: Segurança na autenticação e transmissão dos dados.

**Representação dos Requisitos:** Diagrama de Casos de Uso (a ser incluído).

### 3.2. Considerações de Design

**Visão Inicial da Arquitetura:**

* Front-end em React/Next.js
* Back-end em Node.js (Express)
* Banco de dados PostgreSQL
* ETL com Apache Airflow
* Streaming com Apache Kafka

**Padrões de Arquitetura:**

* MVC no backend
* Microserviços para ingestão e tratamento de dados

**Modelos C4:**

* Nível de contexto: Sistema central que interage com fontes públicas de dados e usuários.
* Contêineres: Front-end, API Gateway, ETL, Banco de Dados.
* Componentes e Código: Detalhamento nos documentos técnicos específicos.

### 3.3. Stack Tecnológica

* **Linguagens**: TypeScript (Node.js e React).
* **Frameworks**: Express, Next.js, Tailwind CSS.
* **Bibliotecas**: Axios, Recharts, Leaflet.js, JWT.
* **Ferramentas**: PostgreSQL, Airflow, Kafka, GitHub, Trello, Figma.

### 3.4. Considerações de Segurança

* Utilização de autenticação JWT.
* Criptografia na comunicação entre front-end e back-end (HTTPS).
* Sanitização dos dados de entrada para prevenir injeção de código.

## 4. Próximos Passos

* Construção dos pipelines ETL com Airflow (Portfólio I)
* Desenvolvimento dos microserviços e API RESTful (Portfólio I)
* Construção do front-end com mapas e filtros (Portfólio II)
* Testes, documentação e refinamento final (Portfólio II)

## 5. Referências

* SSP-SC: [https://ssp.sc.gov.br/segurancaemnumeros/](https://ssp.sc.gov.br/segurancaemnumeros/)
* API SINESP (não oficial): [https://github.com/rayonnunes/api\_seguranca\_publica](https://github.com/rayonnunes/api_seguranca_publica)
* PRF Dados Abertos: [https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-da-prf](https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-da-prf)
* Rede Social de Cidades: [https://www.redesocialdecidades.org.br/dados-abertos](https://www.redesocialdecidades.org.br/dados-abertos)
* Documentação oficial das ferramentas utilizadas (Airflow, Kafka, PostgreSQL, etc.)

## 6. Apêndices (Opcionais)

* Prints das telas previstas
* Esboço dos diagramas C4
* Análise de fontes de dados disponíveis

## 7. Avaliações de Professores

**Considerações Professor/a:**

---

**Considerações Professor/a:**

---

**Considerações Professor/a:**

---
