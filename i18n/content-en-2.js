I18n.addContent("en", {
  "help": {
    "jellyfish": {
      "summary": "The four-row (column) version of Swordfish: the candidate positions of a digit in four rows together occupy only four columns, so no other cell in those four columns can be that digit.",
      "how": "Find a digit X where, in each of four rows, the candidates lie within the same four columns (2–4 per row). X must fill all four of those columns using these four rows, so eliminate X from every other cell in those four columns."
    },
    "xyz_wing": {
      "summary": "The pivot cell has three candidates {X,Y,Z}, and two bivalue wing cells {X,Z} and {Y,Z} both see the pivot. Whatever the pivot is, Z lands in one of these three cells, so any cell that sees all three cannot be Z.",
      "how": "1) Find a three-candidate pivot {X,Y,Z}. 2) Find wings {X,Z} and {Y,Z}, each sharing a unit with the pivot. 3) Eliminate Z from every cell that sees the pivot and both wings."
    },
    "swordfish": {
      "summary": "The three-row (column) version of X-Wing: the candidate positions of a digit in three rows together occupy only three columns. No other cell in those three columns can be that digit.",
      "how": "Find a digit X where, in each of three rows, the candidates are confined to the same three columns (each row may have 2–3). X must fill all three of those columns using these three rows, so eliminate X from every other cell in those three columns."
    },
    "xy_chain": {
      "summary": "A chain of bivalue cells linked end to end, where neighboring cells share a digit. At least one end of the chain must be digit A, so any cell that sees both ends cannot be A.",
      "how": "Start from a bivalue cell {A,B}, find a bivalue cell {B,C} that sees it, then continue with {C,D}… until A appears at the end of the chain. If the start is not A, the logic forces the end to be A, so at least one end is A. Eliminate A from every cell that sees both ends."
    },
    "x_chain": {
      "summary": "Focus on a single digit and alternate strong links (a unit where the digit has only two positions left) and weak links (two positions in the same unit) to form a chain. At least one end of the chain is that digit, so cells that see both ends can eliminate it.",
      "how": "Pick a digit X and find the strong links: rows, columns and boxes where X has exactly two positions. Join them end to end with weak links in the same unit to form a strong–weak–strong–weak–strong chain (an odd number of links). If the left end is not X, the strong link makes the next cell X, the weak link makes the following cell not X, and so on, until the right end must be X. So at least one end is X."
    },
    "aic": {
      "summary": "Alternating Inference Chain (AIC): on the graph of candidates, strong and weak links alternate, with no restriction on digits or cells. At least one end of the chain is true, so any candidate with a weak link to both ends can be eliminated.",
      "how": "Strong link: of two candidates, at least one is true (the two digits in a bivalue cell, or a digit with only two positions left in a unit). Weak link: at most one of two candidates is true (different digits in the same cell, or the same digit in the same unit). Starting from a candidate, extend the chain alternating strong–weak–strong…, ending on a strong link. X-Chain and XY-Chain are special cases of AIC."
    },
    "x_cycle": {
      "summary": "The strong and weak links of a single digit join end to end into a closed loop. Every weak link in the loop acts as a strong link, so any cell that sees both ends of a weak link cannot be that digit.",
      "how": "Pick a digit X and find a strong–weak–strong–weak… chain whose last weak link connects the tail back to the head (the loop has an even number of nodes). The loop has only two ways to be filled: all odd-numbered nodes are X, or all even-numbered nodes are X. Either way, exactly one of every two adjacent nodes is X, so eliminate X from other cells that see both nodes of an adjacent pair."
    },
    "grouped_aic": {
      "summary": "An upgraded AIC: nodes of the chain can be several cells in the intersection of a row/column and a box (grouped nodes), meaning the digit is in one of those cells.",
      "how": "For example, if digit 4 has only two cells left in a box, both in the same row, treat those two cells together as one node. When a unit's candidate positions split into exactly two parts, the two parts form a strong link; a cell that sees every cell of a grouped node forms a weak link with it. The rest of the logic is identical to AIC."
    },
    "als_xz": {
      "summary": "An ALS (Almost Locked Set) is a set of n cells in one unit holding n+1 candidate digits. Two ALSs linked through a restricted common candidate X let you eliminate another digit Z they share.",
      "how": "Find two non-overlapping ALSs, A and B. If both contain X, and every X-cell in A sees every X-cell in B (X is the restricted common candidate), then at most one side contains X. The side that loses X becomes n cells holding n digits, so it must contain the other shared digit Z. Therefore any cell that sees all the Z-cells of both A and B cannot be Z."
    },
    "als_chain": {
      "summary": "Link 3–4 ALSs end to end into a chain, with neighbors connected through their restricted common candidates. If both ends contain the same digit Z, eliminate Z from any cell that sees all the Z-cells at both ends.",
      "how": "ALS-XZ is the two-ALS case. Extend it: A –x1– B –x2– C, where x1≠x2. If A does not contain Z, A becomes a locked set, which forces x1 out of B; B then becomes a locked set, which forces x2 out of C… so finally C must contain Z. Hence at least one of A and C contains Z (Z cannot be the restricted common candidate at either end)."
    },
    "sue_de_coq": {
      "summary": "The 2–3 cells where a row (column) meets a box hold more candidate digits than cells. Find one group in the rest of that row (column) and another in the rest of that box to \"share out\" the intersection's digits, which allows many eliminations.",
      "how": "Let I be the intersection (union of candidates V). Find a cell group A in the row outside the intersection and a cell group C in the box outside the intersection, where the candidates of A and C all belong to V and are different from each other, and the total number of cells in I, A and C equals the number of digits in V. These cells then hold exactly all the digits of V: A's digits can only be in I or A, C's digits can only be in I or C, and the remaining digits can only be in I. Eliminate those digits from the other cells of the corresponding units."
    },
    "forcing_chain": {
      "summary": "Make an assumption and follow it through using only naked singles and hidden singles. If every assumption leads to the same conclusion, or all the other assumptions lead to contradictions, that conclusion must be true.",
      "how": "Choose a set where one option must be true: the two digits of a bivalue cell, or a digit with only 2–3 positions left in a unit. Assume each option in turn and deduce using naked singles and hidden singles. An assumption that leads to a contradiction is eliminated; if the remaining assumptions all give the same digit in the same cell, or all eliminate the same candidate, you can apply it directly."
    }
  },
  "lessons": {
    "jellyfish": {
      "terms": [
        ["Jellyfish", "The four-row, four-column version of a \"fish\". Larger than Swordfish, but the logic is exactly the same."]
      ],
      "sections": [
        { "h": "Setup", "t": "Digit 2: the candidate positions in rows 1, 3, 6 and 8 together occupy only columns 2, 4, 7 and 9. Each row has exactly two, linked end to end in a loop." },
        { "h": "Reasoning ①", "t": "Each of the four rows needs a 2, and no two can share a column. One assignment: R1C2, R3C4, R6C7, R8C9." },
        { "h": "Reasoning ②", "t": "The other assignment: R1C4, R3C7, R6C9, R8C2." },
        { "h": "Conclusion", "t": "In both assignments, the 2s of columns 2, 4, 7 and 9 are used up by these four rows. So the other cells in those four columns (red) must eliminate 2." }
      ],
      "tip": "The fish pattern: X-Wing (2) → Swordfish (3) → Jellyfish (4). Jellyfish is extremely rare in practice."
    },
    "xyz_wing": {
      "terms": [
        ["XYZ-Wing", "A variation of XY-Wing: the pivot has three candidates {X,Y,Z}, and the two wings are {X,Z} and {Y,Z}."],
        ["Pivot / Wing", "Same meaning as in XY-Wing. Here the pivot itself also contains the common digit Z, so the target cell must see all three cells: the pivot and both wings."]
      ],
      "sections": [
        { "h": "Setup", "t": "Pivot R5C5 {1,2,5} (purple). Wing R5C1 {1,5} shares the row with the pivot, and wing R4C4 {2,5} shares the box with the pivot (orange). R5C4 and R5C6 (red) see all three cells." },
        { "h": "Reasoning ①", "t": "If the pivot is 5: the red cells in its row obviously cannot be 5." },
        { "h": "Reasoning ②", "t": "If the pivot is 1: the wing {1,5} must be 5, and it shares a row with the red cells, so they cannot be 5." },
        { "h": "Reasoning ③", "t": "If the pivot is 2: the wing {2,5} must be 5, and it shares a box with the red cells, so they cannot be 5." },
        { "h": "Conclusion", "t": "In all three cases, 5 ends up in one of the three cells, and the red cells see all of them, so 5 is eliminated from the red cells." }
      ],
      "tip": "The difference: an XY-Wing pivot has only 2 candidates; an XYZ-Wing pivot has 3, and the target cell must see the pivot itself."
    },
    "swordfish": {
      "terms": [
        ["Fish", "X-Wing, Swordfish and Jellyfish are collectively called \"fish\"; the larger the fish, the more rows and columns it uses."],
        ["Base rows / Cover columns", "The three rows whose candidate positions are restricted are the \"base rows\"; the three columns containing those positions are the \"cover columns\"."]
      ],
      "sections": [
        { "h": "Setup", "t": "Digit 4: row 1 can only place it in columns 2 and 5; row 4 only in columns 5 and 8; row 7 only in columns 2 and 8. The candidates of all three rows fall in columns 2, 5 and 8." },
        { "h": "Reasoning ①", "t": "Each of the three rows needs a 4, and no two can share a column. One assignment: R1C2, R4C5, R7C8." },
        { "h": "Reasoning ②", "t": "The other assignment: R1C5, R4C8, R7C2." },
        { "h": "Conclusion", "t": "In either assignment, the 4s of columns 2, 5 and 8 are used up by these three rows. So the other cells in those three columns (red) must eliminate 4." }
      ],
      "tip": "Each row of a Swordfish need not have 3 candidate positions; 2 is fine, as long as the positions of the three rows together occupy exactly three columns."
    },
    "xy_chain": {
      "terms": [
        ["Chain", "Bivalue cells connected one after another: neighboring cells see each other and share a digit. This line of reasoning is a \"chain\"."],
        ["Chain end", "The first and last cells of the chain. The conclusion of an XY-Chain depends only on the two ends."],
        ["Propagation", "If one end of the chain is not A, the logic passes link by link and forces the other end to be A."]
      ],
      "sections": [
        { "h": "Setup", "t": "Chain: R1C1 {1,2} → R1C5 {2,3} → R5C5 {3,4} → R5C9 {1,4} (cyan). Neighboring cells see each other and share a digit (2, 3, 4). Both ends contain 1. The red cells R1C9 and R5C1 see both chain ends." },
        { "h": "Reasoning ①", "t": "If the top-left end R1C1 is not 1, it is 2. Then R1C5 cannot be 2, so it is 3; R5C5 cannot be 3, so it is 4; R5C9 cannot be 4, so it is 1." },
        { "h": "Reasoning ②", "t": "If R1C1 is 1, then it is 1, of course." },
        { "h": "Conclusion", "t": "Either way, at least one of the two chain ends is 1. Cells that see both ends (red) cannot be 1, so eliminate it." }
      ],
      "tip": "The longer the chain, the harder it is to spot. An XY-Wing is really just an XY-Chain with only 3 cells."
    },
    "x_chain": {
      "terms": [
        ["Strong link (=)", "A unit where digit X has only two positions left: one of these two positions is X and the other is not."],
        ["Weak link (–)", "Two X positions in the same unit: at most one of them is X, and possibly neither."],
        ["X-Chain", "Works on a single digit, alternating strong and weak links. Skyscraper and Two-String Kite are the shortest X-Chains."]
      ],
      "sections": [
        { "h": "Setup", "t": "Chain for digit 5: R1C2=R1C8 (strong link in row 1) – R5C8=R5C4 (strong link in row 5; R1C8 and R5C8 form a weak link in the column) – R8C4=R8C1 (strong link in row 8; R5C4 and R8C4 form a weak link in the column). The ends are R1C2 and R8C1 (cyan). The red cells R2C1 and R9C2 see both chain ends." },
        { "h": "Reasoning ①", "t": "If the left end R1C2 is not 5, the strong link in row 1 makes R1C8 a 5; the weak link in the column makes R5C8 not 5; the strong link in row 5 makes R5C4 a 5; that makes R8C4 not 5; the strong link in row 8 makes R8C1 a 5." },
        { "h": "Reasoning ②", "t": "If R1C2 is 5, then it is 5, of course." },
        { "h": "Conclusion", "t": "At least one of the two chain ends is 5. R2C1 and R9C2 (red), which see both ends, cannot be 5, so eliminate it." }
      ],
      "tip": "When looking for an X-Chain, first list all strong links of a digit (units with exactly two positions), then see whether weak links can join them."
    },
    "aic": {
      "terms": [
        ["Candidate node", "Treat \"a candidate digit in a cell\" as a point, written R1C1(3)."],
        ["Strong link / Weak link", "Strong link: of two points, at least one is true (the two digits in a bivalue cell, or a digit with only two positions left in a unit). Weak link: at most one of two points is true (different digits in the same cell, or the same digit in the same unit)."],
        ["AIC", "Alternating Inference Chain: strong and weak links alternate, with strong links at both ends. At least one end is true. It can cross digits and is the unified form of XY-Chain and X-Chain."]
      ],
      "sections": [
        { "h": "Setup", "t": "Chain: R1C1(3)=R1C1(7) (the cell has only {3,7} left) – R1C5(7) (weak link in the row) =R6C5(7) (strong link in column 5) – R6C5(3) (weak link in the same cell) =R6C9(3) (strong link in row 6). Both ends are the digit 3 (cyan). The red R1C9 sees the 3 at both ends." },
        { "h": "Reasoning ①", "t": "If R1C1 is not 3, it is 7; the weak link in the row makes R1C5 not 7; the strong link in column 5 makes R6C5 a 7; so R6C5 is not 3; the strong link in row 6 makes R6C9 a 3." },
        { "h": "Reasoning ②", "t": "If R1C1 is 3, then it is 3." },
        { "h": "Conclusion", "t": "At least one of R1C1 and R6C9 is 3. R1C9 (red), which sees both, cannot be 3, so eliminate it." }
      ],
      "tip": "This program limits chains to 12 candidates; chains can also contain grouped nodes (see Grouped AIC)."
    },
    "x_cycle": {
      "terms": [
        ["Nice Loop", "A loop of alternating strong and weak links that closes on itself. Every weak link in the loop acts as a strong link."],
        ["Relation to X-Wing", "An X-Wing is an X-Cycle of length 4; longer loops can yield more eliminations."]
      ],
      "sections": [
        { "h": "Setup", "t": "A 6-node loop for digit 7: R1C2=R1C8 (strong link in row 1) – R4C8=R4C5 (strong link in row 4) – R6C5=R6C2 (strong link in row 6), then a weak link in column 2 joins R6C2 back to R1C2. Column 8 and column 5 each also contain a weak link." },
        { "h": "Reasoning", "t": "The loop has only two ways to be filled: R1C2, R4C8 and R6C5 are all 7, or R1C8, R4C5 and R6C2 are all 7. So exactly one end of each weak link is 7 — the other 7s in columns 8 and 5 have no place left." },
        { "h": "Conclusion", "t": "Cells that see both ends of a weak link (red) cannot be 7: R8C8 in column 8, and R5C5 in column 5." }
      ],
      "tip": "A loop gives one more kind of elimination than a plain chain: you can use every weak link inside the loop."
    },
    "grouped_aic": {
      "terms": [
        ["Grouped node", "In the intersection of a box and a row (column), the cells holding a digit are merged into one node: the digit is in one of those cells."],
        ["Strong link (grouped)", "The box's candidate positions split by row (or column) into exactly two parts; one of the two parts must be true."]
      ],
      "sections": [
        { "h": "Setup", "t": "Digit 4: in box 1, 4 has only R1C1, R1C2 (a grouped node) and R3C3 left; R1C8 in row 1 is in the same row as the group; in column 8, 4 has only R1C8 and R6C8 left. Chain: R3C3 = (box 1 grouped strong link) R1C1/R1C2 – (weak link in the row) R1C8 = (strong link in column 8) R6C8. The red R3C8 sees both ends." },
        { "h": "Reasoning ①", "t": "If R3C3 is not 4, the 4 of box 1 is in R1C1 or R1C2, so R1C8 is not 4, and the strong link in column 8 makes R6C8 a 4." },
        { "h": "Reasoning ② and Conclusion", "t": "If R3C3 is 4, it is 4. So at least one of R3C3 and R6C8 is 4; R3C8 (red), which sees both, cannot be 4." }
      ],
      "tip": "Grouped chains let you bring candidate positions of three or more cells, which are not a two-cell strong link, into the chain."
    },
    "als_xz": {
      "terms": [
        ["ALS (Almost Locked Set)", "n cells in one unit holding n+1 candidate digits in total. A single bivalue cell is the smallest ALS."],
        ["Restricted common candidate", "A digit X shared by two ALSs where the X-cells of both sides all see each other: X can be true on at most one side."]
      ],
      "sections": [
        { "h": "Setup", "t": "A = R4C2 {1,2} (a bivalue cell); B = R4C8 {1,3} and R7C8 {2,3} (column 8, two cells with three digits). The shared digits are 1 and 2. Restricted common candidate X=1: the 1 in R4C2 and the 1 in R4C8 see each other in the same row." },
        { "h": "Reasoning ①", "t": "If R4C2 is 1, R4C8 in the same row cannot be 1, so B becomes R4C8=3, R7C8=2, and B contains a 2." },
        { "h": "Reasoning ② and Conclusion", "t": "If R4C2 is not 1, it is 2. So at least one of R4C2 and R7C8 is 2; R7C2 (red), which sees both, cannot be 2." }
      ],
      "tip": "An XY-Wing is the smallest ALS-XZ, made of three bivalue cells."
    },
    "als_chain": {
      "terms": [
        ["ALS Chain", "Several ALSs connected in turn through restricted common candidates. Each link works as: \"if one side does not contain X, the other side is forced to produce a new digit\"."],
        ["Different adjacent restricted candidates", "A –1– B –2– C: the digit linking A and B must differ from the digit linking B and C, otherwise the logic fails."]
      ],
      "sections": [
        { "h": "Setup", "t": "A = R1C1 {1,3}, B = R1C5 {1,2}, C = R5C5 {2,3} (three bivalue cells, which are also three ALSs). A and B share a row and are linked by digit 1; B and C share a column and are linked by digit 2. A and C both contain 3 (Z=3). The red R5C1 sees the 3 of both A and C." },
        { "h": "Reasoning", "t": "If A is not 3, it is 1; then B cannot be 1, so it is 2; then C cannot be 2, so it is 3." },
        { "h": "Conclusion", "t": "At least one of A and C is 3. R5C1 (red), which sees both, cannot be 3." }
      ],
      "tip": "Bivalue cells are used here for the demonstration; real ALSs can have several cells (up to 4), and a chain can link up to 4 ALSs."
    },
    "sue_de_coq": {
      "terms": [
        ["Intersection", "The 2–3 cells where a row (column) meets a box."],
        ["Sharing out", "Some of the intersection's digits go to cell group A in the row, some to cell group C in the box, and the rest must stay in the intersection."]
      ],
      "sections": [
        { "h": "Setup", "t": "Intersection R1C1 {1,2,3}, R1C2 {1,2,4}, with digits {1,2,3,4} in total. In row 1, A = R1C6 {1,2}; in box 1, C = R2C3 {3,4}. The digits of A and C are different, and the total number of cells 2+1+1=4 equals the number of digits." },
        { "h": "Reasoning", "t": "These 4 cells must hold one each of 1, 2, 3 and 4: 1 and 2 can only be in the intersection or A; 3 and 4 can only be in the intersection or C." },
        { "h": "Conclusion", "t": "Other cells in row 1 cannot be 1 or 2 (the 1 in R1C9); other cells in box 1 cannot be 3 or 4 (the 3 in R3C2)." }
      ],
      "tip": "Sue de Coq is named after the Sudoku player who devised it."
    },
    "forcing_chain": {
      "terms": [
        ["Assumption", "First assume a candidate is true, then follow it step by step using naked singles and hidden singles."],
        ["All roads lead to the same result", "If every assumption leads to the same conclusion, that conclusion must be true; if an assumption leads to a contradiction, that assumption is false."]
      ],
      "sections": [
        { "h": "Setup (illustration)", "t": "R1C1 has only {3,5} left, so one of them must hold. The red R4C7 {8,9} is the cell we care about." },
        { "h": "Assume 3", "t": "After R1C1=3, follow the deductions step by step (using only naked singles/hidden singles), and finally R4C7=8." },
        { "h": "Assume 5", "t": "After R1C1=5, follow the same method, and it also ends with R4C7=8." },
        { "h": "Conclusion", "t": "Both assumptions arrive at the same result, so R4C7 must be 8." }
      ],
      "tip": "The difficulty of a Forcing Chain is that the deduction path can be very long; the program only uses naked singles/hidden singles to deduce and never guesses blindly."
    }
  }
});
