from datetime import date, timedelta
from typing import List, Optional

# =====================================================================
# SAINTS CALENDAR — port of Laravel SaintsCalendar.php
#
# 90+ saint entries organized by month-day (MM-DD).
# Each entry has name, icon (emoji), and description.
# =====================================================================

CALENDAR: dict[str, dict] = {
    # Janeiro
    "01-01": {"name": "Santa Maria, Mãe de Deus", "icon": "👑", "desc": "Solenidade — Dia Mundial da Paz"},
    "01-06": {"name": "Epifania do Senhor", "icon": "⭐", "desc": "Manifestação de Jesus aos Magos do Oriente"},
    "01-13": {"name": "Batismo do Senhor", "icon": "🕊", "desc": "Solenidade do Batismo de Jesus no rio Jordão"},
    "01-17": {"name": "Santo Antônio Abade", "icon": "✝", "desc": "Pai do monaquismo cristão — séc. III"},
    "01-21": {"name": "Santa Inês", "icon": "🌹", "desc": "Mártir romana do século IV"},
    "01-24": {"name": "São Francisco de Sales", "icon": "✒", "desc": "Bispo e Doutor da Igreja, padroeiro dos escritores"},
    "01-25": {"name": "Conversão de São Paulo", "icon": "💡", "desc": "Festa da conversão do Apóstolo no caminho de Damasco"},
    "01-28": {"name": "Santo Tomás de Aquino", "icon": "📚", "desc": "Doutor da Igreja, Patrono das universidades"},
    # Fevereiro
    "02-02": {"name": "Apresentação do Senhor", "icon": "🕯", "desc": "Jesus apresentado no Templo — Dia da Vida Consagrada"},
    "02-05": {"name": "Santa Águeda", "icon": "🌸", "desc": "Mártir siciliana do séc. III"},
    "02-11": {"name": "Nossa Senhora de Lourdes", "icon": "💧", "desc": "Aparição a Santa Bernadete em Lourdes, França (1858)"},
    "02-14": {"name": "Santos Cirilo e Metódio", "icon": "📖", "desc": "Irmãos evangelizadores dos eslavos — padroeiros da Europa"},
    "02-22": {"name": "Cátedra de São Pedro", "icon": "🪑", "desc": "Missão de Pedro como pedra e fundamento da Igreja"},
    # Março
    "03-04": {"name": "São Casimiro", "icon": "👑", "desc": "Príncipe polonês, padroeiro da Polônia e Lituânia"},
    "03-07": {"name": "Santas Perpétua e Felicidade", "icon": "🌿", "desc": "Mártires de Cartago do séc. III"},
    "03-17": {"name": "São Patrício", "icon": "☘", "desc": "Apóstolo e patrono da Irlanda — séc. V"},
    "03-19": {"name": "São José", "icon": "🪚", "desc": "Esposo de Maria, pai adotivo de Jesus — Patrono da Igreja Universal"},
    "03-25": {"name": "Anunciação do Senhor", "icon": "🕊", "desc": "O Anjo Gabriel anuncia a Maria a Encarnação do Verbo"},
    # Abril
    "04-07": {"name": "São João Batista de La Salle", "icon": "🏫", "desc": "Padroeiro dos educadores — fundador dos Irmãos das Escolas Cristãs"},
    "04-23": {"name": "São Jorge", "icon": "⚔", "desc": "Mártir e padroeiro de diversas nações — séc. IV"},
    "04-25": {"name": "São Marcos", "icon": "📖", "desc": "Evangelista e discípulo de São Pedro"},
    "04-29": {"name": "Santa Catarina de Sena", "icon": "✝", "desc": "Doutora da Igreja, padroeira da Itália e Europa"},
    "04-30": {"name": "São Pio V", "icon": "⛪", "desc": "Papa que consolidou o Concílio de Trento"},
    # Maio
    "05-01": {"name": "São José Operário", "icon": "🔨", "desc": "São José padroeiro dos trabalhadores"},
    "05-03": {"name": "Santos Filipe e Tiago", "icon": "✝", "desc": "Apóstolos de Jesus Cristo"},
    "05-13": {"name": "Nossa Senhora de Fátima", "icon": "🌹", "desc": "Aparição a três pastores em Fátima, Portugal (1917)"},
    "05-14": {"name": "São Matias", "icon": "✝", "desc": "Apóstolo escolhido para substituir Judas Iscariotes"},
    "05-22": {"name": "Santa Rita de Cássia", "icon": "🌹", "desc": "Padroeira das causas impossíveis"},
    "05-26": {"name": "São Filipe Néri", "icon": "😊", "desc": "Apóstolo de Roma, o 'Santo da alegria'"},
    "05-31": {"name": "Visitação de Nossa Senhora", "icon": "🤱", "desc": "Maria visita sua prima Isabel, grávida de João Batista"},
    # Junho
    "06-01": {"name": "São Justino", "icon": "📜", "desc": "Primeiro apólogo cristão e mártir — séc. II"},
    "06-05": {"name": "São Bonifácio", "icon": "✝", "desc": "Apóstolo da Alemanha — séc. VIII"},
    "06-11": {"name": "Santo Barnabé", "icon": "✝", "desc": "Apóstolo e companheiro de missão de São Paulo"},
    "06-13": {"name": "Santo Antônio de Pádua", "icon": "📖", "desc": "Doutor da Igreja, taumaturgo, padroeiro do Brasil e Portugal"},
    "06-21": {"name": "São Luís Gonzaga", "icon": "🌟", "desc": "Padroeiro da juventude cristã — séc. XVI"},
    "06-24": {"name": "Natividade de São João Batista", "icon": "🌊", "desc": "Solenidade do nascimento do Precursor do Messias"},
    "06-27": {"name": "Nossa Senhora do Perpétuo Socorro", "icon": "🌹", "desc": "Ícone venerado na Basílica de São Afonso em Roma"},
    "06-28": {"name": "São Ireneu de Lião", "icon": "✝", "desc": "Bispo e Doutor da Igreja — séc. II"},
    "06-29": {"name": "Santos Pedro e Paulo", "icon": "⛵", "desc": "Solenidade dos príncipes dos Apóstolos"},
    # Julho
    "07-03": {"name": "São Tomé", "icon": "✝", "desc": "Apóstolo que tocou as chagas de Jesus Ressuscitado"},
    "07-04": {"name": "Santa Isabel de Portugal", "icon": "🌹", "desc": "Rainha e peacemaker — séc. XIII"},
    "07-11": {"name": "São Bento", "icon": "🏰", "desc": "Pai do Monaquismo Ocidental, padroeiro da Europa"},
    "07-16": {"name": "Nossa Senhora do Carmo", "icon": "🌿", "desc": "Padroeira da Ordem do Carmo"},
    "07-22": {"name": "Santa Maria Madalena", "icon": "🌹", "desc": "A primeira a ver Jesus Ressuscitado — Apóstola dos Apóstolos"},
    "07-25": {"name": "São Tiago Apóstolo", "icon": "⛵", "desc": "Apóstolo, filho de Zebedeu — padroeiro da Espanha"},
    "07-26": {"name": "Santos Joaquim e Ana", "icon": "🙏", "desc": "Pais de Nossa Senhora, avós maternos de Jesus"},
    "07-29": {"name": "Santa Marta, Maria e Lázaro", "icon": "🏡", "desc": "Os amigos de Jesus de Betânia"},
    "07-31": {"name": "Santo Inácio de Loyola", "icon": "⚔", "desc": "Fundador da Companhia de Jesus (Jesuítas) — séc. XVI"},
    # Agosto
    "08-01": {"name": "Santo Afonso de Ligório", "icon": "📚", "desc": "Doutor da Igreja, fundador dos Redentoristas"},
    "08-04": {"name": "São João Maria Vianney", "icon": "⛪", "desc": "Cura d'Ars, padroeiro dos sacerdotes"},
    "08-06": {"name": "Transfiguração do Senhor", "icon": "✨", "desc": "Jesus revelou sua glória divina no Monte Tabor"},
    "08-08": {"name": "São Domingos de Gusmão", "icon": "📿", "desc": "Fundador da Ordem dos Pregadores (Dominicanos)"},
    "08-09": {"name": "Santa Teresa Benedita da Cruz", "icon": "✝", "desc": "Santa Edith Stein — filósofa e mártir carmelita"},
    "08-10": {"name": "São Lourenço", "icon": "🔥", "desc": "Diácono e mártir de Roma — séc. III"},
    "08-11": {"name": "Santa Clara de Assis", "icon": "🌼", "desc": "Fundadora das Clarissas, seguidora de São Francisco"},
    "08-14": {"name": "São Maximiliano Maria Kolbe", "icon": "✝", "desc": "Mártir de Auschwitz que se ofereceu em lugar de outro"},
    "08-15": {"name": "Assunção de Nossa Senhora", "icon": "👑", "desc": "Solenidade da entrada gloriosa de Maria ao Céu em corpo e alma"},
    "08-20": {"name": "São Bernardo de Claraval", "icon": "📚", "desc": "Doutor da Igreja, reformador do monaquismo — séc. XII"},
    "08-22": {"name": "Nossa Senhora Rainha", "icon": "👑", "desc": "Memória de Maria como Rainha do Céu e da Terra"},
    "08-24": {"name": "São Bartolomeu", "icon": "✝", "desc": "Apóstolo de Jesus Cristo"},
    "08-27": {"name": "Santa Mônica", "icon": "🙏", "desc": "Mãe de Santo Agostinho, modelo de perseverança na oração"},
    "08-28": {"name": "Santo Agostinho", "icon": "📚", "desc": "'Nosso coração não sossega enquanto não repousa em Ti'"},
    "08-29": {"name": "Martírio de São João Batista", "icon": "⚔", "desc": "Memória da decapitação do Precursor de Cristo"},
    # Setembro
    "09-03": {"name": "São Gregório Magno", "icon": "🎵", "desc": "Papa e Doutor da Igreja, reformador da liturgia"},
    "09-08": {"name": "Natividade de Nossa Senhora", "icon": "🌸", "desc": "Celebração do nascimento da Virgem Maria"},
    "09-12": {"name": "Santíssimo Nome de Maria", "icon": "✝", "desc": "Memória do Santo Nome de Maria"},
    "09-13": {"name": "São João Crisóstomo", "icon": "🌟", "desc": "Doutor da Igreja, 'Boca de Ouro' — séc. IV"},
    "09-14": {"name": "Exaltação da Santa Cruz", "icon": "✝", "desc": "Festa da Cruz como instrumento de salvação"},
    "09-15": {"name": "Nossa Senhora das Dores", "icon": "💙", "desc": "Memória das dores de Maria junto à Cruz de Jesus"},
    "09-21": {"name": "São Mateus", "icon": "📖", "desc": "Apóstolo e Evangelista, ex-cobrador de impostos"},
    "09-27": {"name": "São Vicente de Paulo", "icon": "🤝", "desc": "Padroeiro das obras de caridade e dos pobres"},
    "09-29": {"name": "Santos Miguel, Gabriel e Rafael", "icon": "👼", "desc": "Festa dos três Arcanjos, mensageiros de Deus"},
    "09-30": {"name": "São Jerônimo", "icon": "📖", "desc": "Doutor da Igreja, tradutor da Bíblia para o latim (Vulgata)"},
    # Outubro
    "10-01": {"name": "Santa Teresa do Menino Jesus", "icon": "🌹", "desc": "Doutora da Igreja, padroeira das missões — 'o Camininho'"},
    "10-02": {"name": "Santos Anjos da Guarda", "icon": "👼", "desc": "Memória dos anjos que nos guardam e protegem"},
    "10-04": {"name": "São Francisco de Assis", "icon": "🕊", "desc": "Padroeiro ecológico, fundador dos Franciscanos — Poverello"},
    "10-07": {"name": "Nossa Senhora do Rosário", "icon": "📿", "desc": "Memória de Maria como Rainha do Santo Rosário"},
    "10-12": {"name": "Nossa Senhora Aparecida", "icon": "🙏", "desc": "Padroeira do Brasil — aparecida às margens do Rio Paraíba (1717)"},
    "10-15": {"name": "Santa Teresa de Ávila", "icon": "📚", "desc": "Doutora da Igreja, reformadora do Carmelo — grande Mística"},
    "10-18": {"name": "São Lucas", "icon": "📖", "desc": "Evangelista e médico, companheiro de São Paulo"},
    "10-22": {"name": "São João Paulo II", "icon": "✝", "desc": "'Não tenhais medo! Abri as portas a Cristo!'"},
    "10-28": {"name": "Santos Simão e Judas Tadeu", "icon": "✝", "desc": "Apóstolos de Jesus Cristo"},
    # Novembro
    "11-01": {"name": "Todos os Santos", "icon": "👑", "desc": "Solenidade de todos os santos, conhecidos e desconhecidos"},
    "11-02": {"name": "Finados", "icon": "🕯", "desc": "Comemoração de todos os fiéis defuntos — Dia de Finados"},
    "11-03": {"name": "São Martinho de Porres", "icon": "🌿", "desc": "Frade dominicano, padroeiro dos pobres e mestiços"},
    "11-04": {"name": "São Carlos Borromeu", "icon": "⛪", "desc": "Arcebispo de Milão, grande reformador — séc. XVI"},
    "11-09": {"name": "Dedicação da Basílica de Latrão", "icon": "⛪", "desc": "A catedral do Papa — 'mãe de todas as igrejas'"},
    "11-10": {"name": "São Leão Magno", "icon": "📜", "desc": "Papa e Doutor da Igreja — séc. V"},
    "11-11": {"name": "São Martinho de Tours", "icon": "🛡", "desc": "Soldado que partiu sua capa com o pobre — séc. IV"},
    "11-16": {"name": "Santa Margarida da Escócia", "icon": "👑", "desc": "Rainha e benfeitora dos pobres — séc. XI"},
    "11-17": {"name": "Santa Isabel da Hungria", "icon": "🌹", "desc": "Princesa que dedicou sua vida aos pobres — séc. XIII"},
    "11-21": {"name": "Apresentação de Nossa Senhora", "icon": "🏛", "desc": "Maria apresentada ao Templo pelos pais Joaquim e Ana"},
    "11-22": {"name": "Santa Cecília", "icon": "🎵", "desc": "Mártir e patrona dos músicos e cantores"},
    "11-25": {"name": "Santa Catarina de Alexandria", "icon": "📚", "desc": "Mártir e doutora — padroeira dos estudantes e filósofos"},
    "11-30": {"name": "São André", "icon": "⚓", "desc": "Apóstolo, irmão de Pedro, padroeiro da Escócia e Rússia"},
    # Dezembro
    "12-03": {"name": "São Francisco Xavier", "icon": "⛵", "desc": "Apóstolo das Índias e do Japão, padroeiro das missões"},
    "12-06": {"name": "São Nicolau", "icon": "🎁", "desc": "Bispo de Myra, conhecido pela generosidade — séc. IV"},
    "12-07": {"name": "Santo Ambrósio", "icon": "🎵", "desc": "Bispo de Milão e Doutor da Igreja — séc. IV"},
    "12-08": {"name": "Imaculada Conceição", "icon": "💙", "desc": "Solenidade de Maria concebida sem pecado original — Co-Padroeira do Brasil"},
    "12-12": {"name": "Nossa Senhora de Guadalupe", "icon": "🌹", "desc": "Aparição a Juan Diego no México (1531) — Padroeira das Américas"},
    "12-13": {"name": "Santa Lúcia", "icon": "🕯", "desc": "Mártir siciliana — padroeira dos cegos e da visão"},
    "12-14": {"name": "São João da Cruz", "icon": "✝", "desc": "Doutor da Igreja, poeta místico e reformador do Carmelo"},
    "12-25": {"name": "Natal do Senhor", "icon": "⭐", "desc": "Solenidade do Nascimento de Jesus Cristo em Belém da Judeia"},
    "12-26": {"name": "São Estêvão", "icon": "⭐", "desc": "Primeiro mártir da Igreja — Proto-Mártir"},
    "12-27": {"name": "São João Evangelista", "icon": "📖", "desc": "Apóstolo amado de Jesus, evangelista e visionário do Apocalipse"},
    "12-28": {"name": "Santos Inocentes", "icon": "🕯", "desc": "Mártires da inocência, mortos por Herodes — séc. I"},
    "12-31": {"name": "São Silvestre I", "icon": "⛪", "desc": "Papa ao tempo da paz para a Igreja — séc. IV"},
}


def today_saint() -> dict:
    """Return today's saint entry (timezone: America/Sao_Paulo)."""
    from datetime import date
    key = date.today().strftime("%m-%d")
    return CALENDAR.get(key, {
        "name": "Santos do Calendário Romano",
        "icon": "✝",
        "desc": "Consulte o Calendário Litúrgico Romano para o(a) santo(a) de hoje.",
    })


def upcoming_saints(count: int = 3) -> List[dict]:
    """Return next N upcoming saint days (scans up to 90 days ahead)."""
    from datetime import date, timedelta
    today = date.today()
    result = []
    for i in range(1, 91):
        if len(result) >= count:
            break
        d = today + timedelta(days=i)
        key = d.strftime("%m-%d")
        if key in CALENDAR:
            entry = dict(CALENDAR[key])
            entry["date"] = key
            result.append(entry)
    return result
