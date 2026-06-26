// Reproduction fidèle du questionnaire diffusé (Google Forms), pour
// consultation brute indépendamment des données collectées. Les libellés et
// options reprennent mot pour mot le PDF d'export du formulaire.
export const QUESTIONNAIRE = [
  {
    id: 'profil',
    titre: 'Vous, en quelques questions',
    intro: "Quelques informations rapides pour situer votre profil. Aucune donnée identifiante n'est collectée.",
    questions: [
      { code: 'Q1', texte: 'Quel âge avez-vous', type: 'unique', options: ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
      { code: 'Q2', texte: "Niveau d'études le plus élevé atteint", type: 'unique', options: ['Bac ou inférieur', 'Bac+2 / Bac+3', 'Bac+4 / Bac+5', 'Au delà du Bac+5'] },
      {
        code: 'Q3',
        texte: 'Votre situation professionnelle actuelle',
        type: 'unique',
        options: ['Étudiant', 'Employé / Ouvrier', 'Cadre / Profession intermédiaire', 'Profession libérale / Indépendant', 'Sans activité', 'Retraité'],
      },
      {
        code: 'Q4',
        texte: 'Où vivez-vous ?',
        type: 'unique',
        options: [
          'Paris ou sa banlieue (Île-de-France urbaine)',
          'Une grande métropole de province ou sa banlieue (Lyon, Marseille, Toulouse, Lille, Bordeaux, Nantes, Strasbourg, Rennes, Montpellier, Nice, etc.)',
          "Une ville moyenne (entre 10 000 et 100 000 habitants, hors banlieue d'une grande métropole)",
          'Une petite ville (moins de 10 000 habitants)',
          'Un village ou une zone rurale',
        ],
      },
      {
        code: 'Q5',
        texte: 'Quel est votre positionnement politique ?',
        type: 'unique',
        options: ['Très à gauche', 'Plutôt à gauche', 'Plutôt au centre', 'Plutôt à droite', 'Très à droite', 'Je ne me positionne pas / Préfère ne pas répondre'],
      },
    ],
  },
  {
    id: 'pratiques',
    titre: 'Vos pratiques numériques',
    intro: "Vos usages des réseaux sociaux et vos sources d'information.",
    questions: [
      {
        code: 'Q6',
        texte: 'Quels réseaux sociaux utilisez-vous régulièrement (au moins une fois par semaine) ?',
        type: 'multiple',
        options: ['Facebook', 'Instagram', 'X (anciennement Twitter)', 'TikTok', 'YouTube', 'LinkedIn', 'Snapchat', 'Reddit', 'Aucun', 'Autre : (champ libre)'],
      },
      {
        code: 'Q7',
        texte: 'Quel est votre temps quotidien estimé passé sur les réseaux sociaux (toutes plateformes confondues) ?',
        type: 'unique',
        options: ['Moins de 30 min', '30 min - 1h', '1-2h', '2-4h', 'Plus de 4h'],
      },
      {
        code: 'Q8',
        texte: "Quelle sont vos principales sources d'information pour suivre l'actualité ?",
        type: 'multiple',
        options: ['Réseaux sociaux', "Chaînes d'info en continu (TV)", 'Presse écrite et sites de presse (journaux/magazines)', 'Radio', 'Discussions avec proches', "Ne suit pas l'actualité"],
      },
    ],
  },
  {
    id: 'perception',
    titre: 'Perception des algorithmes',
    intro: "Votre ressenti sur le fonctionnement des fils d'actualité.",
    questions: [
      {
        code: 'Q9',
        texte: "Indiquez votre degré d'accord avec l'affirmation : \"Mon fil d'actualité sur les réseaux sociaux me montre surtout des contenus qui confirment mes opinions\"",
        type: 'echelle',
        min: "Pas du tout d'accord",
        max: "Tout à fait d'accord",
      },
      {
        code: 'Q10',
        texte: "Indiquez votre degré d'accord avec l'affirmation : \"Les contenus qui provoquent colère ou indignation sont plus visibles (mis en avant) par les algorithmes\"",
        type: 'echelle',
        min: "Pas du tout d'accord",
        max: "Tout à fait d'accord",
      },
    ],
  },
  {
    id: 'exposition',
    titre: 'Exposition aux contenus polémiques',
    intro: 'Quelques questions sur les contenus que vous voyez passer sur vos fils d\'actualité. Indiquez la fréquence à laquelle vous les rencontrez.',
    questions: [
      {
        code: 'Q11a',
        texte: 'À quelle fréquence rencontrez-vous des discours hostiles envers un groupe (racisme, sexisme, homophobie, haine envers une religion, etc.) sur les réseaux sociaux ?',
        type: 'unique',
        options: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Très souvent'],
      },
      {
        code: 'Q11b',
        texte: 'À quelle fréquence rencontrez-vous des théories conspirationnistes sur les réseaux sociaux ?',
        type: 'unique',
        options: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Très souvent'],
      },
      {
        code: 'Q11c',
        texte: 'À quelle fréquence rencontrez-vous des fausses informations politiques (fake news) sur les réseaux sociaux ?',
        type: 'unique',
        options: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Très souvent'],
      },
      {
        code: 'Q11d',
        texte: 'À quelle fréquence rencontrez-vous des insultes ou attaques personnelles dans les commentaires sur les réseaux sociaux ?',
        type: 'unique',
        options: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Très souvent'],
      },
      {
        code: 'Q12',
        texte: 'Selon vous, les discussions politiques sur les réseaux sociaux sont aujourd\'hui...',
        type: 'echelle',
        min: 'Beaucoup plus apaisées qu\'avant',
        max: 'Beaucoup plus tendues qu\'avant',
      },
      {
        code: 'Q13',
        texte: "À quelle fréquence estimez-vous qu'une polémique née en ligne est ensuite reprise par la TV ou la presse traditionnelle ?",
        type: 'echelle',
        min: 'Jamais',
        max: 'Très souvent',
      },
    ],
  },
  {
    id: 'climat',
    titre: 'Climat du débat public',
    intro: 'Comment percevez-vous, au quotidien, vos échanges avec celles et ceux qui ne partagent pas vos opinions ?',
    questions: [
      {
        code: 'Q14a',
        texte: 'Pensez à des personnes qui ont des opinions politiques opposées aux vôtres. À quel point les considérez-vous comme mal informées ?',
        type: 'echelle',
        min: "Pas du tout d'accord",
        max: "Tout à fait d'accord",
      },
      {
        code: 'Q14b',
        texte: 'Pensez à ces mêmes personnes. À quel point les considérez-vous comme de mauvaise foi ?',
        type: 'echelle',
        min: "Pas du tout d'accord",
        max: "Tout à fait d'accord",
      },
      {
        code: 'Q14c',
        texte: 'Pensez à ces mêmes personnes. À quel point les considérez-vous comme dangereuses pour le pays ?',
        type: 'echelle',
        min: "Pas du tout d'accord",
        max: "Tout à fait d'accord",
      },
      {
        code: 'Q14d',
        texte: 'Pensez à ces mêmes personnes. Dans quelle mesure considérez-vous leurs positions comme un simple désaccord, mais qui reste tout à fait respectable ?',
        type: 'echelle',
        min: "Pas du tout d'accord",
        max: "Tout à fait d'accord",
      },
      {
        code: 'Q15',
        texte: 'Quel rôle pensez-vous que les réseaux sociaux jouent dans la formation de vos opinions politiques ?',
        type: 'echelle',
        min: 'Aucun rôle',
        max: 'Un rôle très important',
      },
    ],
  },
  {
    id: 'responsabilites',
    titre: 'Responsabilités et régulation',
    intro: 'Selon vous, qui doit agir face aux contenus polarisants en ligne, et comment ?',
    questions: [
      {
        code: 'Q16a',
        texte: 'Selon vous, dans quelle mesure les plateformes (Meta, X, TikTok, etc.) sont-elles responsables de la diffusion de contenus extrémistes ou polarisants en ligne ?',
        type: 'echelle',
        min: 'Pas du tout responsable',
        max: 'Totalement responsable',
      },
      {
        code: 'Q16b',
        texte: "Selon vous, dans quelle mesure l'État et les régulateurs (pouvoirs publics) sont-ils responsables de la diffusion de contenus extrémistes ou polarisants en ligne ?",
        type: 'echelle',
        min: 'Pas du tout responsable',
        max: 'Totalement responsable',
      },
      {
        code: 'Q16c',
        texte: 'Selon vous, dans quelle mesure les utilisateurs qui produisent ces contenus sont-ils responsables de leur diffusion ?',
        type: 'echelle',
        min: 'Pas du tout responsable',
        max: 'Totalement responsable',
      },
      {
        code: 'Q16d',
        texte: 'Selon vous, dans quelle mesure les médias traditionnels (TV, presse) sont-ils responsables de la diffusion de contenus extrémistes ou polarisants en ligne ?',
        type: 'echelle',
        min: 'Pas du tout responsable',
        max: 'Totalement responsable',
      },
      {
        code: 'Q16e',
        texte: 'Selon vous, dans quelle mesure les utilisateurs qui partagent ces contenus sont-ils responsables de leur diffusion ?',
        type: 'echelle',
        min: 'Pas du tout responsable',
        max: 'Totalement responsable',
      },
      {
        code: 'Q17',
        texte: 'Avez-vous connaissance du Digital Services Act (DSA), la réglementation européenne qui encadre les plateformes numériques ?',
        type: 'unique',
        options: ["Oui, je vois précisément de quoi il s'agit.", 'Oui, mais vaguement.', "Non, c'est la première fois que j'entends ça."],
      },
      {
        code: 'Q18',
        texte: "Indiquez votre degré d'accord avec l'affirmation : \"L'État devrait imposer plus de transparence et de contrôle sur le fonctionnement des algorithmes\"",
        type: 'echelle',
        min: "Pas du tout d'accord",
        max: "Tout à fait d'accord",
      },
    ],
  },
  {
    id: 'final',
    titre: 'Pour finir',
    intro: 'Vous y êtes presque ! Deux questions ouvertes facultatives pour conclure et nous aider à comprendre votre point de vue.',
    questions: [
      { code: 'Q19', texte: 'À quoi attribuez-vous principalement la tension ou la polarisation du débat public en France aujourd\'hui ? (Réponse facultative, 3-4 lignes)', type: 'libre' },
      { code: 'Q20', texte: 'Quelle mesure concrète proposeriez-vous pour améliorer le débat public en ligne sur les réseaux sociaux ? (Réponse facultative, 3-4 lignes)', type: 'libre' },
    ],
  },
]

// Intitulé exact par code de question, dérivé de QUESTIONNAIRE : permet aux
// fenêtres méthodologie des graphiques de citer mot pour mot les questions
// mobilisées, sans dupliquer les textes.
export const TEXTE_QUESTIONS = QUESTIONNAIRE.flatMap((s) => s.questions).reduce((acc, q) => {
  acc[q.code] = q.texte
  return acc
}, {})
