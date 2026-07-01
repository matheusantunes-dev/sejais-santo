# Arquitetura da Bíblia

## Modelo Relacional

```
bible_versions (1) ──→ bible_books (N) ──→ bible_chapters (N) ──→ bible_verses (N)
```

### bible_versions
Preparado para múltiplas traduções. Atualmente apenas `ave-maria` (Ave-Maria, português).

### bible_books
73 livros (46 AT + 27 NT), com slug em português para URLs amigáveis.

### bible_chapters
1.334 capítulos no total, com `verses_count` para paginação.

### bible_verses
35.450 versículos com:
- `search_vector` (TSVECTOR generated) para Full Text Search em português
- Índice GIN para busca eficiente
- FK referenciando book e chapter para joins rápidos

### vw_bible_verses (view)
View materializada que junta verse + chapter + book, usada nas consultas frequentes.

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/bible/books` | Lista todos os livros (opcional `?testament=AT\|NT`) |
| GET | `/api/bible/{slug}/{chapter}` | Capítulo completo com navegação prev/next |
| GET | `/api/bible/{slug}/{chapter}/{verse}` | Versículo individual |
| GET | `/api/bible/search?q=...` | Busca unificada (referência + FTS) |

---

## Parser de Referência Bíblica

Localizado em `backend/api/bible_search.py`, o parser decide se uma query é
uma referência bíblica ou texto livre para Full Text Search.

### Gramática Formal

```
REFERENCIA  ::= LIVRO [ESPACO CAPITULO] [SEP VERSICULO] [RANGE VERSICULO] [ESPACO TEXTO]
LIVRO       ::= DIGITO? ESPACO? PALAVRA+
CAPITULO    ::= DIGITO+
VERSICULO   ::= DIGITO+ (LETRA)?
RANGE       ::= SEP_VERSICULO [-–—] VERSICULO
SEP         ::= [:,，]  (dois-pontos ou vírgula, ASCII ou fullwidth)
ESPACO      ::= \s+
TEXTO       ::= .+   (qualquer texto adicional, cai em busca restrita)

DIGITO      ::= [0-9]
LETRA       ::= [a-z]
PALAVRA     ::= [A-Za-záéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]*
```

### Exemplos Aceitos

| Entrada | Livro | Cap. | Vers. | Range | Texto extra |
|---------|-------|------|-------|-------|-------------|
| `Jo 3` | João | 3 | — | — | — |
| `Jo 3,16` | João | 3 | 16 | — | — |
| `Jo 3:16` | João | 3 | 16 | — | — |
| `Jo 3,16-18` | João | 3 | 16 | 18 | — |
| `1Cor 13` | 1 Coríntios | 13 | — | — | — |
| `1Cor 13,1-13` | 1 Coríntios | 13 | 1 | 13 | — |
| `1 Cor 13,1-13` | 1 Coríntios | 13 | 1 | 13 | — |
| `1Coríntios 13` | 1 Coríntios | 13 | — | — | — |
| `1 Coríntios 13` | 1 Coríntios | 13 | — | — | — |
| `Cânticos 2,1` | Cântico dos Cânticos | 2 | 1 | — | — |
| `Ct 2,1` | Cântico dos Cânticos | 2 | 1 | — | — |
| `Ap 21` | Apocalipse | 21 | — | — | — |
| `Ap 21,1-5` | Apocalipse | 21 | 1 | 5 | — |
| `Gn 1` | Gênesis | 1 | — | — | — |
| `Gn 1,1` | Gênesis | 1 | 1 | — | — |
| `Sl 23` | Salmos | 23 | — | — | — |
| `Salmo 23` | Salmos | 23 | — | — | — |
| `Salmos 23` | Salmos | 23 | — | — | — |
| `Eclo 2,1` | Eclesiástico (Sir) | 2 | 1 | — | — |
| `Sb 3,1` | Sabedoria | 3 | 1 | — | — |
| `Fl 4,13` | Filipenses | 4 | 13 | — | — |
| `Fil 4,13` | Filipenses | 4 | 13 | — | — |
| `Jo 3,16 Deus é amor` | João | 3 | 16 | — | `Deus é amor` |

### Quando cai em Full Text Search

Uma query **não** é considerada referência quando:

1. **Apenas nome do livro, sem capítulo:** `Gênesis`, `Mateus`, `João`
2. **Texto livre sem estrutura de referência:** `amor de Deus`, `fé`, `esperança`
3. **Nome de livro não reconhecido:** `abc123`, `xyz`
4. **String vazia ou apenas pontuação:** ``, `3,16` (sem livro)

Nestes casos, `parse_reference()` retorna `None` e `search_verses()` encaminha
para `_search_fts()` — Full Text Search em toda a Bíblia via índice GIN.

### Resolução de Nomes de Livros

O parser usa três fontes em ordem de precedência:

1. **ABBREV_MAP** — ~45 abreviações curtas (`gn`, `mt`, `jo`, `1cor`...).
   Apenas estas disparam o modo "book-only" (lista de capítulos) quando
   usadas sem capítulo/versículo.
2. **FULLNAME_MAP** — ~80 nomes completos e aliases (`gênesis`, `salmos`,
   `eclo`, `fil`, `1coríntios`...). Resolvem o slug para referências, mas
   **não** disparam book-only quando usados sem capítulo (caem em FTS).
3. **Banco de dados** (fallback) — consulta `bible_books` via `ILIKE`.
   Captura variações ortográficas não mapeadas.

### Algoritmo de Decisão (search_verses)

```python
1. parse_reference(query)
   ├── Se regex casa + livro reconhecido + capítulo → referência
   │   ├── Sem texto extra → _search_by_reference()  (lookup direto)
   │   └── Com texto extra → _search_restricted()    (FTS no capítulo)
   └── Senão → None

2. Se query está em ABBREV_MAP (abreviação curta, sem capítulo)
   → Retorna lista de capítulos do livro (book-only)

3. Senão → _search_fts() (Full Text Search em toda a Bíblia)
```

### Benchmark de Desempenho (Parser apenas, sem DB)

Testes executados com 10.000 iterações por query em Python 3.11.

| Cenário | Queries | Operações | Tempo total | Média |
|---------|---------|-----------|-------------|-------|
| `parse_reference` — referências válidas | 10 | 100.000 | 6,18 s | **61,83 µs/op** |
| `parse_reference` — FTS fallback | 8 | 80.000 | 4,08 s | **50,97 µs/op** |
| `search_verses` — roteamento completo* | 18 | 36.000 | 42,10 s | **1,17 ms/op** |

*Inclui overhead da cadeia de mocks do Supabase. Em produção o gargalo será a
latência da rede/banco, não o parser.

**Conclusão:** O parser puro processa ~16.000 referências por segundo
(~62 µs cada). O custo é dominado pela regex e pela resolução do nome do
livro no dicionário — ambos O(1) e sem IO.

---

## Full Text Search

### Índice
```sql
CREATE INDEX idx_bible_verses_fts ON bible_verses USING GIN (search_vector);
```

Coluna `search_vector` é `TSVECTOR` generated sempre como:
```sql
to_tsvector('portuguese', text)
```

### Tipos de consulta suportados

| Tipo | Exemplo | Comportamento |
|------|---------|---------------|
| Referência exata | `Jo 3:16` | Lookup direto por book_slug + chapter + verse |
| Referência range | `Gn 1,1-5` | Lookup com range de versículos |
| Referência + texto | `Jo 3,16 Deus` | FTS restrito ao capítulo |
| Book-only (abrev. curta) | `gn` | Lista capítulos do livro |
| Abrev. curta + capítulo | `Gn 1` | Lookup por capítulo |
| Nome completo s/ capítulo | `Gênesis` | FTS em toda a Bíblia (NÃO book-only) |
| Texto livre | `amor de Deus` | FTS em toda a Bíblia, ordenado por relevância |

### Performance esperada (DB queries)
- Referência exata: < 5ms (índice B-Tree único)
- FTS simples: < 50ms (índice GIN)
- FTS com termo raro: < 20ms
- 35k registros cabem em ~10 MB (2% do free tier Supabase)

### Performance do parser (Python, sem IO)
- parse_reference (referência): ~62 µs/op (~16k ops/s)
- parse_reference (FTS fallback): ~51 µs/op (~20k ops/s)
- search_verses routing: ~1,17 ms/op (~855 ops/s)
  *O roteamento inclui overhead de chamadas mockadas. Em produção o gargalo
  será a latência de rede/banco, não o parser.*

---

## Plano de Remoção da bible-api.com

### Fase 1 (Sprint 4.1) — ✅ Atual
- Schema relacional criado e populado
- `bible_cache` mantido como legado (não usado nas novas rotas)
- Novo router `/api/bible/` implementado
- Frontend compatível com ambas as fontes via feature flag `BIBLE_CACHE`

### Fase 2 (Sprint 5) — Remoção
- Remover `bible_cache.py` e `sql/create_bible_cache_table.sql`
- Remover `bible_cache` table do Supabase
- Remover feature flag `BIBLE_CACHE` (tornar sempre true)
- Remover referências à `bible-api.com` no frontend
- Remover `requests` do endpoint de Bible (se não usado em mais nada)

### Gatilho para remoção
- ✅ Nova schema populado e validado
- ✅ FTS funcionando
- ⬜ Testes de latência comparativa concluídos
- ⬜ Período de estabilização (1 sprint)

---

## Latência Comparativa

| Operação | bible-api.com | Schema local | Ganho |
|----------|---------------|--------------|-------|
| Capítulo (Jo 3) | ~200-400ms (rede) | < 10ms (índice) | 20-40x |
| Capítulo (Sl 119) | ~400-800ms | < 15ms | 26-53x |
| Busca texto "amor" | N/A | ~30ms | — |
| Referência exata | N/A | < 5ms | — |

*Medições aproximadas. A latência da bible-api.com depende da rede e disponibilidade do serviço.*

---

## Funcionalidades futuras desbloqueadas

- Favoritos por usuário (user_id + verse_id)
- Histórico de leitura
- Notas e anotações
- Planos de leitura
- Múltiplas traduções lado a lado
- Estudos bíblicos vinculados
- API de referência para o lecionário
