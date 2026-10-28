I18n.addContent("en", {
  basics: [
    ["Cell / Row / Column / Box", "A Sudoku has 81 cells. The 9 horizontal lines are \"rows\", the 9 vertical lines are \"columns\", and the 9 3×3 regions outlined by thick lines are \"boxes\". Rows, columns and boxes are all called \"units\"; every unit must contain each digit 1–9 exactly once."],
    ["Coordinates R?C?", "This guide writes R3C5 for \"row 3, column 5\": R stands for Row and C for Column. Row and column numbers are printed above and to the left of each diagram."],
    ["Candidates", "The digits a cell could still possibly hold are its candidates. The small digits inside the cells of a diagram are candidates."],
    ["See each other (same unit)", "Two cells that share a row, column or box \"see each other\". Cells that see each other cannot hold the same digit."],
    ["Eliminate", "Once you know a cell cannot be a certain digit, you cross it out of the cell's candidates. Digits with a red strikethrough in the diagrams are eliminated candidates. Every technique boils down to either placing a digit or eliminating candidates."]
  ],
  marks: {
    pivot: "Pivot",
    wing: "Wing / key cell",
    target: "Target cell",
    base: "Key cell",
    block: "Digit is blocked",
    chain: "Cells in the chain"
  },
  help: {
    naked_single: {
      summary: "If a cell has only one candidate left, that digit is the only one it can hold.",
      how: "First cross out of the cell's candidates every digit already present in its row, column and box. If just one digit remains, place it."
    },
    hidden_single: {
      summary: "If a digit has only one possible cell in a row, column or box, it must go there.",
      how: "Pick a unit (row, column or box) and check where a given digit can still go. If only one cell is left, that cell must hold the digit, even if it has other candidates."
    },
    locked_candidates: {
      summary: "If all candidates for a digit inside a box lie on one row (or column), the cells of that row (or column) outside the box cannot hold that digit. The reverse also works.",
      how: "(Pointing) All candidates for digit X in a box lie on one row → eliminate X from the cells of that row outside the box. (Claiming) All candidates for X in a row/column lie in one box → eliminate X from the cells of that box outside the row/column."
    },
    naked_pair: {
      summary: "If two cells in a unit have exactly the same two candidates, those two digits belong to those two cells, so eliminate them from the other cells of the unit.",
      how: "Find two bivalue cells in a row/column/box with identical candidates (e.g. both {2,5}). Eliminate 2 and 5 from the candidates of the other cells in the same unit."
    },
    hidden_pair: {
      summary: "If two digits in a unit appear only in the same two cells, those cells can hold only those two digits, so all their other candidates can be eliminated.",
      how: "Count where each digit can go within the unit. If digits A and B both appear only in the same two cells, eliminate every candidate other than A and B from those two cells."
    },
    naked_triple: {
      summary: "If three cells in a unit together contain only three digits, those digits belong to those three cells, so eliminate them from the other cells of the unit.",
      how: "Find three cells whose combined candidates are exactly three digits (each cell may contain only two of them). Eliminate those three digits from the other cells of the same unit."
    },
    x_wing: {
      summary: "If a digit has exactly two candidate positions in each of two rows, and they lie in the same two columns, they form a rectangle. The digit can be eliminated from the other cells of those two columns (and likewise with rows and columns swapped).",
      how: "Find a digit X that, in two rows, can only go in the same two columns. In those rows X must occupy one pair of diagonal corners of the rectangle, so X can be eliminated from every other cell in those two columns."
    },
    xy_wing: {
      summary: "A bivalue pivot {X,Y} and two bivalue wings {X,Z} and {Y,Z} that both see the pivot. Whatever the pivot is, Z ends up in one of the wings, so any cell that sees both wings cannot be Z.",
      how: "1) Find a pivot {X,Y}. 2) In its row/column/box find wings {X,Z} and {Y,Z}. 3) Eliminate Z from every cell that sees both wings."
    },
    skyscraper: {
      summary: "A digit has exactly two candidate positions in each of two rows (or columns), with one position of each in the same column and the other two (the roofs) in different columns. At least one of the two roof cells is that digit, so any cell seeing both roofs cannot be that digit.",
      how: "1) Find two rows where a digit has exactly 2 positions each. 2) One position in each row is in the same column (the base). 3) The other two positions are the \"roofs\"; eliminate the digit from every cell that sees both roofs."
    },
    two_string_kite: {
      summary: "A digit has exactly two positions in a row and exactly two positions in a column, and one cell of the row and one cell of the column are in the same box. At least one of the kite's two other ends is that digit, so any cell seeing both ends cannot be that digit.",
      how: "1) Find a digit with exactly 2 positions in a row and exactly 2 positions in a column. 2) Pick one cell from the row and one from the column that share a box (the kite's \"knot\"). 3) Eliminate the digit from any cell that sees both remaining ends."
    },
    finned_x_wing: {
      summary: "Like an X-Wing, but one row (or column) has extra candidates, the \"fins\", beyond the two rectangle positions, all in the same box. If the fin is true, cells in that box that see it are eliminated; if it is false, it is a standard X-Wing. An elimination that holds in both cases is the conclusion.",
      how: "1) Find a row with only 2 positions (base A) and another row containing those two positions plus fins (base B). 2) All fins must be in one box, and that box must contain one rectangle corner on base B. 3) In that box, in the rectangle's column and outside the bases, eliminate the digit."
    },
    unique_rectangle: {
      summary: "Four cells of a rectangle spanning two boxes, three of which hold the same pair {a,b}. If the fourth cell were a or b, the rectangle could be filled in two interchangeable ways, breaking the \"unique solution\" rule, so a and b are eliminated from the fourth cell.",
      how: "1) Find 4 cells forming a rectangle that spans exactly two boxes. 2) Three cells have exactly the same candidates {a,b}. 3) The fourth cell contains a, b and other candidates; eliminate a and b from it."
    }
  },
  lessons: {
    naked_single: {
      terms: [
        ["Naked", "The candidates of a cell are all out in the open. A Naked Single is a cell with only 1 candidate left."]
      ],
      sections: [
        { h: "Setup", t: "Look at the purple cell R5C5. In its row, column and box (the light blue area), the digits 1, 2, 3, 4, 5, 6, 7, 8 already appear." },
        { h: "Reasoning", t: "1–8 are all crossed out, so R5C5 has only 9 left as a candidate. This cell must be 9." }
      ],
      tip: "This is the most basic technique: after each placement, check whether any surrounding cell now has only one candidate left."
    },
    hidden_single: {
      terms: [
        ["Hidden", "The answer is \"hidden\" among a cell's other candidates. The cell itself has several candidates, but from the unit's point of view, a digit has only this one position."]
      ],
      sections: [
        { h: "Setup", t: "Look at Box 1 (the blue area) and ask where the digit 7 can go. Orange 7s already appear in Row 1, Row 3, Column 1 and Column 2, so the gray cells are blocked by 7." },
        { h: "Reasoning", t: "In Box 1 only R2C3 can still hold a 7. Although it also has candidates 2 and 9, the box must contain a 7, so this cell is 7." }
      ],
      tip: "A tip for finding Hidden Singles: pick a digit, then check each row, column and box to see how many cells in that unit can still hold it."
    },
    locked_candidates: {
      terms: [
        ["Box line", "When all candidates for a digit inside a box lie on one row (or one column), those cells are \"locked\" onto a single line."],
        ["Pointing", "The box's locked cells \"point\" along the row/column out of the box, so the digit can be eliminated from the rest of that line outside the box."],
        ["Claiming", "The reverse: all candidates for a digit in a row/column lie in one box, so the box \"claims\" the digit and it is eliminated from the other cells of the box."]
      ],
      sections: [
        { h: "Pointing: Setup", t: "In Box 1, Rows 1 and 3 are filled, so the digit 4 can only go in the 3 empty cells of Row 2 (green)." },
        { h: "Pointing: Conclusion", t: "The 4 of this box must be in one of the three green cells in Row 2, so the rest of Row 2 outside the box (red cells) cannot be 4. Cross them out." },
        { h: "Claiming: Setup and conclusion", t: "In Row 4 the digit 3 has only two positions left, R4C1 and R4C2, both in Box 4. So 3 must be in one of those two cells, and the other cells of Box 4 (red) lose the candidate 3." }
      ],
      tip: "This is the most common elimination technique, and it often leads straight to a new single."
    },
    naked_pair: {
      terms: [
        ["Pair", "Two cells, two digits. Naked Pair: two cells have exactly the same candidates, and only those two digits."]
      ],
      sections: [
        { h: "Setup", t: "In Row 4, R4C2 and R4C6 both have the candidates {2,5} (purple)." },
        { h: "Reasoning", t: "These two cells are either (2,5) or (5,2), so 2 and 5 are certainly used up by them. The other cells of the row (red) cannot be 2 or 5; cross them out." }
      ],
      tip: "Pairs can also appear in columns or boxes. The principle is the same: eliminate only within that unit."
    },
    hidden_pair: {
      terms: [
        ["Hidden Pair", "Two digits appear in only the same two cells of a unit. The other candidates in those two cells are \"extra\" and can be removed."]
      ],
      sections: [
        { h: "Setup", t: "In Row 7, the digits 3 and 6 appear only in R7C2 and R7C7 (highlighted in blue); no other cell has 3 or 6." },
        { h: "Reasoning", t: "3 and 6 must each take one cell in this row, and they can only go in these two cells, so these cells are \"filled up\" by 3 and 6. All their other candidates (red) are crossed out." }
      ],
      tip: "A Naked Pair removes candidates from other cells; a Hidden Pair removes the extra candidates from its own cells. The two are often mirror images."
    },
    naked_triple: {
      terms: [
        ["Triple", "Three cells whose candidates together contain only three different digits (each cell may hold only two of them)."]
      ],
      sections: [
        { h: "Setup", t: "In Row 2: R2C1 {1,4}, R2C5 {4,7}, R2C8 {1,7} (purple). Together, the three cells contain only the digits 1, 4 and 7." },
        { h: "Reasoning", t: "Three cells must hold three different digits, which exactly uses up 1, 4 and 7. So the other cells of the row (red) lose 1, 4 and 7." }
      ],
      tip: "The three cells of a Naked Triple don't all need to contain all three digits. A common shape is a \"ring\" like {1,4}, {4,7}, {1,7}."
    },
    x_wing: {
      terms: [
        ["X-Wing", "Four cells form a rectangle on the board, like the four tips of the letter X, hence the name X-Wing."],
        ["Base rows / Cover columns", "The two rows in which the digit has exactly two positions are the \"base rows\"; the two columns containing those positions are the \"cover columns\"."]
      ],
      sections: [
        { h: "Setup", t: "Digit 6: in Row 2 it can only go in Columns 3 and 7, and in Row 8 it can also only go in Columns 3 and 7. The four green cells form a rectangle." },
        { h: "Reasoning ①", t: "The 6 in Row 2 and the 6 in Row 8 must be in different columns. Case one: R2C3 and R8C7 are 6." },
        { h: "Reasoning ②", t: "Case two: R2C7 and R8C3 are 6." },
        { h: "Conclusion", t: "In either case, the 6s of Column 3 and Column 7 are \"used\" by this rectangle. So the other cells of those two columns (red) lose the candidate 6." }
      ],
      tip: "Rows and columns can be swapped: if a digit's positions in two columns fall in the same two rows, eliminate the digit from the other cells of those two rows."
    },
    xy_wing: {
      terms: [
        ["Bivalue cell", "A cell with only two candidates. All three cells of an XY-Wing must be bivalue cells."],
        ["Pivot", "The middle one of the three cells, with candidates {X,Y}. It acts like a hinge connecting the two wings."],
        ["Wing", "The two cells that see the pivot, with candidates {X,Z} and {Y,Z}. They share the same digit Z."],
        ["Target cell", "A cell that sees both wings. It cannot be Z, so Z is eliminated from it."]
      ],
      sections: [
        { h: "Setup", t: "Pivot R5C5 {1,2} (purple). Wing R5C1 {1,5} is in its row; wing R2C5 {2,5} is in its column (orange). The target cell R2C1 (red) sees both wings: R2C1 shares a row with R2C5 and a column with R5C1." },
        { h: "Reasoning ①", t: "If the pivot is 1: the wing {1,5} shares a row with the pivot, so it can't be 1 and must be 5." },
        { h: "Reasoning ②", t: "If the pivot is 2: the wing {2,5} shares a column with the pivot, so it can't be 2 and must be 5." },
        { h: "Conclusion", t: "The pivot must be 1 or 2, and in both cases one of the wings is 5. Since the target cell sees both wings, it cannot be 5." }
      ],
      tip: "How to look for an XY-Wing: first find a bivalue cell to be the pivot, then among the bivalue cells it sees, find a pair of wings sharing the same digit."
    },
    skyscraper: {
      terms: [
        ["Strong link", "When a digit has only two positions in a unit, exactly one of them must be true. This is called a strong link."],
        ["Base / Roof", "A Skyscraper is made of two strong links: the two cells in the same column (row) are the \"base\", and the other two cells, like the top of the building, are the \"roofs\"."]
      ],
      sections: [
        {
          h: "Setup",
          t: "Digit 5: Row 2 can only hold it in C3 and C8; Row 8 only in C3 and C7. The C3 cells of both rows are in the same column and form the base (green); the roofs are R2C8 and R8C7 (orange). The red cells R7C8 and R9C8 see both roofs.",
          lab: { wing: "Roof" }
        },
        {
          h: "Reasoning ①",
          t: "The two base cells are in the same column, Column 3, so they can't both be 5. If R2C3 is 5, the 5 of Row 8 can only be in R8C7 (a roof).",
          lab: { wing: "Roof" }
        },
        {
          h: "Reasoning ②",
          t: "If R8C3 is 5, the 5 of Row 2 can only be in R2C8 (a roof).",
          lab: { wing: "Roof" }
        },
        {
          h: "Conclusion",
          t: "At least one of the two roofs is 5. The red cells see both roofs (R7C8 shares a column with R2C8 and a box with R8C7), so they cannot be 5.",
          lab: { wing: "Roof" }
        }
      ],
      tip: "The Skyscraper is a \"skewed\" version of the X-Wing: in an X-Wing both roofs are in the same column, while in a Skyscraper they are not."
    },
    two_string_kite: {
      terms: [
        ["Strong link", "A digit has only two positions in a row (or column), and exactly one of them is true."],
        ["Kite knot", "One cell of the row and one cell of the column are in the same box. They see each other and can't both be true, like the knot in a kite string."],
        ["Two strings", "The strong link in the row and the strong link in the column are the kite's two strings; the other two ends of the strings are called the \"string ends\"."]
      ],
      sections: [
        {
          h: "Setup",
          t: "Digit 7: Row 3 has only R3C2 and R3C8; Column 3 has only R1C3 and R8C3. R3C2 and R1C3 are both in Box 1 (purple, the kite's knot). The string ends are R3C8 and R8C3 (orange). The red cell R8C8 sees both string ends.",
          lab: { pivot: "Kite knot", wing: "String end" }
        },
        {
          h: "Reasoning ①",
          t: "If R3C2 is 7, R1C3 in the same box can't be 7, so the 7 of Column 3 must be in R8C3.",
          lab: { pivot: "Kite knot", wing: "String end" }
        },
        {
          h: "Reasoning ②",
          t: "If R3C2 is not 7, the 7 of Row 3 must be in R3C8.",
          lab: { wing: "String end" }
        },
        {
          h: "Conclusion",
          t: "At least one of the two string ends is 7. R8C8 shares a row with R8C3 and a column with R3C8, so it sees both ends and cannot be 7.",
          lab: { pivot: "Kite knot", wing: "String end" }
        }
      ],
      tip: "It's called a \"kite\" because one row plus one column plus the knot form the shape of a kite. Like the Skyscraper, it is a \"two strong links\" pattern."
    },
    finned_x_wing: {
      terms: [
        ["Fin", "In a standard X-Wing, a row has extra candidate positions that shouldn't be there, like the extra fin on a fish."],
        ["Finned", "As long as all fins are in the same box, you can still make some eliminations, but only within that box."]
      ],
      sections: [
        {
          h: "Setup",
          t: "Digit 4: Row 1 has only C2 and C7; Row 4 has C2 and C7 plus an extra R4C3 (the fin, orange). The fin shares Box 4 with R4C2.",
          lab: { wing: "Fin" }
        },
        {
          h: "Reasoning ①",
          t: "If the fin R4C3 is 4, the cells in Box 4 that it sees (red) can't be 4.",
          lab: { wing: "Fin" }
        },
        {
          h: "Reasoning ②",
          t: "If the fin is not 4, the 4 of Row 4 can only be in C2 or C7, making a standard X-Wing. One arrangement: R1C7 and R4C2 are 4."
        },
        {
          h: "Reasoning ③",
          t: "The other arrangement: R1C2 and R4C7 are 4. Either way, the 4 of Column 2 is in Row 1 or Row 4, so the other cells of Column 2 (including the red cells) can't be 4."
        },
        {
          h: "Conclusion",
          t: "Whether the fin is true or false, the red cells can't be 4, so cross them out. Note: you can only eliminate cells in the fin's box, in the rectangle's column.",
          lab: { wing: "Fin" }
        }
      ],
      tip: "Without the fin it is a standard X-Wing. The Finned X-Wing solves many positions that are \"almost an X-Wing\"."
    },
    unique_rectangle: {
      terms: [
        ["Unique solution", "A valid Sudoku has exactly one answer. This technique reasons from the fact that two answers can't exist."],
        ["Deadly Pattern", "If all four cells held only {a,b}, a and b could be swapped, producing two answers, so this situation can't occur."],
        ["Type 1", "Unique Rectangles come in several types; this site currently implements only the most basic, Type 1: three cells are {a,b} and the fourth has extra candidates."]
      ],
      sections: [
        {
          h: "Setup",
          t: "The rectangle R1C1, R1C4, R2C1, R2C4 spans Boxes 1 and 2. The first three cells are all {3,7} (purple), and the fourth, R2C4, is {3,7,9} (red).",
          lab: { pivot: "The same {3,7}" }
        },
        {
          h: "Reasoning ①",
          t: "Suppose R2C4 is 3 or 7. Then all four cells are within {3,7}. The rectangle has one way to be filled..."
        },
        {
          h: "Reasoning ②",
          t: "...and swapping 3 and 7 gives another valid fill. The puzzle would then have two answers, contradicting the \"unique solution\"."
        },
        {
          h: "Conclusion",
          t: "So R2C4 can't be 3 or 7, leaving only 9.",
          lab: { pivot: "The same {3,7}" }
        }
      ],
      tip: "The rectangle must span exactly two boxes. This technique relies on a unique solution, so use it only on puzzles guaranteed to have one."
    }
  }
});
