# 🌱 AgroSoja - Landing Page & Sistema de Gestão

> Uma plataforma web moderna para o agronegócio, combinando uma Landing Page de alta conversão com um Painel Administrativo completo para gestão de produtos e contatos.

![Status](https://img.shields.io/badge/status-concluído-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)

---
### Site Hospedado para testes: https://landing-page-agrosoja.vercel.app
---

## 📋 Sobre o Projeto

Este projeto foi desenvolvido para oferecer autonomia digital ao produtor rural. Ele consiste em:

1.  **Landing Page Pública:** Focada em performance e SEO, exibindo a identidade da empresa, planejamento estratégico e vitrine de produtos (Soja).
2.  **Painel Administrativo (CMS):** Área restrita e segura onde o proprietário gerencia o conteúdo do site (produtos, fotos, textos e dados de contato) sem precisar de conhecimentos de programação.

---

## ✨ Funcionalidades

### 🖥️ Área Pública (Cliente)

- **Hero Section Imersiva:** Design impactante com animações suaves (`FadeIn`) e adaptação mobile.
- **Vitrine de Produtos Híbrida:**
  - **Desktop:** Grid paginado (3 colunas) com navegação por setas laterais.
  - **Mobile:** Carrossel com scroll lateral nativo (Touch) e layout otimizado.
- **Filtros Dinâmicos:** Filtragem instantânea por categoria (Grãos / Lavoura).
- **Modal de Detalhes:** Visualização expandida do produto sem sair da página.
- **Integração WhatsApp:** Botão flutuante e formulário que gera mensagens personalizadas com Nome e Assunto.
- **Performance:** Imagens otimizadas via Cloudinary (redimensionamento automático).

### 🔒 Área Administrativa (Admin)

- **Autenticação Segura:** Login via Firebase Auth com tratamento de erros amigável.
- **Gestão de Produtos:** Criar, Editar e Excluir produtos.
- **Upload de Imagens:** Integração com Cloudinary (com preview em tempo real antes de salvar).
- **Gestão de Contato:** Edição do telefone, e-mail e endereço exibidos no site.
- **UX Aprimorada:** Modais de confirmação para exclusão e avisos de sucesso.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [Next.js](https://nextjs.org/) (React)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (Ícones)
- **Backend as a Service:** [Firebase](https://firebase.google.com/) (Firestore Database & Authentication)
- **Mídia:** [Cloudinary](https://cloudinary.com/) (Upload e Otimização de Imagens)
- **Backend Auxiliar:** PHP (Script simples para exclusão segura de imagens na hospedagem).

---

## 🚀 Instalação e Execução Local

### Pré-requisitos

- Node.js instalado.
- Contas ativas no Firebase e Cloudinary.

### 1. Clone o repositório

```bash
git clone https://github.com/ViniiPP/landing-Page-Agro.git
cd landing-Page-Agro
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

- Crie um arquivo (`.env.local`) na raiz do projeto e preencha com suas chaves públicas:

```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Cloudinary Config (Apenas chaves públicas)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
NEXT_PUBLIC_CLOUDINARY_PRESET=seu_preset_unsigned
```

### 4. Inicie o servidor

```bash
npm run dev
```

---

## ⚙️ Configuração dos Serviços

### Firebase (Regras de Segurança):

- No Console do Firebase, vá em Firestore Database > Rules e configure:

```bash
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Produtos: Leitura pública, Escrita restrita ao admin
    match /produtos/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Configurações: Leitura pública, Escrita restrita ao admin
    match /configuracoes/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Cloudinary

    >   Vá em Settings > Upload.
    >   Crie um Upload Preset.
    >   Defina o "Signing Mode" como Unsigned.
    >   Copie o nome do preset para o arquivo .env.local.

---

# 📦 Guia de Deploy (Hostinger)

- Este projeto utiliza Static Export. Siga este roteiro para hospedar na Hostinger (ou qualquer servidor Apache/Shared).

### 1. Gerar a Build:

- No terminal, execute:

```bash
npm run build
```

`Isso criará uma pasta chamada out com o site estático`.

### 2. Preparar Arquivos:

- Entre na pasta out, selecione todos os arquivos e crie um arquivo .ZIP (Ex: `site.zip`)

### 3. Arquivos Essenciais (Backend na Hostinger):

- Para o funcionamento correto das rotas e da exclusão de imagens, você deve criar dois arquivos na pasta `public_html` da hospedagem:

  ### A. Arquivo **.htaccess** (Rotas):

  - Permite acessar `/admin` e outras rotas sem precisar digitar .html.

  ```bash
      <IfModule mod_rewrite.c>
          RewriteEngine On
          RewriteBase /
          RewriteRule ^index\.html$ - [L]
          RewriteCond %{REQUEST_FILENAME} !-f
          RewriteCond %{REQUEST_FILENAME} !-d
          RewriteCond %{REQUEST_FILENAME} !-l
          RewriteRule . /index.html [L]
      </IfModule>
  ```

  ### B. Arquivo **delete_img.php** (Segurança):

  - Para permitir que o admin delete imagens do Cloudinary sem expor a chave secreta no frontend. Crie este arquivo na raiz da hospedagem e edite as chaves:

  ```bash
      <?php
          header("Access-Control-Allow-Origin: *");
          header("Access-Control-Allow-Methods: POST");
          // Se for preflight
          if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

          // --- CONFIGURAÇÕES DO CLOUDINARY (BACKEND) ---
          $cloud_name = "SEU_CLOUD_NAME";
          $api_key = "SUA_API_KEY";
          $api_secret = "SUA_API_SECRET_SUPER_SECRETA"; // Pegue no Dashboard
          // ---------------------------------------------

          $data = json_decode(file_get_contents("php://input"), true);
          $public_id = $data['public_id'];

          if (!$public_id) { echo json_encode(["error" => "No ID"]); exit(); }

          $timestamp = time();
          $signature = sha1("public_id=$public_id&timestamp=$timestamp$api_secret");

          $post_fields = [
              "public_id" => $public_id,
              "api_key" => $api_key,
              "timestamp" => $timestamp,
              "signature" => $signature
          ];

          $ch = curl_init();
          curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/$cloud_name/image/destroy");
          curl_setopt($ch, CURLOPT_POST, 1);
          curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          $response = curl_exec($ch);
          curl_close($ch);
          echo $response;
      ?>
  ```

### 4. Upload Final:

    > No Gerenciador de Arquivos da Hostinger, vá para public_html.
    > Apague arquivos padrão.
    > Suba e extraia o site.zip.
    > Certifique-se de que o .htaccess e o delete_img.php estão na mesma pasta.

### 5. Autorizar Domínio:

- Vá no Console do Firebase > Authentication > Settings > Authorized Domains e adicione o domínio final `(ex: www.agrosoja.com.br)`.

---

# 📄 Licença

- **Este projeto é proprietário e de uso restrito.**
- **Todos os direitos são reservados a Vinícius Pereira Polli**.

- **É proibida a cópia, redistribuição ou uso comercial sem autorização prévia.**
