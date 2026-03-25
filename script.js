let current = 0;
let score = 0;
let selected = null;
let timer;
const timeLimit = 30;

// ランダム10問
let quiz = questions.sort(() => 0.5 - Math.random()).slice(0, 10);

function loadQuestion() {
  selected = null;
  clearInterval(timer);

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
      document.querySelectorAll("#choices button").forEach(b => b.style.background = "#2196F3");
      btn.style.background = "lightblue";
    };

    choicesDiv.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  clearInterval(timer);
  let timeLeft = timeLimit;
  const timerBar = document.getElementById("timerBar");
  const timerText = document.getElementById("timerText");

  timerBar.style.width = "100%";
  timerBar.style.background = "lightgreen";
  timerText.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    const percent = (timeLeft / timeLimit) * 100;
    timerBar.style.width = percent + "%";
    timerText.textContent = timeLeft;

    if (timeLeft > timeLimit * 0.6) {
      timerBar.style.background = "lightgreen";
    } else if (timeLeft > timeLimit * 0.3) {
      timerBar.style.background = "yellow";
    } else {
      timerBar.style.background = "red";
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      autoNextQuestion();
    }
  }, 1000);
}

function autoNextQuestion() {
  current++;
  if (current < quiz.length) {
    loadQuestion();
  } else {
    finishTest();
  }
}

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
  document.getElementById("timerContainer").style.display = "none";

  const shop = document.getElementById("shop").value;
  const name = document.getElementById("name").value;

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
