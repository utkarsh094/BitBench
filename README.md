# DigitalCircuit

digital logic is something every CS and ENTC student encounters, but running through truth tables by hand is slow and error-prone. DigitalCircuit is a terminal-based Java program that simulates the core building blocks of digital electronics — adders, subtractors, and flip-flops — using raw bit manipulation, no libraries, no overhead.

you type in binary inputs, it gives you the exact outputs a real circuit would produce.

---

## what it simulates

**combinational circuits**
- Half Adder — SUM and CARRY from two single bits
- Full Adder — SUM and CARRY with a carry-in
- Half Subtractor — DIFF and BORROW from two bits
- Full Subtractor — DIFF and BORROW with a borrow-in

**sequential circuits (flip-flops)**
- SR Flip-Flop — Set/Reset latch with invalid state handling
- JK Flip-Flop — eliminates the undefined SR state via toggle
- T Flip-Flop — toggles output on T=1
- D Flip-Flop — output simply follows input

---

## how it actually works

all logic is implemented using Java's bitwise operators — `^` (XOR), `&` (AND), `~` (NOT), `|` (OR). no `if (a + b)` shortcuts. the gates are the operators.

for example, a half adder in the code looks like:
```
sum   = a ^ b
carry = a & b
```

flip-flops iterate over both possible current states (Q=0 and Q=1) for each input pair, so you see the full state transition table, not just one scenario.

---

## requirements

- Java Runtime Environment (JRE) 8 or above
- that's it

check if you already have it:
```bash
java -version
```

if not, download from [https://adoptium.net](https://adoptium.net) — it's a one-time install.

---

## run it

**option 1 — download the pre-built JAR (easiest)**

grab `DigitalCircuit.jar` from this repo, then:
```bash
java -jar DigitalCircuit.jar
```

**option 2 — build from source**
```bash
javac src/DigitalCircuit.java
java -cp src DigitalCircuit
```

---

## usage

once running, you'll see a menu:

```
===== DIGITAL CIRCUIT PROGRAM =====
1. Half Adder
2. Full Adder
3. Half Subtractor
4. Full Subtractor
5. SR Flip-Flop
6. JK Flip-Flop
7. T Flip-Flop
8. D Flip-Flop
9. Exit
```

pick a circuit, enter binary strings as input (e.g. `0110`), and it prints a formatted truth table for each bit pair.

**example — Half Adder**
```
Enter A: 011
Enter B: 101

A B | SUM CARRY
----------------
0 1 |  1   0
1 0 |  1   0
1 1 |  0   1
```

inputs must be the same length. the program tells you if they aren't.

---

## repo structure

```
DigitalCircuit/
├── src/
│   └── DigitalCircuit.java
├── DigitalCircuit.jar
├── LICENSE
└── README.md
```

---

## limitations

- inputs are validated for equal length but not for non-binary characters — entering anything other than `0` and `1` will give wrong output silently
- SR Flip-Flop skips the S=1, R=1 state (invalid/undefined), as is standard
- no graphical output — this is purely terminal

---

## license

MIT — see [LICENSE](LICENSE)
