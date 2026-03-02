## Aula 02: Preparando o Ambiente

### Objetivo da Aula

Garantir que todos os alunos tenham as ferramentas necessárias instaladas e compreendam o papel de cada uma no ecossistema do Electron.

### Conceitos Fundamentais

**Node.js e o Electron:** O Electron não é apenas um navegador disfarçado. Ele incorpora o **Node.js** para fornecer capacidades de backend, permitindo acesso nativo ao sistema de arquivos, redes e hardware. Pense no Node.js como o "poder" que transforma um navegador web em um aplicativo desktop completo.

**NPM (Node Package Manager):** O gerenciador de pacotes do Node.js. Ele funciona como uma "loja de código" onde você pode baixar e instalar bibliotecas prontas. Quando você executa `npm install electron`, o NPM baixa o Electron e todas as suas dependências para uma pasta chamada `node_modules`.

**Versão LTS (Long Term Support):** Uma versão de software que recebe suporte e atualizações de segurança por um longo período (geralmente 3 anos). Para iniciantes, sempre instale versões LTS porque são estáveis e bem testadas.

**Visual Studio Code:** Um editor de código moderno e leve. Ele oferece:
- Destaque de sintaxe (cores diferentes para diferentes partes do código)
- Autocompletar (sugestões enquanto você digita)
- Depurador integrado (ferramenta para encontrar erros)
- Terminal integrado (você pode executar comandos sem sair do editor)

**Extensões do VS Code:** Pequenos programas que adicionam funcionalidades:
- **ESLint:** Analisa seu código e aponta erros e problemas de estilo
- **Prettier:** Formata automaticamente seu código para ficar bonito e consistente
- **Electron Color Theme:** Um tema visual agradável para desenvolvimento Electron

**Electron Forge:** Um conjunto de ferramentas "batteries-included" (tudo incluído) que facilita:
- Criar a estrutura inicial do projeto (boilerplate)
- Empacotar o aplicativo para distribuição
- Gerenciar dependências

### Instruções Passo a Passo

#### Passo 1: Instalar Node.js

1. Visite [nodejs.org](https://nodejs.org)
2. Clique no botão "LTS" (Long Term Support)
3. Execute o instalador
4. Siga as instruções do instalador (aceite os padrões)
5. Abra o terminal/prompt de comando e verifique a instalação:

```bash
node --version
npm --version
```

Você deve ver números de versão (exemplo: `v18.16.0` e `9.6.7`).

#### Passo 2: Instalar Visual Studio Code

1. Visite [code.visualstudio.com](https://code.visualstudio.com)
2. Clique em "Download"
3. Execute o instalador
4. Siga as instruções do instalador

#### Passo 3: Instalar Extensões do VS Code

1. Abra VS Code
2. Clique no ícone de "Extensões" na barra lateral esquerda (ícone de 4 quadrados)
3. Procure por "ESLint" e clique em "Instalar"
4. Procure por "Prettier" e clique em "Instalar"
5. Procure por "Electron" e instale um tema de cores

#### Passo 4: Criar Seu Primeiro Projeto

1. Crie uma pasta vazia em um local de sua escolha. Nomeie como `meu-app-electron`
2. Abra o terminal/prompt de comando
3. Navegue até a pasta:
   ```bash
   cd caminho/para/meu-app-electron
   ```
4. Inicialize o projeto Node.js:
   ```bash
   npm init -y
   ```
   
   **Explicação:** O comando `npm init -y` cria um arquivo `package.json` com valores padrão. O `-y` significa "sim para todas as perguntas".

5. Instale o Electron como uma dependência de desenvolvimento:
   ```bash
   npm install --save-dev electron
   ```
   
   **Explicação:** O `--save-dev` indica que o Electron é necessário apenas durante o desenvolvimento, não na versão final do aplicativo.

### Resultado Esperado

Após completar esta aula, você terá:
- Node.js e NPM instalados
- Visual Studio Code com extensões úteis
- Uma pasta de projeto com um arquivo `package.json`
- Electron instalado na pasta `node_modules`

---
