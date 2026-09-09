import { LearningTopic } from '../types';

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'pillars',
    category: 'pillars',
    title: 'The Five Pillars of Islam',
    arabicTitle: 'أركان الإسلام الخمسة',
    subtitle: 'The foundational acts of worship binding every Muslim',
    readTime: '6 min',
    content: [
      {
        heading: '1. Shahadah (Declaration of Faith)',
        paragraphs: [
          'The first and supreme pillar of Islam is the testimony of faith: "Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan rasulullah" (I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is the Messenger of Allah).',
          'Sincere belief in Tawhid (the pure oneness of God) and acceptance of Prophet Muhammad ﷺ as the final messenger is the gateway into the fold of Islam.'
        ],
        arabicQuote: {
          arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
          translation: 'I bear witness that there is no god but Allah, and Muhammad is His servant and messenger.',
          reference: 'Hadith Jibril (Sahih Muslim 8)',
        }
      },
      {
        heading: '2. Salah (The Five Daily Prayers)',
        paragraphs: [
          'Salah is the direct spiritual lifeline between the servant and the Creator performed five times daily: Fajr (Dawn), Dhuhr (Midday), Asr (Afternoon), Maghrib (Sunset), and Isha (Night).',
          'Salah purifies the heart, instills daily discipline, washes away transgressions, and halts one from indecent deeds.'
        ]
      },
      {
        heading: '3. Zakat (Obligatory Almsgiving)',
        paragraphs: [
          'Zakat is an annual obligatory charitable contribution of 2.5% on qualifying surplus wealth that has been held for one full lunar year above the threshold of Nisab.',
          'It purifies wealth, mitigates economic disparity, and fosters a compassionate society centered on brotherhood.'
        ]
      },
      {
        heading: '4. Sawm (Fasting the Month of Ramadan)',
        paragraphs: [
          'During the 9th lunar month of Ramadan, healthy adult Muslims abstain from all food, drink, and intimate relations from the break of dawn (Fajr) until sunset (Maghrib).',
          'Fasting cultivates Taqwa (God-consciousness), self-restraint, empathy for the impoverished, and deep spiritual reinvigoration.'
        ]
      },
      {
        heading: '5. Hajj (The Pilgrimage to Makkah)',
        paragraphs: [
          'Hajj is the sacred pilgrimage to the Holy City of Makkah, required once in a lifetime for every Muslim who possesses the physical and financial capability.',
          'Pilgrims unite in humble white garments (Ihram), circumambulating the Kaaba and standing at the plain of Mount Arafat, symbolizing the ultimate equality of all human beings before God.'
        ]
      }
    ]
  },
  {
    id: 'salah-guide',
    category: 'salah',
    title: 'Step-by-Step Guide to Salah',
    arabicTitle: 'صفة الصلاة',
    subtitle: 'Detailed bodily actions and authentic invocations of prayer',
    readTime: '8 min',
    content: [
      {
        heading: 'Preparation: Purification (Wudu) & Niyyah',
        paragraphs: [
          'Ensure cleanliness of body, clothing, and place of prayer. Perform ritual ablution (Wudu). Face the Qibla (direction of the Holy Kaaba) and form a sincere intention (Niyyah) in your heart for the specific prayer.'
        ]
      },
      {
        heading: 'Takbirat al-Ihram & Qiyam (Standing)',
        paragraphs: [
          'Raise both hands up to ear level (or shoulders) with open palms facing forward and recite: "Allahu Akbar" (Allah is the Greatest). This marks entering the sacred state of prayer.',
          'Place the right hand over the left hand upon the chest or above the navel. Look downwards toward the spot of your prostration.'
        ],
        arabicQuote: {
          arabic: 'اللَّهُ أَكْبَرُ',
          translation: 'Allah is the Greatest.',
          reference: 'Opening of Salah',
        }
      },
      {
        heading: 'Recitation of Surah Al-Fatihah',
        paragraphs: [
          'Recite the opening supplication (Du\'a al-Istiftah), followed by seeking refuge from Satan, and recite Surah Al-Fatihah. Surah Al-Fatihah is an indispensable pillar in every unit (Rak\'ah) of prayer.',
          'In the first two Rak\'ahs, recite any additional short Surah or verses (e.g. Surah Al-Ikhlas).'
        ]
      },
      {
        heading: 'Ruku\' (Bowing)',
        paragraphs: [
          'Say "Allahu Akbar" and bow with a flat back, placing your hands firmly on your knees with fingers spread. Remain steady and recite three times: "Subhana Rabbiyal-Azeem" (Glory be to my Lord, the Magnificent).',
          'Rise up straight and say: "Sami\'allahu liman hamidah" (Allah hears whoever praises Him), followed by "Rabbana walakal-hamd" (Our Lord, to You belongs all praise).'
        ],
        arabicQuote: {
          arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
          translation: 'Glory be to my Lord, the Magnificent.',
          reference: 'Invocations of Ruku (Sahih Muslim 772)',
        }
      },
      {
        heading: 'Sujud (Prostration)',
        paragraphs: [
          'Say "Allahu Akbar" and prostrate onto seven limbs: the forehead and nose together, both palms, both knees, and the toes of both feet touching the ground facing the Qibla.',
          'This is the closest a servant ever comes to Allah. Recite three times: "Subhana Rabbiyal-A\'la" (Glory be to my Lord, the Most High).'
        ],
        arabicQuote: {
          arabic: 'سُبْحَانَ رَبِّيَ الأَعْلَى',
          translation: 'Glory be to my Lord, the Most High.',
          reference: 'Invocations of Sujud (Sahih Muslim 772)',
        }
      },
      {
        heading: 'Tashahhud & Taslim (Concluding Salutations)',
        paragraphs: [
          'In the sitting position, recite the Tashahhud (At-Tahiyyatu lillahi...), followed by the Salawat (Allahumma salli \'ala Muhammad...), and personal Duas.',
          'Conclude the prayer by turning your face to the right saying "As-salamu \'alaykum wa rahmatullah", and then turning to the left repeating the same.'
        ]
      }
    ]
  },
  {
    id: 'prophets',
    category: 'prophets',
    title: 'Stories of the Noble Prophets',
    arabicTitle: 'قصص الأنبياء',
    subtitle: 'Lessons of faith, endurance, and devotion from the chosen messengers',
    readTime: '10 min',
    content: [
      {
        heading: 'Prophet Ibrahim (Abraham) - The Friend of God (Khalilullah)',
        paragraphs: [
          'Prophet Ibrahim stood fearlessly against polytheism and idol worship in ancient Babylon. Through deep reflection upon the stars, moon, and sun, he proved that celestial objects set and perish, whereas the Creator is eternal.',
          'Along with his son Ismail (Ishmael), he raised the sacred foundations of the Kaaba in Makkah, instituting the eternal rites of Hajj and exemplifying supreme surrender to the Divine Will.'
        ],
        arabicQuote: {
          arabic: 'وَإِذْ يَرْفَعُ إِبْرَاهِيمُ الْقَوَاعِدَ مِنَ الْبَيْتِ وَإِسْمَاعِيلُ رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ',
          translation: 'And when Abraham was raising the foundations of the House and Ishmael, [saying], "Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing."',
          reference: 'Surah Al-Baqarah (2:127)',
        }
      },
      {
        heading: 'Prophet Musa (Moses) - Kalimullah',
        paragraphs: [
          'Prophet Musa was born in a perilous time under Pharaoh\'s tyrannical decree and was saved by Allah when cast in a basket down the Nile. At Mount Sinai, Allah spoke directly to Musa and commanded him to liberate the Children of Israel.',
          'Armed with divine signs and unyielding courage, Musa confronted Pharaoh, parted the Red Sea by Allah\'s command, and guided his people through the wilderness with patient forbearance.'
        ]
      },
      {
        heading: 'Prophet Isa (Jesus) - Ruhullah & Word of God',
        paragraphs: [
          'Born miraculously to the virgin Mary (Maryam, peace be upon her) without a father, Prophet Isa spoke as an infant in the cradle defending his mother\'s honor.',
          'By the permission of Allah, he healed the blind, cured the leper, and raised the dead. Islam honors him as one of the greatest messengers and prophets of God.'
        ]
      },
      {
        heading: 'Prophet Muhammad ﷺ - The Seal of the Prophets (Khatam an-Nabiyyin)',
        paragraphs: [
          'Born in Makkah in 570 CE, Muhammad ﷺ was known even before prophethood as Al-Amin (The Trustworthy) and As-Sadiq (The Truthful). At age 40, in the Cave of Hira, the Angel Jibril descended with the first revelation of the Holy Quran: "Iqra!" (Read!).',
          'Over 23 years, with unmatched humility, compassion, and perseverance, he transformed Arabia from tribal ignorance into a beacon of justice, brotherhood, and devotion to One God.'
        ],
        arabicQuote: {
          arabic: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ',
          translation: 'And We have not sent you, [O Muhammad], except as a mercy to the worlds.',
          reference: 'Surah Al-Anbiya (21:107)',
        }
      }
    ]
  },
  {
    id: 'ramadan-rules',
    category: 'ramadan',
    title: 'Understanding Ramadan & Fasting',
    arabicTitle: 'فقه الصيام ورمضان',
    subtitle: 'Spiritual virtues, rules, and etiquettes of the Holy Month',
    readTime: '7 min',
    content: [
      {
        heading: 'The Spiritual Purpose of Fasting',
        paragraphs: [
          'Fasting in Ramadan is far more than physical hunger and thirst; it is a spiritual recalibration. The primary purpose stated in the Quran (2:183) is to attain Taqwa—a vigilant awareness of God.',
          'The Prophet ﷺ said: "Whoever does not give up false speech and evil actions, Allah is not in need of his leaving his food and drink" (Bukhari).'
        ]
      },
      {
        heading: 'Suhoor (The Pre-Dawn Meal)',
        paragraphs: [
          'Suhoor is the blessed meal eaten before the break of dawn. The Prophet ﷺ encouraged: "Eat Suhoor, for indeed there is blessing (barakah) in Suhoor" (Bukhari). It provides physical strength and spiritual mindfulness.'
        ]
      },
      {
        heading: 'Iftar (Breaking the Fast)',
        paragraphs: [
          'It is Sunnah to hasten to break the fast at sunset with dates or water, and to supplicate at that special moment when prayers are readily accepted.',
          'Dua at Iftar: "Dhahaba adh-dhama\'u wab-tallatil-\'urooqu wa thabatal-ajru in sha Allah" (The thirst is gone, the veins are moistened and the reward is confirmed, if Allah wills).'
        ]
      },
      {
        heading: 'Laylat al-Qadr (The Night of Power)',
        paragraphs: [
          'Found within the odd nights of the last ten nights of Ramadan, Laylat al-Qadr is described in Surah Al-Qadr as "better than a thousand months". Sincere worship on this night carries immense divine forgiveness.'
        ]
      }
    ]
  },
  {
    id: 'adab-etiquette',
    category: 'etiquette',
    title: 'Islamic Etiquette (Adab) in Daily Life',
    arabicTitle: 'الآداب الإسلامية',
    subtitle: 'Practical Sunnah manners for speech, family, and public dealings',
    readTime: '5 min',
    content: [
      {
        heading: 'Greeting with Salam',
        paragraphs: [
          'The greeting "As-salamu \'alaykum wa rahmatullah" (Peace be upon you and the mercy of Allah) spreads goodwill, peace, and security between hearts.',
          'It is Sunnah to greet those you know and those you do not know.'
        ]
      },
      {
        heading: 'Etiquette of Speech',
        paragraphs: [
          'The Prophet ﷺ taught: "Whoever believes in Allah and the Last Day should speak good or remain silent." Avoid backbiting (Gheebah), slandering (Nameemah), and swearing.'
        ]
      },
      {
        heading: 'Kindness to Parents & Neighbors',
        paragraphs: [
          'Honoring one\'s parents (Birr al-Walidayn) is placed right next to worship of Allah in multiple Quranic verses. Treating neighbors with generosity and gentleness is an integral part of Islamic faith.'
        ]
      }
    ]
  }
];
