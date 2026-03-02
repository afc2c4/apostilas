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
