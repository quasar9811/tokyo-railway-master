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

const GAME_TIME = 100;

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
let recentAnswers = [];
let recentTypes = [];
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

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function allStations(targetLines) {
  return [...new Set(targetLines.flatMap(line => line.stations))];
}

function makeChoices(answer, candidates) {
  const choices = [answer];

  shuffle(candidates).forEach(item => {
    if (item !== answer && !choices.includes(item) && choices.length < 4) {
      choices.push(item);
    }
  });

  return choices.length === 4 ? shuffle(choices) : [];
}

function targetLinesByDifficulty() {
  if (selectedDifficulty === "easy") return lines.filter(l => l.level === "easy");
  if (selectedDifficulty === "normal") return lines.filter(l => l.level === "easy" || l.level === "normal");
  return lines;
}

function buildStationToLines(targetLines) {
  const map = {};

  targetLines.forEach(line => {
    line.stations.forEach(station => {
      if (!map[station]) map[station] = [];
      if (!map[station].includes(line.name)) map[station].push(line.name);
    });
  });

  return map;
}

function addQuestion(q) {
  if (!q.choices || q.choices.length !== 4) return;
  if (new Set(q.choices).size !== 4) return;
  if (!q.choices.includes(q.answer)) return;

  questions.push(q);
}

function generateQuestions() {
  questions = [];

  const targetLines = targetLinesByDifficulty();
  const stations = allStations(targetLines);
  const lineNames = targetLines.map(l => l.name);
  const stationToLines = buildStationToLines(targetLines);
  const linesAt = station => stationToLines[station] || [];

  // この路線は？
  // 같은 역 배열이 여러 노선에 있으면 출제 안 함.
  targetLines.forEach(line => {
    for (let i = 0; i < line.stations.length - 2; i++) {
      const s1 = line.stations[i];
      const s2 = line.stations[i + 1];
      const s3 = line.stations[i + 2];

      const matchingLines = targetLines.filter(other => {
        for (let j = 0; j < other.stations.length - 2; j++) {
          if (other.stations[j] === s1 && other.stations[j + 1] === s2 && other.stations[j + 2] === s3) {
            return true;
          }
        }
        return false;
      });

      if (matchingLines.length !== 1) continue;

      addQuestion({
        type: "lineSequence",
        question: `【この路線は？】\n\n${s1} → ${s2} → ${s3}`,
        choices: makeChoices(line.name, lineNames.filter(n => n !== line.name)),
        answer: line.name,
        point: 20,
        explanation: `この並びは「${line.name}」です。`
      });
    }
  });

  // どの路線の駅？
  // 복수 정답 노선을 선택지에 넣지 않음.
  Object.keys(stationToLines).forEach(station => {
    const correctLines = linesAt(station);
    const wrongLines = lineNames.filter(name => !correctLines.includes(name));

    if (wrongLines.length < 3) return;

    correctLines.forEach(correctLine => {
      addQuestion({
        type: "stationLine",
        question: `【どの路線の駅？】\n\n「${station}」が含まれる路線はどれ？`,
        choices: makeChoices(correctLine, wrongLines),
        answer: correctLine,
        point: 15,
        explanation: `「${station}」は「${correctLine}」の駅です。`
      });
    });
  });

  // 乗換駅クイズ
  Object.keys(stationToLines).forEach(station => {
    const passingLines = linesAt(station);

    if (passingLines.length < 3) return;

    const quizLines = shuffle(passingLines).slice(0, 3);

    const wrongStations = stations.filter(s => {
      if (s === station) return false;

      const target = linesAt(s);
      return !quizLines.every(lineName => target.includes(lineName));
    });

    addQuestion({
      type: "transferStation",
      question: `【乗換駅クイズ】\n\n${quizLines[0]}\n${quizLines[1]}\n${quizLines[2]}\n\nこの3路線が通る駅は？`,
      choices: makeChoices(station, wrongStations),
      answer: station,
      point: 40,
      explanation: `「${station}」には ${quizLines.join("・")} が通っています。`
    });
  });

  // 3ヒント駅当て
  Object.keys(stationToLines).forEach(station => {
    const passingLines = linesAt(station);

    if (passingLines.length < 3) return;

    const hintLines = shuffle(passingLines).slice(0, 3);

    const wrongStations = stations.filter(s => {
      if (s === station) return false;

      const target = linesAt(s);
      return !hintLines.every(lineName => target.includes(lineName));
    });

    addQuestion({
      type: "threeHints",
      question: `【3ヒント駅当て】\n\nヒント① ${hintLines[0]}\nヒント② ${hintLines[1]}\nヒント③ ${hintLines[2]}\n\nこの駅は？`,
      choices: makeChoices(station, wrongStations),
      answer: station,
      point: 45,
      explanation: `正解は「${station}」です。${hintLines.join("・")} が通っています。`
    });
  });

  // 仲間外れクイズ
  targetLines.forEach(line => {
    const stationsOnLine = line.stations;
    const stationsNotOnLine = stations.filter(s => !stationsOnLine.includes(s));

    if (stationsOnLine.length < 3 || stationsNotOnLine.length < 1) return;

    const answer = shuffle(stationsNotOnLine)[0];

    addQuestion({
      type: "oddOneOut",
      question: `【仲間外れクイズ】\n\n次のうち、「${line.name}」の駅ではないものはどれ？`,
      choices: shuffle([...shuffle(stationsOnLine).slice(0, 3), answer]),
      answer: answer,
      point: 30,
      explanation: `「${answer}」は「${line.name}」の駅ではありません。`
    });
  });

  // 終点クイズ
  // 山手線は環状線なので出題しない。
  targetLines
    .filter(line => line.name !== "山手線")
    .forEach(line => {
      const start = line.stations[0];
      const end = line.stations[line.stations.length - 1];
      const answer = `${start}・${end}`;

      const wrongPairs = targetLines
        .filter(l => l.name !== line.name && l.name !== "山手線")
        .map(l => `${l.stations[0]}・${l.stations[l.stations.length - 1]}`);

      addQuestion({
        type: "terminal",
        question: `【終点クイズ】\n\n「${line.name}」の両端の駅はどれ？`,
        choices: makeChoices(answer, wrongPairs),
        answer: answer,
        point: 35,
        explanation: `「${line.name}」の両端は「${answer}」です。`
      });
    });

  // JRではない駅は？
  // JRにもある同名駅은 출제 안 함.
  const jrStations = [...new Set(targetLines.filter(l => l.company === "JR").flatMap(l => l.stations))];
  const nonJrStations = stations.filter(s => !jrStations.includes(s));

  nonJrStations.forEach(station => {
    addQuestion({
      type: "notJR",
      question: "【JRではない駅は？】\n\n次のうち、JRの駅ではないものはどれ？",
      choices: makeChoices(station, jrStations),
      answer: station,
      point: 20,
      explanation: `「${station}」はこのデータ内ではJRの駅ではありません。`
    });
  });

  // 通らない路線は？
  Object.keys(stationToLines).forEach(station => {
    const passingLines = linesAt(station);
    const notPassingLines = lineNames.filter(name => !passingLines.includes(name));

    if (passingLines.length < 3 || notPassingLines.length < 1) return;

    const answer = shuffle(notPassingLines)[0];

    addQuestion({
      type: "notPassingLine",
      question: `【通らない路線は？】\n\n「${station}」を通らない路線はどれ？`,
      choices: makeChoices(answer, passingLines),
      answer: answer,
      point: 25,
      explanation: `「${station}」を通らないのは「${answer}」です。`
    });
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

    const q = query(collection(db, "rankings"), orderBy("score", "desc"), limit(10));
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
  statusEl.innerText = `Score: ${score} | Best: ${getBestScore()} | Combo: ${combo} | Time: ${time}`;
}

function showScreen(screen) {
  startScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  screen.classList.remove("hidden");
}

function pickQuestionIndex() {
  const available = questions
    .map((q, index) => ({ q, index }))
    .filter(item => !usedIndexes.includes(item.index))
    .filter(item => !recentAnswers.includes(item.q.answer))
    .filter(item => !(recentTypes.length >= 2 && recentTypes[0] === item.q.type && recentTypes[1] === item.q.type));

  const pool = available.length > 0
    ? available
    : questions.map((q, index) => ({ q, index })).filter(item => !usedIndexes.includes(item.index));

  if (pool.length === 0) {
    usedIndexes = [];
    return Math.floor(Math.random() * questions.length);
  }

  return shuffle(pool)[0].index;
}

function loadQuestion() {
  resultEl.innerText = "";
  nextBtn.disabled = true;

  if (questions.length === 0) {
    questionEl.innerText = "問題を作成できませんでした。";
    choicesEl.innerHTML = "";
    return;
  }

  const index = pickQuestionIndex();
  usedIndexes.push(index);
  currentQuestion = questions[index];

  recentAnswers.unshift(currentQuestion.answer);
  recentAnswers = recentAnswers.slice(0, 4);
  recentTypes.unshift(currentQuestion.type);
  recentTypes = recentTypes.slice(0, 3);

  questionEl.innerText = `${currentQuestion.question}\n\n${currentQuestion.point}点問題`;
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

    resultEl.innerText = `⭕ 正解！ +${getPoint}点\nCombo: ${combo}${explanation}`;
  } else {
    combo = 0;
    wrongCount++;
    button.classList.add("wrong");

    resultEl.innerText = `❌ 不正解\n正解：${currentQuestion.answer}${explanation}`;
  }

  if (score > getBestScore()) {
    setBestScore(score);
  }

  updateStatus();
  nextBtn.disabled = false;
}

function startGame() {
  player = playerName.value.trim() || "名無し";
  score = 0;
  combo = 0;
  correctCount = 0;
  wrongCount = 0;
  time = GAME_TIME;
  usedIndexes = [];
  recentAnswers = [];
  recentTypes = [];

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
nextBtn.onclick = loadQuestion;

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

backToStartBtn.onclick = () => {
  showScreen(startScreen);
  showRanking();
};

time = GAME_TIME;
updateStatus();
showRanking();
showScreen(startScreen);
