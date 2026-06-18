import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCkp64fY_hbNTMUaepWY65MExkz-zb-fA",
  authDomain: "tokyo-railway-master.firebaseapp.com",
  projectId: "tokyo-railway-master",
  storageBucket: "tokyo-railway-master.firebasestorage.app",
  messagingSenderId: "574625318787",
  appId: "1:574625318787:web:e346becf1572bbb63e18b6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const GAME_TIME = 120;

const lines = [
  { name: "山手線", company: "JR", level: "easy", stations: ["東京","神田","秋葉原","御徒町","上野","鶯谷","日暮里","西日暮里","田端","駒込","巣鴨","大塚","池袋","目白","高田馬場","新大久保","新宿","代々木","原宿","渋谷","恵比寿","目黒","五反田","大崎","品川","高輪ゲートウェイ","田町","浜松町","新橋","有楽町"] },
  { name: "中央線快速", company: "JR", level: "easy", stations: ["東京","神田","御茶ノ水","四ツ谷","新宿","中野","高円寺","阿佐ヶ谷","荻窪","西荻窪","吉祥寺","三鷹"] },
  { name: "総武線", company: "JR", level: "easy", stations: ["三鷹","吉祥寺","西荻窪","荻窪","阿佐ヶ谷","高円寺","中野","東中野","大久保","新宿","代々木","千駄ヶ谷","信濃町","四ツ谷","市ヶ谷","飯田橋","水道橋","御茶ノ水","秋葉原","浅草橋","両国","錦糸町"] },
  { name: "京浜東北線", company: "JR", level: "easy", stations: ["赤羽","東十条","王子","上中里","田端","西日暮里","日暮里","鶯谷","上野","御徒町","秋葉原","神田","東京","有楽町","新橋","浜松町","田町","高輪ゲートウェイ","品川"] },
  { name: "埼京線", company: "JR", level: "normal", stations: ["大崎","恵比寿","渋谷","新宿","池袋","板橋","十条","赤羽"] },

  { name: "丸ノ内線", company: "東京メトロ", level: "normal", stations: ["荻窪","南阿佐ケ谷","新高円寺","東高円寺","新中野","中野坂上","西新宿","新宿","新宿三丁目","新宿御苑前","四谷三丁目","四ツ谷","赤坂見附","国会議事堂前","霞ケ関","銀座","東京","大手町","淡路町","御茶ノ水","本郷三丁目","後楽園","茗荷谷","新大塚","池袋"] },
  { name: "銀座線", company: "東京メトロ", level: "normal", stations: ["渋谷","表参道","外苑前","青山一丁目","赤坂見附","溜池山王","虎ノ門","新橋","銀座","京橋","日本橋","三越前","神田","末広町","上野広小路","上野","稲荷町","田原町","浅草"] },
  { name: "東西線", company: "東京メトロ", level: "normal", stations: ["中野","落合","高田馬場","早稲田","神楽坂","飯田橋","九段下","竹橋","大手町","日本橋","茅場町","門前仲町","木場","東陽町","南砂町","西葛西","葛西"] },
  { name: "千代田線", company: "東京メトロ", level: "normal", stations: ["代々木上原","代々木公園","明治神宮前","表参道","乃木坂","赤坂","国会議事堂前","霞ケ関","日比谷","二重橋前","大手町","新御茶ノ水","湯島","根津","千駄木","西日暮里","町屋","北千住"] },
  { name: "有楽町線", company: "東京メトロ", level: "hard", stations: ["和光市","地下鉄成増","地下鉄赤塚","平和台","氷川台","小竹向原","千川","要町","池袋","東池袋","護国寺","江戸川橋","飯田橋","市ヶ谷","麹町","永田町","桜田門","有楽町","銀座一丁目","新富町","月島","豊洲","辰巳","新木場"] },
  { name: "半蔵門線", company: "東京メトロ", level: "hard", stations: ["渋谷","表参道","青山一丁目","永田町","半蔵門","九段下","神保町","大手町","三越前","水天宮前","清澄白河","住吉","錦糸町","押上"] },
  { name: "南北線", company: "東京メトロ", level: "hard", stations: ["目黒","白金台","白金高輪","麻布十番","六本木一丁目","溜池山王","永田町","四ツ谷","市ヶ谷","飯田橋","後楽園","東大前","本駒込","駒込","西ケ原","王子","王子神谷","志茂","赤羽岩淵"] },
  { name: "副都心線", company: "東京メトロ", level: "hard", stations: ["和光市","地下鉄成増","地下鉄赤塚","平和台","氷川台","小竹向原","千川","要町","池袋","雑司が谷","西早稲田","東新宿","新宿三丁目","北参道","明治神宮前","渋谷"] },

  { name: "都営浅草線", company: "都営地下鉄", level: "hard", stations: ["西馬込","馬込","中延","戸越","五反田","高輪台","泉岳寺","三田","大門","新橋","東銀座","宝町","日本橋","人形町","東日本橋","浅草橋","蔵前","浅草","本所吾妻橋","押上"] },
  { name: "都営三田線", company: "都営地下鉄", level: "hard", stations: ["目黒","白金台","白金高輪","三田","芝公園","御成門","内幸町","日比谷","大手町","神保町","水道橋","春日","白山","千石","巣鴨","西巣鴨","新板橋","板橋区役所前","板橋本町","本蓮沼","志村坂上","志村三丁目","蓮根","西台","高島平","西高島平"] },
  { name: "都営新宿線", company: "都営地下鉄", level: "hard", stations: ["新宿","新宿三丁目","曙橋","市ヶ谷","九段下","神保町","小川町","岩本町","馬喰横山","浜町","森下","菊川","住吉","西大島","大島","東大島","船堀","一之江","瑞江","篠崎"] },
  { name: "都営大江戸線", company: "都営地下鉄", level: "hard", stations: ["都庁前","新宿西口","東新宿","若松河田","牛込柳町","牛込神楽坂","飯田橋","春日","本郷三丁目","上野御徒町","新御徒町","蔵前","両国","森下","清澄白河","門前仲町","月島","勝どき","築地市場","汐留","大門","赤羽橋","麻布十番","六本木","青山一丁目","国立競技場","代々木","新宿"] }
];

let questions = [];
let usedIndexes = [];
let score = 0;
let combo = 0;
let correctCount = 0;
let wrongCount = 0;
let time = GAME_TIME;
let currentQuestion = null;
let timerId = null;
let selectedDifficulty = "easy";
let player = "名無し";

const statusEl = document.getElementById("status");
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const resultEl = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const playerName = document.getElementById("playerName");
const rankingBox = document.getElementById("rankingBox");
const finalResult = document.getElementById("finalResult");
const backToStartBtn = document.getElementById("backToStartBtn");
const difficultyBtns = document.querySelectorAll(".difficultyBtn");

function allStations(targetLines) {
  return [...new Set(targetLines.flatMap(line => line.stations))];
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function makeChoices(answer, candidates) {
  const list = [answer];

  shuffle(candidates).forEach(c => {
    if (c !== answer && !list.includes(c) && list.length < 4) {
      list.push(c);
    }
  });

  return shuffle(list);
}

function targetLinesByDifficulty() {
  if (selectedDifficulty === "easy") {
    return lines.filter(l => l.level === "easy");
  }

  if (selectedDifficulty === "normal") {
    return lines.filter(l => l.level === "easy" || l.level === "normal");
  }

  return lines;
}

function generateQuestions() {
  questions = [];

  const targetLines = targetLinesByDifficulty();
  const stations = allStations(targetLines);
  const lineNames = targetLines.map(l => l.name);

  const stationToLines = {};

  targetLines.forEach(line => {
    line.stations.forEach(station => {
      if (!stationToLines[station]) {
        stationToLines[station] = [];
      }
      stationToLines[station].push(line.name);
    });
  });

  const uniqueLinesAtStation = station => [...new Set(stationToLines[station] || [])];

  targetLines.forEach(line => {
    for (let i = 0; i < line.stations.length - 1; i++) {
      const from = line.stations[i];
      const answer = line.stations[i + 1];
      const wrongStations = stations.filter(s => s !== answer);

      questions.push({
        question: `【次の駅は？】\n\n${line.name}\n${from} → ？`,
        choices: makeChoices(answer, wrongStations),
        answer: answer,
        point: 10,
        explanation: `${line.name}では「${from}」の次は「${answer}」です。`
      });
    }
  });

  targetLines.forEach(line => {
    for (let i = 0; i < line.stations.length - 2; i++) {
      const s1 = line.stations[i];
      const s2 = line.stations[i + 1];
      const s3 = line.stations[i + 2];

      const matchingLines = targetLines.filter(otherLine => {
        for (let j = 0; j < otherLine.stations.length - 2; j++) {
          if (
            otherLine.stations[j] === s1 &&
            otherLine.stations[j + 1] === s2 &&
            otherLine.stations[j + 2] === s3
          ) {
            return true;
          }
        }
        return false;
      });

      if (matchingLines.length !== 1) {
        continue;
      }

      const wrongLines = lineNames.filter(name => name !== line.name);

      questions.push({
        question: `【この路線は？】\n\n${s1} → ${s2} → ${s3}`,
        choices: makeChoices(line.name, wrongLines),
        answer: line.name,
        point: 20,
        explanation: `この並びは「${line.name}」です。`
      });
    }
  });

  Object.keys(stationToLines).forEach(station => {
    const correctLines = uniqueLinesAtStation(station);
    const wrongLines = lineNames.filter(name => !correctLines.includes(name));

    if (wrongLines.length < 3) {
      return;
    }

    correctLines.forEach(correctLine => {
      questions.push({
        question: `【どの路線の駅？】\n\n「${station}」が含まれる路線は？`,
        choices: makeChoices(correctLine, wrongLines),
        answer: correctLine,
        point: 15,
        explanation: `「${station}」は「${correctLine}」の駅です。`
      });
    });
  });

  const jrStations = [...new Set(
    targetLines
      .filter(l => l.company === "JR")
      .flatMap(l => l.stations)
  )];

  const nonJrStations = stations.filter(s => !jrStations.includes(s));

  nonJrStations.forEach(station => {
    if (jrStations.length < 3) {
      return;
    }

    questions.push({
      question: "【JRではない駅は？】\n\n次のうち、JRの駅ではないものはどれ？",
      choices: makeChoices(station, jrStations),
      answer: station,
      point: 20,
      explanation: `「${station}」はこのデータ内ではJRの駅ではありません。`
    });
  });

  Object.keys(stationToLines).forEach(station => {
    const passingLines = uniqueLinesAtStation(station);
    const notPassingLines = lineNames.filter(name => !passingLines.includes(name));

    if (passingLines.length < 3 || notPassingLines.length < 1) {
      return;
    }

    const answer = notPassingLines[Math.floor(Math.random() * notPassingLines.length)];

    questions.push({
      question: `【通らない路線は？】\n\n「${station}」を通らない路線はどれ？`,
      choices: makeChoices(answer, passingLines),
      answer: answer,
      point: 25,
      explanation: `「${station}」を通らないのは「${answer}」です。`
    });
  });

  Object.keys(stationToLines).forEach(station => {
    const passingLines = uniqueLinesAtStation(station);

    if (passingLines.length < 3) {
      return;
    }

    const quizLines = shuffle(passingLines).slice(0, 3);

    const wrongStations = stations.filter(s => {
      if (s === station) return false;
      const linesAtStation = uniqueLinesAtStation(s);
      return !quizLines.every(lineName => linesAtStation.includes(lineName));
    });

    if (wrongStations.length < 3) {
      return;
    }

    questions.push({
      question:
        `【乗換駅クイズ】\n\n` +
        `${quizLines[0]}\n` +
        `${quizLines[1]}\n` +
        `${quizLines[2]}\n\n` +
        `この3路線が通る駅は？`,
      choices: makeChoices(station, wrongStations),
      answer: station,
      point: 40,
      explanation: `「${station}」には ${quizLines.join("・")} が通っています。`
    });
  });

  Object.keys(stationToLines).forEach(station => {
    const passingLines = uniqueLinesAtStation(station);

    if (passingLines.length < 3) {
      return;
    }

    const hintLines = shuffle(passingLines).slice(0, 3);

    const wrongStations = stations.filter(s => {
      if (s === station) return false;
      const linesAtStation = uniqueLinesAtStation(s);
      return !hintLines.every(lineName => linesAtStation.includes(lineName));
    });

    if (wrongStations.length < 3) {
      return;
    }

    questions.push({
      question:
        `【3ヒント駅当て】\n\n` +
        `ヒント① ${hintLines[0]}\n` +
        `ヒント② ${hintLines[1]}\n` +
        `ヒント③ ${hintLines[2]}\n\n` +
        `この駅は？`,
      choices: makeChoices(station, wrongStations),
      answer: station,
      point: 45,
      explanation: `正解は「${station}」です。${hintLines.join("・")} が通っています。`
    });
  });

  targetLines.forEach(line => {
    if (line.stations.length < 3) {
      return;
    }

    const stationsOnLine = line.stations;
    const stationsNotOnLine = stations.filter(s => !stationsOnLine.includes(s));

    if (stationsNotOnLine.length < 1) {
      return;
    }

    const memberStations = shuffle(stationsOnLine).slice(0, 3);
    const answer = shuffle(stationsNotOnLine)[0];

    questions.push({
      question:
        `【仲間外れクイズ】\n\n` +
        `次のうち、「${line.name}」の駅ではないものはどれ？`,
      choices: shuffle([...memberStations, answer]),
      answer: answer,
      point: 30,
      explanation: `「${answer}」は「${line.name}」の駅ではありません。`
    });
  });

  targetLines.forEach(line => {
    if (line.stations.length < 2) {
      return;
    }

    const start = line.stations[0];
    const end = line.stations[line.stations.length - 1];
    const answer = `${start}・${end}`;

    const wrongPairs = targetLines
      .filter(l => l.name !== line.name && l.stations.length >= 2)
      .map(l => `${l.stations[0]}・${l.stations[l.stations.length - 1]}`);

    if (wrongPairs.length < 3) {
      return;
    }

    questions.push({
      question: `【終点クイズ】\n\n「${line.name}」の両端の駅はどれ？`,
      choices: makeChoices(answer, wrongPairs),
      answer: answer,
      point: 35,
      explanation: `「${line.name}」の両端は「${answer}」です。`
    });
  });

  const oneTransferQuestions = [
    {
      question: "【乗換1回クイズ】\n\n新宿 → 浅草\n\n1回乗り換えるなら、どこで乗り換える？",
      answer: "赤坂見附",
      choices: ["赤坂見附", "大手町", "飯田橋", "青山一丁目"],
      point: 50,
      explanation: "丸ノ内線で赤坂見附まで行き、銀座線に乗り換えるルートです。"
    },
    {
      question: "【乗換1回クイズ】\n\n池袋 → 押上\n\n1回乗り換えるなら、どこで乗り換える？",
      answer: "大手町",
      choices: ["大手町", "新宿", "表参道", "飯田橋"],
      point: 50,
      explanation: "丸ノ内線で大手町まで行き、半蔵門線に乗り換えるルートです。"
    },
    {
      question: "【乗換1回クイズ】\n\n高田馬場 → 浅草\n\n1回乗り換えるなら、どこで乗り換える？",
      answer: "日本橋",
      choices: ["日本橋", "新宿", "神田", "三田"],
      point: 50,
      explanation: "東西線で日本橋まで行き、銀座線に乗り換えるルートです。"
    },
    {
      question: "【乗換1回クイズ】\n\n西馬込 → 大手町\n\n1回乗り換えるなら、どこで乗り換える？",
      answer: "三田",
      choices: ["三田", "新橋", "日本橋", "五反田"],
      point: 50,
      explanation: "都営浅草線で三田まで行き、都営三田線に乗り換えるルートです。"
    },
    {
      question: "【乗換1回クイズ】\n\n九段下 → 目黒\n\n1回乗り換えるなら、どこで乗り換える？",
      answer: "永田町",
      choices: ["永田町", "大手町", "新宿", "飯田橋"],
      point: 50,
      explanation: "半蔵門線で永田町まで行き、南北線に乗り換えるルートです。"
    },
    {
      question: "【乗換1回クイズ】\n\n東陽町 → 池袋\n\n1回乗り換えるなら、どこで乗り換える？",
      answer: "飯田橋",
      choices: ["飯田橋", "大手町", "日本橋", "新宿"],
      point: 50,
      explanation: "東西線で飯田橋まで行き、有楽町線に乗り換えるルートです。"
    }
  ];

  oneTransferQuestions.forEach(q => {
    const answerExists = stations.includes(q.answer);
    const choicesExist = q.choices.every(choice => stations.includes(choice));

    if (answerExists && choicesExist) {
      questions.push(q);
    }
  });
}

function difficultyLabel() {
  if (selectedDifficulty === "easy") return "初級";
  if (selectedDifficulty === "normal") return "中級";
  return "上級";
}

function getTitle(score) {
  if (score >= 2500) return "東京鉄道マスター";
  if (score >= 1800) return "鉄道王";
  if (score >= 1200) return "駅長";
  if (score >= 800) return "車掌";
  if (score >= 400) return "駅員";
  return "鉄道初心者";
}

function getBestScore() {
  return Number(localStorage.getItem("bestScore_" + selectedDifficulty) || 0);
}

function setBestScore(value) {
  localStorage.setItem("bestScore_" + selectedDifficulty, value);
}

async function saveRanking() {
  try {
    await addDoc(collection(db, "rankings"), {
      name: player,
      score: score,
      title: getTitle(score),
      correct: correctCount,
      wrong: wrongCount,
      difficulty: difficultyLabel(),
      createdAt: serverTimestamp()
    });

    console.log("ランキング保存成功");
  } catch (error) {
    console.error("ランキング保存失敗:", error);
    alert("ランキング保存失敗: " + error.message);
  }
}

async function showRanking() {
  try {
    rankingBox.innerText = "ランキング読み込み中...";

    const q = query(
      collection(db, "rankings"),
      orderBy("score", "desc"),
      limit(10)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      rankingBox.innerText = "ランキングはまだありません。";
      return;
    }

    let text = "🏆 ONLINE RANKING\n\n";
    let rank = 1;

    snapshot.forEach(doc => {
      const r = doc.data();
      text += `${rank}位　${r.name}　${r.score}点　${r.title}　${r.difficulty}\n`;
      rank++;
    });

    rankingBox.innerText = text;
  } catch (error) {
    console.error("ランキング読み込み失敗:", error);
    rankingBox.innerText = "ランキング読み込み失敗";
  }
}

function updateStatus() {
  statusEl.innerText =
    `Score: ${score} | Best: ${getBestScore()} | Combo: ${combo} | Time: ${time}`;
}

function showScreen(screen) {
  startScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  endScreen.classList.add("hidden");

  screen.classList.remove("hidden");
}

function loadQuestion() {
  resultEl.innerText = "";
  nextBtn.disabled = true;

  if (usedIndexes.length >= questions.length) {
    usedIndexes = [];
  }

  let index;

  do {
    index = Math.floor(Math.random() * questions.length);
  } while (usedIndexes.includes(index));

  usedIndexes.push(index);
  currentQuestion = questions[index];

  questionEl.innerText =
    `${currentQuestion.question}\n\n${currentQuestion.point}点問題`;

  choicesEl.innerHTML = "";

  shuffle(currentQuestion.choices).forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice;
    btn.onclick = () => answerQuestion(btn, choice);
    choicesEl.appendChild(btn);
  });
}

function answerQuestion(button, choice) {
  const allButtons = document.querySelectorAll("#choices button");

  allButtons.forEach(btn => {
    btn.disabled = true;

    if (btn.innerText === currentQuestion.answer) {
      btn.classList.add("correct");
    }
  });

  const explanation = currentQuestion.explanation ? `\n${currentQuestion.explanation}` : "";

  if (choice === currentQuestion.answer) {
    combo++;
    correctCount++;

    let bonus = 0;

    if (combo >= 10) bonus = 50;
    else if (combo >= 5) bonus = 20;
    else if (combo >= 3) bonus = 10;

    const getPoint = currentQuestion.point + bonus;
    score += getPoint;

    resultEl.innerText =
      `⭕ 正解！ +${getPoint}点\nCombo: ${combo}${explanation}`;
  } else {
    combo = 0;
    wrongCount++;
    button.classList.add("wrong");

    resultEl.innerText =
      `❌ 不正解\n正解：${currentQuestion.answer}${explanation}`;
  }

  if (score > getBestScore()) {
    setBestScore(score);
  }

  updateStatus();
  nextBtn.disabled = false;
}

function startGame() {
  player = playerName.value.trim();

  if (player === "") {
    player = "名無し";
  }

  score = 0;
  combo = 0;
  correctCount = 0;
  wrongCount = 0;
  time = GAME_TIME;
  usedIndexes = [];

  generateQuestions();

  clearInterval(timerId);

  timerId = setInterval(() => {
    time--;
    updateStatus();

    if (time <= 0) {
      finishGame();
    }
  }, 1000);

  showScreen(gameScreen);
  updateStatus();
  loadQuestion();
}

async function finishGame() {
  clearInterval(timerId);

  if (score > getBestScore()) {
    setBestScore(score);
  }

  await saveRanking();

  finalResult.innerText =
    `名前：${player}\n` +
    `難易度：${difficultyLabel()}\n` +
    `称号：${getTitle(score)}\n` +
    `Score：${score}点\n` +
    `正解数：${correctCount}\n` +
    `不正解数：${wrongCount}\n` +
    `Best：${getBestScore()}点`;

  showScreen(endScreen);
  showRanking();
}

difficultyBtns.forEach(btn => {
  btn.onclick = () => {
    difficultyBtns.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedDifficulty = btn.dataset.difficulty;
    showRanking();
    updateStatus();
  };
});

startBtn.onclick = startGame;

restartBtn.onclick = () => {
  clearInterval(timerId);
  showScreen(startScreen);
  score = 0;
  combo = 0;
  correctCount = 0;
  wrongCount = 0;
  time = GAME_TIME;
  updateStatus();
  showRanking();
};

nextBtn.onclick = loadQuestion;

backToStartBtn.onclick = () => {
  showScreen(startScreen);
  showRanking();
};

time = GAME_TIME;
updateStatus();
showRanking();
showScreen(startScreen);
