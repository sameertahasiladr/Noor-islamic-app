import { DuaCategory, DuaItem } from '../types';

export const DUA_CATEGORIES: DuaCategory[] = [
  { id: 'morning', title: 'Morning', arabicTitle: 'أذكار الصباح', iconName: 'Sun', description: 'Duas for barakah and protection upon starting the day' },
  { id: 'evening', title: 'Evening', arabicTitle: 'أذكار المساء', iconName: 'Sunset', description: 'Supplications as the night approaches' },
  { id: 'waking', title: 'After Waking Up', arabicTitle: 'عند الاستيقاظ', iconName: 'Sunrise', description: 'Giving thanks for life restored after sleep' },
  { id: 'sleeping', title: 'Before Sleeping', arabicTitle: 'قبل النوم', iconName: 'Moon', description: 'Seeking peaceful rest and divine protection' },
  { id: 'eating', title: 'Eating & Drinking', arabicTitle: 'الطعام والشراب', iconName: 'Utensils', description: 'Blessings before and after meals' },
  { id: 'travelling', title: 'Travelling', arabicTitle: 'دعاء السفر', iconName: 'Compass', description: 'For safety on roads and voyages' },
  { id: 'mosque', title: 'Mosque Adab', arabicTitle: 'المسجد', iconName: 'Building2', description: 'Entering and leaving the houses of Allah' },
  { id: 'protection', title: 'Protection & Evil Eye', arabicTitle: 'الحفظ والوقاية', iconName: 'Shield', description: 'Safeguard from harm, illness, and anxieties' },
  { id: 'family', title: 'Family & Parents', arabicTitle: 'الأهل والوالدين', iconName: 'HeartHandshake', description: 'Prayers for parents, spouses, and children' },
  { id: 'fasting', title: 'Fasting & Ramadan', arabicTitle: 'الصيام ورمضان', iconName: 'Moon', description: 'Intentions, Iftar, Laylat al-Qadr, and fasting supplications' },
  { id: 'forgiveness', title: 'Forgiveness (Istighfar)', arabicTitle: 'الاستغفار والتوبة', iconName: 'Sparkles', description: 'Sayyid al-Istighfar and seeking mercy' },
];

export const DUAS_LIST: DuaItem[] = [
  // Morning
  {
    id: 'dua_m1',
    categoryId: 'morning',
    title: 'Morning affirmation of faith & life',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Aṣbaḥnā wa-aṣbaḥal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa Huwa \'alā kulli shay\'in qadīr.',
    translation: 'We have entered upon the morning and the whole kingdom belongs to Allah, praise is due to Allah. None has the right to be worshipped but Allah alone, having no partner. Unto Him belongs the kingdom and to Him all praise is due, and He is over all things omnipotent.',
    reference: 'Sahih Muslim 2723 (Hisn al-Muslim)',
    benefit: 'Recite once every morning for gratitude, guidance, and reliance on Allah.',
  },
  {
    id: 'dua_m2',
    categoryId: 'morning',
    title: 'Seeking health & protection from grief',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration: 'Allāhumma \'āfinī fī badanī, Allāhumma \'āfinī fī sam\'ī, Allāhumma \'āfinī fī baṣarī, lā ilāha illā Anta.',
    translation: 'O Allah, grant my body health. O Allah, grant my hearing health. O Allah, grant my sight health. None has the right to be worshipped except You.',
    reference: 'Sunan Abi Dawud 5090 (Hasan)',
    benefit: 'Sunnah to recite 3 times every morning and evening.',
  },

  // Evening
  {
    id: 'dua_e1',
    categoryId: 'evening',
    title: 'Evening affirmation of sovereignty',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Amsaynā wa-amsal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa Huwa \'alā kulli shay\'in qadīr.',
    translation: 'We have reached the evening and the kingdom belongs to Allah, praise is due to Allah. None has the right to be worshipped but Allah alone, having no partner.',
    reference: 'Sahih Muslim 2723',
  },
  {
    id: 'dua_e2',
    categoryId: 'evening',
    title: 'Complete protection by the Perfect Words of Allah',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'A\'ūdhu bi-kalimātillāhit-tāmmāti min sharri mā khalaq.',
    translation: 'I seek refuge in the perfect words of Allah from the evil of that which He has created.',
    reference: 'Sahih Muslim 2709',
    benefit: 'Whoever recites this thrice in the evening, no poisonous sting or harm shall afflict them.',
  },

  // After Waking Up
  {
    id: 'dua_w1',
    categoryId: 'waking',
    title: 'Praise for life restored after sleep',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Al-ḥamdu lillāhilladhī aḥyānā ba\'da mā amātanā wa ilayhin-nushūr.',
    translation: 'All praise is for Allah who gave us life after having caused us to die, and unto Him is the resurrection.',
    reference: 'Sahih al-Bukhari 6312',
  },

  // Before Sleeping
  {
    id: 'dua_s1',
    categoryId: 'sleeping',
    title: 'Surrendering self before sleep',
    arabic: 'بِاسْمِكَ رَبِّ وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    transliteration: 'Bismika Rabbī waḍa\'tu jambī, wa bika arfa\'uh, fa-in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihī \'ibādakaṣ-ṣāliḥīn.',
    translation: 'In Your name, my Lord, I lay down my side and in Your name I raise it. If You should take my soul, then have mercy upon it, and if You should return it, then preserve it as You preserve Your righteous servants.',
    reference: 'Sahih al-Bukhari 6320, Muslim 2714',
  },

  // Eating & Drinking
  {
    id: 'dua_eat1',
    categoryId: 'eating',
    title: 'Before Eating',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillāh.',
    translation: 'In the name of Allah.',
    reference: 'Sahih al-Bukhari 5376',
    benefit: 'If forgotten at start, say: "بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ" (Bismillāhi awwalahū wa ākhirah).',
  },
  {
    id: 'dua_eat2',
    categoryId: 'eating',
    title: 'After Finishing Meal',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration: 'Al-ḥamdu lillāhilladhī aṭ\'amanī hādhā wa razaqanīhi min ghayri ḥawlin minnī wa lā quwwah.',
    translation: 'All praise is for Allah who fed me this and provided it for me without any power or strength from myself.',
    reference: 'Jami` at-Tirmidhi 3458 (Hasan)',
    benefit: 'All previous minor sins are forgiven for whoever recites this after food.',
  },

  // Travelling
  {
    id: 'dua_t1',
    categoryId: 'travelling',
    title: 'Supplication for Riding / Journey',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration: 'Subḥānalladhī sakh-khara lanā hādhā wa mā kunnā lahū muqrinīn, wa innā ilā Rabbinā lamunqalibūn.',
    translation: 'Glory to Him who has placed this transport under our control, though we were unable to conquer it by ourselves. And indeed, to our Lord we will return.',
    reference: 'Surah Az-Zukhruf (43:13-14), Sahih Muslim 1342',
  },

  // Entering / Leaving Mosque
  {
    id: 'dua_m_in',
    categoryId: 'mosque',
    title: 'Upon Entering the Mosque',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allāhummaf-taḥ lī abwāba raḥmatik.',
    translation: 'O Allah, open for me the gates of Your mercy.',
    reference: 'Sahih Muslim 713',
    benefit: 'Step in with the right foot.',
  },
  {
    id: 'dua_m_out',
    categoryId: 'mosque',
    title: 'Upon Leaving the Mosque',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Allāhumma innī as\'aluka min faḍlik.',
    translation: 'O Allah, I ask You from Your bounty.',
    reference: 'Sahih Muslim 713',
    benefit: 'Step out with the left foot.',
  },

  // Protection
  {
    id: 'dua_prot1',
    categoryId: 'protection',
    title: 'Protection from Harm (Nothing in Earth or Heaven can harm)',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillāhilladhī lā yaḍurru ma\'asmihī shay\'un fīl-arḍi wa lā fīs-samā\'i wa Huwas-Samī\'ul-\'Alīm.',
    translation: 'In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.',
    reference: 'Sunan Abi Dawud 5088, Jami` at-Tirmidhi 3388',
    benefit: 'Recite 3 times in morning and 3 times in evening for absolute protection.',
  },
  {
    id: 'dua_prot2',
    categoryId: 'protection',
    title: 'Relief from Anxiety and Depression',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ',
    transliteration: 'Allāhumma innī a\'ūdhu bika minal-hammi wal-ḥazan, wal-\'ajzi wal-kasal, wal-bukhli wal-jubn, wa ḍala\'id-dayn, wa ghalabatir-rijāl.',
    translation: 'O Allah, I take refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and being overpowered by men.',
    reference: 'Sahih al-Bukhari 2893',
  },

  // Family & Parents
  {
    id: 'dua_fam1',
    categoryId: 'family',
    title: 'Quranic Prayer for Parents',
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā.',
    translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
    reference: 'Surah Al-Isra (17:24)',
  },
  {
    id: 'dua_fam2',
    categoryId: 'family',
    title: 'Prayer for Righteous Spouse and Children',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration: 'Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata a\'yunin waj\'alnā lil-muttaqīna imāmā.',
    translation: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous.',
    reference: 'Surah Al-Furqan (25:74)',
  },

  // Fasting & Ramadan
  {
    id: 'dua_fast1',
    categoryId: 'fasting',
    title: 'Intention for Fasting at Suhoor (Niyyah)',
    arabic: 'وَبِصَوْمِ غَدٍ نَوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliteration: 'Wa bi-ṣawmi ghadin nawaytu min shahri Ramaḍān.',
    translation: 'I intend to keep the fast tomorrow in the holy month of Ramadan.',
    reference: 'Islamic Jurisprudence (Fiqh as-Sunnah)',
    benefit: 'Make the intention with sincerity in the heart before Fajr begins.',
  },
  {
    id: 'dua_fast2',
    categoryId: 'fasting',
    title: 'Dua at Iftar (Breaking the Fast)',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: 'Dhahabadh-dhama\'u wabtallatil-\'urūqu wa thabatal-ajru in shā\' Allāh.',
    translation: 'The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
    reference: 'Sunan Abi Dawud 2357',
    benefit: 'Recite immediately upon breaking your fast with dates or water.',
  },
  {
    id: 'dua_fast3',
    categoryId: 'fasting',
    title: 'Alternate Dua for Breaking the Fast',
    arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: 'Allāhumma innī laka ṣumtu wa \'alā rizqika afṭart.',
    translation: 'O Allah, I fasted for You and upon Your provision I have broken my fast.',
    reference: 'Sunan Abi Dawud 2358',
    benefit: 'Traditional prophetic prayer of gratitude at the table of Iftar.',
  },
  {
    id: 'dua_fast4',
    categoryId: 'fasting',
    title: 'Supplication for Laylat al-Qadr (Night of Power)',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: 'Allāhumma innaka \'Afuwwun tuḥibbul-\'afwa fa\'fu \'annī.',
    translation: 'O Allah, You are Most Forgiving, and You love forgiveness; so pardon me.',
    reference: 'Jami` at-Tirmidhi 3513 (Reported by Aisha RA)',
    benefit: 'The Prophet ﷺ taught Aisha (RA) to repeat this frequently in the last ten nights.',
  },

  // Forgiveness (Sayyid al-Istighfar)
  {
    id: 'dua_forg1',
    categoryId: 'forgiveness',
    title: 'Sayyid al-Istighfar (The Master of Forgiveness)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: 'Allāhumma Anta Rabbī lā ilāha illā Ant, khalaqtanī wa anā \'abduk, wa anā \'alā \'ahdika wa wa\'dika mastaṭa\'t, a\'ūdhu bika min sharri mā ṣana\'t, abū\'u laka bi-ni\'matika \'alayya, wa abū\'u bi-dhambī faghfir lī fa-innahū lā yaghfirudh-dhunūba illā Ant.',
    translation: 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide to Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for indeed none forgives sins except You.',
    reference: 'Sahih al-Bukhari 6306',
    benefit: 'The Prophet ﷺ said: Whoever says this with conviction in the morning and dies before evening will be of the people of Paradise; and likewise in the evening.',
  },
];
