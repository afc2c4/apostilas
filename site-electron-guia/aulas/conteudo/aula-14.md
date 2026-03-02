## Aula 14: Distribuindo as Aplicações

### Objetivo da Aula

Transformar o código-fonte em instaladores para os usuários finais.

### Conceitos Fundamentais

**electron-builder:** Ferramenta para empacotar e criar instaladores

**electron-forge:** Ferramenta oficial do Electron para build e publicação

**Code Signing:** Assinatura digital do aplicativo

**Auto-Update:** Atualizações automáticas para usuários

### Instruções Passo a Passo

#### Passo 1: Instalar electron-builder

```bash
npm install --save-dev electron-builder
```

#### Passo 2: Configurar package.json

Modifique `package.json`:

```json
{
  "name": "meu-app-electron",
  "version": "1.0.0",
  "description": "Meu aplicativo Electron",
  "main": "src/main/main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build-win": "electron-builder --win",
    "build-mac": "electron-builder --mac",
    "build-linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.example.meuapp",
    "productName": "Meu App Electron",
    "files": [
      "src/**/*",
      "node_modules/**/*"
    ],
    "directories": {
      "buildResources": "assets"
    },
    "win": {
      "target": ["nsis", "portable"],
      "certificateFile": null,
      "certificatePassword": null
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.utilities"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Utility"
    }
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.0.0"
  }
}
```

#### Passo 3: Preparar Ícones

Crie uma pasta `assets` com os ícones:
- `icon.png` (512x512)
- `icon.ico` (Windows)
- `icon.icns` (macOS)

#### Passo 4: Criar Script de Build

Crie um arquivo `build.js`:

```javascript
const builder = require('electron-builder');

builder.build({
  config: {
    appId: 'com.example.meuapp',
    productName: 'Meu App Electron',
    files: ['src/**/*', 'node_modules/**/*'],
    directories: {
      buildResources: 'assets'
    },
    win: {
      target: ['nsis']
    }
  }
}).then(() => {
  console.log('✅ Build concluído!');
}).catch((error) => {
  console.error('❌ Erro no build:', error);
});
```

#### Passo 5: Executar o Build

```bash
npm run build
```

Isso criará instaladores em uma pasta `dist/`.

### Resultado Esperado

Instaladores prontos para distribuição:
- Windows: `.exe` e `.msi`
- macOS: `.dmg`
- Linux: `.AppImage` e `.deb`

---
