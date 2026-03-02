# Guia Detalhado: Desenvolvimento com Electron.js
## 14 Aulas Completas com Códigos, Instruções e Explicações de Termos

---

## Índice
1. [Glossário Fundamental](#glossário-fundamental)
2. [Aula 02: Preparando o Ambiente](#aula-02-preparando-o-ambiente)
3. [Aula 03: Estrutura Inicial](#aula-03-estrutura-inicial-de-um-app-electron)
4. [Aula 04: Primeira Janela](#aula-04-criando-a-primeira-janela)
5. [Aula 05: Funcionamento](#aula-05-funcionamento-do-electron)
6. [Aula 06: Trabalhando com Janelas](#aula-06-trabalhando-com-janelas)
7. [Aula 07: Gerenciando Energia](#aula-07-gerenciando-energia)
8. [Aula 08: Comunicação IPC](#aula-08-main-e-renderer-comunicação)
9. [Aula 09: APIs Nativas](#aula-09-api-do-electron-nativas)
10. [Aula 10: Projeto Prático](#aula-10-projeto-prático)
11. [Aula 11: App e Atalhos](#aula-11-app-e-atalhos)
12. [Aula 12: Menus](#aula-12-menus-e-barra-de-tarefas)
13. [Aula 13: Notificações](#aula-13-notifications-e-requisições)
14. [Aula 14: Distribuição](#aula-14-distribuindo-as-aplicações)

---

## Glossário Fundamental

Antes de começar, compreenda estes termos essenciais que aparecerão repetidamente:

### Arquitetura e Processos

**Main Process (Processo Principal):** O "maestro" do seu aplicativo Electron. Roda o código Node.js definido no arquivo `main.js`. É o único processo que pode criar janelas (`BrowserWindow`), acessar o sistema de arquivos, registrar atalhos globais e gerenciar o ciclo de vida do aplicativo. Pense nele como o "chefe" que controla tudo.

**Renderer Process (Processo de Renderização):** O código que roda dentro de cada janela do Electron. Renderiza HTML, CSS e JavaScript. Cada janela tem seu próprio Renderer Process isolado. Pense nele como o "funcionário" que executa as ordens do chefe.

**V8:** O motor JavaScript desenvolvido pelo Google que ambos Main Process (via Node.js) e Renderer Process (via Chromium) usam para executar código JavaScript.

**Chromium:** O mecanismo de renderização web que o Electron usa para exibir interfaces HTML/CSS. É o mesmo motor usado pelo Google Chrome.

### Conceitos de Segurança

**nodeIntegration:** Uma configuração que, quando `true`, permite que o código do Renderer Process (a interface web) acesse diretamente o módulo `require` do Node.js. **Isso é perigoso** porque qualquer código malicioso na interface (injetado via XSS) teria acesso total ao sistema de arquivos e ao sistema operacional. Sempre mantenha como `false`.

**contextIsolation:** Uma configuração que, quando `true`, roda o preload script e a página web em contextos JavaScript completamente separados. Isso cria uma "barreira de vidro" que impede que a página web acesse diretamente o contexto do preload. É uma camada crítica de segurança.

**Preload Script:** Um arquivo JavaScript especial que roda **antes** da página web ser carregada. Ele tem acesso ao Node.js e pode usar o `contextBridge` para expor APIs específicas e controladas para a página web, sem dar acesso irrestrito.

**Context Bridge:** Uma ferramenta que permite que o preload script exponha funções e dados específicos para a página web através do objeto `window`. É como uma "janela com grades" - você pode passar coisas através dela, mas não pode atravessar completamente.

**XSS (Cross-Site Scripting):** Um tipo de ataque onde código malicioso é injetado em uma página web. Se seu Electron app carregar conteúdo externo (como uma página web remota) e você tiver `nodeIntegration: true`, um ataque XSS poderia acessar o sistema de arquivos do usuário.

### Conceitos de Desenvolvimento

**NPM (Node Package Manager):** O gerenciador de pacotes do Node.js. Permite instalar, atualizar e gerenciar bibliotecas de código reutilizável.

**package.json:** O arquivo de configuração do seu projeto Node.js. Contém metadados (nome, versão), dependências, scripts e configurações.

**Dependência:** Um pacote (biblioteca) que seu projeto precisa para funcionar. Exemplo: Electron é uma dependência.

**devDependency:** Uma dependência necessária apenas durante o desenvolvimento, não na versão final do aplicativo. Electron é uma devDependency.

**IPC (Inter-Process Communication):** O sistema de "mensagens" que permite comunicação segura entre Main Process e Renderer Process. Como os processos são isolados, eles não podem acessar diretamente as variáveis um do outro - precisam usar IPC.

**ipcMain:** O módulo que roda no Main Process para receber e enviar mensagens do/para Renderer Process.

**ipcRenderer:** O módulo que roda no Renderer Process para receber e enviar mensagens do/para Main Process.

**Async/Await:** Um padrão moderno de JavaScript para trabalhar com código assíncrono (que leva tempo para executar). `async` marca uma função como assíncrona, e `await` pausa a execução até que uma Promise seja resolvida.

**Promise:** Um objeto JavaScript que representa um valor que pode estar disponível agora, no futuro, ou nunca. É usado para operações assíncronas como leitura de arquivos ou requisições HTTP.

### Conceitos de Sistema Operacional

**Terminal/CLI:** Interface de texto onde você digita comandos para o computador executar.

**Linha de Comando:** Uma instrução que você digita no terminal. Exemplo: `npm install electron`.

**Diretório/Pasta:** Um local no computador onde arquivos são armazenados.

**Caminho (Path):** O "endereço" de um arquivo ou pasta. Exemplo: `/home/usuario/projetos/meu-app/main.js`.

**Variáveis de Ambiente:** Valores que o sistema operacional armazena e que os programas podem acessar. Exemplo: `NODE_ENV` pode ser "development" ou "production".

---

## Aula 02: Preparando o Ambiente

### Objetivo da Aula

Garantir que todos os alunos tenham as ferramentas necessárias instaladas e compreendam o papel de cada uma no ecossistema do Electron.

### Conceitos Fundamentais

**Node.js e o Electron:** O Electron não é apenas um navegador disfarçado. Ele incorpora o **Node.js** para fornecer capacidades de backend, permitindo acesso nativo ao sistema de arquivos, redes e hardware. Pense no Node.js como o "poder" que transforma um navegador web em um aplicativo desktop completo.

**NPM (Node Package Manager):** O gerenciador de pacotes do Node.js. Ele funciona como uma "loja de código" onde você pode baixar e instalar bibliotecas prontas. Quando você executa `npm install electron`, o NPM baixa o Electron e todas as suas dependências para uma pasta chamada `node_modules`.

**Versão LTS (Long Term Support):** Uma versão de software que recebe suporte e atualizações de segurança por um longo período (geralmente 3 anos). Para iniciantes, sempre instale versões LTS porque são estáveis e bem testadas.

**Visual Studio Code:** Um editor de código moderno e leve. Ele oferece:
- Destaque de sintaxe (cores diferentes para diferentes partes do código)
- Autocompletar (sugestões enquanto você digita)
- Depurador integrado (ferramenta para encontrar erros)
- Terminal integrado (você pode executar comandos sem sair do editor)

**Extensões do VS Code:** Pequenos programas que adicionam funcionalidades:
- **ESLint:** Analisa seu código e aponta erros e problemas de estilo
- **Prettier:** Formata automaticamente seu código para ficar bonito e consistente
- **Electron Color Theme:** Um tema visual agradável para desenvolvimento Electron

**Electron Forge:** Um conjunto de ferramentas "batteries-included" (tudo incluído) que facilita:
- Criar a estrutura inicial do projeto (boilerplate)
- Empacotar o aplicativo para distribuição
- Gerenciar dependências

### Instruções Passo a Passo

#### Passo 1: Instalar Node.js

1. Visite [nodejs.org](https://nodejs.org)
2. Clique no botão "LTS" (Long Term Support)
3. Execute o instalador
4. Siga as instruções do instalador (aceite os padrões)
5. Abra o terminal/prompt de comando e verifique a instalação:

```bash
node --version
npm --version
```

Você deve ver números de versão (exemplo: `v18.16.0` e `9.6.7`).

#### Passo 2: Instalar Visual Studio Code

1. Visite [code.visualstudio.com](https://code.visualstudio.com)
2. Clique em "Download"
3. Execute o instalador
4. Siga as instruções do instalador

#### Passo 3: Instalar Extensões do VS Code

1. Abra VS Code
2. Clique no ícone de "Extensões" na barra lateral esquerda (ícone de 4 quadrados)
3. Procure por "ESLint" e clique em "Instalar"
4. Procure por "Prettier" e clique em "Instalar"
5. Procure por "Electron" e instale um tema de cores

#### Passo 4: Criar Seu Primeiro Projeto

1. Crie uma pasta vazia em um local de sua escolha. Nomeie como `meu-app-electron`
2. Abra o terminal/prompt de comando
3. Navegue até a pasta:
   ```bash
   cd caminho/para/meu-app-electron
   ```
4. Inicialize o projeto Node.js:
   ```bash
   npm init -y
   ```
   
   **Explicação:** O comando `npm init -y` cria um arquivo `package.json` com valores padrão. O `-y` significa "sim para todas as perguntas".

5. Instale o Electron como uma dependência de desenvolvimento:
   ```bash
   npm install --save-dev electron
   ```
   
   **Explicação:** O `--save-dev` indica que o Electron é necessário apenas durante o desenvolvimento, não na versão final do aplicativo.

### Resultado Esperado

Após completar esta aula, você terá:
- Node.js e NPM instalados
- Visual Studio Code com extensões úteis
- Uma pasta de projeto com um arquivo `package.json`
- Electron instalado na pasta `node_modules`

---

## Aula 03: Estrutura Inicial de um App Electron

### Objetivo da Aula

Fazer os alunos entenderem como um aplicativo Electron é organizado e a separação fundamental de responsabilidades entre Main Process e Renderer Process.

### Conceitos Fundamentais

**package.json - O Coração do Projeto:** Este arquivo é como um "passaporte" do seu projeto. Ele contém:

```json
{
  "name": "meu-app-electron",           // Nome do aplicativo
  "version": "1.0.0",                   // Versão atual
  "description": "Meu primeiro app",    // Descrição
  "main": "main.js",                    // Arquivo que Node.js executa primeiro
  "scripts": {                          // Atalhos para comandos
    "start": "electron ."               // npm start executa "electron ."
  },
  "devDependencies": {                  // Dependências de desenvolvimento
    "electron": "^27.0.0"               // Versão do Electron
  }
}
```

**Ponto de Entrada (main.js):** O arquivo que o Node.js executa primeiro. É o "maestro" do seu aplicativo - ele cria janelas, gerencia o ciclo de vida e controla tudo.

**Arquitetura de Pastas:** A separação entre Main Process e Renderer Process:

```
meu-app-electron/
├── src/
│   ├── main/
│   │   ├── main.js              (Main Process - Node.js)
│   │   └── preload.js           (Ponte segura para Renderer)
│   └── renderer/
│       ├── index.html           (Interface visual)
│       ├── styles.css           (Estilos)
│       └── app.js               (Lógica da interface)
├── package.json                 (Configuração do projeto)
└── node_modules/                (Pacotes instalados)
```

**Main Process vs Renderer Process:**

| Aspecto | Main Process | Renderer Process |
|--------|-------------|------------------|
| **Roda em** | Node.js | Chromium (navegador) |
| **Arquivo** | main.js | index.html + app.js |
| **Acesso** | Sistema de arquivos, SO | Apenas interface |
| **Quantidade** | Um por aplicativo | Um por janela |
| **Responsabilidade** | Gerenciar tudo | Exibir interface |

### Instruções Passo a Passo

#### Passo 1: Estruturar as Pastas

Na pasta `meu-app-electron`, crie a seguinte estrutura:

```bash
mkdir -p src/main src/renderer
```

#### Passo 2: Modificar package.json

Abra o arquivo `package.json` em VS Code e altere para:

```json
{
  "name": "meu-app-electron",
  "version": "1.0.0",
  "description": "Meu primeiro aplicativo Electron",
  "main": "src/main/main.js",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --inspect=5858"
  },
  "devDependencies": {
    "electron": "^27.0.0"
  }
}
```

**Explicação das mudanças:**
- `"main": "src/main/main.js"` - Agora aponta para o arquivo main.js dentro da pasta src/main
- `"start": "electron ."` - Executa o Electron no diretório atual
- `"dev": "electron . --inspect=5858"` - Modo de desenvolvimento com depurador

#### Passo 3: Criar o Arquivo main.js

Crie o arquivo `src/main/main.js` com o seguinte conteúdo:

```javascript
// Importar os módulos necessários do Electron
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Variável para armazenar a referência da janela principal
let mainWindow;

// Função para criar a janela principal
function createWindow() {
  // Criar uma nova janela do Electron
  mainWindow = new BrowserWindow({
    width: 1200,                    // Largura em pixels
    height: 800,                    // Altura em pixels
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  // Caminho para o preload script
      nodeIntegration: false,       // SEGURANÇA: Não permitir acesso direto ao Node.js
      contextIsolation: true        // SEGURANÇA: Isolar contextos JavaScript
    }
  });

  // Carregar o arquivo HTML na janela
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Abrir DevTools (ferramentas de desenvolvedor) - remova em produção
  mainWindow.webContents.openDevTools();

  // Quando a janela é fechada, limpar a referência
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Quando o Electron está pronto, criar a janela
app.whenReady().then(() => {
  createWindow();

  // No macOS, recriar a janela quando o ícone é clicado
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

// Quando todas as janelas são fechadas, sair do aplicativo
app.on('window-all-closed', () => {
  // No macOS, aplicativos geralmente permanecem ativos até o usuário sair explicitamente
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

**Explicação do Código:**

- `require('electron')` - Importa o módulo Electron
- `BrowserWindow` - A classe que cria janelas
- `app` - O módulo que controla o ciclo de vida do aplicativo
- `new BrowserWindow({...})` - Cria uma nova instância de janela com as configurações especificadas
- `webPreferences` - Configurações de segurança e comportamento
- `mainWindow.loadFile()` - Carrega um arquivo HTML na janela
- `app.whenReady()` - Aguarda o Electron estar pronto antes de criar a janela
- `app.on('activate')` - Evento específico do macOS para recriar a janela quando o ícone é clicado

#### Passo 4: Criar o Preload Script

Crie o arquivo `src/main/preload.js`:

```javascript
// Este arquivo roda antes da página web ser carregada
// Ele tem acesso ao Node.js e pode expor APIs específicas para a página web

const { contextBridge, ipcRenderer } = require('electron');

// Expor uma API controlada para a página web
contextBridge.exposeInMainWorld('api', {
  // Função para enviar mensagens para o Main Process
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  // Função para receber mensagens do Main Process
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});
```

**Explicação:**
- `contextBridge.exposeInMainWorld()` - Expõe um objeto no `window` da página web
- `ipcRenderer.send()` - Envia uma mensagem para o Main Process
- `ipcRenderer.on()` - Recebe mensagens do Main Process

#### Passo 5: Criar o Arquivo HTML

Crie o arquivo `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu App Electron</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Bem-vindo ao Electron!</h1>
    <p>Este é seu primeiro aplicativo Electron.</p>
    <p>Versão do Node: <span id="node-version"></span></p>
    <p>Versão do Chrome: <span id="chrome-version"></span></p>
    <p>Versão do Electron: <span id="electron-version"></span></p>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 6: Criar o Arquivo CSS

Crie o arquivo `src/renderer/styles.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 500px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
}

p {
  color: #666;
  margin: 10px 0;
  line-height: 1.6;
}

span {
  font-weight: bold;
  color: #667eea;
}
```

#### Passo 7: Criar o Arquivo JavaScript da Interface

Crie o arquivo `src/renderer/app.js`:

```javascript
// Este arquivo roda no Renderer Process (dentro da janela)

// Aguardar o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', () => {
  // Exibir as versões dos componentes
  document.getElementById('node-version').textContent = process.versions.node;
  document.getElementById('chrome-version').textContent = process.versions.chrome;
  document.getElementById('electron-version').textContent = process.versions.electron;
});
```

### Testando o Aplicativo

1. Abra o terminal na pasta `meu-app-electron`
2. Execute:
   ```bash
   npm start
   ```
3. Uma janela deve abrir mostrando "Bem-vindo ao Electron!"

### Resultado Esperado

Um aplicativo Electron funcional com:
- Estrutura de pastas organizada
- Main Process gerenciando a janela
- Renderer Process exibindo a interface
- Comunicação segura entre processos

---

## Aula 04: Criando a Primeira Janela

### Objetivo da Aula

Colocar a mão na massa e fazer o aplicativo "ganhar um rosto", renderizando o primeiro HTML com controle total sobre a janela.

### Conceitos Fundamentais

**BrowserWindow:** A classe do Electron que cria e gerencia janelas. Cada janela é uma instância dessa classe. Pense nela como um "molde" que você usa para criar janelas com configurações específicas.

**Configurações de Janela (webPreferences):**

```javascript
webPreferences: {
  nodeIntegration: false,      // SEGURANÇA: Não permitir require() na interface
  contextIsolation: true,      // SEGURANÇA: Isolar contextos
  preload: path.join(__dirname, 'preload.js'),  // Caminho do preload script
  sandbox: true                // SEGURANÇA: Executar em sandbox
}
```

**loadFile vs loadURL:**
- `win.loadFile('index.html')` - Carrega um arquivo HTML local (recomendado para produção)
- `win.loadURL('http://localhost:3000')` - Carrega uma URL (útil para desenvolvimento com servidores)

### Instruções Passo a Passo

#### Passo 1: Expandir o main.js com Mais Controles

Modifique `src/main/main.js` para incluir mais funcionalidades:

```javascript
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,                    // Largura mínima
    minHeight: 600,                   // Altura mínima
    show: false,                      // Não mostrar até estar pronto
    icon: path.join(__dirname, '../assets/icon.png'),  // Ícone da janela
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Carregar o arquivo HTML
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Mostrar a janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Abrir DevTools em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

**Explicação das Novas Propriedades:**

- `minWidth` e `minHeight` - Define o tamanho mínimo da janela
- `show: false` - Não mostrar a janela imediatamente
- `icon` - Define o ícone da janela
- `ready-to-show` - Evento disparado quando a janela está pronta para ser exibida
- `process.env.NODE_ENV` - Variável de ambiente que indica se estamos em desenvolvimento ou produção

#### Passo 2: Criar um Menu Básico

Adicione um menu ao seu aplicativo. Modifique `src/main/main.js`:

```javascript
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

// Template do menu
const menuTemplate = [
  {
    label: 'Arquivo',
    submenu: [
      {
        label: 'Sair',
        accelerator: 'CmdOrCtrl+Q',  // Atalho: Ctrl+Q (Windows/Linux) ou Cmd+Q (Mac)
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Editar',
    submenu: [
      { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: 'Refazer', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
      { type: 'separator' },
      { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
      { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: 'Colar', accelerator: 'CmdOrCtrl+V', role: 'paste' }
    ]
  },
  {
    label: 'Visualizar',
    submenu: [
      { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
      { label: 'DevTools', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' }
    ]
  }
];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Criar o menu
const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

**Explicação:**

- `Menu.buildFromTemplate()` - Cria um menu a partir de um template (array de objetos)
- `accelerator` - Define o atalho de teclado
- `role` - Um papel pré-definido do Electron (como 'undo', 'redo', etc.)
- `type: 'separator'` - Uma linha divisória no menu

#### Passo 3: Melhorar a Interface HTML

Modifique `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu App Electron</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>🚀 Bem-vindo ao Electron!</h1>
    
    <div class="info-box">
      <h2>Informações do Sistema</h2>
      <p><strong>Node.js:</strong> <span id="node-version"></span></p>
      <p><strong>Chrome:</strong> <span id="chrome-version"></span></p>
      <p><strong>Electron:</strong> <span id="electron-version"></span></p>
    </div>

    <div class="controls">
      <button id="maximize-btn">Maximizar</button>
      <button id="minimize-btn">Minimizar</button>
      <button id="fullscreen-btn">Tela Cheia</button>
    </div>

    <div class="message" id="message"></div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 4: Melhorar o CSS

Modifique `src/renderer/styles.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.container {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 32px;
  text-align: center;
}

h2 {
  color: #667eea;
  font-size: 18px;
  margin-bottom: 15px;
}

.info-box {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  border-left: 4px solid #667eea;
}

.info-box p {
  color: #666;
  margin: 10px 0;
  line-height: 1.6;
}

.info-box strong {
  color: #333;
}

.info-box span {
  color: #667eea;
  font-weight: bold;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

button {
  flex: 1;
  min-width: 120px;
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}

.message {
  padding: 15px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 8px;
  text-align: center;
  display: none;
}

.message.show {
  display: block;
}
```

#### Passo 5: Melhorar o JavaScript da Interface

Modifique `src/renderer/app.js`:

```javascript
// Este arquivo roda no Renderer Process

document.addEventListener('DOMContentLoaded', () => {
  // Exibir as versões
  document.getElementById('node-version').textContent = process.versions.node;
  document.getElementById('chrome-version').textContent = process.versions.chrome;
  document.getElementById('electron-version').textContent = process.versions.electron;

  // Configurar os botões
  setupButtons();
});

function setupButtons() {
  const maximizeBtn = document.getElementById('maximize-btn');
  const minimizeBtn = document.getElementById('minimize-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const messageDiv = document.getElementById('message');

  maximizeBtn.addEventListener('click', () => {
    // Enviar mensagem para o Main Process
    window.api.send('window-action', { action: 'maximize' });
    showMessage('Janela maximizada!');
  });

  minimizeBtn.addEventListener('click', () => {
    window.api.send('window-action', { action: 'minimize' });
    showMessage('Janela minimizada!');
  });

  fullscreenBtn.addEventListener('click', () => {
    window.api.send('window-action', { action: 'fullscreen' });
    showMessage('Modo tela cheia ativado!');
  });

  function showMessage(text) {
    messageDiv.textContent = text;
    messageDiv.classList.add('show');
    
    setTimeout(() => {
      messageDiv.classList.remove('show');
    }, 3000);
  }
}
```

#### Passo 6: Atualizar o Preload Script

Modifique `src/main/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    // Apenas permitir canais específicos
    const validChannels = ['window-action'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['window-response'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
```

#### Passo 7: Atualizar o Main Process para Ouvir Mensagens

Modifique `src/main/main.js` para adicionar listeners IPC:

```javascript
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// ... (código anterior do menu e createWindow)

// Ouvir mensagens do Renderer Process
ipcMain.on('window-action', (event, args) => {
  if (!mainWindow) return;

  switch (args.action) {
    case 'maximize':
      mainWindow.maximize();
      break;
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'fullscreen':
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      break;
  }
});

// ... (resto do código)
```

### Testando

1. Execute `npm start`
2. Clique nos botões para testar as funcionalidades
3. Use o menu para acessar as opções

### Resultado Esperado

Um aplicativo Electron com:
- Janela configurável
- Menu profissional
- Botões que controlam o estado da janela
- Comunicação IPC funcionando

---

## Aula 05: Funcionamento do Electron

### Objetivo da Aula

Desmistificar a arquitetura do framework e o ciclo de vida do aplicativo.

### Conceitos Fundamentais

**Chromium + Node.js + V8:** O Electron é construído sobre três pilares:

1. **Chromium:** O mecanismo de renderização web (o mesmo usado pelo Google Chrome). Responsável por exibir HTML, CSS e JavaScript.
2. **Node.js:** O ambiente de execução JavaScript no servidor. Fornece acesso ao sistema de arquivos, rede e hardware.
3. **V8:** O motor JavaScript desenvolvido pelo Google. Ambos Chromium e Node.js usam o V8 para executar código JavaScript.

**Arquitetura Multi-Processo:**

```
┌─────────────────────────────────────────────────────┐
│           MAIN PROCESS (Node.js + V8)               │
│  - Roda main.js                                     │
│  - Gerencia ciclo de vida                           │
│  - Acessa SO e sistema de arquivos                  │
│  - Cria BrowserWindows                              │
└─────────────────────────────────────────────────────┘
           ↓              ↓              ↓
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ RENDERER 1  │ │ RENDERER 2  │ │ RENDERER 3  │
    │(Chromium)   │ │(Chromium)   │ │(Chromium)   │
    │HTML/CSS/JS  │ │HTML/CSS/JS  │ │HTML/CSS/JS  │
    └─────────────┘ └─────────────┘ └─────────────┘
```

**Ciclo de Vida do Aplicativo:**

```javascript
// 1. Aplicativo inicia
app.on('ready', () => {
  // 2. Criar primeira janela
  createWindow();
});

// 3. Usuário clica em fechar
mainWindow.on('closed', () => {
  mainWindow = null;
});

// 4. Todas as janelas fechadas
app.on('window-all-closed', () => {
  // 5. Sair do aplicativo
  app.quit();
});

// Ciclo completo
```

### Instruções Passo a Passo

#### Passo 1: Entender o Ciclo de Vida com Logs

Modifique `src/main/main.js` para adicionar logs que mostram o ciclo de vida:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

console.log('📦 Aplicativo iniciando...');

function createWindow() {
  console.log('🪟 Criando janela...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    console.log('✅ Janela pronta para mostrar');
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    console.log('❌ Janela fechada');
    mainWindow = null;
  });
}

// Evento: Electron está pronto
app.on('ready', () => {
  console.log('⚡ Electron pronto');
  createWindow();
});

// Evento: Todas as janelas foram fechadas
app.on('window-all-closed', () => {
  console.log('🛑 Todas as janelas fechadas');
  
  // No macOS, manter o app rodando
  if (process.platform !== 'darwin') {
    console.log('🚪 Saindo do aplicativo');
    app.quit();
  } else {
    console.log('🍎 macOS: Mantendo app rodando');
  }
});

// Evento: Ativar (macOS)
app.on('activate', () => {
  console.log('🔄 Ativando aplicativo');
  
  if (mainWindow === null) {
    createWindow();
  }
});

// Evento: Antes de sair
app.on('before-quit', () => {
  console.log('⏳ Preparando para sair...');
});

// Evento: Saiu
app.on('quit', () => {
  console.log('👋 Aplicativo encerrado');
});
```

**Explicação dos Eventos:**

- `app.on('ready')` - Disparado quando o Electron está pronto para criar janelas
- `app.on('window-all-closed')` - Disparado quando todas as janelas foram fechadas
- `app.on('activate')` - Disparado no macOS quando o usuário clica no ícone do dock
- `app.on('before-quit')` - Disparado antes do aplicativo sair
- `app.on('quit')` - Disparado quando o aplicativo sai

#### Passo 2: Criar um Diagrama Visual

Modifique `src/renderer/index.html` para mostrar o ciclo de vida:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ciclo de Vida do Electron</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>🔄 Ciclo de Vida do Electron</h1>
    
    <div class="lifecycle">
      <div class="step">
        <div class="number">1</div>
        <p>Aplicativo Inicia</p>
      </div>
      <div class="arrow">→</div>
      
      <div class="step">
        <div class="number">2</div>
        <p>app.on('ready')</p>
      </div>
      <div class="arrow">→</div>
      
      <div class="step">
        <div class="number">3</div>
        <p>Criar Janela</p>
      </div>
      <div class="arrow">→</div>
      
      <div class="step">
        <div class="number">4</div>
        <p>Aplicativo Rodando</p>
      </div>
    </div>

    <div class="info-section">
      <h2>Arquitetura Multi-Processo</h2>
      <div class="architecture">
        <div class="process main-process">
          <h3>Main Process</h3>
          <p>Node.js</p>
          <ul>
            <li>Gerencia ciclo de vida</li>
            <li>Cria janelas</li>
            <li>Acessa SO</li>
          </ul>
        </div>
        
        <div class="arrow-down">↓</div>
        
        <div class="renderers">
          <div class="process renderer-process">
            <h3>Renderer 1</h3>
            <p>Chromium</p>
            <ul>
              <li>HTML/CSS/JS</li>
              <li>Interface</li>
            </ul>
          </div>
          <div class="process renderer-process">
            <h3>Renderer 2</h3>
            <p>Chromium</p>
            <ul>
              <li>HTML/CSS/JS</li>
              <li>Interface</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 3: Atualizar o CSS

Modifique `src/renderer/styles.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  color: #333;
  margin-bottom: 40px;
  text-align: center;
  font-size: 32px;
}

h2 {
  color: #667eea;
  margin: 30px 0 20px;
  font-size: 20px;
}

h3 {
  color: #333;
  margin-bottom: 10px;
}

.lifecycle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.step {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  min-width: 120px;
}

.number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.arrow {
  font-size: 24px;
  color: #667eea;
  font-weight: bold;
}

.architecture {
  background: #f5f5f5;
  padding: 30px;
  border-radius: 10px;
}

.process {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  margin-bottom: 20px;
}

.main-process {
  border-left-color: #667eea;
  background: linear-gradient(to right, rgba(102, 126, 234, 0.1), white);
}

.renderer-process {
  border-left-color: #764ba2;
  background: linear-gradient(to right, rgba(118, 75, 162, 0.1), white);
}

.process p {
  color: #666;
  margin-bottom: 10px;
  font-size: 14px;
}

.process ul {
  list-style: none;
  margin-left: 0;
}

.process li {
  color: #666;
  margin: 5px 0;
  padding-left: 20px;
  position: relative;
}

.process li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.renderers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.arrow-down {
  text-align: center;
  font-size: 24px;
  color: #667eea;
  margin: 20px 0;
}

@media (max-width: 600px) {
  .renderers {
    grid-template-columns: 1fr;
  }

  .lifecycle {
    flex-direction: column;
  }

  .arrow {
    transform: rotate(90deg);
  }
}
```

### Testando

1. Execute `npm start`
2. Abra o DevTools (Ctrl+Shift+I) e veja o console
3. Observe os logs que mostram o ciclo de vida
4. Feche a janela e observe mais logs

### Resultado Esperado

Compreensão clara de:
- Como Main Process e Renderer Process funcionam
- O ciclo de vida do aplicativo
- Os eventos principais do Electron

---

## Aula 06: Trabalhando com Janelas

### Objetivo da Aula

Explorar o controle visual e comportamental das `BrowserWindows`.

### Conceitos Fundamentais

**Estado da Janela:** Uma janela pode estar em diferentes estados:
- **Normal:** Tamanho padrão
- **Maximizada:** Ocupando toda a tela
- **Minimizada:** Escondida na barra de tarefas
- **Tela Cheia:** Sem barras do SO

**Frameless Window:** Uma janela sem a barra de título padrão. Útil para criar interfaces personalizadas, mas requer que você implemente seus próprios botões de controle.

**Child Windows (Janelas Filhas):** Janelas que dependem de uma janela "pai". Quando a janela pai fecha, as filhas também fecham.

### Instruções Passo a Passo

#### Passo 1: Criar Funções para Controlar Janelas

Modifique `src/main/main.js`:

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let childWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    center: true,                    // Centralizar na tela
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ouvir comandos de controle de janela
ipcMain.on('window-control', (event, command) => {
  if (!mainWindow) return;

  switch (command) {
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;

    case 'minimize':
      mainWindow.minimize();
      break;

    case 'close':
      mainWindow.close();
      break;

    case 'fullscreen':
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      break;

    case 'always-on-top':
      mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
      break;

    case 'open-child':
      createChildWindow();
      break;
  }
});

// Criar uma janela filha (modal)
function createChildWindow() {
  childWindow = new BrowserWindow({
    parent: mainWindow,              // Janela pai
    modal: true,                     // Modal (bloqueia interação com pai)
    width: 500,
    height: 300,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Criar um HTML simples para a janela filha
  const childHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Janela Filha</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        h1 {
          color: #333;
          margin-top: 0;
        }
        button {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        button:hover {
          background: #764ba2;
        }
      </style>
    </head>
    <body>
      <div class="content">
        <h1>Janela Filha (Modal)</h1>
        <p>Esta é uma janela filha modal. Você não pode interagir com a janela pai até fechar esta.</p>
        <button onclick="window.close()">Fechar</button>
      </div>
    </body>
    </html>
  `;

  childWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(childHTML)}`);

  childWindow.on('closed', () => {
    childWindow = null;
  });
}

// Criar uma janela frameless (sem barra de título)
function createFramelessWindow() {
  const framelessWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,                    // Sem barra de título
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const framelessHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Janela Sem Barra</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: white;
        }
        .title-bar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          -webkit-app-region: drag;  /* Permitir arrastar a janela */
          user-select: none;
        }
        .title-bar-controls {
          -webkit-app-region: no-drag;  /* Não arrastar os botões */
          display: flex;
          gap: 5px;
        }
        .title-bar-btn {
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          cursor: pointer;
          border-radius: 3px;
          font-size: 16px;
        }
        .title-bar-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .content {
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <div class="title-bar">
        <span>Janela Personalizada</span>
        <div class="title-bar-controls">
          <button class="title-bar-btn" onclick="window.close()">✕</button>
        </div>
      </div>
      <div class="content">
        <h2>Janela Frameless</h2>
        <p>Esta janela não tem a barra de título padrão do sistema operacional.</p>
        <p>A barra azul no topo é customizada com HTML e CSS.</p>
      </div>
    </body>
    </html>
  `;

  framelessWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(framelessHTML)}`);
}

ipcMain.on('open-frameless', () => {
  createFramelessWindow();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### Passo 2: Criar Interface para Testar

Modifique `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Controle de Janelas</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>🪟 Controle de Janelas</h1>

    <div class="section">
      <h2>Controles da Janela Principal</h2>
      <div class="button-grid">
        <button onclick="sendCommand('maximize')">Maximizar</button>
        <button onclick="sendCommand('minimize')">Minimizar</button>
        <button onclick="sendCommand('fullscreen')">Tela Cheia</button>
        <button onclick="sendCommand('always-on-top')">Sempre no Topo</button>
        <button onclick="sendCommand('close')">Fechar</button>
      </div>
    </div>

    <div class="section">
      <h2>Janelas Filhas</h2>
      <div class="button-grid">
        <button onclick="sendCommand('open-child')">Abrir Janela Modal</button>
        <button onclick="sendCommand('open-frameless')">Abrir Janela Frameless</button>
      </div>
    </div>

    <div class="section">
      <h2>Informações da Janela</h2>
      <div class="info-box">
        <p><strong>Posição:</strong> <span id="position">-</span></p>
        <p><strong>Tamanho:</strong> <span id="size">-</span></p>
        <p><strong>Maximizada:</strong> <span id="maximized">-</span></p>
        <p><strong>Tela Cheia:</strong> <span id="fullscreen">-</span></p>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 3: Atualizar o JavaScript

Modifique `src/renderer/app.js`:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  updateWindowInfo();
  
  // Atualizar informações a cada 500ms
  setInterval(updateWindowInfo, 500);
});

function sendCommand(command) {
  window.api.send('window-control', command);
}

function updateWindowInfo() {
  // Obter informações da janela (essas informações vêm do processo principal)
  // Para este exemplo, vamos simular
  const position = window.screenX + ', ' + window.screenY;
  const size = window.innerWidth + ' x ' + window.innerHeight;
  
  document.getElementById('position').textContent = position;
  document.getElementById('size').textContent = size;
}
```

#### Passo 4: Atualizar o Preload Script

Modifique `src/main/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    const validChannels = ['window-control', 'open-frameless'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});
```

### Testando

1. Execute `npm start`
2. Clique nos botões para testar diferentes estados de janela
3. Abra janelas filhas e frameless

### Resultado Esperado

Compreensão de:
- Como controlar o estado de janelas
- Como criar janelas filhas (modais)
- Como criar janelas frameless personalizadas

---

## Aula 07: Gerenciando Energia

### Objetivo da Aula

Aprender a interagir com o hardware e a bateria do usuário, detectando eventos de energia.

### Conceitos Fundamentais

**powerMonitor:** Um módulo do Electron que monitora o estado de energia do sistema. Pode detectar:
- Quando o computador entra em repouso (suspend)
- Quando o computador volta do repouso (resume)
- Mudanças na fonte de energia (AC vs bateria)

**Power Save Blocker:** Um recurso que impede temporariamente que o sistema operacional desligue a tela ou entre em repouso. Útil para:
- Players de vídeo
- Apresentações
- Aplicativos que precisam estar sempre ativos

### Instruções Passo a Passo

#### Passo 1: Implementar Monitoramento de Energia

Modifique `src/main/main.js`:

```javascript
const { app, BrowserWindow, powerMonitor, powerSaveBlocker } = require('electron');
const path = require('path');

let mainWindow;
let powerSaveBlockerId = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Monitorar eventos de energia
powerMonitor.on('suspend', () => {
  console.log('💤 Computador entrando em repouso');
  
  // Enviar notificação para o Renderer Process
  if (mainWindow) {
    mainWindow.webContents.send('power-event', {
      type: 'suspend',
      message: 'Computador entrando em repouso'
    });
  }
});

powerMonitor.on('resume', () => {
  console.log('⚡ Computador acordou');
  
  if (mainWindow) {
    mainWindow.webContents.send('power-event', {
      type: 'resume',
      message: 'Computador acordou'
    });
  }
});

// Monitorar mudanças de fonte de energia
powerMonitor.on('on-ac', () => {
  console.log('🔌 Conectado à fonte AC');
  
  if (mainWindow) {
    mainWindow.webContents.send('power-event', {
      type: 'ac',
      message: 'Conectado à fonte AC'
    });
  }
});

powerMonitor.on('on-battery', () => {
  console.log('🔋 Usando bateria');
  
  if (mainWindow) {
    mainWindow.webContents.send('power-event', {
      type: 'battery',
      message: 'Usando bateria'
    });
  }
});

// Monitorar nível de bateria
powerMonitor.on('battery-status-changed', () => {
  const state = powerMonitor.getSystemIdleState(10);
  const idleTime = powerMonitor.getSystemIdleTime();
  
  console.log(`Estado inativo: ${state}, Tempo inativo: ${idleTime}s`);
});

// Ouvir comandos para controlar Power Save Blocker
const { ipcMain } = require('electron');

ipcMain.on('power-control', (event, command) => {
  switch (command) {
    case 'prevent-sleep':
      if (!powerSaveBlockerId) {
        powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
        console.log('🚫 Impedindo que a tela desligue');
        event.reply('power-status', { status: 'sleep-prevented' });
      }
      break;

    case 'allow-sleep':
      if (powerSaveBlockerId) {
        powerSaveBlocker.stop(powerSaveBlockerId);
        powerSaveBlockerId = null;
        console.log('✅ Permitindo que a tela desligue');
        event.reply('power-status', { status: 'sleep-allowed' });
      }
      break;

    case 'get-status':
      const status = {
        onBattery: powerMonitor.isOnBatteryPower(),
        sleepPrevented: powerSaveBlockerId !== null
      };
      event.reply('power-status', status);
      break;
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Limpar Power Save Blocker ao sair
  if (powerSaveBlockerId) {
    powerSaveBlocker.stop(powerSaveBlockerId);
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### Passo 2: Criar Interface para Monitorar Energia

Modifique `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerenciamento de Energia</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>⚡ Gerenciamento de Energia</h1>

    <div class="section">
      <h2>Status da Energia</h2>
      <div class="status-box">
        <p><strong>Fonte de Energia:</strong> <span id="power-source">-</span></p>
        <p><strong>Tela Desbloqueada:</strong> <span id="screen-status">-</span></p>
      </div>
    </div>

    <div class="section">
      <h2>Controles</h2>
      <div class="button-grid">
        <button onclick="preventSleep()">Impedir Repouso</button>
        <button onclick="allowSleep()">Permitir Repouso</button>
        <button onclick="checkStatus()">Verificar Status</button>
      </div>
    </div>

    <div class="section">
      <h2>Log de Eventos</h2>
      <div class="log-box" id="log">
        <p class="log-entry">Aguardando eventos...</p>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 3: Atualizar o JavaScript

Modifique `src/renderer/app.js`:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  checkStatus();

  // Ouvir eventos de energia do Main Process
  window.api.receive('power-event', (data) => {
    logEvent(`${data.type.toUpperCase()}: ${data.message}`);
    checkStatus();
  });

  // Ouvir respostas de status
  window.api.receive('power-status', (data) => {
    if (data.onBattery !== undefined) {
      document.getElementById('power-source').textContent = 
        data.onBattery ? '🔋 Bateria' : '🔌 AC';
    }
    if (data.sleepPrevented !== undefined) {
      document.getElementById('screen-status').textContent = 
        data.sleepPrevented ? '🚫 Impedido' : '✅ Normal';
    }
  });
});

function preventSleep() {
  window.api.send('power-control', 'prevent-sleep');
  logEvent('Impedindo repouso...');
}

function allowSleep() {
  window.api.send('power-control', 'allow-sleep');
  logEvent('Permitindo repouso...');
}

function checkStatus() {
  window.api.send('power-control', 'get-status');
}

function logEvent(message) {
  const logBox = document.getElementById('log');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.className = 'log-entry';
  entry.textContent = `[${timestamp}] ${message}`;
  
  logBox.insertBefore(entry, logBox.firstChild);
  
  // Manter apenas os últimos 10 eventos
  while (logBox.children.length > 10) {
    logBox.removeChild(logBox.lastChild);
  }
}
```

#### Passo 4: Atualizar o Preload Script

Modifique `src/main/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    const validChannels = ['power-control'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['power-event', 'power-status'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
```

### Testando

1. Execute `npm start`
2. Clique em "Impedir Repouso"
3. Aguarde 10 minutos - a tela não deve desligar
4. Clique em "Permitir Repouso"
5. Observe os logs de eventos

### Resultado Esperado

Um aplicativo que:
- Monitora eventos de energia
- Pode impedir que a tela desligue
- Exibe o status da bateria

---

## Aula 08: Main e Renderer (Comunicação)

### Objetivo da Aula

Dominar a comunicação segura entre processos (IPC - Inter-Process Communication).

### Conceitos Fundamentais

**IPC (Inter-Process Communication):** Como os processos isolados se comunicam. Existem dois padrões principais:

1. **One-Way (Unidirecional):** Um processo envia uma mensagem, o outro recebe
2. **Two-Way (Bidirecional):** Um processo envia uma mensagem e espera uma resposta

**ipcMain:** O módulo que roda no Main Process para:
- `ipcMain.on()` - Ouvir mensagens do Renderer
- `ipcMain.handle()` - Responder a requisições do Renderer
- `mainWindow.webContents.send()` - Enviar mensagens para o Renderer

**ipcRenderer:** O módulo que roda no Renderer Process para:
- `ipcRenderer.send()` - Enviar mensagens para o Main Process
- `ipcRenderer.invoke()` - Enviar requisição e esperar resposta
- `ipcRenderer.on()` - Ouvir mensagens do Main Process

### Instruções Passo a Passo

#### Passo 1: Implementar Comunicação Bidirecional

Modifique `src/main/main.js`:

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// PADRÃO 1: One-Way Communication (Renderer → Main)
ipcMain.on('async-message', (event, arg) => {
  console.log('Mensagem recebida do Renderer:', arg);
  
  // Enviar resposta de volta
  event.reply('async-reply', `Main recebeu: ${arg}`);
});

// PADRÃO 2: Two-Way Communication (Renderer → Main → Renderer)
ipcMain.handle('sync-message', async (event, arg) => {
  console.log('Requisição recebida do Renderer:', arg);
  
  // Fazer algo assíncrono
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Retornar resposta
  return `Main respondeu após 1 segundo: ${arg}`;
});

// Exemplo: Ler arquivo
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Exemplo: Escrever arquivo
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Exemplo: Operação longa
ipcMain.handle('long-operation', async (event, duration) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Operação completada após ${duration}ms`);
    }, duration);
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### Passo 2: Criar Interface para Testar IPC

Modifique `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comunicação IPC</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>🔄 Comunicação IPC</h1>

    <div class="section">
      <h2>One-Way Communication</h2>
      <div class="input-group">
        <input type="text" id="async-input" placeholder="Digite uma mensagem">
        <button onclick="sendAsyncMessage()">Enviar</button>
      </div>
      <div class="response-box" id="async-response"></div>
    </div>

    <div class="section">
      <h2>Two-Way Communication</h2>
      <div class="input-group">
        <input type="text" id="sync-input" placeholder="Digite uma mensagem">
        <button onclick="sendSyncMessage()">Enviar e Esperar Resposta</button>
      </div>
      <div class="response-box" id="sync-response"></div>
    </div>

    <div class="section">
      <h2>Operação Longa</h2>
      <div class="input-group">
        <input type="number" id="duration-input" placeholder="Duração em ms" value="3000">
        <button onclick="longOperation()">Executar</button>
      </div>
      <div class="response-box" id="long-response"></div>
    </div>

    <div class="section">
      <h2>Log de Comunicação</h2>
      <div class="log-box" id="log">
        <p class="log-entry">Aguardando comunicação...</p>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 3: Atualizar o JavaScript

Modifique `src/renderer/app.js`:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Ouvir respostas do Main Process
  window.api.receive('async-reply', (data) => {
    document.getElementById('async-response').textContent = data;
    logMessage('Resposta recebida (One-Way): ' + data);
  });
});

async function sendAsyncMessage() {
  const input = document.getElementById('async-input');
  const message = input.value;
  
  if (!message) return;
  
  logMessage('Enviando (One-Way): ' + message);
  window.api.send('async-message', message);
  input.value = '';
}

async function sendSyncMessage() {
  const input = document.getElementById('sync-input');
  const message = input.value;
  
  if (!message) return;
  
  logMessage('Enviando (Two-Way): ' + message);
  
  try {
    const response = await window.api.invoke('sync-message', message);
    document.getElementById('sync-response').textContent = response;
    logMessage('Resposta recebida (Two-Way): ' + response);
  } catch (error) {
    logMessage('Erro: ' + error.message);
  }
  
  input.value = '';
}

async function longOperation() {
  const input = document.getElementById('duration-input');
  const duration = parseInt(input.value) || 3000;
  
  logMessage('Iniciando operação longa (' + duration + 'ms)...');
  
  try {
    const response = await window.api.invoke('long-operation', duration);
    document.getElementById('long-response').textContent = response;
    logMessage('Operação concluída: ' + response);
  } catch (error) {
    logMessage('Erro: ' + error.message);
  }
}

function logMessage(message) {
  const logBox = document.getElementById('log');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.className = 'log-entry';
  entry.textContent = `[${timestamp}] ${message}`;
  
  logBox.insertBefore(entry, logBox.firstChild);
  
  while (logBox.children.length > 15) {
    logBox.removeChild(logBox.lastChild);
  }
}
```

#### Passo 4: Atualizar o Preload Script

Modifique `src/main/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // One-Way: Enviar mensagem
  send: (channel, data) => {
    const validChannels = ['async-message'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Two-Way: Enviar e esperar resposta
  invoke: (channel, data) => {
    const validChannels = ['sync-message', 'long-operation', 'read-file', 'write-file'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  
  // Receber mensagens
  receive: (channel, func) => {
    const validChannels = ['async-reply'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
```

### Testando

1. Execute `npm start`
2. Teste One-Way Communication
3. Teste Two-Way Communication
4. Teste Operação Longa

### Resultado Esperado

Compreensão completa de:
- Comunicação One-Way
- Comunicação Two-Way
- Como usar async/await
- Como passar dados entre processos

---

## Aula 09: API do Electron (Nativas)

### Objetivo da Aula

Integrar o app com as ferramentas e diálogos nativos do sistema operacional.

### Conceitos Fundamentais

**Dialog:** Caixas de diálogo nativas do sistema para:
- Abrir arquivos (`showOpenDialog`)
- Salvar arquivos (`showSaveDialog`)
- Exibir mensagens (`showMessageBox`)

**Shell:** Interagir com o shell do SO:
- Abrir URLs no navegador padrão (`openExternal`)
- Abrir pastas no gerenciador de arquivos (`openPath`)

**Clipboard:** Manipular a área de transferência:
- Copiar texto (`writeText`)
- Ler texto (`readText`)

**Screen:** Informações sobre monitores:
- Dimensões da tela
- Múltiplos monitores

### Instruções Passo a Passo

#### Passo 1: Implementar APIs Nativas

Modifique `src/main/main.js`:

```javascript
const { app, BrowserWindow, ipcMain, dialog, shell, clipboard, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Dialog: Abrir arquivo
ipcMain.handle('open-file', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Todos os Arquivos', extensions: ['*'] },
      { name: 'Texto', extensions: ['txt', 'md'] },
      { name: 'Imagens', extensions: ['png', 'jpg', 'gif'] }
    ]
  });

  return result.filePaths[0] || null;
});

// Dialog: Abrir múltiplos arquivos
ipcMain.handle('open-files', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections']
  });

  return result.filePaths;
});

// Dialog: Abrir pasta
ipcMain.handle('open-folder', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  return result.filePaths[0] || null;
});

// Dialog: Salvar arquivo
ipcMain.handle('save-file', async (event, defaultName = 'arquivo.txt') => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: 'Texto', extensions: ['txt'] },
      { name: 'Markdown', extensions: ['md'] },
      { name: 'Todos', extensions: ['*'] }
    ]
  });

  return result.filePath || null;
});

// Dialog: Caixa de mensagem
ipcMain.handle('show-message', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: options.type || 'info',
    title: options.title || 'Mensagem',
    message: options.message || '',
    buttons: options.buttons || ['OK']
  });

  return result.response;
});

// Shell: Abrir URL no navegador
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Shell: Abrir pasta no gerenciador de arquivos
ipcMain.handle('open-path', async (event, filePath) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Clipboard: Escrever texto
ipcMain.handle('clipboard-write', async (event, text) => {
  try {
    clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Clipboard: Ler texto
ipcMain.handle('clipboard-read', async (event) => {
  try {
    const text = clipboard.readText();
    return { success: true, text };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Screen: Obter informações da tela
ipcMain.handle('get-screen-info', async (event) => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const allDisplays = screen.getAllDisplays();

  return {
    primary: {
      width: primaryDisplay.bounds.width,
      height: primaryDisplay.bounds.height,
      scaleFactor: primaryDisplay.scaleFactor
    },
    displays: allDisplays.map(display => ({
      width: display.bounds.width,
      height: display.bounds.height,
      scaleFactor: display.scaleFactor
    }))
  };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### Passo 2: Criar Interface

Modifique `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APIs Nativas do Electron</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>🔧 APIs Nativas do Electron</h1>

    <div class="section">
      <h2>Dialog - Seleção de Arquivos</h2>
      <div class="button-grid">
        <button onclick="openFile()">Abrir Arquivo</button>
        <button onclick="openFiles()">Abrir Múltiplos</button>
        <button onclick="openFolder()">Abrir Pasta</button>
        <button onclick="saveFile()">Salvar Arquivo</button>
      </div>
      <div class="response-box" id="dialog-response"></div>
    </div>

    <div class="section">
      <h2>Dialog - Caixas de Mensagem</h2>
      <div class="button-grid">
        <button onclick="showInfo()">Info</button>
        <button onclick="showWarning()">Aviso</button>
        <button onclick="showError()">Erro</button>
        <button onclick="showQuestion()">Pergunta</button>
      </div>
      <div class="response-box" id="message-response"></div>
    </div>

    <div class="section">
      <h2>Shell - Abrir URLs e Pastas</h2>
      <div class="input-group">
        <input type="text" id="url-input" placeholder="https://example.com">
        <button onclick="openExternal()">Abrir URL</button>
      </div>
      <div class="response-box" id="shell-response"></div>
    </div>

    <div class="section">
      <h2>Clipboard - Área de Transferência</h2>
      <div class="input-group">
        <input type="text" id="clipboard-input" placeholder="Texto para copiar">
        <button onclick="copyToClipboard()">Copiar</button>
        <button onclick="readFromClipboard()">Ler</button>
      </div>
      <div class="response-box" id="clipboard-response"></div>
    </div>

    <div class="section">
      <h2>Screen - Informações da Tela</h2>
      <button onclick="getScreenInfo()">Obter Informações</button>
      <div class="response-box" id="screen-response"></div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 3: Atualizar o JavaScript

Modifique `src/renderer/app.js`:

```javascript
async function openFile() {
  const filePath = await window.api.invoke('open-file');
  if (filePath) {
    document.getElementById('dialog-response').textContent = `Arquivo: ${filePath}`;
  }
}

async function openFiles() {
  const filePaths = await window.api.invoke('open-files');
  if (filePaths.length > 0) {
    document.getElementById('dialog-response').textContent = 
      `${filePaths.length} arquivo(s) selecionado(s)`;
  }
}

async function openFolder() {
  const folderPath = await window.api.invoke('open-folder');
  if (folderPath) {
    document.getElementById('dialog-response').textContent = `Pasta: ${folderPath}`;
  }
}

async function saveFile() {
  const filePath = await window.api.invoke('save-file', 'documento.txt');
  if (filePath) {
    document.getElementById('dialog-response').textContent = `Salvar em: ${filePath}`;
  }
}

async function showInfo() {
  const response = await window.api.invoke('show-message', {
    type: 'info',
    title: 'Informação',
    message: 'Esta é uma mensagem de informação',
    buttons: ['OK']
  });
  document.getElementById('message-response').textContent = `Resposta: ${response}`;
}

async function showWarning() {
  const response = await window.api.invoke('show-message', {
    type: 'warning',
    title: 'Aviso',
    message: 'Esta é uma mensagem de aviso',
    buttons: ['OK']
  });
  document.getElementById('message-response').textContent = `Resposta: ${response}`;
}

async function showError() {
  const response = await window.api.invoke('show-message', {
    type: 'error',
    title: 'Erro',
    message: 'Esta é uma mensagem de erro',
    buttons: ['OK']
  });
  document.getElementById('message-response').textContent = `Resposta: ${response}`;
}

async function showQuestion() {
  const response = await window.api.invoke('show-message', {
    type: 'question',
    title: 'Pergunta',
    message: 'Deseja continuar?',
    buttons: ['Sim', 'Não']
  });
  document.getElementById('message-response').textContent = 
    `Resposta: ${response === 0 ? 'Sim' : 'Não'}`;
}

async function openExternal() {
  const url = document.getElementById('url-input').value;
  if (url) {
    const result = await window.api.invoke('open-external', url);
    document.getElementById('shell-response').textContent = 
      result.success ? 'URL aberta no navegador' : `Erro: ${result.error}`;
  }
}

async function copyToClipboard() {
  const text = document.getElementById('clipboard-input').value;
  if (text) {
    const result = await window.api.invoke('clipboard-write', text);
    document.getElementById('clipboard-response').textContent = 
      result.success ? 'Copiado para a área de transferência' : `Erro: ${result.error}`;
  }
}

async function readFromClipboard() {
  const result = await window.api.invoke('clipboard-read');
  if (result.success) {
    document.getElementById('clipboard-response').textContent = `Conteúdo: ${result.text}`;
  } else {
    document.getElementById('clipboard-response').textContent = `Erro: ${result.error}`;
  }
}

async function getScreenInfo() {
  const info = await window.api.invoke('get-screen-info');
  const text = `
    Tela Principal:
    - Resolução: ${info.primary.width}x${info.primary.height}
    - Escala: ${info.primary.scaleFactor}
    
    Total de Telas: ${info.displays.length}
  `;
  document.getElementById('screen-response').textContent = text;
}
```

#### Passo 4: Atualizar o Preload Script

Modifique `src/main/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, data) => {
    const validChannels = [
      'open-file',
      'open-files',
      'open-folder',
      'save-file',
      'show-message',
      'open-external',
      'open-path',
      'clipboard-write',
      'clipboard-read',
      'get-screen-info'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
});
```

### Testando

1. Execute `npm start`
2. Teste todas as funcionalidades de Dialog
3. Teste Shell e Clipboard
4. Verifique as informações da tela

### Resultado Esperado

Um aplicativo que interage profissionalmente com o sistema operacional.

---

## Aula 10: Projeto Prático

### Objetivo da Aula

Consolidar todos os conhecimentos criando um software completo e funcional.

### Projeto: Gerenciador de Notas em Markdown

Criaremos um aplicativo que:
- Cria, edita e deleta notas em Markdown
- Salva arquivos `.md` no disco
- Exibe preview em tempo real
- Usa IPC para comunicação segura

#### Passo 1: Estrutura do Projeto

```
src/
├── main/
│   ├── main.js
│   ├── preload.js
│   └── file-manager.js
└── renderer/
    ├── index.html
    ├── styles.css
    └── app.js
```

#### Passo 2: Criar o Gerenciador de Arquivos

Crie `src/main/file-manager.js`:

```javascript
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class FileManager {
  constructor() {
    this.notesDir = path.join(os.homedir(), 'ElectronNotes');
  }

  async initialize() {
    try {
      await fs.mkdir(this.notesDir, { recursive: true });
      return true;
    } catch (error) {
      console.error('Erro ao criar diretório:', error);
      return false;
    }
  }

  async listNotes() {
    try {
      const files = await fs.readdir(this.notesDir);
      return files.filter(file => file.endsWith('.md'));
    } catch (error) {
      console.error('Erro ao listar notas:', error);
      return [];
    }
  }

  async readNote(filename) {
    try {
      const filePath = path.join(this.notesDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveNote(filename, content) {
    try {
      const filePath = path.join(this.notesDir, filename);
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteNote(filename) {
    try {
      const filePath = path.join(this.notesDir, filename);
      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createNote(title) {
    const filename = `${title.replace(/\s+/g, '-')}-${Date.now()}.md`;
    const content = `# ${title}\n\n`;
    return this.saveNote(filename, content);
  }
}

module.exports = FileManager;
```

#### Passo 3: Atualizar o Main Process

Modifique `src/main/main.js`:

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const FileManager = require('./file-manager');

let mainWindow;
const fileManager = new FileManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicializar gerenciador de arquivos
ipcMain.handle('init-app', async () => {
  const success = await fileManager.initialize();
  return { success };
});

// Listar notas
ipcMain.handle('list-notes', async () => {
  const notes = await fileManager.listNotes();
  return notes;
});

// Ler nota
ipcMain.handle('read-note', async (event, filename) => {
  return fileManager.readNote(filename);
});

// Salvar nota
ipcMain.handle('save-note', async (event, filename, content) => {
  return fileManager.saveNote(filename, content);
});

// Deletar nota
ipcMain.handle('delete-note', async (event, filename) => {
  return fileManager.deleteNote(filename);
});

// Criar nota
ipcMain.handle('create-note', async (event, title) => {
  return fileManager.createNote(title);
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### Passo 4: Criar a Interface

Crie `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerenciador de Notas</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>📝 Notas</h1>
        <button class="btn-new" onclick="createNewNote()">+ Nova</button>
      </div>
      <div class="notes-list" id="notesList"></div>
    </aside>

    <main class="editor">
      <div class="editor-header">
        <input type="text" id="noteTitle" placeholder="Título da nota" class="note-title">
        <button class="btn-delete" onclick="deleteCurrentNote()">🗑️ Deletar</button>
      </div>
      
      <div class="editor-content">
        <textarea id="noteContent" placeholder="Escreva sua nota aqui..."></textarea>
        <div class="preview" id="preview"></div>
      </div>
    </main>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 5: Criar o CSS

Crie `src/renderer/styles.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  height: 100vh;
  overflow: hidden;
}

.app {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.sidebar-header h1 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.btn-new {
  width: 100%;
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-new:hover {
  background: #764ba2;
}

.notes-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.note-item {
  padding: 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border-left: 3px solid #667eea;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.3s;
}

.note-item:hover {
  background: #f0f0f0;
  transform: translateX(5px);
}

.note-item.active {
  background: #e8eaf6;
  border-left-color: #764ba2;
}

.editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.editor-header {
  padding: 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.note-title {
  flex: 1;
  font-size: 24px;
  font-weight: 600;
  border: none;
  outline: none;
  color: #333;
}

.btn-delete {
  padding: 8px 15px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-delete:hover {
  background: #ff5252;
}

.editor-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  overflow: hidden;
}

textarea {
  padding: 20px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.preview {
  padding: 20px;
  overflow-y: auto;
  border-left: 1px solid #ddd;
  background: #fafafa;
}

.preview h1, .preview h2, .preview h3 {
  margin: 20px 0 10px;
  color: #333;
}

.preview h1 { font-size: 28px; }
.preview h2 { font-size: 24px; }
.preview h3 { font-size: 20px; }

.preview p {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #666;
}

.preview code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
}

@media (max-width: 1024px) {
  .editor-content {
    grid-template-columns: 1fr;
  }

  .preview {
    display: none;
  }
}
```

#### Passo 6: Criar o JavaScript

Crie `src/renderer/app.js`:

```javascript
let currentNote = null;
let notes = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar aplicativo
  await window.api.invoke('init-app');
  
  // Carregar notas
  await loadNotes();
  
  // Listeners para edição
  document.getElementById('noteContent').addEventListener('input', updatePreview);
  document.getElementById('noteTitle').addEventListener('change', saveCurrentNote);
  document.getElementById('noteContent').addEventListener('change', saveCurrentNote);
});

async function loadNotes() {
  notes = await window.api.invoke('list-notes');
  renderNotesList();
  
  if (notes.length > 0) {
    await selectNote(notes[0]);
  }
}

function renderNotesList() {
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = '';
  
  notes.forEach(note => {
    const noteItem = document.createElement('div');
    noteItem.className = `note-item ${note === currentNote ? 'active' : ''}`;
    noteItem.textContent = note.replace('.md', '').replace(/-/g, ' ');
    noteItem.onclick = () => selectNote(note);
    notesList.appendChild(noteItem);
  });
}

async function selectNote(filename) {
  currentNote = filename;
  const result = await window.api.invoke('read-note', filename);
  
  if (result.success) {
    const content = result.content;
    const lines = content.split('\n');
    const title = lines[0].replace('# ', '');
    const noteContent = lines.slice(2).join('\n');
    
    document.getElementById('noteTitle').value = title;
    document.getElementById('noteContent').value = noteContent;
    
    updatePreview();
    renderNotesList();
  }
}

async function createNewNote() {
  const title = prompt('Nome da nota:');
  if (!title) return;
  
  const result = await window.api.invoke('create-note', title);
  if (result.success) {
    await loadNotes();
  }
}

async function deleteCurrentNote() {
  if (!currentNote) return;
  
  const confirm = await window.api.invoke('show-message', {
    type: 'question',
    title: 'Deletar Nota',
    message: 'Tem certeza que deseja deletar esta nota?',
    buttons: ['Sim', 'Não']
  });
  
  if (confirm === 0) {
    await window.api.invoke('delete-note', currentNote);
    currentNote = null;
    await loadNotes();
  }
}

async function saveCurrentNote() {
  if (!currentNote) return;
  
  const title = document.getElementById('noteTitle').value;
  const content = document.getElementById('noteContent').value;
  const fullContent = `# ${title}\n\n${content}`;
  
  await window.api.invoke('save-note', currentNote, fullContent);
}

function updatePreview() {
  const content = document.getElementById('noteContent').value;
  const preview = document.getElementById('preview');
  
  // Simples conversão de Markdown para HTML
  let html = content
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<)(.+)$/gm, '<p>$1</p>');
  
  preview.innerHTML = html;
}
```

#### Passo 7: Atualizar o Preload Script

Modifique `src/main/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, data) => {
    const validChannels = [
      'init-app',
      'list-notes',
      'read-note',
      'save-note',
      'delete-note',
      'create-note',
      'show-message'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
});
```

### Testando

1. Execute `npm start`
2. Crie uma nova nota
3. Edite o conteúdo
4. Veja o preview em tempo real
5. Crie e delete notas

### Resultado Esperado

Um aplicativo funcional de gerenciamento de notas que demonstra todos os conceitos aprendidos.

---

## Aula 11: App e Atalhos

### Objetivo da Aula

Prover atalhos globais e entender os caminhos de dados do sistema.

### Conceitos Fundamentais

**app.getPath():** Retorna caminhos especiais do sistema:
- `userData` - Pasta para dados do usuário
- `documents` - Pasta de documentos
- `downloads` - Pasta de downloads
- `home` - Pasta home do usuário

**globalShortcut:** Registra atalhos de teclado que funcionam mesmo quando o app está em segundo plano.

### Instruções Passo a Passo

#### Passo 1: Implementar Atalhos Globais

Modifique `src/main/main.js`:

```javascript
const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerGlobalShortcuts() {
  // Atalho: Ctrl+Alt+E para abrir o app
  globalShortcut.register('Ctrl+Alt+E', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  // Atalho: Ctrl+Alt+D para abrir DevTools
  globalShortcut.register('Ctrl+Alt+D', () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  console.log('Atalhos globais registrados');
}

function unregisterGlobalShortcuts() {
  globalShortcut.unregisterAll();
  console.log('Atalhos globais desregistrados');
}

// Obter caminhos do sistema
ipcMain.handle('get-paths', async () => {
  return {
    userData: app.getPath('userData'),
    documents: app.getPath('documents'),
    downloads: app.getPath('downloads'),
    home: app.getPath('home'),
    temp: app.getPath('temp'),
    exe: app.getPath('exe'),
    module: app.getPath('module')
  };
});

// Obter informações do app
ipcMain.handle('get-app-info', async () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    path: app.getAppPath()
  };
});

app.whenReady().then(() => {
  createWindow();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  unregisterGlobalShortcuts();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  unregisterGlobalShortcuts();
});
```

#### Passo 2: Criar Interface

Crie `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App e Atalhos</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>⚡ App e Atalhos Globais</h1>

    <div class="section">
      <h2>Atalhos Globais Registrados</h2>
      <div class="shortcuts-list">
        <div class="shortcut">
          <span class="key">Ctrl+Alt+E</span>
          <span class="desc">Mostrar/Esconder App</span>
        </div>
        <div class="shortcut">
          <span class="key">Ctrl+Alt+D</span>
          <span class="desc">Abrir DevTools</span>
        </div>
      </div>
      <p class="info">Estes atalhos funcionam mesmo quando o app está em segundo plano!</p>
    </div>

    <div class="section">
      <h2>Caminhos do Sistema</h2>
      <button onclick="displayPaths()">Mostrar Caminhos</button>
      <div class="paths-box" id="pathsBox"></div>
    </div>

    <div class="section">
      <h2>Informações do App</h2>
      <button onclick="displayAppInfo()">Mostrar Informações</button>
      <div class="info-box" id="infoBox"></div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 3: Criar o JavaScript

Crie `src/renderer/app.js`:

```javascript
async function displayPaths() {
  const paths = await window.api.invoke('get-paths');
  const pathsBox = document.getElementById('pathsBox');
  
  let html = '<table>';
  for (const [key, value] of Object.entries(paths)) {
    html += `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`;
  }
  html += '</table>';
  
  pathsBox.innerHTML = html;
}

async function displayAppInfo() {
  const info = await window.api.invoke('get-app-info');
  const infoBox = document.getElementById('infoBox');
  
  let html = '<table>';
  for (const [key, value] of Object.entries(info)) {
    html += `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`;
  }
  html += '</table>';
  
  infoBox.innerHTML = html;
}
```

#### Passo 4: Atualizar o Preload Script

Modifique `src/main/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, data) => {
    const validChannels = ['get-paths', 'get-app-info'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
});
```

### Testando

1. Execute `npm start`
2. Pressione Ctrl+Alt+E para esconder/mostrar o app
3. Pressione Ctrl+Alt+D para abrir DevTools
4. Clique nos botões para ver caminhos e informações

### Resultado Esperado

Um aplicativo que:
- Responde a atalhos globais
- Exibe caminhos do sistema
- Mostra informações do app

---

## Aula 12: Menus e Barra de Tarefas

### Objetivo da Aula

Adicionar os acabamentos profissionais da interface de desktop.

### Conceitos Fundamentais

**Menu:** Barra de menu superior (Arquivo, Editar, Ajuda)

**Context Menu:** Menu que aparece ao clicar com botão direito

**System Tray:** Ícone na barra de tarefas/menu bar

**Badges:** Notificações no ícone do app

### Instruções Passo a Passo

#### Passo 1: Implementar Menus

Modifique `src/main/main.js`:

```javascript
const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Novo',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new');
          }
        },
        {
          label: 'Abrir',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu-action', 'open');
          }
        },
        {
          label: 'Salvar',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-action', 'save');
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Refazer', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Colar', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'DevTools', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => {
            mainWindow.webContents.send('menu-action', 'about');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createTray() {
  const trayIcon = path.join(__dirname, '../assets/tray-icon.png');
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Esconder',
      click: () => {
        mainWindow.hide();
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Clicar no ícone da bandeja
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

// Ouvir ações do menu
ipcMain.on('menu-response', (event, action) => {
  console.log('Ação do menu:', action);
});

// Atualizar badge
ipcMain.handle('set-badge', async (event, count) => {
  if (process.platform === 'darwin') {
    app.dock.setBadge(count.toString());
  } else if (process.platform === 'win32') {
    mainWindow.setOverlayIcon(
      path.join(__dirname, '../assets/badge.png'),
      count.toString()
    );
  }
});

app.whenReady().then(() => {
  createWindow();
  createMenu();
  createTray();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### Passo 2: Criar Interface

Crie `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menus e Barra de Tarefas</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>🖱️ Menus e Barra de Tarefas</h1>

    <div class="section">
      <h2>Menu Superior</h2>
      <p>Use o menu superior para acessar as opções do aplicativo.</p>
      <div class="shortcuts">
        <p><strong>Ctrl+N</strong> - Novo</p>
        <p><strong>Ctrl+O</strong> - Abrir</p>
        <p><strong>Ctrl+S</strong> - Salvar</p>
        <p><strong>Ctrl+Q</strong> - Sair</p>
      </div>
    </div>

    <div class="section">
      <h2>System Tray</h2>
      <p>Clique no ícone da bandeja para mostrar/esconder o aplicativo.</p>
      <p>Clique com o botão direito para ver mais opções.</p>
    </div>

    <div class="section">
      <h2>Badges (Notificações)</h2>

      <button onclick="setBadge(5)">Definir Badge: 5</button>
      <button onclick="clearBadge()">Limpar Badge</button>
    </div>

    <div class="section">
      <h2>Context Menu (Botão Direito)</h2>
      <p>Clique com o botão direito em qualquer lugar para ver o menu de contexto.</p>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 3: Criar o JavaScript

Crie `src/renderer/app.js`:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Ouvir ações do menu
  window.api.receive('menu-action', (action) => {
    console.log('Ação recebida:', action);
    
    switch (action) {
      case 'new':
        alert('Novo arquivo');
        break;
      case 'open':
        alert('Abrir arquivo');
        break;
      case 'save':
        alert('Salvar arquivo');
        break;
      case 'about':
        alert('Sobre o aplicativo');
        break;
    }
  });

  // Context menu
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    window.api.showContextMenu();
  });
});

async function setBadge(count) {
  await window.api.invoke('set-badge', count);
  alert(`Badge definido para: ${count}`);
}

async function clearBadge() {
  await window.api.invoke('set-badge', 0);
  alert('Badge limpo');
}
```

#### Passo 4: Atualizar o Preload Script

Modifique `src/main/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, data) => {
    const validChannels = ['set-badge'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['menu-action'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
```

### Resultado Esperado

Um aplicativo com menus profissionais, ícone na barra de tarefas e badges.

---

## Aula 13: Notifications e Requisições

### Objetivo da Aula

Comunicar estados de rede e emitir notificações nativas.

### Conceitos Fundamentais

**Notificações Nativas:** Alertas visuais do sistema operacional

**API net:** Fazer requisições HTTP

**Conectividade:** Detectar estado online/offline

### Instruções Passo a Passo

#### Passo 1: Implementar Notificações e Requisições

Modifique `src/main/main.js`:

```javascript
const { app, BrowserWindow, ipcMain, Notification, net } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Enviar notificação
ipcMain.handle('show-notification', async (event, options) => {
  const notification = new Notification({
    title: options.title || 'Notificação',
    body: options.body || '',
    icon: path.join(__dirname, '../assets/icon.png')
  });

  notification.show();
  return { success: true };
});

// Fazer requisição HTTP
ipcMain.handle('fetch-data', async (event, url) => {
  return new Promise((resolve) => {
    const request = net.request(url);

    request.on('response', (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          resolve({
            success: true,
            status: response.statusCode,
            data: JSON.parse(data)
          });
        } catch (error) {
          resolve({
            success: true,
            status: response.statusCode,
            data: data
          });
        }
      });
    });

    request.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    request.end();
  });
});

// Verificar conectividade
ipcMain.handle('check-connectivity', async () => {
  return new Promise((resolve) => {
    const request = net.request('https://www.google.com');

    request.on('response', () => {
      resolve({ online: true });
    });

    request.on('error', () => {
      resolve({ online: false });
    });

    request.end();
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### Passo 2: Criar Interface

Crie `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificações e Requisições</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>🔔 Notificações e Requisições</h1>

    <div class="section">
      <h2>Notificações Nativas</h2>
      <div class="button-grid">
        <button onclick="showNotification('info')">Info</button>
        <button onclick="showNotification('success')">Sucesso</button>
        <button onclick="showNotification('warning')">Aviso</button>
        <button onclick="showNotification('error')">Erro</button>
      </div>
    </div>

    <div class="section">
      <h2>Requisições HTTP</h2>
      <div class="input-group">
        <input type="text" id="url-input" placeholder="https://api.github.com/users/github" value="https://api.github.com/users/github">
        <button onclick="fetchData()">Buscar Dados</button>
      </div>
      <div class="response-box" id="response"></div>
    </div>

    <div class="section">
      <h2>Conectividade</h2>
      <button onclick="checkConnectivity()">Verificar Conexão</button>
      <div class="response-box" id="connectivity"></div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 3: Criar o JavaScript

Crie `src/renderer/app.js`:

```javascript
async function showNotification(type) {
  const titles = {
    info: 'Informação',
    success: 'Sucesso',
    warning: 'Aviso',
    error: 'Erro'
  };

  const messages = {
    info: 'Esta é uma notificação de informação',
    success: 'Operação concluída com sucesso!',
    warning: 'Atenção: verifique suas configurações',
    error: 'Ocorreu um erro ao processar'
  };

  await window.api.invoke('show-notification', {
    title: titles[type],
    body: messages[type]
  });
}

async function fetchData() {
  const url = document.getElementById('url-input').value;
  const response = await window.api.invoke('fetch-data', url);

  const responseBox = document.getElementById('response');
  if (response.success) {
    responseBox.innerHTML = `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
  } else {
    responseBox.textContent = `Erro: ${response.error}`;
  }
}

async function checkConnectivity() {
  const result = await window.api.invoke('check-connectivity');
  const connectivityBox = document.getElementById('connectivity');
  
  if (result.online) {
    connectivityBox.textContent = '✅ Conectado à Internet';
    connectivityBox.style.color = '#4caf50';
  } else {
    connectivityBox.textContent = '❌ Sem conexão com a Internet';
    connectivityBox.style.color = '#f44336';
  }
}
```

#### Passo 4: Atualizar o Preload Script

Modifique `src/main/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, data) => {
    const validChannels = ['show-notification', 'fetch-data', 'check-connectivity'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
});
```

### Resultado Esperado

Um aplicativo que:
- Exibe notificações nativas
- Faz requisições HTTP
- Verifica conectividade

---

## Aula 14: Distribuindo as Aplicações

### Objetivo da Aula

Transformar o código-fonte em instaladores para os usuários finais.

### Conceitos Fundamentais

**electron-builder:** Ferramenta para empacotar e criar instaladores

**electron-forge:** Ferramenta oficial do Electron para build e publicação

**Code Signing:** Assinatura digital do aplicativo

**Auto-Update:** Atualizações automáticas para usuários

### Instruções Passo a Passo

#### Passo 1: Instalar electron-builder

```bash
npm install --save-dev electron-builder
```

#### Passo 2: Configurar package.json

Modifique `package.json`:

```json
{
  "name": "meu-app-electron",
  "version": "1.0.0",
  "description": "Meu aplicativo Electron",
  "main": "src/main/main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build-win": "electron-builder --win",
    "build-mac": "electron-builder --mac",
    "build-linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.example.meuapp",
    "productName": "Meu App Electron",
    "files": [
      "src/**/*",
      "node_modules/**/*"
    ],
    "directories": {
      "buildResources": "assets"
    },
    "win": {
      "target": ["nsis", "portable"],
      "certificateFile": null,
      "certificatePassword": null
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.utilities"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Utility"
    }
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.0.0"
  }
}
```

#### Passo 3: Preparar Ícones

Crie uma pasta `assets` com os ícones:
- `icon.png` (512x512)
- `icon.ico` (Windows)
- `icon.icns` (macOS)

#### Passo 4: Criar Script de Build

Crie um arquivo `build.js`:

```javascript
const builder = require('electron-builder');

builder.build({
  config: {
    appId: 'com.example.meuapp',
    productName: 'Meu App Electron',
    files: ['src/**/*', 'node_modules/**/*'],
    directories: {
      buildResources: 'assets'
    },
    win: {
      target: ['nsis']
    }
  }
}).then(() => {
  console.log('✅ Build concluído!');
}).catch((error) => {
  console.error('❌ Erro no build:', error);
});
```

#### Passo 5: Executar o Build

```bash
npm run build
```

Isso criará instaladores em uma pasta `dist/`.

### Resultado Esperado

Instaladores prontos para distribuição:
- Windows: `.exe` e `.msi`
- macOS: `.dmg`
- Linux: `.AppImage` e `.deb`

---

## Conclusão

Parabéns! Você completou as 14 aulas de desenvolvimento com Electron.js. Você aprendeu:

1. ✅ Preparar o ambiente
2. ✅ Estruturar um projeto Electron
3. ✅ Criar janelas
4. ✅ Entender a arquitetura
5. ✅ Controlar janelas
6. ✅ Gerenciar energia
7. ✅ Comunicação IPC
8. ✅ APIs nativas
9. ✅ Criar um projeto prático
10. ✅ Atalhos e caminhos
11. ✅ Menus e barra de tarefas
12. ✅ Notificações e requisições
13. ✅ Distribuir aplicativos

### Próximos Passos

- Explore a documentação oficial: [electronjs.org](https://www.electronjs.org)
- Contribua para projetos open-source
- Crie seus próprios aplicativos
- Aprenda sobre segurança em aplicativos desktop
- Explore integrações com APIs externas

### Recursos Úteis

- **Documentação:** https://www.electronjs.org/docs
- **Exemplos:** https://github.com/electron/electron/tree/main/docs/tutorial
- **Comunidade:** Stack Overflow, Reddit (/r/electronjs), Discord
- **Ferramentas:**
  - electron-builder: Empacotamento
  - electron-forge: Scaffolding
  - electron-updater: Auto-update

---

**Autor:** Manus AI  
**Data:** 02 de Março de 2026  
**Versão:** 1.0 - Guia Detalhado Completo com Códigos e Instruções Passo a Passo
