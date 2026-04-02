(() => {
  const PRESETS = {
    beginner: { rows: 9, cols: 9, mines: 10, label: "初级" },
    intermediate: { rows: 16, cols: 16, mines: 40, label: "中级" },
    expert: { rows: 16, cols: 30, mines: 99, label: "高级" }
  };

  const boardEl = document.getElementById("board");
  const mineCounterEl = document.getElementById("mineCounter");
  const timerEl = document.getElementById("timer");
  const statusEl = document.getElementById("statusText");
  const restartBtn = document.getElementById("restartBtn");
  const customStartBtn = document.getElementById("customStartBtn");
  const levelButtons = [...document.querySelectorAll(".level-btn")];
  const rowsInput = document.getElementById("rowsInput");
  const colsInput = document.getElementById("colsInput");
  const minesInput = document.getElementById("minesInput");
  const commandInput = document.getElementById("commandInput");
  const commandBtn = document.getElementById("commandBtn");

  let state = null;
  let timer = null;
  let activeLevel = "beginner";

  function createCell() {
    return {
      mine: false,
      revealed: false,
      mark: "none", // none | flag | question
      adjacent: 0
    };
  }

  function startNewGame(config, source = "normal") {
    const rows = Number(config.rows);
    const cols = Number(config.cols);
    let mines = Number(config.mines);

    if (!Number.isInteger(rows) || !Number.isInteger(cols) || !Number.isInteger(mines)) {
      setStatus("参数无效，请检查行列和雷数。", "lose");
      return;
    }

    if (rows < 5 || cols < 5 || rows > 30 || cols > 40) {
      setStatus("行列范围应在 5-30 行、5-40 列。", "lose");
      return;
    }

    const maxMines = rows * cols - 1;
    if (mines < 1) {
      mines = 1;
    }
    if (mines > maxMines) {
      mines = maxMines;
    }

    state = {
      rows,
      cols,
      mines,
      board: Array.from({ length: rows }, () => Array.from({ length: cols }, () => createCell())),
      started: false,
      ended: false,
      win: false,
      elapsed: 0,
      flags: 0,
      revealedCount: 0
    };

    clearInterval(timer);
    timer = null;
    timerEl.textContent = "0";
    mineCounterEl.textContent = String(state.mines);

    if (source === "command") {
      setStatus(`【扫雷】${rows}x${cols} 棋盘已生成。共有 ${state.mines} 个雷。祝你好运！`);
    } else {
      setStatus("准备开始：首点安全，开冲！");
    }

    renderBoard();
  }

  function setStatus(text, type = "normal") {
    statusEl.textContent = text;
    statusEl.classList.remove("win", "lose");
    if (type === "win" || type === "lose") {
      statusEl.classList.add(type);
    }
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = `repeat(${state.cols}, var(--cell-size))`;

    for (let r = 0; r < state.rows; r += 1) {
      for (let c = 0; c < state.cols; c += 1) {
        const btn = document.createElement("button");
        const cell = state.board[r][c];

        btn.className = "cell";
        btn.dataset.r = String(r);
        btn.dataset.c = String(c);
        btn.type = "button";

        if (cell.revealed) {
          btn.classList.add("open");
          if (cell.mine) {
            btn.textContent = "*";
            btn.classList.add("mine");
          } else if (cell.adjacent > 0) {
            btn.textContent = String(cell.adjacent);
            btn.classList.add(`n${cell.adjacent}`);
          } else {
            btn.textContent = "□";
          }
        } else if (cell.mark === "flag") {
          btn.textContent = "🚩";
        } else if (cell.mark === "question") {
          btn.textContent = "❓";
        } else {
          btn.textContent = "■";
        }

        boardEl.appendChild(btn);
      }
    }

    mineCounterEl.textContent = String(state.mines - state.flags);
  }

  function startTimerIfNeeded() {
    if (timer || !state.started || state.ended) {
      return;
    }
    timer = setInterval(() => {
      state.elapsed += 1;
      timerEl.textContent = String(state.elapsed);
    }, 1000);
  }

  function neighbors(r, c) {
    const result = [];
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (dr === 0 && dc === 0) {
          continue;
        }
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
          result.push([nr, nc]);
        }
      }
    }
    return result;
  }

  function placeMines(safeR, safeC) {
    const pool = [];
    for (let r = 0; r < state.rows; r += 1) {
      for (let c = 0; c < state.cols; c += 1) {
        if (r === safeR && c === safeC) {
          continue;
        }
        pool.push([r, c]);
      }
    }

    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }

    for (let i = 0; i < state.mines; i += 1) {
      const [r, c] = pool[i];
      state.board[r][c].mine = true;
    }

    for (let r = 0; r < state.rows; r += 1) {
      for (let c = 0; c < state.cols; c += 1) {
        if (state.board[r][c].mine) {
          continue;
        }
        state.board[r][c].adjacent = neighbors(r, c).filter(([nr, nc]) => state.board[nr][nc].mine).length;
      }
    }
  }

  function revealCell(r, c, fromChord = false) {
    if (state.ended) {
      return;
    }

    const cell = state.board[r][c];

    if (cell.revealed || cell.mark === "flag") {
      return;
    }

    if (!state.started) {
      placeMines(r, c);
      state.started = true;
      startTimerIfNeeded();
    }

    if (cell.mine) {
      cell.revealed = true;
      explode(r, c);
      return;
    }

    floodReveal(r, c);
    checkWin();

    if (!state.ended && !fromChord) {
      setStatus("继续推理，小心雷区。");
    }

    renderBoard();
  }

  function floodReveal(startR, startC) {
    const queue = [[startR, startC]];

    while (queue.length) {
      const [r, c] = queue.shift();
      const cell = state.board[r][c];
      if (cell.revealed || cell.mark === "flag") {
        continue;
      }

      cell.revealed = true;
      state.revealedCount += 1;

      if (cell.adjacent === 0) {
        const around = neighbors(r, c);
        for (const [nr, nc] of around) {
          const nextCell = state.board[nr][nc];
          if (!nextCell.revealed && !nextCell.mine && nextCell.mark !== "flag") {
            queue.push([nr, nc]);
          }
        }
      }
    }
  }

  function cycleMark(r, c) {
    if (state.ended) {
      return;
    }

    const cell = state.board[r][c];

    if (cell.revealed) {
      return;
    }

    if (cell.mark === "none") {
      cell.mark = "flag";
      state.flags += 1;
    } else if (cell.mark === "flag") {
      cell.mark = "question";
      state.flags -= 1;
    } else {
      cell.mark = "none";
    }

    renderBoard();
  }

  function chordReveal(r, c) {
    if (state.ended) {
      return;
    }

    const cell = state.board[r][c];
    if (!cell.revealed || cell.adjacent <= 0) {
      return;
    }

    const around = neighbors(r, c);
    const flagCount = around.filter(([nr, nc]) => state.board[nr][nc].mark === "flag").length;

    if (flagCount !== cell.adjacent) {
      return;
    }

    for (const [nr, nc] of around) {
      const nCell = state.board[nr][nc];
      if (!nCell.revealed && nCell.mark !== "flag") {
        revealCell(nr, nc, true);
        if (state.ended) {
          break;
        }
      }
    }

    if (!state.ended) {
      renderBoard();
    }
  }

  function revealAllMines(triggerR, triggerC) {
    for (let r = 0; r < state.rows; r += 1) {
      for (let c = 0; c < state.cols; c += 1) {
        const cell = state.board[r][c];
        if (cell.mine) {
          cell.revealed = true;
        }
      }
    }

    const trigger = state.board[triggerR][triggerC];
    trigger.revealed = true;
  }

  function explode(triggerR, triggerC) {
    state.ended = true;
    clearInterval(timer);
    timer = null;
    revealAllMines(triggerR, triggerC);
    renderBoard();

    const idx = triggerR * state.cols + triggerC;
    const cellBtn = boardEl.children[idx];
    if (cellBtn) {
      cellBtn.textContent = "💥";
      cellBtn.classList.add("mine");
    }

    setStatus("💥 轰！你踩到雷了。游戏结束。点击重玩再来一局。", "lose");
  }

  function checkWin() {
    const target = state.rows * state.cols - state.mines;
    if (state.revealedCount === target) {
      state.ended = true;
      state.win = true;
      clearInterval(timer);
      timer = null;
      setStatus("🎉 恭喜！所有非雷格子已翻开，你赢了！", "win");
    }
  }

  function applyLevel(levelKey) {
    const level = PRESETS[levelKey] || PRESETS.beginner;
    activeLevel = levelKey;
    rowsInput.value = String(level.rows);
    colsInput.value = String(level.cols);
    minesInput.value = String(level.mines);
    levelButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.level === levelKey));
    startNewGame(level);
  }

  function parseCommand(raw) {
    const text = raw.trim().toLowerCase();

    if (!text) {
      return;
    }

    if (text === "重来" || text === "新一局" || text === "开始扫雷") {
      applyLevel(activeLevel);
      return;
    }

    if (text.startsWith("/mine")) {
      if (text.includes("初级")) {
        applyLevel("beginner");
        return;
      }
      if (text.includes("中级")) {
        applyLevel("intermediate");
        return;
      }
      if (text.includes("高级")) {
        applyLevel("expert");
        return;
      }
      applyLevel(activeLevel);
      return;
    }

    const openMatch = text.match(/^点开\s+(\d+)\s+(\d+)$/);
    if (openMatch) {
      const rr = Number(openMatch[1]) - 1;
      const cc = Number(openMatch[2]) - 1;
      if (rr >= 0 && rr < state.rows && cc >= 0 && cc < state.cols) {
        revealCell(rr, cc);
      } else {
        setStatus("坐标越界，请检查输入。", "lose");
      }
      renderBoard();
      return;
    }

    setStatus("无法识别的命令。可用：/mine 初级、中级、高级、开始扫雷、重来、新一局、点开 行 列", "lose");
  }

  boardEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".cell");
    if (!btn || state.ended) {
      return;
    }
    const r = Number(btn.dataset.r);
    const c = Number(btn.dataset.c);
    revealCell(r, c);
  });

  boardEl.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const btn = event.target.closest(".cell");
    if (!btn || state.ended) {
      return;
    }
    const r = Number(btn.dataset.r);
    const c = Number(btn.dataset.c);
    cycleMark(r, c);
  });

  boardEl.addEventListener("dblclick", (event) => {
    const btn = event.target.closest(".cell");
    if (!btn || state.ended) {
      return;
    }
    const r = Number(btn.dataset.r);
    const c = Number(btn.dataset.c);
    chordReveal(r, c);
  });

  restartBtn.addEventListener("click", () => {
    applyLevel(activeLevel);
  });

  levelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLevel(btn.dataset.level);
    });
  });

  customStartBtn.addEventListener("click", () => {
    const cfg = {
      rows: Number(rowsInput.value),
      cols: Number(colsInput.value),
      mines: Number(minesInput.value)
    };
    activeLevel = "custom";
    levelButtons.forEach((btn) => btn.classList.remove("active"));
    startNewGame(cfg);
  });

  function runCommandInput() {
    parseCommand(commandInput.value);
    commandInput.value = "";
    commandInput.focus();
  }

  commandBtn.addEventListener("click", runCommandInput);
  commandInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runCommandInput();
    }
  });

  applyLevel("beginner");

  // 移动端：标旗模式 + 长按标旗
  (function initMobileFlag() {
      var flagMode = false;
      var flagBtn = document.getElementById('flagModeBtn');
      if (!flagBtn) return;

      flagBtn.addEventListener('click', function() {
          flagMode = !flagMode;
          flagBtn.classList.toggle('active', flagMode);
          flagBtn.textContent = flagMode ? '🚩 标记中(点击标旗)' : '🚩 标记模式';
      });

      // 在标旗模式下，点击变为标旗
      boardEl.addEventListener('click', function(e) {
          if (!flagMode) return;
          var btn = e.target.closest('.cell');
          if (!btn || state.ended) return;
          e.stopImmediatePropagation();
          var r = Number(btn.dataset.r);
          var c = Number(btn.dataset.c);
          cycleMark(r, c);
      }, true);

      // 长按触发标旗
      var longPressTimer = null;
      var longPressed = false;
      boardEl.addEventListener('touchstart', function(e) {
          var btn = e.target.closest('.cell');
          if (!btn || state.ended) return;
          longPressed = false;
          longPressTimer = setTimeout(function() {
              longPressed = true;
              var r = Number(btn.dataset.r);
              var c = Number(btn.dataset.c);
              cycleMark(r, c);
          }, 500);
      }, { passive: true });
      boardEl.addEventListener('touchend', function(e) {
          if (longPressTimer) clearTimeout(longPressTimer);
          if (longPressed) { e.preventDefault(); longPressed = false; }
      });
      boardEl.addEventListener('touchmove', function() {
          if (longPressTimer) clearTimeout(longPressTimer);
      }, { passive: true });
      boardEl.addEventListener('touchcancel', function() {
          if (longPressTimer) clearTimeout(longPressTimer);
      });
  })();
})();
