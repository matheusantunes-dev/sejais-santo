# Sejais Santo - Design System

## 🎨 Visão Geral

Design responsivo para o projeto de evangelização **Sejais Santo**, seguindo o conceito "Porque Deus é Santo". O design é baseado em uma abordagem **Mobile First** e totalmente responsivo para dispositivos móveis, tablets e desktops.

## 📱 Breakpoints Responsivos

- **Mobile**: < 768px (padrão)
- **Tablet**: 768px - 1023px (md:)
- **Desktop**: ≥ 1024px (lg:)

## 🎨 Sistema de Cores Litúrgicas

O site adapta suas cores de acordo com o calendário litúrgico católico:

### Cores dos Tempos Litúrgicos

| Tempo Litúrgico | Cor Principal | Código Hex | Uso |
|----------------|---------------|------------|-----|
| **Padrão (São Carlo Acutis)** | Vermelho | `#b71c1c` | Tema padrão do site |
| **Advento** | Roxo | `#7b2cbf` | Preparação para o Natal |
| **Quaresma** | Roxo | `#7b2cbf` | Preparação para a Páscoa |
| **Tempo Pascal** | Laranja/Vermelho | `#dc2f02` | Celebração da Ressurreição |
| **Tempo Comum** | Verde | `#2d6a4f` | Crescimento espiritual |
| **Natal** | Branco | `#ffffff` | Nascimento de Cristo |

### Cores Secundárias

- **Background Principal**: `#f5f5dc` (Beige claro)
- **Background Gradiente**: `from-[#f5f5dc] to-amber-50`
- **Texto Escuro**: `#1f2937` (Gray 800)
- **Acentos**: Âmbar/Dourado

## 🎯 Componentes Principais

### 1. Header
- Logo "Sejais Santo" com tagline
- Botão de Login com Google
- Decoração ondulada na base
- Cor adaptável ao tempo litúrgico

### 2. Hero Banner
- Imagem destacada de São Carlo Acutis
- Título e subtítulo
- Background gradiente com textura
- Responsivo com imagem circular em mobile

### 3. Feature Cards (3 principais)

#### a) Evangelho do Dia
- Iframe do evangelho diário
- Dropdown para selecionar data
- Botão de compartilhamento

#### b) Versículos do Mês
- Imagem de bíblia e rosário
- Sugestões de leitura
- Botão de compartilhamento

#### c) Organize Seus Versículos
- Ícone customizado (bíblia + checklist)
- Sistema de organização pessoal
- Botão de compartilhamento

### 4. Banner Especial (Condicional)
- Exibido em datas especiais (ex: Páscoa)
- Mensagem customizável
- Background temático
- Cruz e lírios decorativos

### 5. Seção "Quem Foi São Carlo Acutis?"
- Biografia resumida
- Imagem do santo
- Botão "Saiba Mais"
- Design card com bordas arredondadas

### 6. Footer Litúrgico
- Indicador do tempo litúrgico atual
- Grid com 4 ícones dos tempos litúrgicos
- Informações de copyright
- Hover effects nos ícones

## 🎨 Tipografia

### Fontes
- **Display/Títulos**: `Playfair Display` (Serif elegante)
- **Corpo/UI**: `Inter` (Sans-serif moderna)

### Hierarquia
- **H1**: 2xl/4xl/5xl (mobile/tablet/desktop)
- **H2**: xl/2xl/3xl
- **H3**: lg/xl/2xl
- **Body**: sm/base/base

## 🖼️ Sistema de Imagens

### Uso de Imagens
1. **Imagens do Figma**: Usar esquema `figma:asset/[id].png`
2. **Novas Imagens**: Usar componente `ImageWithFallback`
3. **SVGs**: Importar diretamente dos arquivos

### Otimização
- Lazy loading automático
- Aspect ratios fixos para evitar layout shift
- Fallbacks para erros de carregamento

## 🎭 Animações e Transições

### Transições de Cores Litúrgicas
```css
transition: background-color 0.5s ease-in-out, color 0.5s ease-in-out;
```

### Hover Effects
- **Botões**: Scale de 105% + mudança de cor
- **Cards**: TranslateY(-5px) + sombra aumentada
- **Ícones litúrgicos**: Opacity e scale

### Animações de Entrada
- Fade in up para cards
- Durações: 0.3s (rápido) a 0.6s (normal)

## 📐 Espaçamento e Layout

### Container
- Max-width: `7xl` (1280px)
- Padding: 4 (mobile) / 8 (desktop)

### Grid de Cards
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3 colunas
- Gap: 6 (mobile) / 8 (desktop)

### Seções
- Padding vertical: 8 (mobile) / 12 (tablet) / 16 (desktop)

## 🔧 Features Técnicas

### Responsividade
- **Mobile First**: Estilos base para mobile
- **Breakpoints**: Uso de prefixos md: e lg:
- **Flexbox/Grid**: Layout fluido e adaptável
- **Viewport Units**: Evitados para melhor compatibilidade

### Acessibilidade
- Contraste adequado de cores
- Focus visible em elementos interativos
- Alt text em todas as imagens
- Estrutura semântica de HTML

### Performance
- Imagens otimizadas do Unsplash
- CSS minificado
- Lazy loading de imagens
- No layout shift

## 🎪 Estados Especiais

### Tempo Pascal (Páscoa)
```typescript
showEasterBanner: true
currentSeason: 'easter'
```
- Banner: "O túmulo está aberto, Ele Ressuscitou!"
- Cor predominante: Laranja/Vermelho
- Decoração: Cruz e lírios

### Advento/Quaresma
- Cor predominante: Roxo
- Tom mais sóbrio e reflexivo

### Tempo Comum
- Cor predominante: Verde
- Tema de crescimento e vida

## 📱 Comportamento Mobile

### Ajustes Específicos
1. **Header**: Logo menor, texto do botão escondido em telas pequenas
2. **Hero**: Layout em coluna, imagem acima do texto
3. **Cards**: Empilhados verticalmente
4. **Footer**: Grid 2x2 em vez de 4x1
5. **Fontes**: Redução de 16px para 14px

### Touch Targets
- Botões com pelo menos 44px de altura
- Espaçamento adequado entre elementos clicáveis
- Hover effects substituídos por active states

## 🎨 Guia de Estilo Visual

### Bordas e Raios
- **Cards principais**: `rounded-2xl` (16px)
- **Botões**: `rounded-lg` (8px)
- **Imagens circulares**: `rounded-full`

### Sombras
- **Cards**: `shadow-xl`
- **Botões**: `shadow-lg`
- **Elementos flutuantes**: `drop-shadow-2xl`

### Decorações
- **Ondas**: SVG paths customizados
- **Gradientes**: Sutis, mostly radial
- **Texturas**: Overlays com opacity

## 🔄 Futuras Implementações

### Backend (Não implementado nesta versão)
- Autenticação via Google
- Salvamento de versículos favoritos
- Histórico de leituras
- Compartilhamento social

### Features Planejadas
- Notificações de dias santos
- Calendário litúrgico completo
- Orações diárias
- Comunidade de usuários

## 📝 Notas de Desenvolvimento

### CSS Architecture
- **Tailwind CSS v4**: Utility-first
- **CSS Modules**: Para estilos customizados
- **Custom Properties**: Para cores litúrgicas dinâmicas

### React Components
- **Functional Components**: Apenas hooks
- **TypeScript**: Tipagem completa
- **Props Interface**: Para cada componente

### File Structure
```
src/
  app/
    components/
      Header.tsx
      HeroBanner.tsx
      FeatureCard.tsx
      GospelCard.tsx
      VerseOrganizerIcon.tsx
      EasterBanner.tsx
      AboutSection.tsx
      LiturgicalFooter.tsx
    App.tsx
  styles/
    fonts.css
    theme.css
    custom.css
```

## 🙏 Inspiração

O design é inspirado em:
- Estética católica tradicional
- Modernidade de São Carlo Acutis
- Paleta de cores litúrgicas
- UI/UX acessível e intuitiva

---

**Desenvolvido com fé e dedicação para evangelização digital** 🙏✨
