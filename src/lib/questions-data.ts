/**
 * DSAT Questions Data — imported directly from Dr. Joe's questions.js
 * No PHP/MySQL/XAMPP required.
 */

export interface DSATQuestion {
  id: string;
  module: number;
  text: string;
  passage?: string;
  type: 'MC' | 'SPR';
  options?: string[];
  correctAnswer: string; // 'A'|'B'|'C'|'D' for MC, or numeric string for SPR
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl?: string | null;
  skill?: string;
  domain?: string;
  explanation?: string;
  _subject?: string; // Appended by questions-pool
}

export interface DSATTestData {
  name: string;
  subject?: string;
  isFull?: boolean;
  M1: DSATQuestion[];
  M2H: DSATQuestion[];
  M2E: DSATQuestion[];
  MATH_M1?: DSATQuestion[];
  MATH_M2H?: DSATQuestion[];
  MATH_M2E?: DSATQuestion[];
}

export type DSATModule = Omit<DSATTestData, 'name'>;

// ──────────────────────────────────────────────────────────────
// TABLE HTML helpers (used as answer options for certain questions)
// ──────────────────────────────────────────────────────────────

const tbl = (headers: string[], rows: string[][]) =>
  `<table class="question-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

// M1_DATA_T2 tables
const M1_DATA_T2 = {
  Q9_A: tbl(['$x$', '$y$'], [['0', '14'], ['5', '21'], ['10', '28']]),
  Q9_B: tbl(['$x$', '$y$'], [['0', '28'], ['5', '21'], ['10', '14']]),
  Q9_C: tbl(['$x$', '$y$'], [['14', '0'], ['21', '5'], ['28', '10']]),
  Q9_D: tbl(['$x$', '$y$'], [['14', '10'], ['21', '5'], ['28', '0']]),
};

// M2E_DATA_T1 tables
const M2E_DATA_T1 = {
  Q4_A: tbl(['x', 'y'], [['5', '4'], ['6', '5'], ['7', '6']]),
  Q4_B: tbl(['x', 'y'], [['-12', '-5'], ['-11', '-6'], ['-10', '-7']]),
  Q4_C: tbl(['x', 'y'], [['-12', '-13'], ['-11', '-12'], ['-10', '-11']]),
  Q4_D: tbl(['x', 'y'], [['5', '10'], ['6', '9'], ['7', '8']]),
  Q11_A: tbl(['Value', 'Freq'], [['60', '3'], ['70', '3'], ['80', '3'], ['90', '3']]),
  Q11_B: tbl(['Value', 'Freq'], [['60', '4'], ['70', '3'], ['80', '3'], ['90', '4']]),
  Q11_C: tbl(['Value', 'Freq'], [['60', '1'], ['70', '2'], ['80', '3'], ['90', '4']]),
  Q11_D: tbl(['Value', 'Freq'], [['60', '1'], ['70', '1'], ['80', '1'], ['90', '7']]),
};

// ──────────────────────────────────────────────────────────────
// ALL TEST QUESTIONS
// ──────────────────────────────────────────────────────────────

export const ALL_TEST_QUESTIONS: Record<string, DSATTestData> = {

  // ════════════════════════════════════════════════════════════
  //  TEST 1 — DSAT Mock Test 1
  // ════════════════════════════════════════════════════════════
  TEST_1: {
    name: 'DSAT Mock Test 1',

    // ── MODULE 1 (22 questions, mixed difficulty) ──
    M1: [
      { id: 'T1M1_Q1', module: 1, text: 'A goose species flies at an average speed of $16$ meters per second. At this rate, how many meters would this goose fly in $6$ seconds?', type: 'MC', options: ['$96$', '$16$', '$10$', '$22$'], correctAnswer: 'A', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M1_Q2', module: 1, text: 'The expression $3x^3 \\cdot 3x^5$ is equivalent to which of the following?', type: 'MC', options: ['$6x^8$', '$9x^8$', '$6x^{15}$', '$9x^{15}$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M1_Q3', module: 1, text: 'Which expression is equivalent to $(5x^3+4x-4)-(4x^3+7x+3)$?', type: 'MC', options: ['$x^3+11x-1$', '$x^3+3x-1$', '$x^3+11x-7$', '$x^3-3x-7$'], correctAnswer: 'D', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M1_Q4', module: 1, text: 'The equation $y = 3x - 4$ has a slope of:', type: 'MC', options: ['$4$', '$-4$', '$3$', '$-3$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M1_Q5', module: 1, text: '$g = 13 - \\frac{x}{29}$. The equation gives the estimated amount of gas $g$, in gallons, remaining after driving $x$ miles. What is the estimated gas remaining when $x = 290$?', type: 'MC', options: ['$13$', '$0$', '$3$', '$16$'], correctAnswer: 'C', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q6', module: 1, text: '$\\sqrt{x^2} = 80 - 9x$. What is the solution to the given equation?', type: 'MC', options: ['$4$', '$71$', '$90$', '$8$'], correctAnswer: 'D', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q7', module: 1, text: 'A right square pyramid has a height of $6$ units and a volume of $128$ cubic units. What is the side length, in units, of the base?', type: 'MC', options: ['$256$', '$8$', '$\\frac{64}{3}$', '$\\frac{8\\sqrt{3}}{3}$'], correctAnswer: 'B', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q8', module: 1, text: 'A rectangle has an area of $66$ square meters and a length of $11$ meters. What is the width, in meters?', type: 'MC', options: ['$55$', '$6$', '$726$', '$121$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M1_Q9', module: 1, text: '$\\frac{a}{b+c} = 64$. Which equation expresses $a$ in terms of $b$ and $c$?', type: 'MC', options: ['$a=(b+c)$', '$a=64-(b+c)$', '$a=64(b+c)$', '$a=\\frac{64}{b+c}$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M1_Q10', module: 1, text: 'The graph of $y=f(x)$ passes through $(0,6)$ and $(7,7)$. What is the slope of the line?', type: 'MC', options: ['$\\frac{1}{8}$', '$\\frac{1}{7}$', '$\\frac{2}{5}$', '$\\frac{3}{8}$'], correctAnswer: 'B', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q11', module: 1, text: 'Given the system: $4x+3y=29$ and $7x-12y=-61$, what is the value of $y$?', type: 'MC', options: ['$8$', '$7$', '$5$', '$3$'], correctAnswer: 'A', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q12', module: 1, text: 'A function $f$ has roots at $x=-4$, $x=1$, and $x=9$. Which of the following is a factor of $f(x)$?', type: 'MC', options: ['$x-1$', '$x+9$', '$x-4$', '$x+1$'], correctAnswer: 'A', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q13', module: 1, text: 'In a right triangle with legs 4 and 9, what is the value of $\\tan y°$ where $y$ is the angle opposite the side of length $c$?', type: 'MC', options: ['$\\frac{c}{9}$', '$\\frac{4}{9}$', '$\\frac{c}{4}$', '$\\frac{9}{4}$'], correctAnswer: 'A', difficulty: 'Medium', imageUrl: '' },
      { id: 'T1M1_Q14', module: 1, text: 'How many intersections are there for the system: $8x+32y=30$ and $12x+48y=45$?', type: 'MC', options: ['Zero', 'One', 'Infinitely many', 'Two'], correctAnswer: 'C', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q15', module: 1, text: 'In a class of 30 students, 18 play sports and 14 read books. 8 students do both. How many do neither?', type: 'MC', options: ['$4$', '$6$', '$8$', '$12$'], correctAnswer: 'B', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q16', module: 1, text: 'Which value of $x$ satisfies $|2x - 6| = 10$?', type: 'MC', options: ['$x=8$', '$x=-2$', '$x=8$ or $x=-2$', '$x=8$ and $x=-2$'], correctAnswer: 'C', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q17', module: 1, text: 'The line $y = -2x + 5$ is perpendicular to a line passing through $(0, 3)$. What is the equation of the perpendicular line?', type: 'MC', options: ['$y = 2x + 3$', '$y = -2x + 3$', '$y = \\frac{1}{2}x + 3$', '$y = -\\frac{1}{2}x + 3$'], correctAnswer: 'C', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q18', module: 1, text: 'A circle has center $(3,-2)$ and passes through $(7,-2)$. What is the equation of the circle?', type: 'MC', options: ['$(x-3)^2+(y+2)^2=4$', '$(x-3)^2+(y+2)^2=16$', '$(x+3)^2+(y-2)^2=16$', '$(x-3)^2+(y-2)^2=4$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M1_Q19', module: 1, text: 'If $f(x) = 2x^2 - 3x + 1$, what is $f(-1)$?', type: 'MC', options: ['$6$', '$-4$', '$4$', '$0$'], correctAnswer: 'A', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q20', module: 1, text: 'What is the sum of all solutions to $x^2 - 4x - 12 = 0$?', type: 'MC', options: ['$-4$', '$4$', '$12$', '$-12$'], correctAnswer: 'B', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M1_Q21', module: 1, text: 'A data set has a mean of 20 and a standard deviation of 4. Which value is exactly 1.5 standard deviations above the mean?', type: 'MC', options: ['$24$', '$26$', '$28$', '$30$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M1_Q22', module: 1, text: 'The exponential function $f(x)=a^x+b$. If $f(0)=-22$ and $f(2)=26$, what is the value of $a+b$?', type: 'MC', options: ['$20$', '$40$', '$10$', '$30$'], correctAnswer: 'D', difficulty: 'Hard', imageUrl: null },
    ],

    // ── MODULE 2 HARD (22 questions) ──
    M2H: [
      { id: 'T1M2H_Q1', module: 2, text: 'If $x^2 - 6x + 7 = 0$, what is the sum of the solutions?', type: 'MC', options: ['$-6$', '$-7$', '$6$', '$7$'], correctAnswer: 'C', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q2', module: 2, text: 'A parabola has vertex $(3, -4)$ and passes through $(1, 0)$. What is its equation in vertex form?', type: 'MC', options: ['$y=(x-3)^2-4$', '$y=(x+3)^2+4$', '$y=(x-3)^2+4$', '$y=-(x-3)^2+4$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q3', module: 2, text: 'For what value of $k$ does the system $3x-4y=7$ and $kx-12y=15$ have no solution?', type: 'MC', options: ['$3$', '$9$', '$12$', '$-9$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q4', module: 2, text: 'What is the remainder when $p(x)=2x^3-4x^2+3x-1$ is divided by $(x-2)$?', type: 'MC', options: ['$0$', '$3$', '$5$', '$9$'], correctAnswer: 'D', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q5', module: 2, text: 'Circle $A$ has equation $x^2+y^2-6x+4y-12=0$. What is its radius?', type: 'MC', options: ['$\\sqrt{12}$', '$5$', '$\\sqrt{25}$', '$\\sqrt{5}$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q6', module: 2, text: 'If $\\log_2 x = 5$, what is the value of $\\log_2(4x)$?', type: 'MC', options: ['$7$', '$9$', '$10$', '$20$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q7', module: 2, text: 'A company\'s profit $P$, in thousands of dollars, after $t$ years is modeled by $P=3t^2-12t+15$. In what year is the profit minimized?', type: 'MC', options: ['$t=1$', '$t=2$', '$t=3$', '$t=4$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q8', module: 2, text: 'In triangle $ABC$, $\\sin A = \\frac{3}{5}$. If the triangle is a right triangle with the right angle at $C$, what is $\\cos B$?', type: 'MC', options: ['$\\frac{4}{5}$', '$\\frac{3}{5}$', '$\\frac{3}{4}$', '$\\frac{4}{3}$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q9', module: 2, text: 'The function $g(x)=\\frac{x^2-9}{x-3}$ is equivalent to which expression for $x \\neq 3$?', type: 'MC', options: ['$x-3$', '$x+3$', '$x^2+3$', '$\\frac{x+3}{1}$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q10', module: 2, text: 'If $i = \\sqrt{-1}$, what is $(3+2i)(1-i)$?', type: 'MC', options: ['$3-2i$', '$5-i$', '$1+5i$', '$5+i$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q11', module: 2, text: 'A geometric sequence has first term $a_1=3$ and common ratio $r=2$. What is the 6th term?', type: 'MC', options: ['$48$', '$64$', '$96$', '$32$'], correctAnswer: 'C', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q12', module: 2, text: 'What are the solutions to $x^2-5x+6=0$?', type: 'MC', options: ['$x=2, x=3$', '$x=-2, x=-3$', '$x=1, x=6$', '$x=2, x=-3$'], correctAnswer: 'A', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M2H_Q13', module: 2, text: 'If $f(x)=3x-5$ and $g(x)=x^2$, what is $f(g(2))$?', type: 'MC', options: ['$1$', '$7$', '$9$', '$12$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q14', module: 2, text: 'How many solutions does the equation $2\\sin x = 1$ have in $[0, 2\\pi]$?', type: 'MC', options: ['$0$', '$1$', '$2$', '$4$'], correctAnswer: 'C', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q15', module: 2, text: 'The discriminant of $3x^2-5x+k=0$ is zero. What is the value of $k$?', type: 'MC', options: ['$\\frac{25}{12}$', '$\\frac{5}{3}$', '$\\frac{25}{3}$', '$\\frac{12}{25}$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q16', module: 2, text: 'A box has dimensions $l$, $w$, and $h$. If $l$ is doubled, $w$ is halved, and $h$ stays the same, how does the volume change?', type: 'MC', options: ['It doubles', 'It halves', 'It stays the same', 'It quadruples'], correctAnswer: 'C', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q17', module: 2, text: 'For $f(x)=\\frac{2x+1}{x-3}$, what is the vertical asymptote?', type: 'MC', options: ['$x=2$', '$x=-3$', '$x=3$', '$x=\\frac{1}{2}$'], correctAnswer: 'C', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q18', module: 2, text: 'What is the value of $\\binom{7}{3}$?', type: 'MC', options: ['$21$', '$35$', '$42$', '$70$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q19', module: 2, text: 'The line $y=mx+b$ passes through $(-2,5)$ and $(4,-1)$. What is $m+b$?', type: 'MC', options: ['$-1$', '$0$', '$2$', '$3$'], correctAnswer: 'C', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q20', module: 2, text: 'If the probability of event $A$ is $0.3$ and event $B$ is $0.5$, and they are independent, what is $P(A \\cap B)$?', type: 'MC', options: ['$0.15$', '$0.20$', '$0.35$', '$0.65$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q21', module: 2, text: 'In an arithmetic sequence, $a_3=11$ and $a_7=27$. What is the first term $a_1$?', type: 'MC', options: ['$3$', '$5$', '$7$', '$9$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'T1M2H_Q22', module: 2, text: 'If $5^x = 125$, what is the value of $5^{x-1}$?', type: 'MC', options: ['$5$', '$25$', '$50$', '$100$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
    ],

    // ── MODULE 2 EASY (22 questions) ──
    M2E: [
      { id: 'T1M2E_Q1', module: 2, text: 'What is the value of $3x+7$ when $x=4$?', type: 'MC', options: ['$15$', '$17$', '$19$', '$21$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q2', module: 2, text: 'A store sells a jacket for $\\$80$. If the store gives a $25\\%$ discount, what is the sale price?', type: 'MC', options: ['$\\$20$', '$\\$55$', '$\\$60$', '$\\$65$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q3', module: 2, text: 'What is the slope of the line passing through $(2,3)$ and $(6,7)$?', type: 'MC', options: ['$\\frac{1}{2}$', '$1$', '$2$', '$4$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q4', module: 2, text: 'Which table shows points that satisfy $y < x$ and $y > -4x - 9$?', type: 'MC', options: [M2E_DATA_T1.Q4_A, M2E_DATA_T1.Q4_B, M2E_DATA_T1.Q4_C, M2E_DATA_T1.Q4_D], correctAnswer: 'A', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M2E_Q5', module: 2, text: 'Simplify: $\\frac{12x^4}{4x^2}$', type: 'MC', options: ['$3x^2$', '$3x^6$', '$8x^2$', '$8x^6$'], correctAnswer: 'A', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q6', module: 2, text: 'If $2x - 5 = 11$, what is the value of $4x$?', type: 'MC', options: ['$8$', '$16$', '$32$', '$64$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q7', module: 2, text: 'A line passes through the origin with slope $-3$. Which point lies on this line?', type: 'MC', options: ['$(1, 3)$', '$(2, -6)$', '$(3, 1)$', '$(-1, -3)$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q8', module: 2, text: 'What is the area of a triangle with base $12$ and height $7$?', type: 'MC', options: ['$42$', '$84$', '$19$', '$36$'], correctAnswer: 'A', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q9', module: 2, text: 'If $x + y = 15$ and $x - y = 5$, what is $x$?', type: 'MC', options: ['$5$', '$10$', '$15$', '$20$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q10', module: 2, text: 'What is the median of the data set: $4, 8, 3, 7, 5$?', type: 'MC', options: ['$4$', '$5$', '$6$', '$7$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q11', module: 2, text: 'Which of the following has a mean of $75$?', type: 'MC', options: [M2E_DATA_T1.Q11_A, M2E_DATA_T1.Q11_B, M2E_DATA_T1.Q11_C, M2E_DATA_T1.Q11_D], correctAnswer: 'A', difficulty: 'Medium', imageUrl: null },
      { id: 'T1M2E_Q12', module: 2, text: 'Evaluate $f(-3)$ if $f(x)=x^2+2x-1$?', type: 'MC', options: ['$2$', '$-2$', '$14$', '$-4$'], correctAnswer: 'A', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q13', module: 2, text: 'A car travels $240$ miles in $4$ hours. What is the car\'s average speed, in miles per hour?', type: 'MC', options: ['$40$', '$50$', '$60$', '$80$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q14', module: 2, text: 'Which inequality represents $x$ is at most $-3$?', type: 'MC', options: ['$x > -3$', '$x \\geq -3$', '$x < -3$', '$x \\leq -3$'], correctAnswer: 'D', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q15', module: 2, text: 'What is $20\\%$ of $350$?', type: 'MC', options: ['$60$', '$70$', '$80$', '$90$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q16', module: 2, text: 'The radius of a circle is $6$. What is its circumference?', type: 'MC', options: ['$6\\pi$', '$12\\pi$', '$36\\pi$', '$72\\pi$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q17', module: 2, text: 'Which of the following is the factored form of $x^2-9$?', type: 'MC', options: ['$(x-3)^2$', '$(x+3)(x-3)$', '$(x-9)(x+1)$', '$(x-3)(x+9)$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q18', module: 2, text: 'What is the perimeter of a square with side length $9$?', type: 'MC', options: ['$9$', '$18$', '$27$', '$36$'], correctAnswer: 'D', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q19', module: 2, text: 'Solve: $\\frac{x}{3} = 9$', type: 'MC', options: ['$3$', '$9$', '$18$', '$27$'], correctAnswer: 'D', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q20', module: 2, text: 'Which ordered pair is a solution to $y = 2x + 1$?', type: 'MC', options: ['$(1, 3)$', '$(2, 4)$', '$(3, 5)$', '$(0, 2)$'], correctAnswer: 'A', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q21', module: 2, text: 'What is the value of $2^5$?', type: 'MC', options: ['$10$', '$16$', '$32$', '$64$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'T1M2E_Q22', module: 2, text: 'The volume of a cylinder is $V = \\pi r^2 h$. If $r=3$ and $h=5$, what is $V$?', type: 'MC', options: ['$15\\pi$', '$30\\pi$', '$45\\pi$', '$90\\pi$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  TEST 2 — DSAT Mock Test 2
  // ════════════════════════════════════════════════════════════
  TEST_2: {
    name: 'DSAT Mock Test 2',

    M1: [
      { id: 'M1_Q1', module: 1, text: 'In the figure, line $n$ intersects lines $r$ and $s$. Line $r$ is parallel to line $s$. What is the value of $x$?', type: 'MC', options: ['$38$', '$42$', '$90$', '$138$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: '' },
      { id: 'M1_Q2', module: 1, text: 'During a portion of a flight, a small airplane\'s cruising speed varied between $125$ miles per hour and $135$ miles per hour. Which inequality best represents this situation?', type: 'MC', options: ['$s \\leq 10$', '$s \\leq 125$', '$s \\leq 135$', '$125 \\leq s \\leq 135$'], correctAnswer: 'D', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q3', module: 1, text: 'If $5x=4$, what is the value of $40x$?', type: 'MC', options: ['$4$', '$12$', '$28$', '$32$'], correctAnswer: 'D', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q4', module: 1, text: 'Which expression is equivalent to $(x^3+4x^2-3x)+5(x^2+8)$?', type: 'MC', options: ['$x^3+9x^2-3x+40$', '$x^3+4x^2-3x+40$', '$x^3+8x^2-3x+40$', '$x^3+5x^2-3x+40$'], correctAnswer: 'A', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q5', module: 1, text: 'The function $f$ is defined by $f(x)=x^3+14$. What is the value of $f(2)$?', type: 'MC', options: ['$16$', '$20$', '$22$', '$26$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q6', module: 1, text: 'The function $g$ is defined by $g(x)=\\frac{x}{2}$. For what value of $x$ does $g(x)=624$?', type: 'MC', options: ['$312$', '$624$', '$1248$', '$1250$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q7', module: 1, text: 'The scatterplot shows the relationship between two variables, $x$ and $y$. Which equation is the most appropriate linear model?', type: 'MC', options: ['$y=0.8+8.7x$', '$y=0.8-8.7x$', '$y=8.7+0.8x$', '$y=8.7-0.8x$'], correctAnswer: 'D', difficulty: 'Medium', imageUrl: '' },
      { id: 'M1_Q8', module: 1, text: 'The function $f(x)=\\frac{1}{9}(x-4)^2+5$ gives a toy car\'s height. Which is the best interpretation of the vertex?', type: 'MC', options: ['The toy car\'s minimum height was $5$ inches.', 'The minimum height was $4$ inches.', 'Height was $5$ inches when it started.', 'Height was $4$ inches when it started.'], correctAnswer: 'A', difficulty: 'Medium', imageUrl: null },
      { id: 'M1_Q9', module: 1, text: 'For the equation $7x-5y=-70$, which table gives three values of $x$ and corresponding $y$?', type: 'MC', options: [M1_DATA_T2.Q9_A, M1_DATA_T2.Q9_B, M1_DATA_T2.Q9_C, M1_DATA_T2.Q9_D], correctAnswer: 'A', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q10', module: 1, text: 'A chemist combines water and isopropanol to make $45$ mL. The isopropanol is $10$ mL. What is the volume of water?', type: 'MC', options: ['$10$', '$35$', '$45$', '$55$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q11', module: 1, text: 'If $y = 3x - 2$ and $y = x + 4$, what is the value of $x$?', type: 'MC', options: ['$1$', '$3$', '$5$', '$7$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q12', module: 1, text: 'What is $\\frac{3}{4} \\div \\frac{1}{2}$?', type: 'MC', options: ['$\\frac{3}{8}$', '$\\frac{1}{2}$', '$\\frac{3}{2}$', '$2$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q13', module: 1, text: 'The surface area of a cube with side length $s$ is $6s^2$. If $s=4$, what is the surface area?', type: 'MC', options: ['$24$', '$48$', '$64$', '$96$'], correctAnswer: 'D', difficulty: 'Medium', imageUrl: null },
      { id: 'M1_Q14', module: 1, text: 'Which of the following is equivalent to $\\sqrt{48}$?', type: 'MC', options: ['$4\\sqrt{3}$', '$6\\sqrt{2}$', '$3\\sqrt{4}$', '$2\\sqrt{12}$'], correctAnswer: 'A', difficulty: 'Medium', imageUrl: null },
      { id: 'M1_Q15', module: 1, text: 'A survey shows $40\\%$ of 200 people prefer coffee. How many prefer coffee?', type: 'MC', options: ['$40$', '$60$', '$80$', '$100$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q16', module: 1, text: 'The equation $y = -x^2 + 4x - 3$ has its vertex at:', type: 'MC', options: ['$(2, 1)$', '$(-2, -3)$', '$(2, -3)$', '$(4, -3)$'], correctAnswer: 'A', difficulty: 'Medium', imageUrl: null },
      { id: 'M1_Q17', module: 1, text: 'What is $15\\% $ of $\\$240$?', type: 'MC', options: ['$\\$24$', '$\\$30$', '$\\$36$', '$\\$48$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q18', module: 1, text: 'Which expression is equivalent to $(2x+3)^2$?', type: 'MC', options: ['$4x^2+9$', '$4x^2+6x+9$', '$4x^2+12x+9$', '$4x^2+12x+6$'], correctAnswer: 'C', difficulty: 'Medium', imageUrl: null },
      { id: 'M1_Q19', module: 1, text: 'In a right triangle, the legs are $5$ and $12$. What is the hypotenuse?', type: 'MC', options: ['$7$', '$11$', '$13$', '$17$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M1_Q20', module: 1, text: 'Solve for $x$: $3(x-2)=2(x+1)$', type: 'MC', options: ['$4$', '$6$', '$8$', '$10$'], correctAnswer: 'C', difficulty: 'Medium', imageUrl: null },
      { id: 'M1_Q21', module: 1, text: 'What is $\\log_{10}(1000)$?', type: 'MC', options: ['$2$', '$3$', '$4$', '$10$'], correctAnswer: 'B', difficulty: 'Medium', imageUrl: null },
      { id: 'M1_Q22', module: 1, text: 'The sum of an arithmetic sequence with first term $3$, last term $47$, and $10$ terms is:', type: 'MC', options: ['$250$', '$275$', '$300$', '$325$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
    ],

    M2H: [
      { id: 'M2H_Q1', module: 2, text: 'For $f(x)=2x^3-x^2+3x-5$, what is $f(-1)$?', type: 'MC', options: ['$-11$', '$-9$', '$9$', '$11$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q2', module: 2, text: 'What is the equation of the circle with center $(-2, 3)$ and radius $5$?', type: 'MC', options: ['$(x+2)^2+(y-3)^2=5$', '$(x+2)^2+(y-3)^2=25$', '$(x-2)^2+(y+3)^2=25$', '$(x+2)^2+(y+3)^2=25$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q3', module: 2, text: 'The expression $\\frac{x^2-4}{x^2+5x+6}$ simplifies to:', type: 'MC', options: ['$\\frac{x-2}{x+3}$', '$\\frac{x+2}{x+3}$', '$\\frac{x-2}{x-3}$', '$\\frac{x+2}{x-3}$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q4', module: 2, text: 'What is the inverse of $f(x)=2x-6$?', type: 'MC', options: ['$f^{-1}(x)=\\frac{x}{2}+3$', '$f^{-1}(x)=\\frac{x+6}{2}$', '$f^{-1}(x)=\\frac{x-6}{2}$', '$f^{-1}(x)=2x+6$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q5', module: 2, text: 'A data set has 10 values. If the mean is 15 and one value of 25 is removed, what is the new mean?', type: 'MC', options: ['$13.33$', '$14$', '$14.44$', '$15.5$'], correctAnswer: 'C', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q6', module: 2, text: 'A function is even if $f(-x)=f(x)$. Which of the following is an even function?', type: 'MC', options: ['$f(x)=x^3$', '$f(x)=x^2+1$', '$f(x)=2x+1$', '$f(x)=x^3+x$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q7', module: 2, text: 'What is the sum of all roots of $2x^3-6x^2+4x-8=0$?', type: 'MC', options: ['$2$', '$3$', '$4$', '$6$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q8', module: 2, text: 'How many real solutions does $x^2+6x+9=0$ have?', type: 'MC', options: ['$0$', '$1$', '$2$', '$3$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q9', module: 2, text: 'The range of $f(x)=-|x|+5$ is:', type: 'MC', options: ['$(-\\infty, 5]$', '$[5, \\infty)$', '$(-\\infty, \\infty)$', '$[0, 5]$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q10', module: 2, text: 'Which expression is equivalent to $\\frac{1}{1-\\frac{1}{x}}$?', type: 'MC', options: ['$\\frac{x}{x-1}$', '$x-1$', '$\\frac{x-1}{x}$', '$\\frac{1}{x-1}$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q11', module: 2, text: 'If $\\sin \\theta = \\frac{5}{13}$, what is $\\cos \\theta$ (assuming $\\theta$ is acute)?', type: 'MC', options: ['$\\frac{5}{12}$', '$\\frac{12}{13}$', '$\\frac{13}{12}$', '$\\frac{5}{13}$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q12', module: 2, text: 'A function has $f(2)=7$ and $f(5)=16$. Assuming linearity, what is $f(8)$?', type: 'MC', options: ['$22$', '$24$', '$25$', '$27$'], correctAnswer: 'C', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q13', module: 2, text: 'What is $\\int_0^2 (2x+1)dx$?', type: 'MC', options: ['$4$', '$5$', '$6$', '$8$'], correctAnswer: 'C', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q14', module: 2, text: 'Rationalize: $\\frac{3}{\\sqrt{5}}$', type: 'MC', options: ['$\\frac{3\\sqrt{5}}{5}$', '$\\frac{\\sqrt{5}}{3}$', '$3\\sqrt{5}$', '$\\frac{3}{5}\\sqrt{5}$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q15', module: 2, text: 'Expand $(x+y)^3$:', type: 'MC', options: ['$x^3+y^3$', '$x^3+3x^2y+3xy^2+y^3$', '$x^3+2xy+y^3$', '$x^3+3xy+y^3$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q16', module: 2, text: 'Given vectors $\\vec{u}=(2,3)$ and $\\vec{v}=(4,-1)$, what is $\\vec{u} \\cdot \\vec{v}$?', type: 'MC', options: ['$5$', '$7$', '$8$', '$11$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q17', module: 2, text: 'If $e^{2x}=50$, what is $x$ to the nearest hundredth?', type: 'MC', options: ['$1.96$', '$2.00$', '$1.85$', '$1.56$'], correctAnswer: 'A', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q18', module: 2, text: 'A sequence is defined by $a_n = a_{n-1} + 5$ with $a_1 = 3$. What is $a_{10}$?', type: 'MC', options: ['$45$', '$48$', '$50$', '$53$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q19', module: 2, text: 'What is $\\lim_{x \\to 0} \\frac{\\sin x}{x}$?', type: 'MC', options: ['$0$', '$1$', '$\\infty$', 'Undefined'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q20', module: 2, text: 'The graph of $y = a(x-h)^2 + k$ has vertex at $(3, -5)$ and passes through $(5, 3)$. What is $a$?', type: 'MC', options: ['$1$', '$2$', '$3$', '$4$'], correctAnswer: 'B', difficulty: 'Hard', imageUrl: null },
      { id: 'M2H_Q21', module: 2, text: 'What is the value of $\\cos(45°) \\cdot \\sqrt{2}$?', type: 'MC', options: ['$\\frac{1}{2}$', '$1$', '$\\sqrt{2}$', '$2$'], correctAnswer: 'B', difficulty: 'Medium', imageUrl: null },
      { id: 'M2H_Q22', module: 2, text: 'If $p(x)$ is divided by $(x+2)$ and the remainder is $7$, what is $p(-2)$?', type: 'MC', options: ['$-7$', '$0$', '$7$', '$14$'], correctAnswer: 'C', difficulty: 'Hard', imageUrl: null },
    ],

    M2E: [
      { id: 'M2E_Q1', module: 2, text: 'What is the value of $7 + 3 \\times 4 - 2$?', type: 'MC', options: ['$17$', '$38$', '$18$', '$40$'], correctAnswer: 'A', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q2', module: 2, text: 'If $x = -3$, what is the value of $x^2 + 2x + 1$?', type: 'MC', options: ['$2$', '$4$', '$16$', '$-4$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q3', module: 2, text: 'A car travels $180$ km in $3$ hours. What is its speed in km/h?', type: 'MC', options: ['$40$', '$50$', '$60$', '$70$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q4', module: 2, text: 'What is the value of $\\frac{8}{4} + \\frac{6}{2}$?', type: 'MC', options: ['$4$', '$5$', '$7$', '$8$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q5', module: 2, text: 'A rectangle has length $9$ and width $4$. What is its area?', type: 'MC', options: ['$13$', '$26$', '$36$', '$72$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q6', module: 2, text: 'Solve: $5x - 3 = 22$', type: 'MC', options: ['$4$', '$5$', '$6$', '$7$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q7', module: 2, text: 'Which of the following is a prime number?', type: 'MC', options: ['$21$', '$27$', '$29$', '$33$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q8', module: 2, text: 'What is $3^4$?', type: 'MC', options: ['$12$', '$27$', '$64$', '$81$'], correctAnswer: 'D', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q9', module: 2, text: 'The ratio of boys to girls in a class is $3:5$. If there are $15$ boys, how many girls are there?', type: 'MC', options: ['$20$', '$25$', '$30$', '$35$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q10', module: 2, text: 'What is the value of $|{-15}| - |{7}|$?', type: 'MC', options: ['$-8$', '$8$', '$22$', '$-22$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q11', module: 2, text: 'What is the mode of: $2, 3, 2, 5, 7, 2, 8$?', type: 'MC', options: ['$2$', '$3$', '$5$', '$7$'], correctAnswer: 'A', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q12', module: 2, text: 'A bag has $4$ red and $6$ blue balls. What is the probability of picking a red ball?', type: 'MC', options: ['$\\frac{1}{4}$', '$\\frac{2}{5}$', '$\\frac{3}{5}$', '$\\frac{2}{3}$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q13', module: 2, text: 'What is the GCF of $24$ and $36$?', type: 'MC', options: ['$4$', '$6$', '$12$', '$18$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q14', module: 2, text: 'Simplify: $\\frac{15x^3}{5x}$', type: 'MC', options: ['$3x^2$', '$3x^3$', '$10x^2$', '$10x$'], correctAnswer: 'A', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q15', module: 2, text: 'What is the LCM of $4$ and $6$?', type: 'MC', options: ['$2$', '$12$', '$18$', '$24$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q16', module: 2, text: 'Which is equivalent to $0.75$?', type: 'MC', options: ['$\\frac{3}{5}$', '$\\frac{4}{5}$', '$\\frac{3}{4}$', '$\\frac{1}{4}$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q17', module: 2, text: 'What is the value of $2^0 + 3^1 + 4^2$?', type: 'MC', options: ['$16$', '$18$', '$20$', '$24$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q18', module: 2, text: 'Convert $2.5$ kg to grams:', type: 'MC', options: ['$25$', '$250$', '$2500$', '$25000$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q19', module: 2, text: 'The perimeter of a regular hexagon with side $7$ is:', type: 'MC', options: ['$28$', '$35$', '$42$', '$49$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q20', module: 2, text: 'If $y = 5$ when $x = 2$ and $y$ varies directly with $x$, what is $y$ when $x = 6$?', type: 'MC', options: ['$10$', '$12$', '$15$', '$18$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q21', module: 2, text: 'The sum of two consecutive integers is $49$. What is the larger integer?', type: 'MC', options: ['$23$', '$24$', '$25$', '$26$'], correctAnswer: 'C', difficulty: 'Easy', imageUrl: null },
      { id: 'M2E_Q22', module: 2, text: 'Evaluate: $\\sqrt{144} + \\sqrt{25}$', type: 'MC', options: ['$13$', '$17$', '$19$', '$21$'], correctAnswer: 'B', difficulty: 'Easy', imageUrl: null },
    ],
  },
};

// Aliases for Math and English and additional Mock Tests 
ALL_TEST_QUESTIONS['TEST_3'] = ALL_TEST_QUESTIONS['TEST_1'];
ALL_TEST_QUESTIONS['TEST_4'] = ALL_TEST_QUESTIONS['TEST_2'];

ALL_TEST_QUESTIONS['MATH_TEST_1'] = ALL_TEST_QUESTIONS['TEST_1'];
ALL_TEST_QUESTIONS['MATH_TEST_2'] = ALL_TEST_QUESTIONS['TEST_2'];
ALL_TEST_QUESTIONS['MATH_TEST_3'] = ALL_TEST_QUESTIONS['TEST_1'];
ALL_TEST_QUESTIONS['MATH_TEST_4'] = ALL_TEST_QUESTIONS['TEST_2'];


export const ENG_TEST_1_DATA: DSATTestData = {
  "name": "Reading & Writing Mock Test 1",
  "subject": "Reading & Writing",
  "M1": [
    {
      "id": "ENG_M1_Q1",
      "module": 1,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q2",
      "module": 1,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q3",
      "module": 1,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M1_Q4",
      "module": 1,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M1_Q5",
      "module": 1,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M1_Q6",
      "module": 1,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q7",
      "module": 1,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q8",
      "module": 1,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M1_Q9",
      "module": 1,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M1_Q10",
      "module": 1,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M1_Q11",
      "module": 1,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q12",
      "module": 1,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q13",
      "module": 1,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M1_Q14",
      "module": 1,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M1_Q15",
      "module": 1,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M1_Q16",
      "module": 1,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q17",
      "module": 1,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q18",
      "module": 1,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M1_Q19",
      "module": 1,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M1_Q20",
      "module": 1,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M1_Q21",
      "module": 1,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q22",
      "module": 1,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q23",
      "module": 1,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M1_Q24",
      "module": 1,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M1_Q25",
      "module": 1,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M1_Q26",
      "module": 1,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M1_Q27",
      "module": 1,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    }
  ],
  "M2H": [
    {
      "id": "ENG_M2H_Q1",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q2",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q3",
      "module": 2,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M2H_Q4",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2H_Q5",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2H_Q6",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q7",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q8",
      "module": 2,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M2H_Q9",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2H_Q10",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2H_Q11",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q12",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q13",
      "module": 2,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M2H_Q14",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2H_Q15",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2H_Q16",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q17",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q18",
      "module": 2,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M2H_Q19",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2H_Q20",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2H_Q21",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q22",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q23",
      "module": 2,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M2H_Q24",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2H_Q25",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2H_Q26",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2H_Q27",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    }
  ],
  "M2E": [
    {
      "id": "ENG_M2E_Q1",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q2",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q3",
      "module": 2,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M2E_Q4",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2E_Q5",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2E_Q6",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q7",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q8",
      "module": 2,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M2E_Q9",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2E_Q10",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2E_Q11",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q12",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q13",
      "module": 2,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M2E_Q14",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2E_Q15",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2E_Q16",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q17",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q18",
      "module": 2,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M2E_Q19",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2E_Q20",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2E_Q21",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q22",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q23",
      "module": 2,
      "text": "Which choice most logically completes the text?",
      "passage": "When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______",
      "type": "MC",
      "options": [
        "HIIT is the only form of exercise that can improve cardiovascular health in older adults.",
        "mitochondrial function is entirely independent of age and is influenced only by physical activity levels.",
        "engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.",
        "older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Command of Evidence",
      "domain": "Information and Ideas"
    },
    {
      "id": "ENG_M2E_Q24",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.",
      "type": "MC",
      "options": [
        "significant;",
        "significant,",
        "significant",
        "significant:"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Boundaries",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2E_Q25",
      "module": 2,
      "text": "Which choice completes the text so that it conforms to the conventions of Standard English?",
      "passage": "To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.",
      "type": "MC",
      "options": [
        "they fix them before the official release.",
        "fixing them before the official release.",
        "fixed them before the official release.",
        "to fix them before the official release."
      ],
      "correctAnswer": "C",
      "difficulty": "Easy",
      "skill": "Form, Structure, and Sense",
      "domain": "Standard English Conventions"
    },
    {
      "id": "ENG_M2E_Q26",
      "module": 2,
      "text": "As used in the text, what does the word \"projection\" most nearly mean?",
      "passage": "The following text is from Northrop Frye's 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.",
      "type": "MC",
      "options": [
        "Elimination",
        "Estimation",
        "Presentation",
        "Prediction"
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Words in Context",
      "domain": "Craft and Structure"
    },
    {
      "id": "ENG_M2E_Q27",
      "module": 2,
      "text": "Which choice best describes the function of the underlined portion in the text as a whole?",
      "passage": "Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown's multidisciplinary approach and use of diverse sources.",
      "type": "MC",
      "options": [
        "It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.",
        "It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.",
        "It lists specific examples of the diverse materials that are referenced in the sentence that follows it.",
        "It explains the process by which Brown obtained the specific materials that are discussed in the text."
      ],
      "correctAnswer": "C",
      "difficulty": "Medium",
      "skill": "Text Structure and Purpose",
      "domain": "Craft and Structure"
    }
  ]
};

ALL_TEST_QUESTIONS['ENG_TEST_1'] = ENG_TEST_1_DATA;
ALL_TEST_QUESTIONS['ENG_TEST_2'] = ALL_TEST_QUESTIONS['TEST_2'];
ALL_TEST_QUESTIONS['ENG_TEST_3'] = ALL_TEST_QUESTIONS['TEST_1'];
ALL_TEST_QUESTIONS['ENG_TEST_4'] = ALL_TEST_QUESTIONS['TEST_2'];

// Complete Tests (4 modules: RW M1, RW M2, Math M1, Math M2)
// For these, we store RW in M1/M2 and MATH in the actual fields, but we'll flag them as isFull = true
ALL_TEST_QUESTIONS['FULL_TEST_1'] = {
  name: 'DSAT Complete Mock 1',
  isFull: true,
  M1: ALL_TEST_QUESTIONS['ENG_TEST_1'].M1,
  M2H: ALL_TEST_QUESTIONS['ENG_TEST_1'].M2H,
  M2E: ALL_TEST_QUESTIONS['ENG_TEST_1'].M2E,
  MATH_M1: ALL_TEST_QUESTIONS['TEST_1'].M1,
  MATH_M2H: ALL_TEST_QUESTIONS['TEST_1'].M2H,
  MATH_M2E: ALL_TEST_QUESTIONS['TEST_1'].M2E,
} as any;

ALL_TEST_QUESTIONS['FULL_TEST_2'] = {
  name: 'DSAT Complete Mock 2',
  isFull: true,
  M1: ALL_TEST_QUESTIONS['ENG_TEST_2'].M1,
  M2H: ALL_TEST_QUESTIONS['ENG_TEST_2'].M2H,
  M2E: ALL_TEST_QUESTIONS['ENG_TEST_2'].M2E,
  MATH_M1: ALL_TEST_QUESTIONS['TEST_2'].M1,
  MATH_M2H: ALL_TEST_QUESTIONS['TEST_2'].M2H,
  MATH_M2E: ALL_TEST_QUESTIONS['TEST_2'].M2E,
} as any;

ALL_TEST_QUESTIONS['FULL_TEST_3'] = {
  name: 'DSAT Complete Mock 3',
  isFull: true,
  M1: ALL_TEST_QUESTIONS['ENG_TEST_3'].M1,
  M2H: ALL_TEST_QUESTIONS['ENG_TEST_3'].M2H,
  M2E: ALL_TEST_QUESTIONS['ENG_TEST_3'].M2E,
  MATH_M1: ALL_TEST_QUESTIONS['TEST_3'].M1,
  MATH_M2H: ALL_TEST_QUESTIONS['TEST_3'].M2H,
  MATH_M2E: ALL_TEST_QUESTIONS['TEST_3'].M2E,
} as any;

ALL_TEST_QUESTIONS['FULL_TEST_4'] = {
  name: 'DSAT Complete Mock 4',
  isFull: true,
  M1: ALL_TEST_QUESTIONS['ENG_TEST_4'].M1,
  M2H: ALL_TEST_QUESTIONS['ENG_TEST_4'].M2H,
  M2E: ALL_TEST_QUESTIONS['ENG_TEST_4'].M2E,
  MATH_M1: ALL_TEST_QUESTIONS['TEST_4'].M1,
  MATH_M2H: ALL_TEST_QUESTIONS['TEST_4'].M2H,
  MATH_M2E: ALL_TEST_QUESTIONS['TEST_4'].M2E,
} as any;
