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
**Atenção:** 

Cuidado com a digitação da função openDevTools(). 
O "s" no final é obrigatório, caso contrário o Node.js lançará um erro do tipo "not a function".

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
// src/main/preload.js
// Este arquivo roda antes da página web ser carregada
// Ele tem acesso ao Node.js e atua como uma ponte segura

const { contextBridge } = require('electron');

// Expor variáveis do sistema de forma segura para o Renderer Process
contextBridge.exposeInMainWorld('versoes', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
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
// src/renderer/app.js
// Este arquivo roda no Renderer Process (dentro da janela do navegador)

document.addEventListener('DOMContentLoaded', () => {
  // Acessamos as informações através da ponte segura 'window.versoes' criada no preload.js
  document.getElementById('node-version').textContent = window.versoes.node();
  document.getElementById('chrome-version').textContent = window.versoes.chrome();
  document.getElementById('electron-version').textContent = window.versoes.electron();
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
