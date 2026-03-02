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
