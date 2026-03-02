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
