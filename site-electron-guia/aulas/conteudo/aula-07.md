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
