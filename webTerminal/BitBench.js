/* ============================================================
   BitBench — browser port
   Reimplements the circuit logic from BitBench.java (bitwise
   ops only: ^ & ~ |) and wraps it in a small terminal shell.
   ============================================================ */

(function () {
  "use strict";

const outputEl = document.getElementById("output");
let terminalInput = "";
let cursorVisible = true;
let currentInputLine = null;

  const history = [];
  let historyPos = -1;

  // ---------- output helpers ----------

  function print(text, cls) {
    const div = document.createElement("div");
    div.className = "line" + (cls ? " " + cls : "");
    div.textContent = text;
    outputEl.appendChild(div);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function printBlank() {
    print("", "dim");
  }

  function scrollToBottom() {
    outputEl.scrollTop = outputEl.scrollHeight;
  }
  
  function createInputLine() {
  const line = document.createElement("div");
  line.className = "line echo terminal-input-line";

  const prompt = document.createElement("span");
  prompt.className = "terminal-prompt";
  prompt.textContent = "> ";

  const text = document.createElement("span");
  text.className = "terminal-input-text";

  const cursor = document.createElement("span");
  cursor.className = "cursor-blink";

  line.appendChild(prompt);
  line.appendChild(text);
  line.appendChild(cursor);

  outputEl.appendChild(line);

  currentInputLine = {
    line,
    text,
    cursor
  };

  terminalInput = "";

  scrollToBottom();
}


function updateInputLine() {
  if (!currentInputLine) return;

  currentInputLine.text.textContent = terminalInput;

  scrollToBottom();
}


function submitTerminalInput() {
  if (!currentInputLine) return;

  const raw = terminalInput;

  // Remove blinking cursor from submitted command
  currentInputLine.cursor.remove();

  // This line is now permanent
  currentInputLine = null;
  terminalInput = "";

  if (raw.trim() !== "") {
    history.push(raw);
    historyPos = history.length;
  }

  if (!flow) {
    beginFlow(raw.trim());
  } else if (flow.type === "exited") {
    // Session has ended
  } else {
    advanceFlow(raw);
  }

  if (!flow || flow.type !== "exited") {
    createInputLine();
  }

  scrollToBottom();
}


  // ---------- circuit logic (bitwise only, mirrors the Java) ----------

  const Gates = {
    halfAdder(a, b) {
      return { sum: a ^ b, carry: a & b };
    },
    fullAdder(a, b, cin) {
      const sum = a ^ b ^ cin;
      const carry = (a & b) | (cin & (a ^ b));
      return { sum, carry };
    },
    halfSubtractor(a, b) {
      const diff = a ^ b;
      const borrow = (~a) & b & 1;
      return { diff, borrow };
    },
    fullSubtractor(a, b, bin) {
      const diff = a ^ b ^ bin;
      // borrow-out = (~a & b) | (~a & bin) | (b & bin), all bitwise
      const notA = (~a) & 1;
      const borrow = (notA & b) | (notA & bin) | (b & bin);
      return { diff, borrow: borrow & 1 };
    }
  };

  function validateBinaryPair(aStr, bStr) {
    if (aStr.length !== bStr.length) {
      return "Error: inputs must be the same length.";
    }
    if (!/^[01]+$/.test(aStr) || !/^[01]+$/.test(bStr)) {
      return "Error: inputs must contain only 0 and 1.";
    }
    return null;
  }

  // ---------- combinational circuit runners ----------

  function runHalfAdder(aStr, bStr) {
    const err = validateBinaryPair(aStr, bStr);
    if (err) { print(err, "err"); return; }

    print("");
    print("A B | SUM CARRY", "table-head");
    print("----------------", "rule");
    for (let i = 0; i < aStr.length; i++) {
      const a = Number(aStr[i]), b = Number(bStr[i]);
      const { sum, carry } = Gates.halfAdder(a, b);
      print(`${a} ${b} |  ${sum}   ${carry}`, "ok");
    }
  }

  function runFullAdder(aStr, bStr, cinStr) {
    const err = validateBinaryPair(aStr, bStr);
    if (err) { print(err, "err"); return; }
    if (cinStr.length !== aStr.length || !/^[01]+$/.test(cinStr)) {
      print("Error: carry-in must match input length and be binary.", "err");
      return;
    }
    print("");
    print("A B Cin | SUM CARRY", "table-head");
    print("--------------------", "rule");
    for (let i = 0; i < aStr.length; i++) {
      const a = Number(aStr[i]), b = Number(bStr[i]), cin = Number(cinStr[i]);
      const { sum, carry } = Gates.fullAdder(a, b, cin);
      print(` ${a} ${b}  ${cin}  |  ${sum}   ${carry}`, "ok");
    }
  }

  function runHalfSubtractor(aStr, bStr) {
    const err = validateBinaryPair(aStr, bStr);
    if (err) { print(err, "err"); return; }
    print("");
    print("A B | DIFF BORROW", "table-head");
    print("-----------------", "rule");
    for (let i = 0; i < aStr.length; i++) {
      const a = Number(aStr[i]), b = Number(bStr[i]);
      const { diff, borrow } = Gates.halfSubtractor(a, b);
      print(`${a} ${b} |  ${diff}    ${borrow}`, "ok");
    }
  }

  function runFullSubtractor(aStr, bStr, binStr) {
    const err = validateBinaryPair(aStr, bStr);
    if (err) { print(err, "err"); return; }
    if (binStr.length !== aStr.length || !/^[01]+$/.test(binStr)) {
      print("Error: borrow-in must match input length and be binary.", "err");
      return;
    }
    print("");
    print("A B Bin | DIFF BORROW", "table-head");
    print("----------------------", "rule");
    for (let i = 0; i < aStr.length; i++) {
      const a = Number(aStr[i]), b = Number(bStr[i]), bin = Number(binStr[i]);
      const { diff, borrow } = Gates.fullSubtractor(a, b, bin);
      print(` ${a} ${b}  ${bin}  |  ${diff}    ${borrow}`, "ok");
    }
  }

  // ---------- flip-flops: iterate Q=0 and Q=1 for each input pair ----------

  function runSR(sStr, rStr) {
    const err = validateBinaryPair(sStr, rStr);
    if (err) { print(err, "err"); return; }
    print("");
    print("S R Q(t) | Q(t+1)   State", "table-head");
    print("---------------------------", "rule");
    for (let i = 0; i < sStr.length; i++) {
      const s = Number(sStr[i]), r = Number(rStr[i]);
      for (let q = 0; q <= 1; q++) {
        if (s === 1 && r === 1) {
          print(`${s} ${r}  ${q}   |   -      invalid (skipped)`, "err");
          continue;
        }
        let qNext;
        if (s === 1 && r === 0) qNext = 1;
        else if (s === 0 && r === 1) qNext = 0;
        else qNext = q; // s=0, r=0 -> hold
        print(`${s} ${r}  ${q}   |   ${qNext}      ${qNext === q ? "hold" : "set/reset"}`, "ok");
      }
    }
  }

  function runJK(jStr, kStr) {
    const err = validateBinaryPair(jStr, kStr);
    if (err) { print(err, "err"); return; }
    print("");
    print("J K Q(t) | Q(t+1)   State", "table-head");
    print("---------------------------", "rule");
    for (let i = 0; i < jStr.length; i++) {
      const j = Number(jStr[i]), k = Number(kStr[i]);
      for (let q = 0; q <= 1; q++) {
        let qNext;
        if (j === 0 && k === 0) qNext = q;
        else if (j === 0 && k === 1) qNext = 0;
        else if (j === 1 && k === 0) qNext = 1;
        else qNext = q ^ 1; // j=1,k=1 -> toggle
        const label = (j === 1 && k === 1) ? "toggle" : (qNext === q ? "hold" : "set/reset");
        print(`${j} ${k}  ${q}   |   ${qNext}      ${label}`, "ok");
      }
    }
  }

  function runT(tStr) {
    if (!/^[01]+$/.test(tStr)) { print("Error: input must be binary.", "err"); return; }
    print("");
    print("T Q(t) | Q(t+1)   State", "table-head");
    print("-------------------------", "rule");
    for (let i = 0; i < tStr.length; i++) {
      const t = Number(tStr[i]);
      for (let q = 0; q <= 1; q++) {
        const qNext = t === 1 ? (q ^ 1) : q;
        print(`${t}  ${q}   |   ${qNext}      ${t === 1 ? "toggle" : "hold"}`, "ok");
      }
    }
  }

  function runD(dStr) {
    if (!/^[01]+$/.test(dStr)) { print("Error: input must be binary.", "err"); return; }
    print("");
    print("D Q(t) | Q(t+1)   State", "table-head");
    print("-------------------------", "rule");
    for (let i = 0; i < dStr.length; i++) {
      const d = Number(dStr[i]);
      for (let q = 0; q <= 1; q++) {
        print(`${d}  ${q}   |   ${d}      follows D`, "ok");
      }
    }
  }

  // ---------- shell: menu + input-flow state machine ----------

  const MENU = [
    "===== DIGITAL CIRCUIT PROGRAM =====",
    "1. Half Adder",
    "2. Full Adder",
    "3. Half Subtractor",
    "4. Full Subtractor",
    "5. SR Flip-Flop",
    "6. JK Flip-Flop",
    "7. T Flip-Flop",
    "8. D Flip-Flop",
    "9. Exit"
  ];

  function printMenu() {
    printBlank();
    MENU.forEach((l, i) => print(l, i === 0 ? "banner" : "dim"));
    printBlank();
  }

  // flow: null = waiting for menu choice
  // otherwise an object describing which prompt we're waiting for
  let flow = null;

  function beginFlow(choice) {
    switch (choice) {
      case "1":
        flow = { type: "1", step: "a" };
        print("Enter A:", "prompt");
        break;
      case "2":
        flow = { type: "2", step: "a" };
        print("Enter A:", "prompt");
        break;
      case "3":
        flow = { type: "3", step: "a" };
        print("Enter A:", "prompt");
        break;
      case "4":
        flow = { type: "4", step: "a" };
        print("Enter A:", "prompt");
        break;
      case "5":
        flow = { type: "5", step: "s" };
        print("Enter S:", "prompt");
        break;
      case "6":
        flow = { type: "6", step: "j" };
        print("Enter J:", "prompt");
        break;
      case "7":
        flow = { type: "7", step: "t" };
        print("Enter T:", "prompt");
        break;
      case "8":
        flow = { type: "8", step: "d" };
        print("Enter D:", "prompt");
        break;
      case "9":
        print("");
        print("Exiting BitBench. Goodbye.", "banner");
        flow = { type: "exited" };
        inputEl.disabled = true;
        inputEl.placeholder = "session ended — refresh to restart";
        break;
      default:
        print("Invalid choice. Enter a number from 1-9.", "err");
        printMenu();
        print("Choose an option (1-9):", "prompt");
    }
  }

  function advanceFlow(raw) {
    const val = raw.trim();

    switch (flow.type) {
      case "1": // half adder
        if (flow.step === "a") { flow.a = val; flow.step = "b"; print("Enter B:", "prompt"); return; }
        runHalfAdder(flow.a, val);
        endFlow();
        return;

      case "2": // full adder
        if (flow.step === "a") { flow.a = val; flow.step = "b"; print("Enter B:", "prompt"); return; }
        if (flow.step === "b") { flow.b = val; flow.step = "c"; print("Enter Carry-in:", "prompt"); return; }
        runFullAdder(flow.a, flow.b, val);
        endFlow();
        return;

      case "3": // half subtractor
        if (flow.step === "a") { flow.a = val; flow.step = "b"; print("Enter B:", "prompt"); return; }
        runHalfSubtractor(flow.a, val);
        endFlow();
        return;

      case "4": // full subtractor
        if (flow.step === "a") { flow.a = val; flow.step = "b"; print("Enter B:", "prompt"); return; }
        if (flow.step === "b") { flow.b = val; flow.step = "c"; print("Enter Borrow-in:", "prompt"); return; }
        runFullSubtractor(flow.a, flow.b, val);
        endFlow();
        return;

      case "5": // SR
        if (flow.step === "s") { flow.s = val; flow.step = "r"; print("Enter R:", "prompt"); return; }
        runSR(flow.s, val);
        endFlow();
        return;

      case "6": // JK
        if (flow.step === "j") { flow.j = val; flow.step = "k"; print("Enter K:", "prompt"); return; }
        runJK(flow.j, val);
        endFlow();
        return;

      case "7": // T
        runT(val);
        endFlow();
        return;

      case "8": // D
        runD(val);
        endFlow();
        return;
    }
  }

  function endFlow() {
    flow = null;
    printMenu();
    print("Choose an option (1-9):", "prompt");
  }

  // ---------- boot sequence ----------

  const BOOT_LINES = [
    { text: "BitBench v1.0 — booting simulator...", cls: "dim", delay: 40 },
    { text: "", cls: "dim", delay: 10 },
    { text: "BitBench — terminal-based digital circuit simulator", cls: "banner", delay: 20 },
    { text: "no libraries. no shortcuts. just bitwise operators.", cls: "dim", delay: 20 },
  ];

  function typeLine(text, cls, cb) {
    if (text === "") { print(""); cb(); return; }
    const div = document.createElement("div");
    div.className = "line" + (cls ? " " + cls : "");
    outputEl.appendChild(div);
    let i = 0;
    const speed = Math.max(4, Math.min(14, 320 / text.length));
    (function step() {
      div.textContent = text.slice(0, i) + (i < text.length ? "▌" : "");
      scrollToBottom();
      if (i < text.length) {
        i++;
        setTimeout(step, speed);
      } else {
        div.textContent = text;
        cb();
      }
    })();
  }

  function boot(index) {
    if (index >= BOOT_LINES.length) {
      printMenu();
      print("Choose an option (1-9):", "prompt");
      createInputLine();
      outputEl.focus();
      return;
    }
    const line = BOOT_LINES[index];
    typeLine(line.text, line.cls, () => setTimeout(() => boot(index + 1), line.delay));
  }

  // ---------- input wiring ----------


  outputEl.addEventListener("keydown", (e) => {

  if (flow && flow.type === "exited") {
    return;
  }

  // ENTER
  if (e.key === "Enter") {
    e.preventDefault();
    submitTerminalInput();
    return;
  }

  // BACKSPACE
  if (e.key === "Backspace") {
    e.preventDefault();

    if (terminalInput.length > 0) {
      terminalInput = terminalInput.slice(0, -1);
      updateInputLine();
    }

    return;
  }

  // ARROW UP — previous command
  if (e.key === "ArrowUp") {
    e.preventDefault();

    if (history.length === 0) return;

    historyPos = Math.max(0, historyPos - 1);
    terminalInput = history[historyPos] || "";

    updateInputLine();
    return;
  }

  // ARROW DOWN — next command
  if (e.key === "ArrowDown") {
    e.preventDefault();

    if (history.length === 0) return;

    historyPos = Math.min(history.length, historyPos + 1);
    terminalInput = history[historyPos] || "";

    updateInputLine();
    return;
  }

  // Ignore Ctrl / Alt / Windows / Command keys
  if (
    e.ctrlKey ||
    e.altKey ||
    e.metaKey ||
    e.key.length !== 1
  ) {
    return;
  }

  // Normal keyboard character
  terminalInput += e.key;

  updateInputLine();
});

  document.addEventListener("click", () => {
  outputEl.focus();
});

  boot(0);
})();