export interface IslamicQuote {
  id: string;
  arabic: string;
  translation: string;
  source: string;
  topic: string;
}

export const ISLAMIC_QUOTES: IslamicQuote[] = [
  {
    id: 'q1',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Unquestionably, by the remembrance of Allah hearts are assured.',
    source: 'Surah Ar-Ra’d (13:28)',
    topic: 'Inner Peace',
  },
  {
    id: 'q2',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
    source: 'Surah Ash-Sharh (94:5-6)',
    topic: 'Hope & Ease',
  },
  {
    id: 'q3',
    arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    translation: 'And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.',
    source: 'Surah Al-Baqarah (2:186)',
    topic: 'Closeness to Allah',
  },
  {
    id: 'q4',
    arabic: 'وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا',
    translation: 'And be patient for the decision of your Lord, for indeed, you are in Our eyes [care].',
    source: 'Surah At-Tur (52:48)',
    topic: 'Patience & Care',
  },
  {
    id: 'q5',
    arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    translation: 'And say, "My Lord, increase me in knowledge."',
    source: 'Surah Ta-Ha (20:114)',
    topic: 'Seeking Knowledge',
  },
  {
    id: 'q6',
    arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    translation: 'Indeed, Allah is with the patient.',
    source: 'Surah Al-Baqarah (2:153)',
    topic: 'Patience',
  },
  {
    id: 'q7',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best among you are those who learn the Quran and teach it to others.',
    source: 'Sahih al-Bukhari 5027',
    topic: 'Quran',
  },
  {
    id: 'q8',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    translation: 'Whoever treads a path seeking knowledge, Allah will make easy for him the path to Paradise.',
    source: 'Sahih Muslim 2699',
    topic: 'Knowledge & Guidance',
  },
];

export function getRandomQuote(): IslamicQuote {
  const index = Math.floor(Math.random() * ISLAMIC_QUOTES.length);
  return ISLAMIC_QUOTES[index];
}
