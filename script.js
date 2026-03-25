let current = 0;
let score = 0;
let selected = null;
let timer; // タイマーID
const timeLimit = 30; // 秒数

// ランダム20問
let quiz = questions.sort(() => 0.5 - Math.random()).slice(0, 20);

function loadQuestion() {
  selected = null; // ←これ重要（バグ修正）
  clearInterval(timer); // 古いタイマー停止

  const q = quiz[current];

  document.getElementById("question").innerText = q.q;
  document.getElementById("progress").innerText = `${current + 1} / 10`;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  q.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice;

    btn.onclick = () => {
      selected = choice;

      // ボタン色リセット
      document.querySelectorAll("#choices button").forEach(b => {
        b.style.background = "";
      });

      // 選択中のボタンを強調
      btn.style.background = "lightblue";
    };

    choicesDiv.appendChild(btn);
  });

  // タイマー開始
  startTimer();
}

function startTimer() {
  let timeLeft = timeLimit;
  const timerEl = document.getElementById("timer");
  timerEl.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      autoNextQuestion();
    }
  }, 1000);
}

// タイムアップ時の自動処理
function autoNextQuestion() {
  // 選択されていなければスコアなしで次に
  current++;
  if (current < quiz.length) {
    loadQuestion();
  } else {
    finishTest();
  }
}

// ユーザーがボタンで進む場合
function nextQuestion() {
  if (!selected) {
    alert("選択してください");
    return;
  }

  if (selected === quiz[current].answer) {
    score++;
  }

  current++;
  if (current < quiz.length) {
    loadQuestion();
  } else {
    finishTest();
  }
}

function finishTest() {
  clearInterval(timer);

  document.getElementById("question").innerHTML = "";
  document.getElementById("choices").innerHTML = "";
  document.getElementById("timer").style.display = "none";

  const shop = document.getElementById("shop").value;
  const name = document.getElementById("name").value;

  // 未入力チェック
  if (!shop || !name) {
    alert("店舗名と氏名を入力してください");
    location.reload();
    return;
  }

  const resultText = score >= 8 ? "合格" : "不合格";

  document.getElementById("result").innerText =
    `${name}（${shop}）のスコア：${score}/10 → ${resultText}`;

  sendToSheet(shop, name, score);
}

// スプレッドシート送信
function sendToSheet(shop, name, score) {
  fetch("https://script.google.com/macros/s/AKfycbwmyrxLXB2AjoTzfnQlqD2zYA0NzQ8loBio9GsZwYHDLd6P7ZTHAjw-oRXdhAT8IdIFLQ/exec", {
    method: "POST",
    body: JSON.stringify({ shop, name, score })
  });
}

// 不正防止：タブ離脱
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    alert("不正検知：画面を離れたためリセットします");
    location.reload();
  }
});

// 初期起動
loadQuestion();