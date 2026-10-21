# 🌐 Órbita — Sistema de Gerenciamento de Espaços Corporativos Compartilhados

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=Spring-Security&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

> **Trabalho de Conclusão de Curso (TCC)** apresentado ao curso de Tecnologia da Informação e Comunicação da **FAETERJ-Petrópolis**.  
> **Autora:** Bianca de Araújo Ferreira Guimarães  
> **Orientador:** Prof. Amarildo Micoski Luz

---

## 📌 Sobre o Projeto

O **Órbita** é uma plataforma Full-Stack desenvolvida para automatizar e otimizar a gestão de ambientes corporativos compartilhados — como salas de reunião, espaços de coworking e auditórios modulares.

A solução substitui controles manuais e planilhas descentralizadas por um motor inteligente de governança corporativa, prevenindo **duplas reservas**, **monopólio de espaços por determinadas equipes** e **ociosidade por cancelamentos tardios**, além de impor isolamento estrito de dados entre empresas parceiras.

---

## 🚀 Principais Diferenciais de Engenharia

Muito além de um CRUD tradicional de reservas, o **Órbita** implementa soluções arquiteturais robustas para problemas reais de concorrência, segurança e regras de negócio:

*   **🛡️ Segurança em Profundidade (RBAC & JWT Assimétrico):**
    *   Autenticação *stateless* via **OAuth2 Resource Server** com tokens JWT assinados digitalmente através de pares de chaves criptográficas **RSA (Pública/Privada)** e senhas criptografadas com `BCrypt`.
    *   Validação de papéis em dupla camada: declarativa nos Controllers (`@PreAuthorize`) e programática nos Services (`UserValidator`), além de proteção de rotas no cliente com *Higher-Order Components (HOCs)* e *Context API*.
*   **⚡ Motor Bifásico de Detecção de Conflitos e Espaços Divisíveis:**
    *   **No Cliente (Frontend):** Algoritmo reativo que fraciona o expediente do local em blocos de 30 minutos e oculta preventivamente janelas passadas ou conflitantes.
    *   **No Servidor (Backend):** Consultas JPQL customizadas que impedem sobreposição de horários (`startAt < :endAt AND endAt > :startAt`), tratando a hierarquia entre **Auditórios Principais (`Venue`) e Subespaços (`SubVenue`)** — bloquear o auditório inteiro bloqueia suas divisões, enquanto reservar um subespaço mantém os demais disponíveis.
*   **📊 Gestão Transacional de Cotas Mensais e Horas Extras:**
    *   Controle automatizado de cota global mensal por empresa (padrão configurável de 20h) e subteto por categoria de espaço (12h), agregados diretamente no banco via `SUM()` para alta performance.
    *   Workflow completo de solicitação de horas adicionais em múltiplos níveis (`PENDING_MANAGER_REVIEW` ➔ `PENDING_ADMIN_REVIEW` ➔ `APPROVED`).
*   **⏱️ Expurgo e Cancelamento Automático Proativo (`@Scheduled`):**
    *   Job agendado no Spring Boot que monitora solicitações pendentes e cancela automaticamente reservas que ultrapassem o SLA de **72 horas** sem deliberação do Gestor, liberando a agenda.
*   **🔄 Resolução de Conflitos de Unicidade com Preservação de Auditoria:**
    *   Estratégia de migração atômica entre tabelas (`UserRegistrationRequest` ➔ `UserRejectedRequest`): quando um gestor recusa o vínculo de um usuário, o registro é copiado para o histórico de auditoria e removido fisicamente da fila ativa, liberando as restrições `UNIQUE` de CPF e E-mail no PostgreSQL para uma nova tentativa de cadastro.
*   **📦 Blindagem de Contratos via DTOs e Soft Delete:**
    *   Isolamento total das entidades de domínio com *Data Transfer Objects (DTOs)*, prevenção do problema de performance $N+1$ com `JOIN FETCH` e exclusão lógica (`@SQLDelete`) para preservação histórica.

---

## 👥 Perfis de Acesso (RBAC)

| Perfil | Nível | Principais Responsabilidades |
| :--- | :---: | :--- |
| **Administrador** | Estratégico | Cadastra empresas, espaços, subespaços, equipamentos e parâmetros de acessibilidade; vincula o primeiro Gestor; delibera em última instância sobre pacotes de horas adicionais. |
| **Gestor** | Tático | Supervisiona a equipe da sua empresa; aprova/rejeita vínculos de colaboradores e solicitações de agendamento; monitora dashboards de consumo de cotas; realiza **reservas diretas** (aprovação imediata). |
| **Colaborador** | Operacional | Solicita vínculo corporativo; consulta disponibilidade em tempo real no calendário; solicita reservas de salas/auditórios e requer horas extras. |

---

## 🏗️ Arquitetura do Sistema

O projeto adota a **Arquitetura em Três Camadas (Three-Tier Architecture)** totalmente conteinerizada:

```text
┌──────────────────────────────────────────────────────────────┐
│                 CAMADA DE APRESENTAÇÃO (UI)                  │
│     Next.js + React + TypeScript + Tailwind + shadcn/ui      │
│    (Context API, HOCs, Paginação Nativa, Motor de Blocos)    │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTPS / JSON (Bearer JWT RSA)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│              CAMADA DE LÓGICA DE NEGÓCIO (API)               │
│                  Java + Spring Boot 3 + JPA                  │
│   ┌──────────────┐   ┌────────────────────┐   ┌──────────┐   │
│   │ Controllers  │──▶│ Services/Validators│──▶│ Factories│   │
│   └──────────────┘   └─────────┬──────────┘   └──────────┘   │
│                                ▼                             │
│                      ┌────────────────────┐                  │
│                      │    Repositories    │                  │
│                      └─────────┬──────────┘                  │
└────────────────────────────────┼─────────────────────────────┘
                                 │ TCP/IP (JDBC / JPQL)
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                CAMADA DE PERSISTÊNCIA (DADOS)                │
│                         PostgreSQL                           │
│     (Integridade Referencial, Constraints, Soft Delete)      │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Regras de Negócio Implementadas

*   **RN01 (Antecedência Mínima):** Solicitações de colaboradores exigem no mínimo **96h** de antecedência (configurável por espaço).
*   **RN02 (Antecedência Máxima):** Limite de agendamento futuro de até **3 meses** (configurável por espaço).
*   **RN03 (SLA de Aprovação):** Prazo máximo de **72h** para o Gestor aprovar uma solicitação antes do cancelamento automático.
*   **RN04 (Janela de Cancelamento):** Cancelamentos permitidos apenas com até **48h** de antecedência do evento.
*   **RN05 (Via Rápida do Gestor):** Agendamentos criados por Gestores possuem aprovação atômica imediata e isenção das travas RN01, RN02 e RN03.
*   **RN06 (Bloqueio de Sobreposição):** Proibição estrita de agendamentos conflitantes no mesmo espaço ou subespaço.
*   **RN07 & RN08 (Política de Cotas):** Limite padrão de **20h mensais** por empresa, com teto de **12h** por categoria de espaço.
*   **RN14, RN15 & RN16 (Tipologia de Locais):** Salas de reunião e coworking operam por hora livre; auditórios operam por turnos fixos (Manhã 4h, Tarde 4h ou Integral 8h) e suportam divisibilidade modular.

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
*   **Java** & **Spring Boot** (Web, Validation, Scheduling)
*   **Spring Security** & **OAuth2 Resource Server** (Nimbus JOSE + JWT com chaves RSA)
*   **Spring Data JPA / Hibernate** (Consultas customizadas em JPQL)
*   **PostgreSQL** (SGBD Relacional)
*   **SpringDoc OpenAPI (Swagger UI)** (Documentação interativa da API)

### **Frontend**
*   **TypeScript** & **JavaScript (ES6+)**
*   **React** & **Next.js**
*   **Tailwind CSS** & **shadcn/ui** (Design System e componentes acessíveis)
*   **Context API & React Hooks** (`useState`, `useEffect`, `useCallback`)

### **DevOps & Ferramentas**
*   **Docker** & **Docker Compose**

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos
*   [Docker](https://www.docker.com/) e **Docker Compose** instalados (recomendado para subir todo o ecossistema com um único comando).
*   *Opcional (para execução local sem Docker):* **Java JDK 17+**, **Maven**, **Node.js 18+** e **PostgreSQL**.

### 1. Executando via Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/biancadearaujo/corporate-space-management.git

# 2. Acesse a pasta raiz do projeto
cd corporate-space-management

# 3. Suba os contêineres (Banco de Dados, Backend e Frontend)
docker-compose up --build -d
```

### 2. Acessando a Aplicação e Documentação

Após a inicialização dos contêineres, os serviços estarão disponíveis nos seguintes endereços locais:

*   🖥️ **Aplicação Web (Frontend Next.js):** `http://localhost:3000`
*   ⚙️ **API REST (Backend Spring Boot):** `http://localhost:8080`
*   📑 **Documentação Interativa (Swagger UI):** `http://localhost:8080/swagger-ui/index.html`

---

## 🗺️ Roadmap de Evolução (Trabalhos Futuros)

- [ ] **Engenharia de Qualidade:** Suíte de testes unitários (JUnit/Mockito), testes de integração da API e testes E2E no frontend (Cypress/Playwright).
- [ ] **Mensageria Assíncrona:** Serviço de envio de notificações transacionais por e-mail para alertas de aprovações, rejeições e horas extras.
- [ ] **Módulo de Analytics:** Expansão do painel com métricas de taxa de ocupação, horários de pico e exportação de relatórios gerenciais.
- [ ] **Interoperabilidade:** Sincronização bidirecional de reservas com Google Workspace (Google Calendar) e Microsoft 365 (Outlook).
- [ ] **CI/CD & Cloud:** Esteira automatizada de deploy contínuo em ambiente de nuvem (AWS / Vercel).

---

## 👩‍💻 Autora

Desenvolvido por **Bianca de Araújo Ferreira Guimarães**.

*   💼 **LinkedIn:** [linkedin.com/in/bianca-de-araujo](https://www.linkedin.com/in/bianca-de-araujo)