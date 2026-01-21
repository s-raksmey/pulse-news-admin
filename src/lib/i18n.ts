export type Locale = "en" | "km";

type TranslationSet = {
  nav: Record<"home" | "world" | "tech" | "business" | "politics" | "sports" | "culture", string>;
  header: {
    searchLabel: string;
    cmsLabel: string;
  };
  mobile: {
    cmsDashboard: string;
    stayInformed: string;
  };
  footer: {
    brand: string;
    builtWith: string;
  };
  breaking: {
    prefix: string;
  };
  home: {
    featuredTitle: string;
    featuredSubtitle: string;
    moreStories: string;
    trendingTopicsLabel: string;
    editorsPicksTitle: string;
    editorsPicksSubtitle: string;
    latestNewsTitle: string;
    latestNewsSubtitle: string;
  };
  topics: {
    breakingNews: string;
    technology: string;
    politics: string;
    climateChange: string;
    economy: string;
    sports: string;
  };
  article: {
    readMore: string;
    noImage: string;
    minLabel: string;
    shareLabel: string;
    unknownDate: string;
  };
  search: {
    placeholder: string;
    resultsTitle: string;
    noResults: string;
    recentTitle: string;
    trendingTitle: string;
  };
  sidebar: {
    categoriesTitle: string;
    followUs: string;
    advertisement: string;
    adSpace: string;
    viewAllTrending: string;
  };
  newsletter: {
    title: string;
    description: string;
    emailPlaceholder: string;
    subscribing: string;
    subscribed: string;
    subscribeButton: string;
    invalidEmail: string;
    success: string;
    error: string;
    privacy: string;
  };
  trendingWidget: {
    title: string;
  };
};

export const TRANSLATIONS: Record<Locale, TranslationSet> = {
  en: {
    nav: {
      home: "Home",
      world: "World",
      tech: "Tech",
      business: "Business",
      politics: "Politics",
      sports: "Sports",
      culture: "Culture",
    },
    header: {
      searchLabel: "Search",
      cmsLabel: "CMS",
    },
    mobile: {
      cmsDashboard: "CMS Dashboard",
      stayInformed: "Stay informed with the latest news",
    },
    footer: {
      brand: "Pulse News",
      builtWith: "Built with Next.js, GraphQL, PostgreSQL.",
    },
    breaking: {
      prefix: "Breaking:",
    },
    home: {
      featuredTitle: "Featured Stories",
      featuredSubtitle: "The most important news and stories of the day",
      moreStories: "More stories coming soon",
      trendingTopicsLabel: "Trending Topics:",
      editorsPicksTitle: "Editor's Picks",
      editorsPicksSubtitle: "Carefully curated stories from our editorial team",
      latestNewsTitle: "Latest News",
      latestNewsSubtitle: "Stay up to date with the most recent developments",
    },
    topics: {
      breakingNews: "Breaking News",
      technology: "Technology",
      politics: "Politics",
      climateChange: "Climate Change",
      economy: "Economy",
      sports: "Sports",
    },
    article: {
      readMore: "Read more",
      noImage: "No image",
      minLabel: "min",
      shareLabel: "Share article",
      unknownDate: "Unknown date",
    },
    search: {
      placeholder: "Search articles, categories, authors...",
      resultsTitle: "Search Results",
      noResults: 'No results found for "{query}"',
      recentTitle: "Recent Searches",
      trendingTitle: "Trending Searches",
    },
    sidebar: {
      categoriesTitle: "Categories",
      followUs: "Follow Us",
      advertisement: "Advertisement",
      adSpace: "Ad Space",
      viewAllTrending: "View All Trending Stories",
    },
    newsletter: {
      title: "Stay Informed",
      description: "Get the latest news and updates delivered to your inbox.",
      emailPlaceholder: "Enter your email",
      subscribing: "Subscribing...",
      subscribed: "Subscribed!",
      subscribeButton: "Subscribe to Newsletter",
      invalidEmail: "Please enter a valid email address",
      success: "Thank you for subscribing!",
      error: "Something went wrong. Please try again.",
      privacy: "We respect your privacy. Unsubscribe at any time.",
    },
    trendingWidget: {
      title: "Trending Now",
    },
  },
  km: {
    nav: {
      home: "ទំព័រដើម",
      world: "ពិភពលោក",
      tech: "បច្ចេកវិទ្យា",
      business: "អាជីវកម្ម",
      politics: "នយោបាយ",
      sports: "កីឡា",
      culture: "វប្បធម៌",
    },
    header: {
      searchLabel: "ស្វែងរក",
      cmsLabel: "CMS",
    },
    mobile: {
      cmsDashboard: "ផ្ទាំងគ្រប់គ្រង CMS",
      stayInformed: "តាមដានព័ត៌មានថ្មីៗបំផុត",
    },
    footer: {
      brand: "Pulse News",
      builtWith: "បង្កើតដោយ Next.js, GraphQL, PostgreSQL។",
    },
    breaking: {
      prefix: "ព័ត៌មានបន្ទាន់៖",
    },
    home: {
      featuredTitle: "រឿងរ៉ាវពិសេស",
      featuredSubtitle: "ព័ត៌មាន និងរឿងរ៉ាវសំខាន់ៗប្រចាំថ្ងៃ",
      moreStories: "រឿងរ៉ាវបន្ថែមកំពុងមកដល់",
      trendingTopicsLabel: "ប្រធានបទពេញនិយម៖",
      editorsPicksTitle: "ជម្រើសក្រុមកែសម្រួល",
      editorsPicksSubtitle: "រឿងរ៉ាវដែលបានជ្រើសរើសយ៉ាងយកចិត្តទុកដាក់ពីក្រុមកែសម្រួល",
      latestNewsTitle: "ព័ត៌មានថ្មីៗ",
      latestNewsSubtitle: "តាមដានការអភិវឌ្ឍថ្មីៗបំផុត",
    },
    topics: {
      breakingNews: "ព័ត៌មានបន្ទាន់",
      technology: "បច្ចេកវិទ្យា",
      politics: "នយោបាយ",
      climateChange: "ការផ្លាស់ប្តូរអាកាសធាតុ",
      economy: "សេដ្ឋកិច្ច",
      sports: "កីឡា",
    },
    article: {
      readMore: "អានបន្ថែម",
      noImage: "គ្មានរូបភាព",
      minLabel: "នាទី",
      shareLabel: "ចែករំលែកអត្ថបទ",
      unknownDate: "មិនស្គាល់កាលបរិច្ឆេទ",
    },
    search: {
      placeholder: "ស្វែងរកអត្ថបទ ប្រភេទ អ្នកនិពន្ធ...",
      resultsTitle: "លទ្ធផលស្វែងរក",
      noResults: 'រកមិនឃើញលទ្ធផលសម្រាប់ "{query}"',
      recentTitle: "ការស្វែងរកថ្មីៗ",
      trendingTitle: "ការស្វែងរកពេញនិយម",
    },
    sidebar: {
      categoriesTitle: "ប្រភេទ",
      followUs: "តាមដានពួកយើង",
      advertisement: "ពាណិជ្ជកម្ម",
      adSpace: "កន្លែងផ្សព្វផ្សាយ",
      viewAllTrending: "មើលរឿងរ៉ាវពេញនិយមទាំងអស់",
    },
    newsletter: {
      title: "តាមដានព័ត៌មាន",
      description: "ទទួលបានព័ត៌មានថ្មីៗ និងការអាប់ដេតផ្ញើទៅអ៊ីមែលរបស់អ្នក។",
      emailPlaceholder: "បញ្ចូលអ៊ីមែលរបស់អ្នក",
      subscribing: "កំពុងជាវ...",
      subscribed: "បានជាវរួច!",
      subscribeButton: "ជាវព័ត៌មានថ្មីៗ",
      invalidEmail: "សូមបញ្ចូលអ៊ីមែលត្រឹមត្រូវ",
      success: "សូមអរគុណសម្រាប់ការជាវ!",
      error: "មានបញ្ហាមួយ។ សូមព្យាយាមម្តងទៀត។",
      privacy: "យើងគោរពឯកជនភាពរបស់អ្នក។ អាចឈប់ជាវបានគ្រប់ពេល។",
    },
    trendingWidget: {
      title: "កំពុងពេញនិយម",
    },
  },
};

export const DEFAULT_LOCALE: Locale = "en";

export function getTranslations(locale: Locale) {
  return TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
}
