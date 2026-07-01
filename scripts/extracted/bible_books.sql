--
-- PostgreSQL database dump
--

\restrict 3Mrs1z0sF9uhZeyWS0P9XAzNib8M3WnJsCIrVHhUCPSpanhDeiyHAOdBiQtizeN

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: bible_books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bible_books (id, testament, abbreviation, slug, name, "position", chapters_count, created_at, updated_at) FROM stdin;
1	AT	Gn	genesis	Gênesis	1	50	2026-06-13 17:13:16	2026-06-14 16:12:38
2	AT	Ex	exodo	Êxodo	2	40	2026-06-13 17:13:16	2026-06-14 16:12:38
3	AT	Lv	levitico	Levítico	3	27	2026-06-13 17:13:16	2026-06-14 16:12:38
4	AT	Nm	numeros	Números	4	36	2026-06-13 17:13:16	2026-06-14 16:12:38
5	AT	Dt	deuteronomio	Deuteronômio	5	34	2026-06-13 17:13:16	2026-06-14 16:12:38
6	AT	Js	josue	Josué	6	24	2026-06-13 17:13:16	2026-06-14 16:12:39
7	AT	Jz	juizes	Juízes	7	21	2026-06-13 17:13:16	2026-06-14 16:12:39
8	AT	Rt	rute	Rute	8	4	2026-06-13 17:13:16	2026-06-14 16:12:39
9	AT	1Sm	1-samuel	1 Samuel	9	31	2026-06-13 17:13:16	2026-06-14 16:12:39
10	AT	2Sm	2-samuel	2 Samuel	10	24	2026-06-13 17:13:16	2026-06-14 16:12:39
11	AT	1Rs	1-reis	1 Reis	11	22	2026-06-13 17:13:16	2026-06-14 16:12:39
12	AT	2Rs	2-reis	2 Reis	12	25	2026-06-13 17:13:16	2026-06-14 16:12:39
13	AT	1Cr	1-cronicas	1 Crônicas	13	29	2026-06-13 17:13:16	2026-06-14 16:12:39
14	AT	2Cr	2-cronicas	2 Crônicas	14	36	2026-06-13 17:13:16	2026-06-14 16:12:39
15	AT	Ed	esdras	Esdras	15	10	2026-06-13 17:13:16	2026-06-14 16:12:39
16	AT	Ne	neemias	Neemias	16	13	2026-06-13 17:13:16	2026-06-14 16:12:39
17	AT	Tb	tobias	Tobias	17	14	2026-06-13 17:13:16	2026-06-14 16:12:39
18	AT	Jt	judite	Judite	18	16	2026-06-13 17:13:16	2026-06-14 16:12:39
19	AT	Est	ester	Ester	19	16	2026-06-13 17:13:16	2026-06-14 16:12:39
20	AT	1Mc	1-macabeus	1 Macabeus	20	42	2026-06-13 17:13:16	2026-06-14 16:12:39
21	AT	2Mc	2-macabeus	2 Macabeus	21	150	2026-06-13 17:13:16	2026-06-14 16:12:39
22	AT	Jó	job	Jó	22	16	2026-06-13 17:13:16	2026-06-14 16:12:40
23	AT	Sl	salmos	Salmos	23	15	2026-06-13 17:13:16	2026-06-14 16:12:40
24	AT	Pr	proverbios	Provérbios	24	31	2026-06-13 17:13:16	2026-06-14 16:12:40
25	AT	Ecl	eclesiastes	Eclesiastes	25	12	2026-06-13 17:13:16	2026-06-14 16:12:40
26	AT	Ct	cantico	Cântico dos Cânticos	26	8	2026-06-13 17:13:16	2026-06-14 16:12:40
27	AT	Sb	sabedoria	Sabedoria	27	19	2026-06-13 17:13:16	2026-06-14 16:12:40
28	AT	Sir	eclesiastico	Eclesiástico	28	51	2026-06-13 17:13:16	2026-06-14 16:12:40
29	AT	Is	isaias	Isaías	29	66	2026-06-13 17:13:16	2026-06-14 16:12:40
30	AT	Jr	jeremias	Jeremias	30	52	2026-06-13 17:13:16	2026-06-14 16:12:40
31	AT	Lm	lamentacoes	Lamentações	31	5	2026-06-13 17:13:16	2026-06-14 16:12:41
32	AT	Bar	baruc	Baruc	32	6	2026-06-13 17:13:16	2026-06-14 16:12:41
33	AT	Ez	ezequiel	Ezequiel	33	48	2026-06-13 17:13:16	2026-06-14 16:12:41
34	AT	Dn	daniel	Daniel	34	14	2026-06-13 17:13:16	2026-06-14 16:12:41
35	AT	Os	oseias	Oséias	35	14	2026-06-13 17:13:16	2026-06-14 16:12:41
36	AT	Jl	joel	Joel	36	4	2026-06-13 17:13:16	2026-06-14 16:12:41
37	AT	Am	amos	Amós	37	9	2026-06-13 17:13:16	2026-06-14 16:12:41
38	AT	Ab	abdias	Abdias	38	1	2026-06-13 17:13:16	2026-06-14 16:12:41
39	AT	Jn	jonas	Jonas	39	4	2026-06-13 17:13:16	2026-06-14 16:12:41
40	AT	Mq	miqueias	Miquéias	40	7	2026-06-13 17:13:16	2026-06-14 16:12:41
41	AT	Na	naum	Naum	41	3	2026-06-13 17:13:16	2026-06-14 16:12:41
42	AT	Hc	habacuque	Habacuque	42	3	2026-06-13 17:13:16	2026-06-14 16:12:41
43	AT	Sf	sofonias	Sofonias	43	3	2026-06-13 17:13:16	2026-06-14 16:12:41
44	AT	Ag	ageu	Ageu	44	2	2026-06-13 17:13:16	2026-06-14 16:12:41
45	AT	Zc	zacarias	Zacarias	45	14	2026-06-13 17:13:16	2026-06-14 16:12:41
46	AT	Ml	malaquias	Malaquias	46	3	2026-06-13 17:13:16	2026-06-14 16:12:41
47	NT	Mt	mateus	Mateus	47	28	2026-06-13 17:13:16	2026-06-14 16:12:41
48	NT	Mc	marcos	Marcos	48	16	2026-06-13 17:13:16	2026-06-14 16:12:41
49	NT	Lc	lucas	Lucas	49	24	2026-06-13 17:13:16	2026-06-14 16:12:41
50	NT	Jo	joao	João	50	21	2026-06-13 17:13:16	2026-06-14 16:12:41
51	NT	At	atos	Atos dos Apóstolos	51	28	2026-06-13 17:13:16	2026-06-14 16:12:42
52	NT	Rm	romanos	Romanos	52	16	2026-06-13 17:13:16	2026-06-14 16:12:42
53	NT	1Cor	1-corintios	1 Coríntios	53	16	2026-06-13 17:13:16	2026-06-14 16:12:42
54	NT	2Cor	2-corintios	2 Coríntios	54	13	2026-06-13 17:13:16	2026-06-14 16:12:42
55	NT	Gl	galatas	Gálatas	55	6	2026-06-13 17:13:16	2026-06-14 16:12:42
56	NT	Ef	efesios	Efésios	56	6	2026-06-13 17:13:16	2026-06-14 16:12:42
57	NT	Fl	filipenses	Filipenses	57	4	2026-06-13 17:13:16	2026-06-14 16:12:42
58	NT	Cl	colossenses	Colossenses	58	4	2026-06-13 17:13:16	2026-06-14 16:12:42
59	NT	1Ts	1-tessalonicenses	1 Tessalonicenses	59	5	2026-06-13 17:13:16	2026-06-14 16:12:42
60	NT	2Ts	2-tessalonicenses	2 Tessalonicenses	60	3	2026-06-13 17:13:16	2026-06-14 16:12:42
61	NT	1Tm	1-timoteo	1 Timóteo	61	6	2026-06-13 17:13:16	2026-06-14 16:12:42
62	NT	2Tm	2-timoteo	2 Timóteo	62	4	2026-06-13 17:13:16	2026-06-14 16:12:42
63	NT	Tt	tito	Tito	63	3	2026-06-13 17:13:16	2026-06-14 16:12:42
64	NT	Fm	filemom	Filemom	64	1	2026-06-13 17:13:16	2026-06-14 16:12:42
65	NT	Hb	hebreus	Hebreus	65	13	2026-06-13 17:13:16	2026-06-14 16:12:42
66	NT	Tg	tiago	Tiago	66	5	2026-06-13 17:13:16	2026-06-14 16:12:42
67	NT	1Pd	1-pedro	1 Pedro	67	5	2026-06-13 17:13:16	2026-06-14 16:12:42
68	NT	2Pd	2-pedro	2 Pedro	68	3	2026-06-13 17:13:16	2026-06-14 16:12:42
69	NT	1Jo	1-joao	1 João	69	5	2026-06-13 17:13:16	2026-06-14 16:12:42
70	NT	2Jo	2-joao	2 João	70	1	2026-06-13 17:13:16	2026-06-14 16:12:42
71	NT	3Jo	3-joao	3 João	71	1	2026-06-13 17:13:16	2026-06-14 16:12:42
72	NT	Jd	judas	Judas	72	1	2026-06-13 17:13:16	2026-06-14 16:12:42
73	NT	Ap	apocalipse	Apocalipse	73	22	2026-06-13 17:13:16	2026-06-14 16:12:42
\.


--
-- PostgreSQL database dump complete
--

\unrestrict 3Mrs1z0sF9uhZeyWS0P9XAzNib8M3WnJsCIrVHhUCPSpanhDeiyHAOdBiQtizeN

