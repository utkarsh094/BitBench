# BitBench

digital logic is something every CS student encounters, but running through truth tables by hand is slow and error-prone. BitBench is a terminal-based Java program that simulates the core building blocks of digital electronics adders, subtractors, and flip-flops using raw bit manipulation, no libraries, no overhead.

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

## quickstart
 
no cloning needed. just download and run:
 
1. download `BitBench.jar` from [Releases](https://github.com/yourusername/BitBench/releases)
2. open terminal in your download folder
3. run:
```bash
java -jar BitBench.jar
```
 

## requirements
 
**Java**
- Java Runtime Environment (JRE) 8 or above
- check if you have it: `java -version`
- if not, download from [https://adoptium.net](https://adoptium.net) — one-time install
---
 
## run it
 
### Java
 
**option 1 — releases (easiest, no cloning)**
 
download `BitBench.jar` from [Releases](https://github.com/yourusername/BitBench/releases), then:
```bash
java -jar BitBench.jar
```
 
**option 2 — build from source**
```bash
git clone https://github.com/yourusername/BitBench.git
cd BitBench
javac src/java/BitBench.java
java -cp src/java BitBench
```
 
---
 
on Windows:
```bash
gcc src/c/BitBench.c -o BitBench.exe
BitBench.exe
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
BitBench/
├── src/
│   └── java/
│       └── BitBench.java
├── bin/
│   └── BitBench.jar
├── .gitignore
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
