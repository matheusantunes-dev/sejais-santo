# Sejais Santo - CSS Puro ✅

## ✨ Conversão Completa de Tailwind para CSS Puro

Este projeto foi **100% convertido de Tailwind CSS para CSS Puro**.

---

## 📁 Estrutura de Arquivos CSS

```
/src/
├── app/
│   ├── App.tsx
│   ├── App.css ⭐ NOVO
│   └── components/
│       ├── Header.tsx
│       ├── Header.css ⭐ NOVO
│       ├── HeroBanner.tsx
│       ├── HeroBanner.css ⭐ NOVO
│       ├── FeatureCard.tsx
│       ├── FeatureCard.css ⭐ NOVO
│       ├── GospelCard.tsx
│       ├── GospelCard.css ⭐ NOVO
│       ├── EasterBanner.tsx
│       ├── EasterBanner.css ⭐ NOVO
│       ├── AboutSection.tsx
│       ├── AboutSection.css ⭐ NOVO
│       ├── LiturgicalFooter.tsx
│       ├── LiturgicalFooter.css ⭐ NOVO
│       └── VerseOrganizerIcon.tsx (SVG puro - sem CSS)
└── styles/
    ├── index.css (principal)
    ├── base.css ⭐ NOVO (substitui Tailwind)
    ├── custom.css (mantido)
    ├── theme.css (mantido)
    └── fonts.css (mantido)
```

---

## 🎨 Como Editar os Estilos Agora

### **1. Editar Estilos de um Componente Específico**

Cada componente tem seu próprio arquivo CSS:

**Exemplo: Mudar cor do Header**

Abra `/src/app/components/Header.css`:

```css
.header {
  background-color: #8B1A1A; /* ← Mude aqui */
}

.header-title {
  color: white; /* ← Ou mude aqui */
  font-size: 1.875rem;
}
```

---

### **2. Mudar Cores Globais**

Edite `/src/styles/theme.css` ou os arquivos CSS individuais.

---

### **3. Classes CSS Disponíveis**

Cada componente tem classes nomeadas de forma clara:

**Header.css:**
- `.header` - Container principal
- `.header-title` - Título "Sejais Santo"
- `.header-subtitle` - Slogan
- `.login-button` - Botão de login

**HeroBanner.css:**
- `.hero-banner` - Banner completo
- `.hero-title` - Nome "São Carlo Acutis"
- `.hero-image` - Foto

**FeatureCard.css:**
- `.feature-card` - Card inteiro
- `.feature-card-header` - Cabeçalho vermelho
- `.share-button` - Botão compartilhar

**GospelCard.css:**
- `.gospel-card` - Container
- `.gospel-select` - Seletor de data
- `.gospel-preview` - Área do evangelho

**EasterBanner.css:**
- `.easter-banner` - Banner Páscoa
- `.easter-title` - "Ele Ressuscitou!"

**AboutSection.css:**
- `.about-section` - Seção completa
- `.about-card` - Card de informações
- `.about-button` - Botão "Saiba Mais"

**LiturgicalFooter.css:**
- `.liturgical-footer` - Footer completo
- `.liturgical-season-card` - Cards dos tempos

---

## 🔧 Exemplos Práticos de Edição

### **Exemplo 1: Mudar Cor do Header**

Arquivo: `/src/app/components/Header.css`

```css
/* ANTES */
.header {
  background-color: #8B1A1A;
}

/* DEPOIS */
.header {
  background-color: #000080; /* Azul marinho */
}
```

---

### **Exemplo 2: Aumentar Tamanho do Título**

Arquivo: `/src/app/components/Header.css`

```css
/* ANTES */
.header-title {
  font-size: 1.875rem;
}

/* DEPOIS */
.header-title {
  font-size: 3rem; /* Maior */
}
```

---

### **Exemplo 3: Mudar Cor dos Botões**

Arquivo: `/src/app/components/FeatureCard.css`

```css
/* ANTES */
.share-button {
  background-color: #8B1A1A;
}

/* DEPOIS */
.share-button {
  background-color: #0066cc; /* Azul */
}
```

---

### **Exemplo 4: Trocar Imagem de Fundo**

Arquivo: `/src/app/components/HeroBanner.css`

Não precisa editar CSS! Vá em:
`/src/app/components/HeroBanner.tsx`

```tsx
// Linha 1 - troque a URL da imagem
import carloAcutisImage from 'SUA_NOVA_IMAGEM_AQUI';
```

---

## 📐 Responsividade (Mobile, Tablet, Desktop)

Todos os arquivos CSS têm **media queries** configuradas:

```css
/* Mobile (padrão) - 0-767px */
.header-title {
  font-size: 1.875rem;
}

/* Tablet - 768px+ */
@media (min-width: 768px) {
  .header-title {
    font-size: 2.25rem;
  }
}

/* Desktop - 1024px+ */
@media (min-width: 1024px) {
  .header-title {
    font-size: 3rem;
  }
}
```

---

## 🎯 Breakpoints Usados

```
Mobile:    0px - 767px (padrão)
Tablet:    768px - 1023px (@media min-width: 768px)
Desktop:   1024px+ (@media min-width: 1024px)
```

---

## ✅ Vantagens do CSS Puro

1. ✅ **Mais fácil de editar** - Classes com nomes claros
2. ✅ **Sem dependência** do Tailwind
3. ✅ **Arquivos separados** por componente
4. ✅ **Totalmente customizável**
5. ✅ **Melhor para aprender** CSS

---

## 🚀 Como Continuar

### **Para mudar visual:**
1. Abra o arquivo `.css` do componente
2. Edite as propriedades (cor, tamanho, etc)
3. Salve → atualização automática

### **Para mudar textos/conteúdo:**
1. Abra o arquivo `.tsx` do componente
2. Edite o JSX
3. Salve

### **Para adicionar novos estilos:**
1. Crie nova classe no arquivo `.css`
2. Use no arquivo `.tsx`:
   ```tsx
   <div className="minha-nova-classe">
   ```

---

## 📚 Guia Rápido de Propriedades CSS

```css
/* Cores */
color: #ff0000;              /* Cor do texto */
background-color: #00ff00;   /* Cor de fundo */

/* Tamanhos */
font-size: 16px;             /* Tamanho da fonte */
width: 100%;                 /* Largura */
height: 200px;               /* Altura */
padding: 1rem;               /* Espaçamento interno */
margin: 1rem;                /* Espaçamento externo */

/* Layout */
display: flex;               /* Layout flexível */
flex-direction: column;      /* Direção vertical */
align-items: center;         /* Centraliza horizontalmente */
justify-content: center;     /* Centraliza verticalmente */

/* Bordas */
border: 2px solid #000;      /* Borda */
border-radius: 0.5rem;       /* Cantos arredondados */

/* Sombras */
box-shadow: 0 4px 6px rgba(0,0,0,0.1);

/* Transições */
transition: all 0.3s ease;   /* Animação suave */
```

---

## 🎨 Cores Principais do Projeto

```css
Vermelho Principal:  #8B1A1A
Bege Fundo:          #f5f5dc
Marrom Bordas:       #8B6F47
Laranja Páscoa:      #dc2f02
Roxo Quaresma:       #7b2cbf
Verde Tempo Comum:   #2d6a4f
```

---

## 💡 Dicas Finais

- Cada componente tem seu CSS separado = fácil de encontrar
- Use o DevTools do navegador (F12) para testar cores antes de salvar
- Mantenha o padrão de nomenclatura (`.componente-elemento`)
- Teste sempre em Mobile, Tablet e Desktop

---

✨ **Projeto 100% em CSS Puro - Pronto para Edição!** ✨
