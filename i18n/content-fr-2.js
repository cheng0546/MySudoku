I18n.addContent("fr", {
  help: {
    "jellyfish": {
      "summary": "Version à quatre lignes (colonnes) du Swordfish : les candidats d'un chiffre dans quatre lignes n'occupent au total que quatre colonnes. Les autres cases de ces quatre colonnes ne peuvent pas contenir ce chiffre.",
      "how": "Cherchez un chiffre X : dans quatre lignes, tous les candidats X se trouvent dans les mêmes quatre colonnes (2 à 4 par ligne). X occupe forcément ces quatre colonnes grâce à ces quatre lignes ; éliminez donc X des autres cases de ces quatre colonnes."
    },
    "xyz_wing": {
      "summary": "La case pivot a trois candidats {X,Y,Z} ; deux ailes bivaluées {X,Z} et {Y,Z} voient toutes deux le pivot. Quelle que soit la valeur du pivot, Z se trouve dans l'une des trois cases : toute case qui voit les trois ne peut pas être Z.",
      "how": "1) Trouvez un pivot à trois candidats {X,Y,Z}. 2) Trouvez des ailes {X,Z} et {Y,Z}, chacune dans une unité commune avec le pivot. 3) Éliminez Z de toute case qui voit à la fois le pivot et les deux ailes."
    },
    "swordfish": {
      "summary": "Version à trois lignes (colonnes) du X-Wing : les candidats d'un chiffre dans trois lignes n'occupent au total que trois colonnes. Les autres cases de ces trois colonnes ne peuvent pas contenir ce chiffre.",
      "how": "Cherchez un chiffre X : dans trois lignes, les candidats X sont limités aux mêmes trois colonnes (2 ou 3 par ligne). X occupe forcément ces trois colonnes grâce à ces trois lignes ; éliminez donc X des autres cases de ces trois colonnes."
    },
    "xy_chain": {
      "summary": "Une chaîne formée de plusieurs cases bivaluées reliées bout à bout, deux cases voisines partageant un chiffre. L'une au moins des deux extrémités vaut A : toute case qui voit les deux extrémités ne peut pas être A.",
      "how": "Partez d'une case {A,B}, cherchez une case bivaluée {B,C} qu'elle voit, puis {C,D}… jusqu'à ce que A réapparaisse en bout de chaîne. Si le départ n'est pas A, la déduction impose A à l'autre extrémité : l'une au moins des extrémités est A. Éliminez A des cases qui voient les deux extrémités."
    },
    "x_chain": {
      "summary": "On ne s'intéresse qu'à un seul chiffre, en alternant liens forts (dans une unité, le chiffre n'a plus que deux positions) et liens faibles (deux positions d'une même unité). L'une au moins des extrémités vaut ce chiffre : toute case qui voit les deux extrémités peut l'éliminer.",
      "how": "Choisissez un chiffre X, repérez les liens forts (unités où X n'a que deux positions) et reliez-les par des liens faibles d'une même unité pour former une chaîne fort–faible–fort–faible–fort (nombre impair de liens). Si l'extrémité gauche n'est pas X, le lien fort impose X à la case suivante, le lien faible interdit X à la suivante… et l'extrémité droite est forcément X. L'une au moins des extrémités est donc X."
    },
    "aic": {
      "summary": "Chaîne d'inférences alternées (AIC) : sur le graphe des candidats, on alterne liens forts et liens faibles, sans restriction de chiffre ni de case. L'une au moins des extrémités est vraie ; tout candidat lié faiblement aux deux extrémités peut être éliminé.",
      "how": "Lien fort : de deux candidats, l'un est forcément vrai (les deux chiffres d'une case bivaluée, ou un chiffre qui n'a plus que deux positions dans une unité). Lien faible : au plus un des deux est vrai (deux chiffres d'une même case, ou le même chiffre dans une même unité). Partez d'un candidat et alternez fort–faible–fort…, la chaîne se terminant par un lien fort. Les X-Chain et XY-Chain sont des cas particuliers d'AIC."
    },
    "x_cycle": {
      "summary": "Les liens forts et faibles d'un seul chiffre se referment en boucle. Chaque lien faible de la boucle équivaut à un lien fort : toute case qui voit les deux extrémités d'un lien faible ne peut pas contenir ce chiffre.",
      "how": "Choisissez un chiffre X, trouvez une chaîne fort–faible–fort–faible… dont le dernier lien faible relie la fin au début (nombre pair de nœuds). La boucle n'a que deux remplissages : tous les nœuds impairs sont X, ou tous les nœuds pairs le sont. Dans les deux cas, chaque paire de nœuds voisins contient exactement un X ; les autres cases qui voient ces deux nœuds peuvent éliminer X."
    },
    "grouped_aic": {
      "summary": "Version améliorée de l'AIC : un nœud peut être un groupe de cases situées à l'intersection d'une ligne/colonne et d'un bloc (nœud groupé), signifiant que le chiffre se trouve dans l'une de ces cases.",
      "how": "Par exemple, si le 4 n'a plus dans un bloc que deux cases d'une même ligne, ces deux cases forment un seul nœud. Quand les candidats d'une unité se répartissent en exactement deux parties, elles forment un lien fort ; une case qui voit toutes les cases du nœud groupé forme un lien faible. Le reste du raisonnement est identique à l'AIC."
    },
    "als_xz": {
      "summary": "Un ALS (ensemble presque verrouillé) est un ensemble de n cases d'une même unité contenant au total n+1 candidats. Deux ALS reliés par un « candidat commun restreint » X permettent d'éliminer un autre chiffre Z qu'ils ont en commun.",
      "how": "Trouvez deux ALS disjoints A et B. Si tous deux contiennent X et que toutes les cases de A contenant X voient toutes celles de B contenant X (X est le candidat commun restreint), alors X est au plus d'un seul côté. L'autre côté, privé de X, devient n cases pour n chiffres et contient forcément l'autre chiffre commun Z. Éliminez donc Z des cases qui voient tous les Z de A et de B."
    },
    "als_chain": {
      "summary": "On relie 3 à 4 ALS bout à bout, deux ALS voisins étant liés par leur candidat commun restreint. Si les deux extrémités contiennent le même chiffre Z, on peut l'éliminer des cases qui voient tous les Z des deux extrémités.",
      "how": "L'ALS-XZ est le cas à deux ALS. On l'allonge : A –x1– B –x2– C, avec x1≠x2. Si A ne contient pas Z, A devient un ensemble verrouillé, ce qui chasse x1 de B ; B devient verrouillé, ce qui chasse x2 de C… et finalement C contient forcément Z. L'un au moins de A et C contient donc Z (Z ne doit pas être un candidat commun restreint des extrémités)."
    },
    "sue_de_coq": {
      "summary": "L'intersection d'une ligne (colonne) et d'un bloc compte 2 à 3 cases avec plus de candidats que de cases. En trouvant un groupe de cases dans le reste de la ligne (colonne) et un autre dans le reste du bloc, on « répartit » les chiffres de l'intersection, ce qui permet de nombreuses éliminations.",
      "how": "Soit I l'intersection (union de candidats V). Trouvez un groupe de cases A dans la ligne hors de I, et un groupe C dans le bloc hors de I, dont les candidats appartiennent à V et sont disjoints entre eux, avec un nombre total de cases de I, A et C égal au nombre de chiffres de V. Ces cases contiennent alors exactement les chiffres de V : ceux de A sont dans I ou A, ceux de C dans I ou C, les autres dans I. Éliminez ces chiffres des autres cases des unités concernées."
    },
    "forcing_chain": {
      "summary": "On fait une hypothèse et on déduit de proche en proche par « candidat unique, position unique ». Si toutes les hypothèses mènent à la même conclusion, ou si les autres mènent à une contradiction, cette conclusion est forcément vraie.",
      "how": "Choisissez un ensemble dont l'un des éléments est forcément vrai : les deux chiffres d'une case bivaluée, ou un chiffre qui n'a plus que 2 à 3 positions dans une unité. Testez chaque hypothèse avec les candidats uniques et positions uniques. Une hypothèse contradictoire est éliminée ; si les hypothèses restantes donnent la même valeur pour la même case, ou éliminent le même candidat, on peut l'appliquer directement."
    }
  },
  lessons: {
    "jellyfish": {
      "terms": [
        ["Méduse (Jellyfish)", "La version « poisson » à quatre lignes et quatre colonnes. Plus grande que le Swordfish, mais le raisonnement est exactement le même."]
      ],
      "sections": [
        { "h": "Situation", "t": "Chiffre 2 : dans les lignes 1, 3, 6 et 8, les candidats n'occupent au total que les colonnes 2, 4, 7 et 9. Chaque ligne a exactement deux positions, reliées bout à bout en boucle." },
        { "h": "Raisonnement ①", "t": "Chaque ligne a besoin d'un 2, et deux 2 ne peuvent pas être dans la même colonne. Une répartition possible : R1C2, R3C4, R6C7, R8C9." },
        { "h": "Raisonnement ②", "t": "Une autre répartition : R1C4, R3C7, R6C9, R8C2." },
        { "h": "Conclusion", "t": "Dans les deux répartitions, les 2 des colonnes 2, 4, 7 et 9 sont tous fournis par ces quatre lignes. Les autres cases (rouges) de ces quatre colonnes perdent donc le candidat 2." }
      ],
      "tip": "La règle des poissons : X-Wing (2) → Swordfish (3) → Jellyfish (4). En pratique, la Méduse est extrêmement rare."
    },
    "xyz_wing": {
      "terms": [
        ["XYZ-Wing", "Variante du XY-Wing : le pivot a trois candidats {X,Y,Z} et les deux ailes sont {X,Z} et {Y,Z}."],
        ["Pivot / ailes", "Même sens que dans le XY-Wing. Ici, le pivot contient lui aussi le chiffre commun Z : la case cible doit donc voir à la fois le pivot et les deux ailes."]
      ],
      "sections": [
        { "h": "Situation", "t": "Pivot R5C5 {1,2,5} (violet). L'aile R5C1 {1,5} est dans la même ligne que le pivot, l'aile R4C4 {2,5} dans le même bloc (orange). R5C4 et R5C6 (rouges) voient les trois cases." },
        { "h": "Raisonnement ①", "t": "Si le pivot vaut 5 : les cases rouges, dans sa ligne, ne peuvent évidemment pas être 5." },
        { "h": "Raisonnement ②", "t": "Si le pivot vaut 1 : l'aile {1,5} ne peut être que 5 ; elle est dans la ligne des cases rouges, qui ne peuvent donc pas être 5." },
        { "h": "Raisonnement ③", "t": "Si le pivot vaut 2 : l'aile {2,5} ne peut être que 5 ; elle est dans le bloc des cases rouges, qui ne peuvent donc pas être 5." },
        { "h": "Conclusion", "t": "Dans les trois cas, un 5 se trouve dans l'une des trois cases, et les cases rouges les voient toutes : on élimine le candidat 5 des cases rouges." }
      ],
      "tip": "À ne pas confondre : le pivot du XY-Wing n'a que 2 candidats ; celui du XYZ-Wing en a 3, et la case cible doit voir le pivot lui-même."
    },
    "swordfish": {
      "terms": [
        ["Poisson (Fish)", "X-Wing, Swordfish (Espadon) et Jellyfish (Méduse) forment la famille des « poissons » : plus le poisson est grand, plus il utilise de lignes et de colonnes."],
        ["Lignes de base / colonnes de couverture", "Les trois lignes dont les candidats sont restreints sont les « lignes de base » ; les trois colonnes où se trouvent ces candidats sont les « colonnes de couverture »."]
      ],
      "sections": [
        { "h": "Situation", "t": "Chiffre 4 : la ligne 1 ne peut le placer qu'en colonnes 2 et 5 ; la ligne 4 qu'en colonnes 5 et 8 ; la ligne 7 qu'en colonnes 2 et 8. Les candidats des trois lignes se trouvent tous dans les colonnes 2, 5 et 8." },
        { "h": "Raisonnement ①", "t": "Chaque ligne a besoin d'un 4, et deux 4 ne peuvent pas être dans la même colonne. Une répartition possible : R1C2, R4C5, R7C8." },
        { "h": "Raisonnement ②", "t": "Une autre répartition : R1C5, R4C8, R7C2." },
        { "h": "Conclusion", "t": "Quelle que soit la répartition, les 4 des colonnes 2, 5 et 8 sont tous fournis par ces trois lignes. On élimine donc le candidat 4 des autres cases (rouges) de ces trois colonnes." }
      ],
      "tip": "Chaque ligne du Swordfish n'a pas forcément 3 candidats : 2 suffisent, tant que les positions des trois lignes occupent exactement trois colonnes."
    },
    "xy_chain": {
      "terms": [
        ["Chaîne (Chain)", "On relie des cases bivaluées l'une après l'autre : deux cases voisines se voient et partagent un chiffre. Cette suite d'indices est une « chaîne »."],
        ["Extrémités", "La première et la dernière case de la chaîne. La conclusion d'une XY-Chain ne dépend que de ces deux extrémités."],
        ["Propagation", "Si une extrémité n'est pas A, la déduction se transmet de maillon en maillon et impose A à l'autre extrémité."]
      ],
      "sections": [
        { "h": "Situation", "t": "Chaîne : R1C1 {1,2} → R1C5 {2,3} → R5C5 {3,4} → R5C9 {1,4} (cyan). Les cases voisines se voient et partagent un chiffre (2, 3, 4). Les deux extrémités contiennent 1. Les cases rouges R1C9 et R5C1 voient les deux extrémités." },
        { "h": "Raisonnement ①", "t": "Si l'extrémité en haut à gauche R1C1 n'est pas 1, c'est 2. Alors R1C5 ne peut pas être 2, donc c'est 3 ; R5C5 ne peut pas être 3, donc c'est 4 ; R5C9 ne peut pas être 4, donc c'est 1." },
        { "h": "Raisonnement ②", "t": "Si R1C1 vaut 1, alors c'est bien 1." },
        { "h": "Conclusion", "t": "Dans tous les cas, l'une au moins des deux extrémités vaut 1. Les cases qui voient les deux extrémités (rouges) ne peuvent pas être 1 : on l'élimine." }
      ],
      "tip": "Plus la chaîne est longue, plus elle est difficile à repérer. Le XY-Wing est en fait une XY-Chain de seulement 3 cases."
    },
    "x_chain": {
      "terms": [
        ["Lien fort (=)", "Dans une unité, le chiffre X n'a plus que deux positions : l'une des deux est X, l'autre non."],
        ["Lien faible (–)", "Deux positions de X dans une même unité : au plus une est X, et il se peut qu'aucune ne le soit."],
        ["X-Chain", "Chaîne centrée sur un seul chiffre, alternant liens forts et faibles. Le Gratte-ciel (Skyscraper) et le Cerf-volant à deux cordes (Two-String Kite) sont les X-Chain les plus courtes."]
      ],
      "sections": [
        { "h": "Situation", "t": "Chaîne du chiffre 5 : R1C2=R1C8 (lien fort de la ligne 1) – R5C8=R5C4 (lien fort de la ligne 5 ; R1C8 et R5C8 sont reliés faiblement par la colonne) – R8C4=R8C1 (lien fort de la ligne 8 ; R5C4 et R8C4 sont reliés faiblement par la colonne). Extrémités R1C2 et R8C1 (cyan). Les cases rouges R2C1 et R9C2 voient les deux extrémités." },
        { "h": "Raisonnement ①", "t": "Si l'extrémité gauche R1C2 n'est pas 5, le lien fort de la ligne 1 rend R1C8 égal à 5 ; le lien faible de la colonne interdit 5 à R5C8 ; le lien fort de la ligne 5 rend R5C4 égal à 5 ; cela interdit 5 à R8C4 ; le lien fort de la ligne 8 rend R8C1 égal à 5." },
        { "h": "Raisonnement ②", "t": "Si R1C2 vaut 5, alors c'est bien 5." },
        { "h": "Conclusion", "t": "L'une au moins des extrémités vaut 5. R2C1 et R9C2 (rouges), qui voient les deux extrémités, ne peuvent pas être 5 : on l'élimine." }
      ],
      "tip": "Pour trouver une X-Chain, listez d'abord tous les liens forts d'un chiffre (unités où il n'a que deux positions), puis voyez si des liens faibles permettent de les relier."
    },
    "aic": {
      "terms": [
        ["Nœud candidat", "On considère « tel candidat dans telle case » comme un point, noté R1C1(3)."],
        ["Lien fort / lien faible", "Lien fort : l'un des deux points est forcément vrai (les deux chiffres d'une case bivaluée, ou un chiffre qui n'a plus que deux positions dans une unité). Lien faible : au plus un des deux est vrai (deux chiffres d'une même case, ou le même chiffre dans une même unité)."],
        ["AIC", "Chaîne d'inférences alternées : liens forts et faibles alternent, et les deux bouts sont des liens forts. L'une au moins des extrémités est vraie. Elle peut changer de chiffre et unifie XY-Chain et X-Chain."]
      ],
      "sections": [
        { "h": "Situation", "t": "Chaîne : R1C1(3)=R1C1(7) (la case n'a plus que {3,7}) – R1C5(7) (lien faible de la ligne) =R6C5(7) (lien fort de la colonne 5) – R6C5(3) (lien faible de la case) =R6C9(3) (lien fort de la ligne 6). Les deux extrémités sont le chiffre 3 (cyan). R1C9 (rouge) voit les deux 3 des extrémités." },
        { "h": "Raisonnement ①", "t": "Si R1C1 n'est pas 3, elle est 7 ; le lien faible de la ligne interdit 7 à R1C5 ; le lien fort de la colonne 5 rend R6C5 égal à 7 ; donc R6C5 n'est pas 3 ; le lien fort de la ligne 6 rend R6C9 égal à 3." },
        { "h": "Raisonnement ②", "t": "Si R1C1 vaut 3, alors c'est bien 3." },
        { "h": "Conclusion", "t": "R1C1 ou R6C9 au moins vaut 3. R1C9 (rouge), qui voit les deux, ne peut pas être 3 : on l'élimine." }
      ],
      "tip": "Dans ce programme, la longueur maximale d'une chaîne est de 12 candidats ; une chaîne peut aussi contenir des nœuds groupés (voir AIC groupée)."
    },
    "x_cycle": {
      "terms": [
        ["Boucle continue (Nice Loop)", "Boucle où liens forts et faibles alternent et qui se referme sur elle-même. Chaque lien faible de la boucle équivaut à un lien fort."],
        ["Lien avec le X-Wing", "Le X-Wing est un X-Cycle de longueur 4 ; une boucle plus longue permet davantage d'éliminations."]
      ],
      "sections": [
        { "h": "Situation", "t": "Boucle de 6 nœuds pour le chiffre 7 : R1C2=R1C8 (lien fort de la ligne 1) – R4C8=R4C5 (lien fort de la ligne 4) – R6C5=R6C2 (lien fort de la ligne 6), puis un lien faible de la colonne 2 ramène R6C2 à R1C2. La colonne 8 et la colonne 5 ont aussi chacune un lien faible." },
        { "h": "Raisonnement", "t": "La boucle n'a que deux remplissages : R1C2, R4C8, R6C5 valent 7, ou R1C8, R4C5, R6C2 valent 7. Chaque lien faible a donc exactement un 7 à ses deux extrémités : les autres 7 des colonnes 8 et 5 n'ont plus de place." },
        { "h": "Conclusion", "t": "Les cases (rouges) qui voient les deux extrémités d'un lien faible ne peuvent pas être 7 : R8C8 dans la colonne 8, R5C5 dans la colonne 5." }
      ],
      "tip": "Une boucle offre plus d'éliminations qu'une simple chaîne : on peut exploiter chacun de ses liens faibles."
    },
    "grouped_aic": {
      "terms": [
        ["Nœud groupé", "Dans l'intersection d'un bloc et d'une ligne (colonne), les cases contenant un chiffre sont fusionnées en un seul nœud : le chiffre est dans l'une de ces cases."],
        ["Lien fort (groupé)", "Les candidats d'un bloc, coupés par ligne (ou colonne), forment exactement deux parties : l'une des deux est vraie."]
      ],
      "sections": [
        { "h": "Situation", "t": "Chiffre 4 : dans le bloc 1, le 4 n'est plus que dans R1C1, R1C2 (nœud groupé) et R3C3 ; R1C8 est dans la ligne du groupe ; dans la colonne 8, le 4 n'est plus que dans R1C8 et R6C8. Chaîne : R3C3 = (lien fort groupé du bloc 1) R1C1/R1C2 – (lien faible de la ligne) R1C8 = (lien fort de la colonne 8) R6C8. R3C8 (rouge) voit les deux extrémités." },
        { "h": "Raisonnement ①", "t": "Si R3C3 n'est pas 4, le 4 du bloc 1 est en R1C1 ou R1C2, donc R1C8 n'est pas 4, et le lien fort de la colonne 8 rend R6C8 égal à 4." },
        { "h": "Raisonnement ② et conclusion", "t": "Si R3C3 vaut 4, c'est bien 4. L'une au moins de R3C3 et R6C8 vaut donc 4 ; R3C8 (rouge), qui les voit, ne peut pas être 4." }
      ],
      "tip": "Les chaînes groupées permettent d'intégrer des unités à trois candidats ou plus, qui ne forment pas un lien fort à deux cases."
    },
    "als_xz": {
      "terms": [
        ["ALS (ensemble presque verrouillé)", "n cases d'une même unité contenant au total n+1 candidats. Une case bivaluée seule est le plus petit ALS."],
        ["Candidat commun restreint", "Un chiffre X commun à deux ALS, dont les cases contenant X se voient deux à deux d'un côté à l'autre : X est vrai d'un seul côté au plus."]
      ],
      "sections": [
        { "h": "Situation", "t": "A = R4C2 {1,2} (case bivaluée) ; B = R4C8 {1,3} et R7C8 {2,3} (colonne 8, deux cases pour trois chiffres). Chiffres communs : 1 et 2. Candidat commun restreint X=1 : le 1 de R4C2 et celui de R4C8 se voient dans la même ligne." },
        { "h": "Raisonnement ①", "t": "Si R4C2 vaut 1, R4C8, dans la même ligne, ne peut pas être 1 : B devient R4C8=3, R7C8=2, et B contient un 2." },
        { "h": "Raisonnement ② et conclusion", "t": "Si R4C2 n'est pas 1, c'est 2. L'une au moins de R4C2 et R7C8 vaut donc 2 ; R7C2 (rouge), qui voit les deux, ne peut pas être 2." }
      ],
      "tip": "Le XY-Wing est l'ALS-XZ minimal, formé de trois cases bivaluées."
    },
    "als_chain": {
      "terms": [
        ["Chaîne d'ALS", "Plusieurs ALS reliés successivement par leurs candidats communs restreints. Chaque maillon fonctionne ainsi : si un côté ne contient pas X, l'autre est forcé de produire un nouveau chiffre."],
        ["Candidats restreints voisins différents", "A –1– B –2– C : le chiffre reliant A et B doit être différent de celui reliant B et C, sinon le raisonnement ne tient pas."]
      ],
      "sections": [
        { "h": "Situation", "t": "A = R1C1 {1,3}, B = R1C5 {1,2}, C = R5C5 {2,3} (trois cases bivaluées, donc trois ALS). A et B, dans la même ligne, sont reliés par le chiffre 1 ; B et C, dans la même colonne, par le chiffre 2. A et C contiennent tous deux 3 (Z=3). R5C1 (rouge) voit les 3 de A et de C." },
        { "h": "Raisonnement", "t": "Si A n'est pas 3, c'est 1 ; alors B ne peut pas être 1, donc c'est 2 ; alors C ne peut pas être 2, donc c'est 3." },
        { "h": "Conclusion", "t": "A ou C au moins vaut 3. R5C1 (rouge), qui voit les deux, ne peut pas être 3." }
      ],
      "tip": "Ici, on illustre avec des cases bivaluées ; un vrai ALS peut compter plusieurs cases (jusqu'à 4), et la chaîne peut relier jusqu'à 4 ALS."
    },
    "sue_de_coq": {
      "terms": [
        ["Intersection", "Les 2 à 3 cases communes à une ligne (colonne) et à un bloc."],
        ["Répartition", "Une partie des chiffres de l'intersection revient au groupe de cases A de la ligne, une autre au groupe C du bloc, et le reste doit demeurer dans l'intersection."]
      ],
      "sections": [
        { "h": "Situation", "t": "Intersection R1C1 {1,2,3}, R1C2 {1,2,4}, soit les chiffres {1,2,3,4}. Dans la ligne 1, A=R1C6 {1,2} ; dans le bloc 1, C=R2C3 {3,4}. Les chiffres de A et de C sont disjoints, et le nombre total de cases 2+1+1=4 égale le nombre de chiffres." },
        { "h": "Raisonnement", "t": "Ces 4 cases doivent contenir chacun des chiffres 1, 2, 3, 4 : 1 et 2 ne peuvent être que dans l'intersection ou A, 3 et 4 que dans l'intersection ou C." },
        { "h": "Conclusion", "t": "Dans la ligne 1, les autres cases ne peuvent pas être 1 ni 2 (le 1 de R1C9) ; dans le bloc 1, les autres cases ne peuvent pas être 3 ni 4 (le 3 de R3C2)." }
      ],
      "tip": "Le nom « Sue de Coq » vient de la joueuse de sudoku qui a inventé la technique."
    },
    "forcing_chain": {
      "terms": [
        ["Hypothèse", "On suppose qu'un candidat est vrai et on déduit pas à pas, par candidat unique et position unique."],
        ["Tous les chemins mènent au même but", "Si chaque hypothèse donne la même conclusion, elle est forcément vraie ; si une hypothèse mène à une contradiction, elle est fausse."]
      ],
      "sections": [
        { "h": "Situation (schéma)", "t": "R1C1 n'a plus que {3,5} : l'un des deux est forcément vrai. La case rouge R4C7 {8,9} est celle qui nous intéresse." },
        { "h": "Hypothèse 3", "t": "Avec R1C1=3, on déduit de proche en proche (uniquement par candidat unique / position unique) que R4C7=8." },
        { "h": "Hypothèse 5", "t": "Avec R1C1=5, la même méthode aboutit aussi à R4C7=8." },
        { "h": "Conclusion", "t": "Les deux hypothèses mènent au même but : R4C7 vaut forcément 8." }
      ],
      "tip": "La difficulté de la chaîne de forçage est que le chemin de déduction peut être très long ; le programme ne déduit que par candidat unique / position unique et ne devine jamais au hasard."
    }
  }
});
