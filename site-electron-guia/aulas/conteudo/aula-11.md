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
