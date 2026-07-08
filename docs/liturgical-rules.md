# Motor Litúrgico — Regras de Cor e Precedência

## Arquitetura

O motor litúrgico reside em dois módulos Python no backend:

```
backend/api/
├── liturgical_lib.py       # Cálculo do calendário litúrgico
└── saints_calendar.py      # Calendário dos santos + metadados litúrgicos
```

### Fluxo de resolução (`resolve_liturgical_day()`)

```
data → liturgical_start_year() → _identify_celebration()
            ↓                        ↓
         ciclo A/B/C            (key, season, week)
            ↓                        ↓
         _color_for_key()       rank do LITURGICAL_DAYS
            ↓                        ↓
    cor base + rank         → se rank < "memoria" (3)
                                ↓
                         get_saint_for_date()
                            ↓ se santo com rank ≥ "memoria"
                         → cor do santo sobrescreve
```

### Hierarquia de precedência (`_RANK_ORDER`)

```
6  solemnity       — Solenidade (Sempre vence)
5  sunday           — Domingo
4  feast            — Festa
3  memoria          — Memória obrigatória
2  optional_memoria — Memória facultativa (NÃO substitui ferial)
1  ferial           — Dia de semana comum
```

Um santo só substitui a cor do dia se:

- O **rank do dia** for ferial (1) ou optional_memoria (2)
- **E** o **rank do santo** for ≥ memoria (3)

## Categorias de Santos e Cores

### Mapeamento automático (`_SAINT_TYPE_COLOR`)

| Type       | Cor       |
|------------|-----------|
| `martyr`   | vermelho  |
| `apostle`  | vermelho  |
| `evangelist` | vermelho |
| `saint` (padrão) | branco |

### Exceções (`color_override`)

| Data       | Santo                  | Type     | Cor       | Motivo                                         |
|------------|------------------------|----------|-----------|------------------------------------------------|
| 01-25      | Conversão de São Paulo | apostle  | **branco** | Festa da conversão, não martírio               |
| 02-22      | Cátedra de São Pedro   | apostle  | **branco** | Festa do ministério petrino, não martírio      |
| 12-27      | São João Evangelista   | apostle  | **branco** | Apóstolo não mártir (único dos 12)             |

### Santos com rank especial

| Data       | Santo                  | Rank especial          | Fonte                                                                 |
|------------|------------------------|------------------------|-----------------------------------------------------------------------|
| 07-22      | Maria Madalena         | **feast**              | Carta Apost. "Apostolorum Apostola" (2016), Prot. 190/16             |
| 07-29      | Marta, Maria e Lázaro  | memoria (padrão)       | Prot. 35/21 (26 Jan 2021) — DECRETO declara MEMORIAL (não festa)     |
| 01-17      | Antônio Abade          | optional_memoria       | Calendário Romano Geral                                               |
| 03-17      | São Patrício           | optional_memoria       | Calendário Romano Geral                                               |
| 04-23      | São Jorge              | optional_memoria       | Calendário Romano Geral                                               |
| 12-06      | São Nicolau            | optional_memoria       | Calendário Romano Geral                                               |
| 10-22      | São João Paulo II      | optional_memoria       | Calendário Romano Geral                                               |

## Fases Implementadas

### Fase 1 — Correções de cor (concluída)

- Domingo de Ramos → VERMELHO
- Sexta-feira Santa (GOOD_FRIDAY) → VERMELHO
- Corpus Christi → BRANCO
- Nossa Senhora Aparecida → BRANCO
- Exaltação da Santa Cruz → VERMELHO

### Fase 2 — Rosa, Preto, Santos (concluída, exceto Preto)

- Gaudete (3º Advento) → ROSA
- Laetare (4º Quaresma) → ROSA
- Rank-based saint integration
- `_RANK_ORDER` hierarchy
- `get_saint_for_date()` with enriched metadata
- Auditoria de 7 anos (2020-2026): 480 mudanças de cor identificadas
- 29 rank removidos por optional_memoria incorreto

## Fases Futuras

### Preto (Finados)

- Bloqueado: frontend não possui suporte a "preto"
- Necessário: CSS token → COLOR_TO_SEASON → paleta → LiturgicalSeason type
- Tarefa separada, fora do escopo do motor litúrgico

### Precedência completa (IGMR — Tabela de Precedência)

- Implementar tabela completa conforme Institutio Generalis Missalis Romani
- Solenidades do Senhor > Solenidades da Virgem > Solenidades dos Santos > ...
- Domingo > Festa > Memória > Ferial
- Atualmente: resolvido parcialmente via `_RANK_ORDER`

### Calendários nacionais e locais

- Brasil: padroeiros, feriados religiosos (Aparecida já implementada)
- Dioceses: santos locais
- Atualmente: `scope` field exists but not used

### Metadados de santos

- `rank_override` (field exists, not used)
- `metadata` dict (field exists, empty)
- Slug, icon, banner for saint pages

## Como adicionar um santo

1. Adicionar em `CALENDAR` com `name`, `icon`, `desc`
2. Adicionar em `SAINT_METADATA` APENAS se diferir dos defaults:
   - `{"type": "saint", "rank": "memoria", "scope": "universal"}`
3. Para mártires: `{"type": "martyr"}`
4. Para apóstolos: `{"type": "apostle", "rank": "feast"}`
5. Para exceções de cor: `{"type": "...", "color_override": "branco"}`
6. Rodar regressão: `python -m tests.test_liturgical_regression`
7. Verificar diff na tabela gerada
