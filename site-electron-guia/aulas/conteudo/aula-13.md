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
