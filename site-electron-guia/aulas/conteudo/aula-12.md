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
