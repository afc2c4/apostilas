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
