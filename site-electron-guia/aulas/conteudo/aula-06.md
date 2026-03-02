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
