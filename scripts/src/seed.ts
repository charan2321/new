import { db } from "@workspace/db";
import { booksTable, usersTable, activityTable } from "@workspace/db";

const sampleBooks = [
  {
    title: "Spanish for Beginners: Complete Immersion",
    author: "Elena Vásquez",
    description: "A comprehensive introduction to Spanish covering vocabulary, grammar, and conversational skills through real-world scenarios. Perfect for absolute beginners who want to achieve conversational fluency.",
    coverUrl: null,
    price: "29.99",
    category: "Spanish",
    language: "Spanish",
    level: "beginner",
    isFeatured: true,
    isBestseller: true,
    totalPages: 320,
    rating: "4.8",
    reviewCount: 1243,
    content: `# Chapter 1: Hola, Mundo!\n\nWelcome to your Spanish learning journey. In this first chapter, we will cover basic greetings and introductions.\n\n## Basic Greetings\n\n- Hola = Hello\n- Buenos días = Good morning\n- Buenas tardes = Good afternoon\n- Buenas noches = Good evening/night\n- ¿Cómo estás? = How are you?\n- Bien, gracias = Fine, thank you\n- Me llamo... = My name is...\n\n## Practice Dialogue\n\nA: ¡Hola! ¿Cómo te llamas?\nB: Me llamo María. ¿Y tú?\nA: Me llamo Carlos. Mucho gusto.\nB: Igualmente.\n\n## Chapter 2: Numbers and Colors\n\nNumbers are fundamental to daily communication...\n\nUno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez.\n\nColors: rojo (red), azul (blue), verde (green), amarillo (yellow), negro (black), blanco (white).\n\n## Chapter 3: The Family\n\nLa familia es muy importante en la cultura española...\n\nMadre, padre, hermano, hermana, abuelo, abuela, tío, tía.\n\n[Content continues for 320 pages...]`,
  },
  {
    title: "Japanese in 90 Days: Hiragana to Conversation",
    author: "Kenji Nakamura",
    description: "Master Japanese from scratch with a proven 90-day system. Learn Hiragana, Katakana, 500 essential kanji, and become conversational through structured daily lessons and cultural insights.",
    coverUrl: null,
    price: "39.99",
    category: "Japanese",
    language: "Japanese",
    level: "beginner",
    isFeatured: true,
    isBestseller: true,
    totalPages: 450,
    rating: "4.9",
    reviewCount: 892,
    content: `# Day 1: The Japanese Writing System\n\nJapanese uses three writing systems: Hiragana, Katakana, and Kanji.\n\n## Hiragana\n\nHiragana is the foundational phonetic alphabet of Japanese. It has 46 base characters.\n\nあ (a) い (i) う (u) え (e) お (o)\nか (ka) き (ki) く (ku) け (ke) こ (ko)\nさ (sa) し (shi) す (su) せ (se) そ (so)\n\n## Day 2: Katakana\n\nKatakana is used primarily for foreign words and loanwords.\n\nア (a) イ (i) ウ (u) エ (e) オ (o)\n\n## Day 3: Basic Greetings\n\nおはようございます (Ohayou gozaimasu) - Good morning\nこんにちは (Konnichiwa) - Hello/Good afternoon\nこんばんは (Konbanwa) - Good evening\nありがとう (Arigatou) - Thank you\n\n[Content continues for 450 pages with systematic daily lessons...]`,
  },
  {
    title: "Mandarin Mastery: HSK 1-3 Complete Guide",
    author: "Li Wei Chen",
    description: "A structured path through Mandarin Chinese covering all HSK 1-3 vocabulary and grammar. Includes tone practice, character writing, and authentic conversation scenarios for rapid progress.",
    coverUrl: null,
    price: "44.99",
    category: "Mandarin",
    language: "Mandarin",
    level: "intermediate",
    isFeatured: true,
    isBestseller: false,
    totalPages: 520,
    rating: "4.7",
    reviewCount: 567,
    content: `# Unit 1: Tones and Pronunciation\n\nMandarin Chinese is a tonal language with four tones plus a neutral tone.\n\n## The Four Tones\n\n1st Tone (ā): High and level - like singing a note\n2nd Tone (á): Rising - like asking a question\n3rd Tone (ǎ): Falling then rising - like a bounce\n4th Tone (à): Sharply falling - like a command\n\n## Basic Characters\n\n你好 (Nǐ hǎo) - Hello\n谢谢 (Xièxie) - Thank you\n再见 (Zàijiàn) - Goodbye\n\n## Numbers in Chinese\n\n一 (yī) - 1\n二 (èr) - 2\n三 (sān) - 3\n四 (sì) - 4\n五 (wǔ) - 5\n\n[Comprehensive content through HSK Level 3...]`,
  },
  {
    title: "French Fluency: The Natural Approach",
    author: "Sophie Beaumont",
    description: "Learn French the natural way — through stories, songs, and immersive scenarios. This book uses the comprehensible input method proven to build genuine fluency faster than traditional drilling.",
    coverUrl: null,
    price: "34.99",
    category: "French",
    language: "French",
    level: "beginner",
    isFeatured: false,
    isBestseller: true,
    totalPages: 380,
    rating: "4.6",
    reviewCount: 734,
    content: `# Chapitre 1: Bonjour la France!\n\nBienvenue dans votre voyage linguistique en français.\n\n## Les Salutations\n\nBonjour - Good morning/Hello\nBonsoir - Good evening\nSalut - Hi (informal)\nComment allez-vous? - How are you? (formal)\nComment vas-tu? - How are you? (informal)\nJe m'appelle... - My name is...\n\n## Les Chiffres\n\nun, deux, trois, quatre, cinq, six, sept, huit, neuf, dix\n\n## La Grammaire Fondamentale\n\nFrench nouns have gender - masculine and feminine.\nLe (masculine) / La (feminine) / Les (plural)\n\n[Natural learning content through conversational French...]`,
  },
  {
    title: "Arabic Script and Conversation Fundamentals",
    author: "Omar Al-Rashid",
    description: "Demystify Arabic script and build a solid conversational foundation. Covers Modern Standard Arabic with focus on the Arabic alphabet, core vocabulary, and practical phrases used across the Arab world.",
    coverUrl: null,
    price: "37.99",
    category: "Arabic",
    language: "Arabic",
    level: "beginner",
    isFeatured: false,
    isBestseller: false,
    totalPages: 290,
    rating: "4.5",
    reviewCount: 312,
    content: `# Lesson 1: The Arabic Alphabet\n\nArabic is written right to left and has 28 letters.\n\n## The Letters\n\nAlef (ا), Ba (ب), Ta (ت), Tha (ث), Jim (ج)...\n\nEach letter has four forms: isolated, initial, medial, and final.\n\n## Basic Vocabulary\n\nمرحبا (Marhaba) - Hello\nشكرا (Shukran) - Thank you\nنعم (Na'am) - Yes\nلا (La) - No\n\n## Numbers in Arabic\n\nواحد، اثنان، ثلاثة، أربعة، خمسة\n\n[Comprehensive Arabic learning content...]`,
  },
  {
    title: "German Grammar Decoded: A Modern Reference",
    author: "Hans Weber",
    description: "The definitive grammar reference for serious German learners. Clear explanations, abundant examples, and practical exercises covering all aspects of German grammar from articles to subordinate clauses.",
    coverUrl: null,
    price: "32.99",
    category: "German",
    language: "German",
    level: "intermediate",
    isFeatured: false,
    isBestseller: true,
    totalPages: 410,
    rating: "4.7",
    reviewCount: 445,
    content: `# Kapitel 1: Der, Die, Das — The German Articles\n\nGerman has three grammatical genders: masculine (der), feminine (die), and neuter (das).\n\n## Nominative Case\n\nder Mann (the man)\ndie Frau (the woman)\ndas Kind (the child)\n\n## Accusative Case\n\nIch sehe den Mann. (I see the man.)\nIch sehe die Frau. (I see the woman.)\n\n## Basic Verbs\n\nsein (to be): ich bin, du bist, er/sie/es ist\nhaben (to have): ich habe, du hast, er/sie/es hat\n\n[Comprehensive German grammar reference...]`,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed books
  const existingBooks = await db.select().from(booksTable);
  if (existingBooks.length === 0) {
    await db.insert(booksTable).values(sampleBooks);
    console.log(`✅ Inserted ${sampleBooks.length} books`);
  } else {
    console.log(`ℹ️  Books already seeded (${existingBooks.length} books)`);
  }

  // Seed activity log entries
  const existingActivity = await db.select().from(activityTable);
  if (existingActivity.length === 0) {
    await db.insert(activityTable).values([
      { type: "signup", description: "New user registered", createdAt: new Date(Date.now() - 86400000 * 2) },
      { type: "signup", description: "New user registered", createdAt: new Date(Date.now() - 86400000) },
      { type: "purchase", description: 'User purchased "Spanish for Beginners"', amount: "29.99", createdAt: new Date(Date.now() - 3600000 * 5) },
      { type: "purchase", description: 'User purchased "Japanese in 90 Days"', amount: "39.99", createdAt: new Date(Date.now() - 3600000 * 2) },
    ]);
    console.log("✅ Inserted sample activity");
  }

  console.log("🎉 Seed complete");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
