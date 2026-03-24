# 🙏 Sejais Santo - Design Responsivo

> **"Porque Deus é Santo"**

Design completo e responsivo para plataforma de evangelização católica dedicada a São Carlo Acutis.

## 📱 Preview do Design

Este projeto implementa um design moderno e religioso baseado em uma abordagem **Mobile First**, totalmente responsivo para dispositivos móveis, tablets e desktop.

## ✨ Características Principais

### 🎨 Sistema de Temas Litúrgicos
O site adapta automaticamente suas cores baseado no calendário litúrgico católico:

- **🔴 Padrão (São Carlo Acutis)**: Vermelho (#b71c1c)
- **🟣 Advento/Quaresma**: Roxo (#7b2cbf)
- **🟢 Tempo Comum**: Verde (#2d6a4f)
- **🟠 Tempo Pascal**: Laranja/Vermelho (#dc2f02)
- **🟡 Natal**: Dourado (#d4af37)

### 📱 Responsividade Completa
- **Mobile**: < 768px (padrão)
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

### 🧩 Componentes Implementados

1. **Header**
   - Logo "Sejais Santo"
   - Botão de Login com Google
   - Decoração ondulada
   - Cor adaptável ao tempo litúrgico

2. **Banner do Herói**
   - Imagem de São Carlo Acutis
   - Background gradiente com textura
   - Layout adaptável

3. **Cards de Funcionalidades** (3)
   - 📖 **Evangelho do Dia**: Preview com dropdown
   - 📚 **Versículos do Mês**: Sugestões de leitura
   - ❤️ **Organize Versículos**: Sistema de organização

4. **Banner Especial (Páscoa)**
   - Mensagem: "O túmulo está aberto, Ele Ressuscitou!"
   - Imagem de cruz e lírios
   - Ativado durante Tempo Pascal

5. **Seção "Quem Foi São Carlo Acutis?"**
   - Biografia resumida
   - Imagem circular
   - Botão "Saiba Mais"

6. **Footer Litúrgico**
   - Indicador do tempo atual
   - Grid com 4 tempos litúrgicos
   - Efeitos de hover

7. **Navegação Mobile**
   - Menu hamburguer
   - Navegação por âncoras
   - Animações suaves

8. **Componentes Extras**
   - Seletor de tema (demonstração)
   - Botão "Voltar ao topo"
   - Scroll suave

## 🛠️ Tecnologias Utilizadas

- **React 18.3**: Framework principal
- **TypeScript**: Tipagem estática
- **Tailwind CSS v4**: Estilização utility-first
- **Lucide React**: Ícones modernos
- **CSS Custom Properties**: Temas dinâmicos

## 🎯 Estrutura de Arquivos

```
src/
├── app/
│   ├── components/
│   │   ├── Header.tsx                 # Cabeçalho com login
│   │   ├── HeroBanner.tsx            # Banner principal
│   │   ├── FeatureCard.tsx           # Card reutilizável
│   │   ├── GospelCard.tsx            # Card do evangelho
│   │   ├── VerseOrganizerIcon.tsx    # Ícone SVG customizado
│   │   ├── EasterBanner.tsx          # Banner de Páscoa
│   │   ├── AboutSection.tsx          # Seção sobre São Carlo
│   │   ├── LiturgicalFooter.tsx      # Rodapé litúrgico
│   │   ├── ThemeSwitcher.tsx         # Seletor de tema
│   │   ├── MobileNav.tsx             # Navegação mobile
│   │   └── ScrollToTop.tsx           # Botão scroll to top
│   └── App.tsx                        # Componente principal
└── styles/
    ├── fonts.css                      # Importação de fontes
    ├── theme.css                      # Tema Tailwind
    └── custom.css                     # Estilos customizados
```

## 🎨 Design System

### Tipografia
- **Títulos**: Playfair Display (Serif elegante)
- **Corpo**: Inter (Sans-serif moderna)

### Cores Secundárias
- **Background**: #f5f5dc (Beige claro)
- **Acentos**: Âmbar e dourado
- **Texto**: Gray-800

### Espaçamento
- Mobile: padding 4 (16px)
- Desktop: padding 8 (32px)
- Gaps: 6-8 (24-32px)

### Animações
- Transições de cores: 0.5s ease-in-out
- Hover effects: 0.3s ease
- Scroll suave: behavior: smooth

## 🚀 Como Usar

### Mudança de Tema Litúrgico
```typescript
// No código
const [currentSeason, setCurrentSeason] = useState('default');

// Ou use o botão flutuante no canto inferior direito
```

### Compartilhamento
Todos os cards possuem botão de compartilhamento que usa a Web Share API quando disponível.

### Navegação
- **Desktop**: Scroll tradicional
- **Mobile**: Menu hamburguer no canto superior esquerdo

## 📋 Funcionalidades Demonstradas

✅ Layout responsivo sem quebras  
✅ Temas litúrgicos dinâmicos  
✅ Animações suaves  
✅ Navegação mobile otimizada  
✅ Componentes reutilizáveis  
✅ Acessibilidade básica  
✅ Performance otimizada  
✅ Mobile-first design  

## 🎭 Demonstração de Temas

Use o botão de calendário (📅) no canto inferior direito para experimentar diferentes tempos litúrgicos e ver as cores mudarem em tempo real.

### Exemplo de mudança de tema:
1. Clique no botão de calendário
2. Selecione "Tempo Pascal"
3. Observe:
   - Cores mudam para laranja/vermelho
   - Banner de Páscoa aparece
   - Footer atualiza o indicador

## 📐 Breakpoints

```css
/* Mobile (padrão) */
< 768px

/* Tablet */
md: 768px - 1023px

/* Desktop */
lg: ≥ 1024px
```

## 🎨 Paleta de Cores Completa

```css
/* Tempos Litúrgicos */
--liturgical-default: #b71c1c;    /* São Carlo Acutis */
--liturgical-advent: #7b2cbf;     /* Advento */
--liturgical-lent: #7b2cbf;       /* Quaresma */
--liturgical-easter: #dc2f02;     /* Páscoa */
--liturgical-ordinary: #2d6a4f;   /* Tempo Comum */
--liturgical-christmas: #d4af37;  /* Natal */

/* Cores Base */
--background: #f5f5dc;            /* Beige */
--accent-amber: #f59e0b;          /* Âmbar */
--text-dark: #1f2937;             /* Gray-800 */
```

## 🔄 Estados Especiais

### Páscoa
```typescript
showEasterBanner: true
currentSeason: 'easter'
```
- Banner especial aparece
- Mensagem: "O túmulo está aberto, Ele Ressuscitou!"
- Cruz e lírios decorativos

### Advento/Quaresma
- Tom roxo predominante
- Atmosfera mais sóbria e reflexiva

### Natal
- Cor dourada
- Celebração do nascimento

## 🙏 Sobre São Carlo Acutis

Carlo Acutis (1991-2006) foi um jovem italiano beatificado pela Igreja Católica em 2020. 

**Por que ele é o patrono deste site?**
- 💻 Apaixonado por tecnologia
- 🌐 Usou a internet para evangelizar
- ⚡ Criou site sobre milagres eucarísticos
- 🎯 Exemplo de santidade moderna
- 👦 Patrono dos jovens e da internet

## 📱 Otimizações Mobile

1. **Touch Targets**: Mínimo 44px de altura
2. **Navegação**: Menu hamburguer acessível
3. **Fontes**: Redução automática em telas pequenas
4. **Imagens**: Lazy loading e aspect ratios fixos
5. **Performance**: CSS otimizado

## 🎯 Próximos Passos (Não Implementados)

Estas funcionalidades foram planejadas mas não implementadas nesta versão de design:

- [ ] Integração com backend
- [ ] Login real com Google
- [ ] Salvamento de versículos favoritos
- [ ] Calendário litúrgico completo
- [ ] Notificações de dias santos
- [ ] Compartilhamento em redes sociais
- [ ] Sistema de comentários
- [ ] Orações diárias
- [ ] Modo escuro
- [ ] Múltiplos idiomas

## 🔧 Requisitos Técnicos Atendidos

✅ React.js + CSS  
✅ Mobile First  
✅ Responsividade (Mobile, Tablet, Desktop)  
✅ Layout que não quebra  
✅ Telas com iframe do evangelho + botão compartilhar  
✅ Tela de organização de versículos  
✅ Tela de sugestão de versículos  
✅ Topbar e estilo variam com calendário litúrgico  
✅ Tema de São Carlos Acutis (vermelho e branco)  
✅ Fotos e sessão sobre São Carlos Acutis  

## 📝 Notas de Implementação

### Não Implementado (Requer Backend)
- Sistema de login real
- Banco de dados
- Salvamento de dados do usuário

### Implementado (Frontend)
- Design completo
- Temas litúrgicos
- Responsividade
- Componentes reutilizáveis
- Animações e transições

## 🌟 Destaques do Design

1. **Fidelidade ao Design Original**: Baseado 100% na imagem fornecida
2. **Acessibilidade**: Contraste adequado, estrutura semântica
3. **Performance**: Otimizado para carregamento rápido
4. **Manutenibilidade**: Código organizado e componentizado
5. **Escalabilidade**: Fácil adicionar novas funcionalidades

## 💡 Inspiração

O design combina:
- ⛪ Estética católica tradicional
- 💻 Modernidade digital de São Carlo
- 🎨 Paleta litúrgica da Igreja
- 🚀 UI/UX moderna e acessível

## 📞 Contato

Este é um projeto de design demonstrativo para fins educacionais e de evangelização.

---

**Desenvolvido com fé e dedicação** 🙏✨

*"Todos nascemos como originais, mas muitos morrem como fotocópias."*  
— São Carlo Acutis
