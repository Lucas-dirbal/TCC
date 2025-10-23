# TCC - Sistema de Gestão de Equipamentos

Este repositório é dedicado ao armazenamento e desenvolvimento de arquivos relacionados ao Trabalho de Conclusão de Curso (TCC) para a obtenção do título de Técnico em Desenvolvimento de Sistemas.

## Visão Geral

Este projeto visa o desenvolvimento de um **Sistema de Gestão de Equipamentos** para instituições de ensino. O principal objetivo é otimizar o controle, organização e monitoramento dos recursos empregados, como ferramentas e dispositivos eletrônicos. A iniciativa busca fornecer um instrumento centralizado para dados sobre os equipamentos, melhorando a eficácia na gestão, monitoramento e manutenção, e diminuindo erros resultantes do uso impróprio e a perda de materiais. O sistema proposto funcionará por meio de um processo de autenticação com diferentes níveis de acesso para alunos, equipe pedagógica e administradores, facilitando a comunicação e promovendo o uso responsável dos recursos.

## Estrutura do Projeto

A estrutura de pastas do projeto foi organizada para promover a modularidade e facilitar a manutenção, separando as responsabilidades de cada componente. O sistema é construído com **HTML**, **CSS**, **JavaScript** (com **Node.js** para o backend) e utiliza **SQLite** como banco de dados.

```
. 
├── public/             # Arquivos estáticos acessíveis pelo navegador (HTML, CSS, JS do frontend)
├── src/                # Código fonte principal do backend (Node.js)
│   ├── controllers/    # Lógica de controle para as rotas da API
│   ├── models/         # Definição dos modelos de dados e interação com o banco de dados
│   ├── routes/         # Definição das rotas da API
│   └── views/          # Templates HTML (caso o backend renderize views)
├── database/           # Arquivos do banco de dados SQLite
├── .gitignore          # Arquivos e pastas a serem ignorados pelo Git
├── LICENSE             # Licença do projeto
├── README.md           # Documentação principal do repositório
├── package.json        # Metadados do projeto e dependências Node.js
└── package-lock.json   # Registro exato das dependências do projeto
```

Esta organização visa a clareza e a escalabilidade, permitindo que desenvolvedores compreendam rapidamente a função de cada diretório e arquivo.

## Instalação e Configuração

Para configurar o ambiente de desenvolvimento e executar o projeto, siga os passos abaixo:

1.  **Pré-requisitos**:
    
    *   Node.js (versão 14 ou superior)
    *   npm (gerenciador de pacotes do Node.js)
    *   Um editor de código (ex: VS Code)
2.  **Clonar o Repositório**:
    
    ```shell
    git clone https://github.com/Lucas-dirbal/TCC.git
    cd TCC
    ```
    
3.  **Instalar Dependências**:
    
    Este projeto utiliza `bcryptjs` para o hashing de senhas de usuários. Para instalar todas as dependências do projeto, execute:
    
    ```shell
    npm install
    ```
    
4.  **Executar o Projeto**:
    
    Para iniciar o servidor backend, execute:
    
    ```shell
    node server.js
    ```
    
    *Nota: Certifique-se de que o arquivo principal do seu servidor Node.js seja `server.js` ou ajuste o comando conforme necessário.*
