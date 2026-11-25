"use strict";

/* ==========================================
   ПЕПЕЛ ПОДЗЕМЕЛЬЯ
   Основной игровой движок
   Версия 1.0
========================================== */


/* ==========================================
   1. ОСНОВНЫЕ ПЕРЕМЕННЫЕ
========================================== */

const $ = id => document.getElementById(id);

const SAVE_KEY = "ashenRealmsSlotsV3";

let active = -1;
let state = null;

let slots = [null, null, null];

let creator = {
    step: 0,
    name: "",
    answers: []
};


/* ==========================================
   2. КЛАССЫ ПЕРСОНАЖЕЙ
========================================== */

const classes = {

    warrior: {
        name: "Воин",
        icon: "⚔️",
        hp: 38,
        atk: 7,
        def: 4,
        skill: "Сокрушительный удар",
        skillDamage: 15
    },

    hunter: {
        name: "Охотник",
        icon: "🏹",
        hp: 30,
        atk: 8,
        def: 2,
        skill: "Меткий выстрел",
        skillDamage: 18
    },

    mage: {
        name: "Маг",
        icon: "🔮",
        hp: 27,
        atk: 10,
        def: 1,
        skill: "Огненный сгусток",
        skillDamage: 22
    },

    necromancer: {
        name: "Некромант",
        icon: "☠️",
        hp: 31,
        atk: 7,
        def: 2,
        skill: "Праховая хватка",
        skillDamage: 17
    }

};


/* ==========================================
   3. ИГРОВЫЕ ЛОКАЦИИ
========================================== */

const places = {

    outskirts: {
        name: "Пепельная окраина",
        tag: "СЕВЕРНЫЕ ПУСТОШИ",

        description:
            "Среди обвалившихся стен лежат вещи тех, кто не успел уйти.",

        unlock: () => true,

        enemies: [
            {
                name: "Пепельный падальщик",
                hp: 13,
                damage: 3,
                xp: 8,
                gold: 4,
                icon: "☠️"
            }
        ]
    },


    forest: {
        name: "Чёрный перелесок",
        tag: "ЗАБЫТЫЕ ЗЕМЛИ",

        description:
            "Мёртвые деревья скрипят без ветра. Между корнями кто-то оставил след.",

        unlock: () => true,

        enemies: [
            {
                name: "Корневой упырь",
                hp: 18,
                damage: 5,
                xp: 12,
                gold: 6,
                icon: "🌲"
            },

            {
                name: "Бродячая тень",
                hp: 15,
                damage: 4,
                xp: 10,
                gold: 5,
                icon: "👤"
            }
        ]
    },


    crypt: {
        name: "Затопленная крипта",
        tag: "ПОД СТАРЫМ ХРАМОМ",

        description:
            "Вода скрывает ступени, а из глубины доносится тихий звон.",

        unlock: s => s.relic,

        enemies: [
            {
                name: "Криптовый страж",
                hp: 24,
                damage: 6,
                xp: 17,
                gold: 9,
                icon: "💀"
            },

            {
                name: "Утопленник",
                hp: 20,
                damage: 5,
                xp: 14,
                gold: 7,
                icon: "👻"
            }
        ]
    },


    keep: {
        name: "Башня без окон",
        tag: "РУБЕЖ ПЕПЛА",

        description:
            "Башня возвышается над пустошью. Ни одного окна, ни одного огня.",

        unlock: s => s.level >= 3,

        enemies: [
            {
                name: "Рыцарь без знамени",
                hp: 35,
                damage: 8,
                xp: 27,
                gold: 15,
                icon: "⚔️"
            }
        ]
    },


    marsh: {
        name: "Мёртвые топи",
        tag: "НИЗИНЫ УГАСШЕГО СОЛНЦА",

        description:
            "Под чёрной водой медленно движутся тени.",

        unlock: s => s.level >= 2,

        enemies: [
            {
                name: "Топяной пожиратель",
                hp: 28,
                damage: 7,
                xp: 20,
                gold: 11,
                icon: "☠️"
            },

            {
                name: "Гнилой блуждающий",
                hp: 23,
                damage: 6,
                xp: 17,
                gold: 9,
                icon: "👤"
            }
        ]
    },


    chapel: {
        name: "Часовня праха",
        tag: "ЗЕМЛИ ЗА СТАРОЙ ДОРОГОЙ",

        description:
            "Разрушенная часовня хранит последний отблеск забытой веры.",

        unlock: s => s.level >= 4,

        enemies: [
            {
                name: "Пепельный исповедник",
                hp: 40,
                damage: 9,
                xp: 32,
                gold: 18,
                icon: "✝️"
            }
        ]
    }

};


/* ==========================================
   4. ТЕСТ СОЗДАНИЯ ГЕРОЯ
========================================== */

const quiz = [

    {
        title: "Перед тобой опасность. Что сделаешь?",

        description:
            "Первый инстинкт часто говорит о многом.",

        answers: [

            {
                title: "Защищу слабых",
                description: "Выдержать удар и защитить других.",
                class: "warrior",
                icon: "⚔️"
            },

            {
                title: "Найду слабое место",
                description: "Точность важнее грубой силы.",
                class: "hunter",
                icon: "🏹"
            },

            {
                title: "Изучу противника",
                description: "Знание и магия решают исход.",
                class: "mage",
                icon: "🔮"
            },

            {
                title: "Подчиню неизвестное",
                description: "Даже смерть может стать союзником.",
                class: "necromancer",
                icon: "☠️"
            }

        ]
    },


    {
        title: "Какой след ты оставишь в мире?",

        description:
            "Выбери то, что ближе твоему характеру.",

        answers: [

            {
                title: "Легенду о несгибаемой воле",
                description: "Честь и стойкость.",
                class: "warrior",
                icon: "🛡️"
            },

            {
                title: "Историю о свободе",
                description: "Независимость и ловкость.",
                class: "hunter",
                icon: "🌲"
            },

            {
                title: "Знание, пережившее века",
                description: "Тайны и запретные формулы.",
                class: "mage",
                icon: "📜"
            },

            {
                title: "Наследие после смерти",
                description: "Власть над забытым.",
                class: "necromancer",
                icon: "☠️"
            }

        ]
    },


    {
        title: "Что возьмёшь в неизвестность?",

        description:
            "Последний выбор определит твою специализацию.",

        answers: [

            {
                title: "Меч и щит",
                description: "Встречу судьбу лицом к лицу.",
                class: "warrior",
                icon: "⚔️"
            },

            {
                title: "Лук и карту троп",
                description: "Предпочитаю видеть опасность издалека.",
                class: "hunter",
                icon: "🏹"
            },

            {
                title: "Посох и книгу",
                description: "Сам напишу законы этого мира.",
                class: "mage",
                icon: "🔮"
            },

            {
                title: "Амулет с забытым именем",
                description: "Некоторые двери открываются мёртвым.",
                class: "necromancer",
                icon: "☠️"
            }

        ]
    }

];


/* ==========================================
   5. СОЗДАНИЕ НОВОГО ПЕРСОНАЖА
========================================== */

function fresh(name, className) {

    const characterClass = classes[className];

    return {

        name: name,

        class: className,

        level: 1,

        hp: characterClass.hp,
        maxHp: characterClass.hp,

        attack: characterClass.atk,
        defense: characterClass.def,

        xp: 0,
        nextXp: 20,

        gold: 12,
        potions: 2,

        day: 1,

        place: "outskirts",

        relic: false,

        enemy: null,

        guard: false,

        npcMet: [],
        npcProgress: {},

        storyFlags: {},

        chapter: 1,

        log: [
            `${name} пришёл в себя среди пепла.`
        ],

        storyTag: "ПЕРВЫЕ ШАГИ",

        storyTitle:
            "Пепел шевелится под ногами",

        storyText:
            "Ты очнулся среди развалин. Холодный ветер гонит по земле серый пепел. Где-то впереди мерцает слабый огонь."

    };

}


/* ==========================================
   6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
========================================== */

function toast(message) {

    const element = $("toast");

    if (!element) return;

    element.textContent = message;

    element.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        element.classList.remove("show");

    }, 2200);

}


function addLog(message) {

    if (!state) return;

    state.log.unshift(message);

    state.log = state.log.slice(0, 18);

}


function show(screenId) {

    document.querySelectorAll(".screen").forEach(screen => {

        screen.classList.toggle(
            "active",
            screen.id === screenId
        );

    });

}


function random(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}


/* ==========================================
   КОНЕЦ ЧАСТИ 1
========================================== */
/* ================================
   ЧАСТЬ 2. СОХРАНЕНИЯ И СОЗДАНИЕ ПЕРСОНАЖА
================================ */

// Проверка и восстановление сохранения
function safe(data) {
    if (!data || typeof data !== "object") return null;

    const className = classes[data.class] ? data.class : "warrior";
    const base = classes[className];

    return {
        ...fresh(data.name || "Странник", className),
        ...data,
        name: String(data.name || "Странник").slice(0, 20),
        class: className,
        level: Math.max(1, Number(data.level) || 1),
        maxHp: Math.max(1, Number(data.maxHp) || base.hp),
        hp: Math.max(0, Math.min(Number(data.hp) || base.hp, Number(data.maxHp) || base.hp)),
        attack: Math.max(1, Number(data.attack) || base.atk),
        defense: Math.max(0, Number(data.defense) || base.def),
        xp: Math.max(0, Number(data.xp) || 0),
        nextXp: Math.max(1, Number(data.nextXp) || 100),
        gold: Math.max(0, Number(data.gold) || 0),
        potions: Math.max(0, Number(data.potions) || 0),
        day: Math.max(1, Number(data.day) || 1),
        place: locations[data.place] ? data.place : "outskirts",
        log: Array.isArray(data.log) ? data.log.slice(-30) : [],
        npcMet: Array.isArray(data.npcMet) ? data.npcMet : [],
        npcProgress: data.npcProgress && typeof data.npcProgress === "object"
            ? data.npcProgress : {},
        storyFlags: data.storyFlags && typeof data.storyFlags === "object"
            ? data.storyFlags : {}
    };
}

// Загрузка сохранений
function loadSlots() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        slots = Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch (error) {
        console.error("Ошибка загрузки сохранений:", error);
        slots = [];
    }

    while (slots.length < 3) slots.push(null);

    slots = slots.map(slot => safe(slot));
}

// Сохранение всех слотов
function saveSlots() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(slots));
    } catch (error) {
        console.error("Ошибка сохранения:", error);
        toast("Не удалось сохранить игру");
    }
}

// Сохранить текущего персонажа
function save() {
    if (active === null || !state) return;

    slots[active] = { ...state };
    saveSlots();
}

// Показать список сохранений
function renderSlots() {
    const container = $("saveSlots");
    if (!container) return;

    container.innerHTML = "";

    slots.forEach((slot, index) => {
        const card = document.createElement("div");
        card.className = "save-slot";

        if (slot) {
            card.innerHTML = `
                <div class="slot-info">
                    <strong>${escapeHTML(slot.name)}</strong>
                    <span>${classes[slot.class].icon} ${classes[slot.class].name}</span>
                    <small>Уровень ${slot.level} · День ${slot.day}</small>
                </div>
                <div class="slot-actions">
                    <button class="slot-load">Продолжить</button>
                    <button class="slot-delete">Удалить</button>
                </div>
            `;

            card.querySelector(".slot-load").addEventListener("click", () => {
                active = index;
                state = safe(slots[index]);
                show("gameScreen");
                renderGame();
            });

            card.querySelector(".slot-delete").addEventListener("click", () => {
                if (!confirm("Удалить это сохранение?")) return;

                slots[index] = null;
                saveSlots();
                renderSlots();
                toast("Сохранение удалено");
            });
        } else {
            card.innerHTML = `
                <div class="slot-info">
                    <strong>Пустой слот ${index + 1}</strong>
                    <small>Здесь можно создать нового персонажа</small>
                </div>
                <button class="slot-new">Новая игра</button>
            `;

            card.querySelector(".slot-new").addEventListener("click", () => {
                beginCreator(index);
            });
        }

        container.appendChild(card);
    });
}

// Защита текста от HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Начало создания персонажа
function beginCreator(index) {
    active = index;

    creator = {
        slot: index,
        step: 0,
        name: "",
        answers: []
    };

    show("creatorScreen");
    renderCreator();
}

// Отрисовка теста
function renderCreator() {
    const title = $("creatorTitle");
    const desc = $("creatorDesc");
    const content = $("creatorContent");
    const back = $("creatorBack");
    const next = $("creatorNext");

    if (!title || !desc || !content) {
        console.error("Не найдены элементы создания персонажа");
        toast("Ошибка интерфейса создания персонажа");
        return;
    }

    content.innerHTML = "";

    if (back) {
        back.style.display = creator.step === 0 ? "none" : "";
        back.onclick = creatorBack;
    }

    if (next) {
        next.style.display = creator.step === 0 ? "" : "none";
        next.textContent = "Продолжить";
        next.onclick = creatorNext;
    }

    // Шаг 0 — имя
    if (creator.step === 0) {
        title.textContent = "КТО ТЫ?";
        desc.textContent = "Назови себя. Это имя останется в летописи.";

        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 20;
        input.placeholder = "Имя персонажа";
        input.value = creator.name;
        input.id = "heroName";

        content.appendChild(input);
        return;
    }

    // Шаги 1–3 — вопросы
    const questionIndex = creator.step - 1;
    const question = quiz[questionIndex];

    if (!question) {
        finishCreator();
        return;
    }

    title.textContent = `ИСПЫТАНИЕ ${creator.step} / ${quiz.length}`;
    desc.textContent = question.question || "Выбери свой ответ.";

    question.answers.forEach((answer, answerIndex) => {
        const button = document.createElement("button");
        button.className = "quiz-answer";

        button.innerHTML = `
            <span>${answer.icon || "✦"}</span>
            <strong>${escapeHTML(answer.title)}</strong>
            <small>${escapeHTML(answer.description || "")}</small>
        `;

        button.addEventListener("click", () => {
            chooseAnswer(answer, answerIndex);
        });

        content.appendChild(button);
    });
}

// Кнопка продолжения после ввода имени
function creatorNext() {
    const input = $("heroName");
    const name = input ? input.value.trim() : "";

    if (!name) {
        toast("Сначала введи имя");
        return;
    }

    creator.name = name.slice(0, 20);
    creator.step = 1;
    renderCreator();
}

// Выбор ответа
function chooseAnswer(answer, answerIndex) {
    if (!creator || creator.step < 1) return;

    creator.answers[creator.step - 1] = answer;

    // Последний вопрос — завершаем создание
    if (creator.step >= quiz.length) {
        finishCreator();
        return;
    }

    // Иначе автоматически переходим дальше
    creator.step++;
    renderCreator();
}

// Возврат к предыдущему шагу
function creatorBack() {
    if (!creator) return;

    if (creator.step > 0) {
        creator.step--;

        if (creator.step === 0) {
            renderCreator();
            return;
        }

        creator.answers.length = creator.step;
        renderCreator();
    }
}

// Определение класса по ответам
function determineClass() {
    const scores = {
        warrior: 0,
        hunter: 0,
        mage: 0,
        necromancer: 0
    };

    creator.answers.forEach(answer => {
        if (answer && scores[answer.class] !== undefined) {
            scores[answer.class]++;
        }
    });

    return Object.entries(scores)
        .sort((a, b) => b[1] - a[1])[0][0];
}

// Завершение создания персонажа
function finishCreator() {
    const className = determineClass();

    state = fresh(creator.name, className);
    active = creator.slot;

    state.log = [];
    addLog(`Путешествие ${state.name} начинается.`);
    addLog(`Ты стал: ${classes[className].name}.`);

    save();

    creator = null;

    show("gameScreen");
    renderGame();

    toast("Персонаж создан!");
}

/* КОНЕЦ ЧАСТИ 2 */