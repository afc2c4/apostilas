## Aula 10: Projeto Prático

### Objetivo da Aula

Consolidar todos os conhecimentos criando um software completo e funcional.

### Projeto: Gerenciador de Notas em Markdown

Criaremos um aplicativo que:
- Cria, edita e deleta notas em Markdown
- Salva arquivos `.md` no disco
- Exibe preview em tempo real
- Usa IPC para comunicação segura

#### Passo 1: Estrutura do Projeto

```
src/
├── main/
│   ├── main.js
│   ├── preload.js
│   └── file-manager.js
└── renderer/
    ├── index.html
    ├── styles.css
    └── app.js
```

#### Passo 2: Criar o Gerenciador de Arquivos

Crie `src/main/file-manager.js`:

```javascript
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class FileManager {
  constructor() {
    this.notesDir = path.join(os.homedir(), 'ElectronNotes');
  }

  async initialize() {
    try {
      await fs.mkdir(this.notesDir, { recursive: true });
      return true;
    } catch (error) {
      console.error('Erro ao criar diretório:', error);
      return false;
    }
  }

  async listNotes() {
    try {
      const files = await fs.readdir(this.notesDir);
      return files.filter(file => file.endsWith('.md'));
    } catch (error) {
      console.error('Erro ao listar notas:', error);
      return [];
    }
  }

  async readNote(filename) {
    try {
      const filePath = path.join(this.notesDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveNote(filename, content) {
    try {
      const filePath = path.join(this.notesDir, filename);
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteNote(filename) {
    try {
      const filePath = path.join(this.notesDir, filename);
      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createNote(title) {
    const filename = `${title.replace(/\s+/g, '-')}-${Date.now()}.md`;
    const content = `# ${title}\n\n`;
    return this.saveNote(filename, content);
  }
}

module.exports = FileManager;
```

#### Passo 3: Atualizar o Main Process

Modifique `src/main/main.js`:

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const FileManager = require('./file-manager');

let mainWindow;
const fileManager = new FileManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
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

// Inicializar gerenciador de arquivos
ipcMain.handle('init-app', async () => {
  const success = await fileManager.initialize();
  return { success };
});

// Listar notas
ipcMain.handle('list-notes', async () => {
  const notes = await fileManager.listNotes();
  return notes;
});

// Ler nota
ipcMain.handle('read-note', async (event, filename) => {
  return fileManager.readNote(filename);
});

// Salvar nota
ipcMain.handle('save-note', async (event, filename, content) => {
  return fileManager.saveNote(filename, content);
});

// Deletar nota
ipcMain.handle('delete-note', async (event, filename) => {
  return fileManager.deleteNote(filename);
});

// Criar nota
ipcMain.handle('create-note', async (event, title) => {
  return fileManager.createNote(title);
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

#### Passo 4: Criar a Interface

Crie `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerenciador de Notas</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>📝 Notas</h1>
        <button class="btn-new" onclick="createNewNote()">+ Nova</button>
      </div>
      <div class="notes-list" id="notesList"></div>
    </aside>

    <main class="editor">
      <div class="editor-header">
        <input type="text" id="noteTitle" placeholder="Título da nota" class="note-title">
        <button class="btn-delete" onclick="deleteCurrentNote()">🗑️ Deletar</button>
      </div>
      
      <div class="editor-content">
        <textarea id="noteContent" placeholder="Escreva sua nota aqui..."></textarea>
        <div class="preview" id="preview"></div>
      </div>
    </main>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### Passo 5: Criar o CSS

Crie `src/renderer/styles.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  height: 100vh;
  overflow: hidden;
}

.app {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.sidebar-header h1 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.btn-new {
  width: 100%;
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-new:hover {
  background: #764ba2;
}

.notes-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.note-item {
  padding: 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border-left: 3px solid #667eea;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.3s;
}

.note-item:hover {
  background: #f0f0f0;
  transform: translateX(5px);
}

.note-item.active {
  background: #e8eaf6;
  border-left-color: #764ba2;
}

.editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.editor-header {
  padding: 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.note-title {
  flex: 1;
  font-size: 24px;
  font-weight: 600;
  border: none;
  outline: none;
  color: #333;
}

.btn-delete {
  padding: 8px 15px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-delete:hover {
  background: #ff5252;
}

.editor-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  overflow: hidden;
}

textarea {
  padding: 20px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.preview {
  padding: 20px;
  overflow-y: auto;
  border-left: 1px solid #ddd;
  background: #fafafa;
}

.preview h1, .preview h2, .preview h3 {
  margin: 20px 0 10px;
  color: #333;
}

.preview h1 { font-size: 28px; }
.preview h2 { font-size: 24px; }
.preview h3 { font-size: 20px; }

.preview p {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #666;
}

.preview code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
}

@media (max-width: 1024px) {
  .editor-content {
    grid-template-columns: 1fr;
  }

  .preview {
    display: none;
  }
}
```

#### Passo 6: Criar o JavaScript

Crie `src/renderer/app.js`:

```javascript
let currentNote = null;
let notes = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar aplicativo
  await window.api.invoke('init-app');
  
  // Carregar notas
  await loadNotes();
  
  // Listeners para edição
  document.getElementById('noteContent').addEventListener('input', updatePreview);
  document.getElementById('noteTitle').addEventListener('change', saveCurrentNote);
  document.getElementById('noteContent').addEventListener('change', saveCurrentNote);
});

async function loadNotes() {
  notes = await window.api.invoke('list-notes');
  renderNotesList();
  
  if (notes.length > 0) {
    await selectNote(notes[0]);
  }
}

function renderNotesList() {
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = '';
  
  notes.forEach(note => {
    const noteItem = document.createElement('div');
    noteItem.className = `note-item ${note === currentNote ? 'active' : ''}`;
    noteItem.textContent = note.replace('.md', '').replace(/-/g, ' ');
    noteItem.onclick = () => selectNote(note);
    notesList.appendChild(noteItem);
  });
}

async function selectNote(filename) {
  currentNote = filename;
  const result = await window.api.invoke('read-note', filename);
  
  if (result.success) {
    const content = result.content;
    const lines = content.split('\n');
    const title = lines[0].replace('# ', '');
    const noteContent = lines.slice(2).join('\n');
    
    document.getElementById('noteTitle').value = title;
    document.getElementById('noteContent').value = noteContent;
    
    updatePreview();
    renderNotesList();
  }
}

async function createNewNote() {
  const title = prompt('Nome da nota:');
  if (!title) return;
  
  const result = await window.api.invoke('create-note', title);
  if (result.success) {
    await loadNotes();
  }
}

async function deleteCurrentNote() {
  if (!currentNote) return;
  
  const confirm = await window.api.invoke('show-message', {
    type: 'question',
    title: 'Deletar Nota',
    message: 'Tem certeza que deseja deletar esta nota?',
    buttons: ['Sim', 'Não']
  });
  
  if (confirm === 0) {
    await window.api.invoke('delete-note', currentNote);
    currentNote = null;
    await loadNotes();
  }
}

async function saveCurrentNote() {
  if (!currentNote) return;
  
  const title = document.getElementById('noteTitle').value;
  const content = document.getElementById('noteContent').value;
  const fullContent = `# ${title}\n\n${content}`;
  
  await window.api.invoke('save-note', currentNote, fullContent);
}

function updatePreview() {
  const content = document.getElementById('noteContent').value;
  const preview = document.getElementById('preview');
  
  // Simples conversão de Markdown para HTML
  let html = content
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<)(.+)$/gm, '<p>$1</p>');
  
  preview.innerHTML = html;
}
```

#### Passo 7: Atualizar o Preload Script

Modifique `src/main/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, data) => {
    const validChannels = [
      'init-app',
      'list-notes',
      'read-note',
      'save-note',
      'delete-note',
      'create-note',
      'show-message'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
});
```

### Testando

1. Execute `npm start`
2. Crie uma nova nota
3. Edite o conteúdo
4. Veja o preview em tempo real
5. Crie e delete notas

### Resultado Esperado

Um aplicativo funcional de gerenciamento de notas que demonstra todos os conceitos aprendidos.

---
