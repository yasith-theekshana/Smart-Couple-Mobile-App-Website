export interface StringDict {
  [key: string]: string;
}

export const translations = {
  fr: {
    // Global & Home
    welcome: 'Bienvenue',
    responsibilities: 'Répartition des responsabilités',
    extras: 'Supplémentaires',
    viewAll: 'Voir tout',
    readArticle: 'Lire Article',
    changePhoto: 'Changer la photo',
    myProfile: 'Mon Profil (Prochainement)',
    parameters: 'Paramètres',
    close: 'Fermer',
    langLabel: 'Langue / Language',
    home: 'Home',
    finance: 'Finance',
    shop: 'Shop',
    agenda: 'Agenda',
    tasks: 'Tasks',
    comingSoon: 'Prochainement',
    
    // Tab Headers / Names
    tabCourses: 'Shopping',
    tabFinances: 'Finances',
    tabMenages: 'Ménages',
    tabCalendar: 'Calendrier',

    // Finances View
    finDashboard: 'Dashboard',
    finExpenses: 'Dépenses',
    finDebts: 'Dettes',
    finAnalysis: 'Analyse',
    finBalanceTotal: 'Reste Total',
    finContribution: 'Contribution (Revenu)',
    finSpent: 'Dépensé',
    finRemaining: 'Reste',
    finBudgetTitle: 'Budget Conjoint',
    finEditBudget: 'Modifier budget public',
    finAddExpense: 'Nouvelle dépense',
    finDesc: 'Description',
    finCategory: 'Catégorie',
    finOwner: 'Qui paye ?',
    finAmount: 'Montant',
    finIsRecurrent: 'Paiement récurrent',
    finCancel: 'Annuler',
    finSave: 'Enregistrer',
    finNext: 'Suivant',
    finPrevious: 'Précédent',
    finAddCat: 'Nouvelle catégorie',
    finAddDebt: 'Déclarer dette',
    finSettle: 'Marquer comme réglé',
    finDebtDisclaimer: "Pour un partage plus juste, les dettes s'équilibrent selon les contributions publiques déclarées par chacun de vous.",
    finConfirm: 'Confirmer',

    // Tasks (Ménages) View
    tskDashboard: 'Tableau',
    tskUpcoming: 'À faire',
    tskCompleted: 'Terminé',
    tskWeek: 'Semaine',
    tskNoTasks: 'Aucune tâche prévue',
    tskAddTask: 'Ajouter une tâche',
    tskEditTask: 'Modifier la tâche',
    tskTaskName: 'Nom de la tâche',
    tskAssignedTo: 'Assigné à',
    tskDate: 'Date d\'échéance',
    tskRecurrent: 'Tâche récurrente',
    tskDelete: 'Supprimer',
    tskAddCat: 'Nouveau salon',
    tskDetails: 'Détails de la tâche',

    // Courses View
    crsAddBasket: 'Ajouter au panier',
    crsSearchHold: 'Rechercher un article...',
    crsQuantity: 'Quantité',
    crsPrice: 'Prix estimé',
    crsUnit: 'Unité',
    crsHist: 'Hist.',
    crsCreateList: 'Créer Liste',
    crsSupprList: 'Supprimer',
    crsEmptyBasket: 'Votre panier est vide',
    crsAddPlaceholder: 'Ex: Pommes, Lait...',
    crsSaveList: 'Nommer la liste',
    crsDeleteConfirmTitle: 'Vider la liste ?',
    crsDeleteConfirmDesc: 'Cette action supprimera tous les articles de la liste actuelle.',
    crsDeleteConfirmBtn: 'Supprimer',
    crsKeepBtn: 'Conserver',
    crsNoHist: 'Aucun historique de liste',
    crsRestore: 'Restaurer',

    // Calendar View
    calTitle: 'Calendrier',
    calTotalAct: 'activités',
    calNoEvent: 'Aucun événement prévu',
    calCloseSheet: 'Fermer',
    calAddEvt: 'Nouvel événement',
    calEvtTitle: 'Titre de l\'événement',
    calEvtDate: 'Date',
    calConfirmDeleteTitle: 'Supprimer l\'événement ?',
    calConfirmDeleteDesc: 'Cette action est irréversible.'
  },
  en: {
    // Global & Home
    welcome: 'Welcome',
    responsibilities: 'Responsibility distribution',
    extras: 'Additional items',
    viewAll: 'View all',
    readArticle: 'Read Article',
    changePhoto: 'Change Photo',
    myProfile: 'My Profile (Coming soon)',
    parameters: 'Settings',
    close: 'Close',
    langLabel: 'Language / Langue',
    home: 'Home',
    finance: 'Finance',
    shop: 'Shop',
    agenda: 'Agenda',
    tasks: 'Tasks',
    comingSoon: 'Coming Soon',

    // Tab Headers / Names
    tabCourses: 'Shopping',
    tabFinances: 'Finances',
    tabMenages: 'Tasks',
    tabCalendar: 'Calendar',

    // Finances View
    finDashboard: 'Dashboard',
    finExpenses: 'Expenses',
    finDebts: 'Debts',
    finAnalysis: 'Analysis',
    finBalanceTotal: 'Remaining budget',
    finContribution: 'Contribution (Income)',
    finSpent: 'Spent',
    finRemaining: 'Remaining',
    finBudgetTitle: 'Shared Budget',
    finEditBudget: 'Edit Shared Budget',
    finAddExpense: 'New Expense',
    finDesc: 'Description',
    finCategory: 'Category',
    finOwner: 'Who paid?',
    finAmount: 'Amount',
    finIsRecurrent: 'Recurring Payment',
    finCancel: 'Cancel',
    finSave: 'Save',
    finNext: 'Next',
    finPrevious: 'Back',
    finAddCat: 'New Category',
    finAddDebt: 'Add Debt',
    finSettle: 'Settle Debt',
    finDebtDisclaimer: 'For a fairer split, debts are balanced relative to the shared contributions declared by each of you.',
    finConfirm: 'Confirm',

    // Tasks (Ménages) View
    tskDashboard: 'Dashboard',
    tskUpcoming: 'To do',
    tskCompleted: 'Completed',
    tskWeek: 'Week',
    tskNoTasks: 'No tasks scheduled',
    tskAddTask: 'Add Task',
    tskEditTask: 'Edit Task',
    tskTaskName: 'Task Name',
    tskAssignedTo: 'Assigned To',
    tskDate: 'Due Date',
    tskRecurrent: 'Recurring task',
    tskDelete: 'Delete',
    tskAddCat: 'New Category',
    tskDetails: 'Task details',

    // Courses View
    crsAddBasket: 'Add to Cart',
    crsSearchHold: 'Search item...',
    crsQuantity: 'Quantity',
    crsPrice: 'Est. Price',
    crsUnit: 'Unit',
    crsHist: 'History',
    crsCreateList: 'Create List',
    crsSupprList: 'Delete',
    crsEmptyBasket: 'Your cart is empty',
    crsAddPlaceholder: 'E.g: Apples, Milk...',
    crsSaveList: 'Name List',
    crsDeleteConfirmTitle: 'Empty List?',
    crsDeleteConfirmDesc: 'This action will delete all items from the current list.',
    crsDeleteConfirmBtn: 'Delete',
    crsKeepBtn: 'Keep',
    crsNoHist: 'No list history',
    crsRestore: 'Restore',

    // Calendar View
    calTitle: 'Calendar',
    calTotalAct: 'activities',
    calNoEvent: 'No scheduled activities',
    calCloseSheet: 'Close',
    calAddEvt: 'New Event',
    calEvtTitle: 'Event Title',
    calEvtDate: 'Date',
    calConfirmDeleteTitle: 'Delete Event?',
    calConfirmDeleteDesc: 'This action cannot be undone.'
  }
};

export const translateCategory = (cat: string, lang?: 'fr' | 'en' | string): string => {
  if (lang === 'fr') return cat;
  const lower = cat.toLowerCase();
  if (lower === 'cuisine' || lower === 'kitchen') return 'Kitchen';
  if (lower === 'salon' || lower === 'living room') return 'Living Room';
  if (lower === 'chambre' || lower === 'bedroom') return 'Bedroom';
  if (lower === 'salle de bain' || lower === 'salle-de-bain' || lower === 'bathroom') return 'Bathroom';
  if (lower === 'jardin' || lower === 'garden') return 'Garden';
  if (lower === 'vêtements' || lower === 'vetements' || lower === 'laundry') return 'Laundry';
  if (lower === 'autres' || lower === 'others') return 'Others';
  if (lower === 'loyer' || lower === 'rent') return 'Rent';
  if (lower === 'courses' || lower === 'groceries') return 'Groceries';
  if (lower === 'abos' || lower === 'subscriptions') return 'Subscriptions';
  if (lower === 'essence' || lower === 'fuel') return 'Fuel';
  if (lower === 'loisirs' || lower === 'leisure' || lower === 'entertainment') return 'Leisure';
  if (lower === 'autre' || lower === 'other') return 'Other';
  return cat;
};

export const translateTaskName = (name: string, lang?: 'fr' | 'en' | string): string => {
  if (lang === 'fr') return name;
  const dict: Record<string, string> = {
    'Préparer le petit-déjeuner': 'Prepare Breakfast',
    'Préparer le dîner': 'Prepare Dinner',
    'Lessive': 'Laundry',
    'Repasser les vêtements': 'Iron Clothes',
    'Tondre la pelouse': 'Mow the Lawn',
    'Nettoyer la salle de bain': 'Clean the Bathroom',
    'Faire les courses': 'Go Grocery Shopping'
  };
  return dict[name] || name;
};

export const translateShoppingItemName = (name: string, lang?: 'fr' | 'en' | string): string => {
  if (lang === 'fr') return name;
  const dict: Record<string, string> = {
    'Pain': 'Bread',
    'Lait': 'Milk',
    'Lessive': 'Detergent',
    'Pommes': 'Apples',
    'Lait demi-écrémé': 'Semi-skimmed Milk',
    'Pain de campagne': 'Country Bread',
    'Pâtisserie fraise': 'Strawberry Pastry',
    'Ananas entier': 'Whole Pineapple',
    'Café Arabica': 'Arabica Coffee',
    'Beurre doux': 'Unsalted Butter',
    'Pommes royales': 'Royal Apples'
  };
  return dict[name] || name;
};

export const translateExpenseDesc = (desc: string, lang?: 'fr' | 'en' | string): string => {
  if (lang === 'fr') return desc;
  const dict: Record<string, string> = {
    'Loyer Avril': 'April Rent',
    'Courses Bio': 'Organic Groceries',
    'Netflix': 'Netflix',
    'Plein Essence': 'Gasoline Refuel'
  };
  return dict[desc] || desc;
};

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  content: string;
  date: string;
  lead?: string;
  quote?: string;
}

export const translateArticle = (art: Article, lang?: 'fr' | 'en' | string): Article => {
  if (lang === 'fr') return art;
  
  const translationsMap: Record<string, Partial<Article>> = {
    'ecoute-active': {
      title: "The Art of Active Listening",
      excerpt: "Transform your disagreements into moments of connection with compassionate listening techniques.",
      category: "Communication",
      lead: "Active listening is not just being quiet while the other person speaks. It is a full commitment to understanding.",
      content: "The first obstacle to good communication is distraction. Put down your phone, turn off the TV, and turn your body towards your partner. Eye contact shows that what they say has value.",
      quote: "Listening is perhaps the greatest gift we can give to another human being."
    },
    'langages-amour': {
      title: "The 5 Love Languages",
      excerpt: "Understanding how your partner expresses and receives affection is the key to lasting harmony.",
      category: "Psychology",
      lead: "Not everyone expresses love in the same way.",
      content: "Gary Chapman identified 5 pillars: words of affirmation, quality time, gifts, acts of service, and physical touch.",
      quote: "Love is a choice we make every single day."
    },
    'pardon-quotidien': {
      title: "Forgiveness in Daily Life",
      excerpt: "How to let go of minor frustrations to prevent them from building walls between you.",
      category: "Psychology",
      lead: "Forgiveness is not weakness; it is the oil that keeps the couple's gears running smoothly.",
      content: "Forgiving does not mean forgetting or condoning a mistake, but deciding that the relationship is more important than the offense. This requires a daily practice of 'small' forgivenesses.",
      quote: "The first to ask for forgiveness is the bravest. The first to forgive is the strongest."
    },
    'vision-board': {
      title: "Building a Shared Vision",
      excerpt: "Why and how to create a 'Vision Board' for your life projects together.",
      category: "Daily Life",
      lead: "Looking in the same direction is more powerful than just looking at each other.",
      content: "Regard dans la même direction est plus puissant que de simplement se regarder l'un l'autre.",
      quote: "The future belongs to those who believe in the beauty of their shared dreams."
    }
  };

  const translatedFields = translationsMap[art.id];
  if (translatedFields) {
    return {
      ...art,
      ...translatedFields,
    };
  }

  // Fallback category translation
  let translatedCategory = art.category;
  if (art.category === 'Psychologie') translatedCategory = 'Psychology';
  if (art.category === 'Vie Quotidienne') translatedCategory = 'Daily Life';
  if (art.category === 'Finances') translatedCategory = 'Finances';

  return {
    ...art,
    category: translatedCategory
  };
};


