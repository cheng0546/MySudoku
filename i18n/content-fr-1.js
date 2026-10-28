I18n.addContent("fr", {
  basics: [
    [
      "Case / ligne / colonne / bloc",
      "Une grille de Sudoku compte 81 cases : les 9 rangées horizontales sont les « lignes », les 9 rangées verticales les « colonnes », et les 9 régions de 3×3 délimitées par les traits épais les « blocs ». Lignes, colonnes et blocs sont appelés « unités » : dans chaque unité, les chiffres de 1 à 9 doivent apparaître exactement une fois."
    ],
    [
      "Coordonnées R?C?",
      "Dans ce cours, R3C5 désigne la case de la ligne 3 et de la colonne 5 : R est Row (ligne) et C est Column (colonne). Les numéros de lignes et de colonnes sont indiqués au-dessus et à gauche des grilles."
    ],
    [
      "Candidat",
      "Un candidat est un chiffre qui peut encore être placé dans une case. Les petits chiffres dans les cases des schémas sont les candidats."
    ],
    [
      "Se voir (même unité)",
      "Deux cases qui sont dans la même ligne, la même colonne ou le même bloc « se voient ». Deux cases qui se voient ne peuvent pas contenir le même chiffre."
    ],
    [
      "Éliminer",
      "Lorsqu'on est sûr qu'une case ne peut pas contenir un chiffre, on le barre de ses candidats. Les chiffres rouges barrés dans les schémas sont les candidats éliminés. Toute technique consiste soit à « placer un chiffre », soit à « éliminer des candidats »."
    ]
  ],
  marks: {
    pivot: "Pivot",
    wing: "Aile / case clé",
    target: "Case cible",
    base: "Case clé",
    block: "Chiffre bloqué",
    chain: "Cases de la chaîne"
  },
  help: {
    naked_single: {
      summary: "Si une case n'a plus qu'un seul candidat, c'est forcément ce chiffre qui doit y être placé.",
      how: "Barrez d'abord des candidats de la case les chiffres déjà présents dans sa ligne, sa colonne et son bloc. S'il ne reste qu'un chiffre, placez-le."
    },
    hidden_single: {
      summary: "Si un chiffre ne peut aller que dans une seule case d'une ligne, d'une colonne ou d'un bloc, il doit être placé là.",
      how: "Choisissez une unité (ligne, colonne ou bloc) et regardez où un chiffre peut encore aller. S'il ne reste qu'une case, ce chiffre doit y être placé, même si la case a d'autres candidats."
    },
    locked_candidates: {
      summary: "Si, dans un bloc, tous les candidats d'un chiffre sont alignés sur une même ligne (ou colonne), ce chiffre est éliminé des autres cases de cette ligne (ou colonne) hors du bloc. La réciproque est vraie aussi.",
      how: "(Pointage) Les candidats du chiffre X dans un bloc sont tous sur une même ligne → éliminez X des cases de cette ligne hors du bloc. (Réduction) Les candidats du chiffre X dans une ligne/colonne sont tous dans un même bloc → éliminez X des autres cases de ce bloc, hors de cette ligne/colonne."
    },
    naked_pair: {
      summary: "Si deux cases d'une même unité ont exactement les deux mêmes candidats, ces deux chiffres leur appartiennent : éliminez-les des autres cases de l'unité.",
      how: "Repérez dans une ligne/colonne/bloc deux cases à deux candidats identiques (par exemple {2,5}). Éliminez 2 et 5 des candidats des autres cases de cette unité."
    },
    hidden_pair: {
      summary: "Si deux chiffres d'une unité ne peuvent aller que dans les deux mêmes cases, ces cases ne peuvent contenir que ces deux chiffres : tous leurs autres candidats sont éliminés.",
      how: "Comptez les emplacements possibles de chaque chiffre dans l'unité. Si les chiffres A et B n'apparaissent que dans les deux mêmes cases, éliminez de ces deux cases tous les candidats autres que A et B."
    },
    naked_triple: {
      summary: "Si trois cases d'une même unité ont, à elles trois, seulement trois chiffres candidats, ces chiffres leur appartiennent : éliminez-les des autres cases de l'unité.",
      how: "Cherchez trois cases dont l'union des candidats est exactement de trois chiffres (chaque case peut n'en contenir que deux). Éliminez ces trois chiffres des autres cases de l'unité."
    },
    x_wing: {
      summary: "Si un chiffre n'a que deux emplacements possibles dans chacune de deux lignes, et que ce sont les deux mêmes colonnes, ils forment un rectangle. Ce chiffre est éliminé des autres cases de ces deux colonnes (et de même en échangeant lignes et colonnes).",
      how: "Cherchez un chiffre X qui, dans deux lignes, ne peut aller que dans les deux mêmes colonnes. X occupe forcément deux coins opposés du rectangle, donc éliminez X des autres cases de ces deux colonnes."
    },
    xy_wing: {
      summary: "Un pivot à deux candidats {X,Y} et deux ailes à deux candidats {X,Z} et {Y,Z} qui voient toutes deux le pivot. Quelle que soit la valeur du pivot, Z sera dans l'une des ailes : une case qui voit les deux ailes ne peut donc pas être Z.",
      how: "1) Trouvez le pivot {X,Y}. 2) Dans sa ligne/colonne/bloc, trouvez les ailes {X,Z} et {Y,Z}. 3) Éliminez Z des cases vues par les deux ailes à la fois."
    },
    skyscraper: {
      summary: "Un chiffre n'a que deux emplacements dans chacune de deux lignes (ou colonnes), dont un de chaque ligne dans la même colonne, les deux autres (le toit) étant différents. L'un au moins des deux toits contient le chiffre : une case qui voit les deux toits ne peut pas le contenir.",
      how: "1) Trouvez deux lignes où un chiffre n'a que 2 emplacements. 2) Une case de chaque ligne est dans la même colonne (la base). 3) Les deux autres cases sont les « toits » : éliminez le chiffre des cases qui voient les deux toits."
    },
    two_string_kite: {
      summary: "Un chiffre n'a que deux emplacements dans une ligne et deux dans une colonne, avec une case de la ligne et une case de la colonne dans le même bloc. L'une au moins des deux autres extrémités du cerf-volant contient le chiffre : une case qui voit les deux extrémités ne peut pas le contenir.",
      how: "1) Trouvez un chiffre qui a exactement 2 emplacements dans une ligne et exactement 2 dans une colonne. 2) Choisissez une case dans la ligne et une dans la colonne qui sont dans le même bloc (le « nœud » du cerf-volant). 3) Éliminez le chiffre des cases qui voient les deux autres extrémités."
    },
    finned_x_wing: {
      summary: "Comme un X-Wing, mais l'une des lignes (colonnes) a en plus, hors des deux positions du rectangle, quelques « ailerons » situés dans le même bloc. Si l'aileron est vrai, on élimine dans le bloc les cases qu'il voit ; s'il est faux, c'est un X-Wing classique. Les éliminations valables dans les deux cas sont la conclusion.",
      how: "1) Trouvez une ligne avec seulement 2 emplacements (ligne de base A) et une autre ligne qui contient ces deux emplacements plus des ailerons (ligne de base B). 2) Tous les ailerons doivent être dans un même bloc, qui contient un coin du rectangle sur la ligne de base B. 3) Dans ce bloc, éliminez le chiffre des cases de cette colonne du rectangle, hors des lignes de base."
    },
    unique_rectangle: {
      summary: "Un rectangle de quatre cases sur deux blocs, dont trois cases ont la même paire de candidats {a,b}. Si la quatrième case prenait a ou b, le rectangle aurait deux remplissages interchangeables, ce qui contredit l'unicité de la solution : on élimine donc a et b de la quatrième case.",
      how: "1) Trouvez 4 cases formant un rectangle qui s'étend sur exactement deux blocs. 2) Trois cases ont exactement les mêmes candidats {a,b}. 3) La quatrième case contient a, b et d'autres candidats : éliminez a et b."
    }
  },
  lessons: {
    naked_single: {
      terms: [
        [
          "Nu (Naked)",
          "Les candidats de la case sont tous à découvert. Un single nu, c'est une case qui n'a plus qu'un seul candidat."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Regardez la case violette R5C5. Dans sa ligne, sa colonne et son bloc (zone bleu clair) apparaissent déjà 1, 2, 3, 4, 5, 6, 7 et 8."
        },
        {
          h: "Raisonnement",
          t: "Les chiffres de 1 à 8 sont éliminés ; il ne reste que 9 comme candidat de R5C5, donc cette case est forcément 9."
        }
      ],
      tip: "C'est la technique la plus basique : à chaque chiffre placé, vérifiez si une case voisine n'a plus qu'un seul candidat."
    },
    hidden_single: {
      terms: [
        [
          "Caché (Hidden)",
          "La réponse est « cachée » parmi les autres candidats de la case. La case a plusieurs candidats, mais du point de vue de l'unité, ce chiffre n'a qu'un seul emplacement possible."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Observez le bloc 1 (zone bleue) et demandez-vous où peut aller le chiffre 7. Les 7 orange sont déjà présents sur les lignes 1 et 3 et les colonnes 1 et 2 ; les cases grises sont bloquées par ces 7."
        },
        {
          h: "Raisonnement",
          t: "Dans le bloc 1, seule R2C3 peut encore accueillir un 7. Même si elle a aussi 2 et 9 comme candidats, le bloc doit contenir un 7, donc cette case est 7."
        }
      ],
      tip: "L'astuce pour trouver un single caché : choisissez un chiffre, puis examinez chaque ligne, colonne et bloc pour voir combien de cases peuvent encore l'accueillir."
    },
    locked_candidates: {
      terms: [
        [
          "Candidats verrouillés",
          "Tous les candidats d'un chiffre dans un bloc sont sur la même ligne (ou la même colonne) : ces cases sont comme « verrouillées » sur une droite."
        ],
        [
          "Pointage (Pointing)",
          "Les candidats verrouillés d'un bloc « pointent » le long de la ligne/colonne vers l'extérieur du bloc : on élimine ce chiffre du reste de la droite, hors du bloc."
        ],
        [
          "Réduction (Claiming)",
          "Inversement : si tous les candidats d'un chiffre dans une ligne/colonne sont dans un même bloc, ce bloc le « revendique » et on élimine ce chiffre des autres cases du bloc."
        ]
      ],
      sections: [
        {
          h: "Pointage : situation",
          t: "Dans le bloc 1, les lignes 1 et 3 sont remplies : le chiffre 4 ne peut aller que dans les 3 cases vides de la ligne 2 (vert)."
        },
        {
          h: "Pointage : conclusion",
          t: "Le 4 de ce bloc est forcément dans l'une des trois cases vertes de la ligne 2, donc la ligne 2 ne peut plus avoir de 4 hors du bloc (cases rouges) : éliminez-les."
        },
        {
          h: "Réduction : situation et conclusion",
          t: "Dans la ligne 4, le chiffre 3 n'a plus que deux emplacements, R4C1 et R4C2, tous deux dans le bloc 4. Le 3 est donc forcément dans l'une de ces deux cases, et on élimine 3 des autres cases du bloc 4 (rouge)."
        }
      ],
      tip: "C'est la technique d'élimination la plus courante ; après l'élimination, un nouveau single apparaît souvent."
    },
    naked_pair: {
      terms: [
        [
          "Paire",
          "Deux cases, deux chiffres. Paire nue : les deux cases ont exactement les mêmes candidats, et seulement ces deux chiffres."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Dans la ligne 4, R4C2 et R4C6 ont toutes deux pour candidats {2,5} (violet)."
        },
        {
          h: "Raisonnement",
          t: "Ces deux cases sont soit (2,5), soit (5,2) : elles utilisent forcément 2 et 5. Les autres cases de la ligne (rouge) ne peuvent plus être 2 ou 5 : éliminez-les."
        }
      ],
      tip: "Une paire peut aussi apparaître dans une colonne ou un bloc, avec exactement le même principe : on n'élimine que dans cette « unité »."
    },
    hidden_pair: {
      terms: [
        [
          "Paire cachée",
          "Deux chiffres n'apparaissent que dans les deux mêmes cases de l'unité : les autres candidats de ces deux cases sont « superflus » et peuvent être supprimés."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Dans la ligne 7, les chiffres 3 et 6 n'apparaissent que dans R7C2 et R7C7 (en bleu) ; aucune autre case n'a de 3 ni de 6."
        },
        {
          h: "Raisonnement",
          t: "Dans cette ligne, 3 et 6 doivent chacun occuper une case, et ils ne peuvent aller que dans ces deux-là : ces deux cases sont donc « complètes » avec 3 et 6, et tous leurs autres candidats (rouge) sont éliminés."
        }
      ],
      tip: "La paire nue « élimine les candidats des autres », la paire cachée « élimine les candidats superflus de ses propres cases » : les deux sont souvent le miroir l'une de l'autre."
    },
    naked_triple: {
      terms: [
        [
          "Triplet",
          "Trois cases dont les candidats réunis ne forment que trois chiffres différents (chaque case peut n'en contenir que deux)."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Dans la ligne 2 : R2C1 {1,4}, R2C5 {4,7}, R2C8 {1,7} (violet). À elles trois, ces cases n'ont que les chiffres 1, 4 et 7 comme candidats."
        },
        {
          h: "Raisonnement",
          t: "Trois cases doivent contenir trois chiffres différents, ce qui épuise exactement 1, 4 et 7. Les autres cases de la ligne (rouge) perdent donc 1, 4 et 7."
        }
      ],
      tip: "Les trois cases d'un triplet nu n'ont pas à contenir chacune trois chiffres ; le cas courant est un « cycle » comme {1,4}, {4,7}, {1,7}."
    },
    x_wing: {
      terms: [
        [
          "X-Wing",
          "Quatre cases forment un rectangle sur la grille, comme les quatre extrémités d'un X, d'où le nom X-Wing (aile en X)."
        ],
        [
          "Lignes de base / colonnes de couverture",
          "Dans un X-Wing, les deux lignes où le candidat n'a que deux emplacements sont les « lignes de base », et les deux colonnes qui contiennent ces emplacements sont les « colonnes de couverture »."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Chiffre 6 : dans la ligne 2, il ne peut aller qu'en colonnes 3 et 7 ; dans la ligne 8, également qu'en colonnes 3 et 7. Les quatre cases vertes forment un rectangle."
        },
        {
          h: "Raisonnement ①",
          t: "Le 6 de la ligne 2 et celui de la ligne 8 doivent être dans des colonnes différentes. Cas 1 : R2C3 et R8C7 sont 6."
        },
        {
          h: "Raisonnement ②",
          t: "Cas 2 : R2C7 et R8C3 sont 6."
        },
        {
          h: "Conclusion",
          t: "Dans les deux cas, le 6 des colonnes 3 et 7 est « occupé » par ce rectangle. Les autres cases de ces deux colonnes (rouge) perdent donc le candidat 6."
        }
      ],
      tip: "Lignes et colonnes sont interchangeables : si les candidats de deux colonnes tombent sur les deux mêmes lignes, on élimine le chiffre des autres cases de ces deux lignes."
    },
    xy_wing: {
      terms: [
        [
          "Case bivaluée",
          "Une case qui n'a que deux candidats. Les trois cases d'un XY-Wing doivent toutes être bivaluées."
        ],
        [
          "Pivot",
          "La case centrale des trois, avec les candidats {X,Y}. Elle fait office de charnière entre les deux ailes."
        ],
        [
          "Aile (Wing)",
          "Les deux cases qui voient le pivot, avec les candidats {X,Z} et {Y,Z} respectivement ; elles partagent le même chiffre Z."
        ],
        [
          "Case cible",
          "Une case qui voit les deux ailes à la fois. Elle ne peut pas être Z : éliminez Z."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Le pivot R5C5 {1,2} (violet). L'aile R5C1 {1,5} est dans sa ligne ; l'aile R2C5 {2,5} est dans sa colonne (orange). La case cible R2C1 (rouge) voit les deux ailes : R2C1 est dans la même ligne que R2C5 et dans la même colonne que R5C1."
        },
        {
          h: "Raisonnement ①",
          t: "Si le pivot est 1 : l'aile {1,5}, qui est dans sa ligne, ne peut plus être 1, donc elle est 5."
        },
        {
          h: "Raisonnement ②",
          t: "Si le pivot est 2 : l'aile {2,5}, qui est dans sa colonne, ne peut plus être 2, donc elle est 5."
        },
        {
          h: "Conclusion",
          t: "Le pivot ne peut être que 1 ou 2, et dans les deux cas l'une des ailes est 5. Comme la case cible voit les deux ailes, elle ne peut pas être 5."
        }
      ],
      tip: "Pour trouver un XY-Wing : choisissez d'abord une case bivaluée comme pivot, puis cherchez parmi les cases bivaluées qu'elle voit deux ailes partageant un même chiffre."
    },
    skyscraper: {
      terms: [
        [
          "Lien fort",
          "Quand un chiffre n'a que deux emplacements dans une unité, exactement l'un des deux est vrai : c'est un lien fort."
        ],
        [
          "Base / toit",
          "Un gratte-ciel est formé de deux liens forts : leurs deux cases situées dans la même colonne (ligne) sont la « base », les deux autres, comme le haut de l'immeuble, sont les « toits »."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Chiffre 5 : la ligne 2 n'a que C3 et C8 ; la ligne 8 n'a que C3 et C7. Les deux C3 sont dans la même colonne et forment la base (vert) ; les toits sont R2C8 et R8C7 (orange). Les cases rouges R7C8 et R9C8 voient les deux toits.",
          lab: {
            wing: "Toit"
          }
        },
        {
          h: "Raisonnement ①",
          t: "Les deux cases de la base sont dans la colonne 3 et ne peuvent pas être toutes deux 5. Si R2C3 est 5, le 5 de la ligne 8 ne peut être qu'en R8C7 (toit).",
          lab: {
            wing: "Toit"
          }
        },
        {
          h: "Raisonnement ②",
          t: "Si R8C3 est 5, le 5 de la ligne 2 ne peut être qu'en R2C8 (toit).",
          lab: {
            wing: "Toit"
          }
        },
        {
          h: "Conclusion",
          t: "L'un au moins des deux toits est 5. Les cases rouges voient les deux toits (R7C8 est dans la même colonne que R2C8 et dans le même bloc que R8C7) : elles ne peuvent pas être 5.",
          lab: {
            wing: "Toit"
          }
        }
      ],
      tip: "Le gratte-ciel est une version « de travers » du X-Wing : dans un X-Wing les deux toits sont dans la même colonne, dans un gratte-ciel ils ne le sont pas."
    },
    two_string_kite: {
      terms: [
        [
          "Lien fort",
          "Le chiffre n'a que deux emplacements dans une ligne (ou colonne) : exactement l'un des deux est vrai."
        ],
        [
          "Nœud du cerf-volant",
          "Une case de la ligne et une case de la colonne sont dans le même bloc : elles se voient et ne peuvent pas être vraies en même temps, comme le nœud d'une ficelle de cerf-volant."
        ],
        [
          "Deux cordes",
          "Le lien fort de la ligne et celui de la colonne sont les deux cordes du cerf-volant ; leurs autres extrémités sont les « bouts de corde »."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Chiffre 7 : la ligne 3 n'a que R3C2 et R3C8 ; la colonne 3 n'a que R1C3 et R8C3. R3C2 et R1C3 sont dans le même bloc 1 (violet, le nœud du cerf-volant). Les bouts de corde sont R3C8 et R8C3 (orange). La case rouge R8C8 voit les deux bouts.",
          lab: {
            pivot: "Nœud du cerf-volant",
            wing: "Bout de corde"
          }
        },
        {
          h: "Raisonnement ①",
          t: "Si R3C2 est 7, R1C3, dans le même bloc, ne peut pas être 7 : le 7 de la colonne 3 ne peut alors être qu'en R8C3.",
          lab: {
            pivot: "Nœud du cerf-volant",
            wing: "Bout de corde"
          }
        },
        {
          h: "Raisonnement ②",
          t: "Si R3C2 n'est pas 7, le 7 de la ligne 3 ne peut être qu'en R3C8.",
          lab: {
            wing: "Bout de corde"
          }
        },
        {
          h: "Conclusion",
          t: "L'un au moins des deux bouts est 7. R8C8 est dans la même ligne que R8C3 et dans la même colonne que R3C8 : elle voit les deux bouts, donc elle ne peut pas être 7.",
          lab: {
            pivot: "Nœud du cerf-volant",
            wing: "Bout de corde"
          }
        }
      ],
      tip: "On parle de « cerf-volant » car une ligne, une colonne et leur nœud en dessinent la forme. Comme le gratte-ciel, c'est une structure à « deux liens forts »."
    },
    finned_x_wing: {
      terms: [
        [
          "Aileron (Fin)",
          "Dans un X-Wing classique, un emplacement candidat en trop dans l'une des lignes, comme l'aileron qui dépasse sur le corps d'un poisson."
        ],
        [
          "À ailerons",
          "Tant que tous les ailerons sont dans le même bloc, on peut encore tirer des éliminations partielles, mais limitées à ce bloc."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Chiffre 4 : la ligne 1 n'a que C2 et C7 ; la ligne 4 a C2 et C7, plus R4C3 (l'aileron, en orange). L'aileron est dans le même bloc 4 que R4C2.",
          lab: {
            wing: "Aileron"
          }
        },
        {
          h: "Raisonnement ①",
          t: "Si l'aileron R4C3 est 4, les cases du bloc 4 qu'il voit (rouge) ne peuvent pas être 4.",
          lab: {
            wing: "Aileron"
          }
        },
        {
          h: "Raisonnement ②",
          t: "Si l'aileron n'est pas 4, le 4 de la ligne 4 ne peut être qu'en C2 ou C7 : c'est un X-Wing classique. Une disposition possible : R1C7 et R4C2 sont 4."
        },
        {
          h: "Raisonnement ③",
          t: "Autre disposition : R1C2 et R4C7 sont 4. Dans tous les cas, le 4 de la colonne 2 est dans les lignes 1 ou 4, et les autres cases de la colonne 2 (dont la case rouge) ne peuvent pas être 4."
        },
        {
          h: "Conclusion",
          t: "Que l'aileron soit vrai ou faux, la case rouge ne peut pas être 4 : éliminez-le. Attention : on ne peut éliminer que dans les cases « du bloc de l'aileron, sur la colonne du rectangle ».",
          lab: {
            wing: "Aileron"
          }
        }
      ],
      tip: "Sans aileron, c'est un X-Wing classique. Le X-Wing à ailerons règle de nombreuses grilles où l'on était « à un cheveu d'un X-Wing »."
    },
    unique_rectangle: {
      terms: [
        [
          "Solution unique",
          "Une grille de Sudoku valide n'a qu'une seule solution. Cette technique exploite justement le fait qu'« il ne peut pas y avoir deux solutions »."
        ],
        [
          "Motif mortel (Deadly Pattern)",
          "Si les quatre cases n'ont que {a,b}, a et b pourraient être échangés, ce qui donnerait deux solutions : cette situation ne peut donc pas se produire."
        ],
        [
          "Type 1",
          "Il existe plusieurs types de rectangle unique ; ce site n'implémente pour l'instant que le plus basique, le type 1 : trois cases sont {a,b} et la quatrième a des candidats supplémentaires."
        ]
      ],
      sections: [
        {
          h: "Situation",
          t: "Le rectangle R1C1, R1C4, R2C1, R2C4 s'étend sur les blocs 1 et 2. Les trois premières cases sont {3,7} (violet) et la quatrième, R2C4, est {3,7,9} (rouge).",
          lab: {
            pivot: "Le même {3,7}"
          }
        },
        {
          h: "Raisonnement ①",
          t: "Supposons que R2C4 prenne 3 ou 7 : les quatre cases seraient toutes dans {3,7}. Le rectangle aurait alors un premier remplissage…"
        },
        {
          h: "Raisonnement ②",
          t: "… et en échangeant 3 et 7, un second remplissage valide. La grille aurait alors deux solutions, ce qui contredit la « solution unique »."
        },
        {
          h: "Conclusion",
          t: "R2C4 ne peut donc pas être 3 ni 7 : il ne reste que 9.",
          lab: {
            pivot: "Le même {3,7}"
          }
        }
      ],
      tip: "Le rectangle doit s'étendre sur exactement deux blocs. Cette technique repose sur l'unicité de la solution : ne l'utilisez que pour des grilles dont la solution unique est garantie."
    }
  }
});
