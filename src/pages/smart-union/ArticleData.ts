export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: 'Communication' | 'Psychologie' | 'Vie Quotidienne' | 'Finances';
  readTime: string;
  image: string;
  content: string;
  date: string; // Format YYYY-MM-DD
  lead?: string;
  quote?: string;
}

export const ARTICLES: Article[] = [
  {
    id: 'ecoute-active',
    title: "L'art de l'écoute active",
    excerpt: "Transformez vos désaccords en moments de connexion grâce à des techniques d'écoute bienveillante.",
    category: 'Communication',
    readTime: '5 min',
    date: '2024-03-10',
    image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=800',
    lead: "L'écoute active n'est pas simplement le fait de se taire pendant que l'autre parle. C'est un engagement total envers la compréhension.",
    content: "Le premier obstacle à une bonne communication est la distraction. Posez votre téléphone, éteignez la télévision et tournez votre corps vers votre partenaire. Le contact visuel montre que ce qu'ils disent a de la valeur.",
    quote: "L'écoute est peut-être le plus beau cadeau que nous puissions faire à un autre être humain."
  },
  {
    id: 'langages-amour',
    title: "Les 5 langages de l'amour",
    excerpt: "Comprendre comment votre partenaire exprime et reçoit de l'affection est la clé d'une harmonie durable.",
    category: 'Psychologie',
    readTime: '6 min',
    date: '2024-03-05',
    image: 'https://www.lune-baroque.com/292-thickbox_default/lot-de-5-petits-mobiles-coeurs.jpg',
    lead: "Tout le monde n'exprime pas l'amour de la même manière.",
    content: "Gary Chapman a identifié 5 piliers : les paroles valorisantes, les moments de qualité, les cadeaux, les services rendus et le toucher physique.",
    quote: "L'amour est un choix que l'on fait chaque jour."
  },
  {
    id: 'pardon-quotidien',
    title: "Le pardon au quotidien",
    excerpt: "Comment lâcher prise sur les petites frustrations pour éviter qu'elles ne deviennent des murs.",
    category: 'Psychologie',
    readTime: '4 min',
    date: '2024-03-15',
    image: 'https://images.unsplash.com/photo-1556484687-30636164638b?auto=format&fit=crop&q=80&w=800',
    lead: "Le pardon n'est pas une faiblesse, c'est l'huile qui permet aux rouages du couple de ne pas s'enrayer.",
    content: "Pardonner ne signifie pas oublier ou valider une erreur, mais décider que la relation est plus importante que l'offense. Cela demande une pratique quotidienne des 'petits' pardons.",
    quote: "Le premier à demander pardon est le plus brave. Le premier à pardonner est le plus fort."
  },
  {
    id: 'vision-board',
    title: "Bâtir une Vision Commune",
    excerpt: "Pourquoi et comment créer un 'Vision Board' pour vos projets de vie à deux.",
    category: 'Vie Quotidienne',
    readTime: '8 min',
    date: '2024-02-28',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800',
    lead: "Regarder dans la même direction est plus puissant que de simplement se regarder l'un l'autre.",
    content: "Un couple qui ne rêve plus ensemble finit par s'ennuyer. Prenez une soirée pour découper des images, lister vos objectifs financiers et vos envies de voyages.",
    quote: "L'avenir appartient à ceux qui croient à la beauté de leurs rêves communs."
  },
  {
    id: 'sommeil-et-couple',
    title: "Sommeil et Harmonie",
    excerpt: "L'impact méconnu de la fatigue sur votre patience et votre communication.",
    category: 'Psychologie',
    readTime: '5 min',
    date: '2024-02-15',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800',
    lead: "Une nuit de 5 heures est le meilleur terreau pour une dispute inutile à 8 heures du matin.",
    content: "La science montre que le manque de sommeil réduit notre capacité d'empathie. Avant de régler un conflit majeur, assurez-vous d'être reposés.",
    quote: "Un bon sommeil est la moitié d'une réconciliation."
  },
  {
    id: 'humour-secret',
    title: "Le Rire : Votre Meilleur Allié",
    excerpt: "Utiliser l'autodérision pour désamorcer les tensions en moins de 30 secondes.",
    category: 'Communication',
    readTime: '4 min',
    date: '2024-03-20',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    lead: "L'humour est le raccourci le plus court entre deux personnes.",
    content: "Savoir rire de soi-même lors d'une maladresse change instantanément l'énergie d'une pièce. Attention toutefois : l'humour doit être partagé, jamais aux dépens de l'autre.",
    quote: "Le rire est la distance la plus courte entre deux cœurs."
  },
  {
    id: 'parler-argent',
    title: "Parler d'argent sans tabou",
    excerpt: "L'argent est l'une des principales sources de stress. Apprenez à aligner vos visions financières.",
    category: 'Finances',
    readTime: '7 min',
    date: '2024-01-20',
    image: 'https://images.pexels.com/photos/4386339/pexels-photo-4386339.jpeg',
    content: "La règle d'or est la transparence. Il ne s'agit pas de tout fusionner, mais de tout se dire.",
    quote: "Un budget dit à votre argent où aller."
  },
  {
    id: 'beaux-parents',
    title: "Gérer la 'Belle-Famille'",
    excerpt: "Trouver le bon équilibre entre loyauté familiale et priorité au couple.",
    category: 'Vie Quotidienne',
    readTime: '9 min',
    date: '2024-02-05',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800',
    lead: "Quand on épouse quelqu'un, on n'épouse pas seulement une personne, mais tout un écosystème.",
    content: "Apprendre à poser des limites saines avec les parents et beaux-parents est crucial pour protéger l'intimité du foyer.",
    quote: "Le couple est une île qui a besoin de digues solides pour prospérer."
  },
  {
    id: 'rituels-couple',
    title: "Rituels de couple : Vitalité",
    excerpt: "Des ancres qui maintiennent le couple stable face aux tempêtes du quotidien.",
    category: 'Vie Quotidienne',
    readTime: '4 min',
    date: '2023-12-15',
    image: 'https://images.pexels.com/photos/4922792/pexels-photo-4922792.jpeg',
    content: "Que ce soit le café du matin ensemble sans écran ou la promenade du dimanche.",
    quote: "Les petits rituels quotidiens sont le ciment des grandes histoires d'amour."
  },
  {
    id: 'intimite-emotionnelle',
    title: "L'intimité émotionnelle",
    excerpt: "Comment se reconnecter quand on a l'impression de devenir des 'colocataires'.",
    category: 'Psychologie',
    readTime: '10 min',
    date: '2024-03-25',
    image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&q=80&w=800',
    lead: "Le danger n'est pas la dispute, c'est l'indifférence.",
    content: "Redécouvrir l'autre passe par des questions de curiosité, comme si on venait de se rencontrer. Ne présumez jamais que vous savez tout de votre partenaire.",
    quote: "L'intimité, c'est la capacité d'être vulnérable sans avoir peur."
  }
];

export const CONNECTION_QUESTIONS = [
  "Quelle est la petite chose que j'ai faite cette semaine qui t'a fait te sentir aimé(e) ?",
  "Si nous pouvions partir en voyage demain, sans limite de budget, où irions-nous ?",
  "Quelle est la qualité que tu admires le plus chez moi aujourd'hui ?",
  "Y a-t-il quelque chose qui te pèse en ce moment et dont je pourrais te soulager ?",
  "Quel est ton souvenir préféré de nous deux au cours du mois dernier ?",
  "Comment puis-je mieux te soutenir dans tes projets personnels cette semaine ?",
  "Quelle est la chose la plus importante que tu as apprise sur notre relation cette année ?"
];
