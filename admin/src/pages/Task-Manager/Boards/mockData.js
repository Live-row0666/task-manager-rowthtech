import { colors } from "@atlaskit/theme";

const ToDo = {
  id: "1",
  name: "TODO",
  url: "http://adventuretime.wikia.com/wiki/Jake",
  avatarUrl: "jakeImg",
  colors: {
    soft: colors.Y50,
    hard: colors.N400A
  }
};

const InProgress = {
  id: "2",
  name: "InProgress",
  url: "http://adventuretime.wikia.com/wiki/BMO",
  avatarUrl: "bmoImg",
  colors: {
    soft: colors.G50,
    hard: colors.N400A
  }
};

const InReview = {
  id: "3",
  name: "InReview",
  url: "http://adventuretime.wikia.com/wiki/Finn",
  avatarUrl: "finnImg",
  colors: {
    soft: colors.B50,
    hard: colors.N400A
  }
};

const Done = {
  id: "4",
  name: "Done",
  url: "http://adventuretime.wikia.com/wiki/Princess_Bubblegum",
  avatarUrl: "princessImg",
  colors: {
    soft: colors.P50,
    hard: colors.N400A
  }
};

export const authors = [ToDo, InProgress, InReview, Done];

export const quotes = [
  {
    id: "1",
    content: "Sometimes life is scary and dark",
    author: ToDo
  },
  {
    id: "2",
    content:
      "Sucking at something is the first step towards being sorta good at something.",
    author: InProgress
  },
  {
    id: "3",
    content: "You got to focus on what's real, man",
    author: Done
  },
  {
    id: "4",
    content: "Is that where creativity comes from? From sad biz?",
    author: ToDo
  },
  {
    id: "5",
    content: "Homies help homies. Always",
    author: InProgress
  },
  {
    id: "6",
    content: "Responsibility demands sacrifice",
    author: Done
  },
  {
    id: "7",
    content: "That's it! The answer was so simple, I was too smart to see it!",
    author: InProgress
  },
  {
    id: "8",
    content:
      "People make mistakes. It's all a part of growing up and you never really stop growing",
    author: InProgress
  },
  {
    id: "9",
    content: "Don't you always call sweatpants 'give up on life pants,' Jake?",
    author: Done
  },
  {
    id: "10",
    content: "I should not have drunk that much tea!",
    author: ToDo
  },
  {
    id: "11",
    content: "Please! I need the real you!",
    author: Done
  },
  {
    id: "12",
    content: "Haven't slept for a solid 83 hours, but, yeah, I'm good.",
    author: InProgress
  }
];

// So we do not have any clashes with our hardcoded ones
let idCount = quotes.length + 1;

export const getQuotes = (count) =>
  Array.from({ length: count }, (v, k) => k).map(() => {
    const random = quotes[Math.floor(Math.random() * quotes.length)];

    const custom = {
      ...random,
      id: `G${idCount++}`
    };

    return custom;
  });

export const getAuthors = (count) =>
  Array.from({ length: count }, (v, k) => k).map(() => {
    const random = authors[Math.floor(Math.random() * authors.length)];

    const custom = {
      ...random,
      id: `author-${idCount++}`
    };

    return custom;
  });

const getByAuthor = (author, items) =>
  items.filter((quote) => quote.author === author);

export const authorQuoteMap: QuoteMap = authors.reduce(
  (previous, author) => ({
    ...previous,
    [author.name]: getByAuthor(author, quotes)
  }),
  {}
);

export const generateQuoteMap = (quoteCount) =>
  authors.reduce(
    (previous, author) => ({
      ...previous,
      [author.name]: getQuotes(quoteCount / authors.length)
    }),
    {}
  );
