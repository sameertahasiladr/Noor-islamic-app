import { SurahDetail, SurahMeta } from '../types';

export const ALL_SURAHS: SurahMeta[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan' },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan' },
  { number: 3, name: 'آل عمران', englishName: 'Ali \'Imran', englishNameTranslation: 'Family of Imran', numberOfAyahs: 200, revelationType: 'Medinan' },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', englishNameTranslation: 'The Women', numberOfAyahs: 176, revelationType: 'Medinan' },
  { number: 5, name: 'المائدة', englishName: 'Al-Ma\'idah', englishNameTranslation: 'The Table Spread', numberOfAyahs: 120, revelationType: 'Medinan' },
  { number: 6, name: 'الأنعام', englishName: 'Al-An\'am', englishNameTranslation: 'The Cattle', numberOfAyahs: 165, revelationType: 'Meccan' },
  { number: 7, name: 'الأعراف', englishName: 'Al-A\'raf', englishNameTranslation: 'The Heights', numberOfAyahs: 206, revelationType: 'Meccan' },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', englishNameTranslation: 'The Spoils of War', numberOfAyahs: 75, revelationType: 'Medinan' },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah', englishNameTranslation: 'The Repentance', numberOfAyahs: 129, revelationType: 'Medinan' },
  { number: 10, name: 'يونس', englishName: 'Yunus', englishNameTranslation: 'Jonah', numberOfAyahs: 109, revelationType: 'Meccan' },
  { number: 11, name: 'هود', englishName: 'Hud', englishNameTranslation: 'Hud', numberOfAyahs: 123, revelationType: 'Meccan' },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', englishNameTranslation: 'Joseph', numberOfAyahs: 111, revelationType: 'Meccan' },
  { number: 13, name: 'الرعد', englishName: 'Ar-Ra\'d', englishNameTranslation: 'The Thunder', numberOfAyahs: 43, revelationType: 'Medinan' },
  { number: 14, name: 'ابراهيم', englishName: 'Ibrahim', englishNameTranslation: 'Abraham', numberOfAyahs: 52, revelationType: 'Meccan' },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', englishNameTranslation: 'The Rocky Tract', numberOfAyahs: 99, revelationType: 'Meccan' },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', englishNameTranslation: 'The Bee', numberOfAyahs: 128, revelationType: 'Meccan' },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra', englishNameTranslation: 'The Night Journey', numberOfAyahs: 111, revelationType: 'Meccan' },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', numberOfAyahs: 110, revelationType: 'Meccan' },
  { number: 19, name: 'مريم', englishName: 'Maryam', englishNameTranslation: 'Mary', numberOfAyahs: 98, revelationType: 'Meccan' },
  { number: 20, name: 'طه', englishName: 'Taha', englishNameTranslation: 'Ta-Ha', numberOfAyahs: 135, revelationType: 'Meccan' },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbiya', englishNameTranslation: 'The Prophets', numberOfAyahs: 112, revelationType: 'Meccan' },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj', englishNameTranslation: 'The Pilgrimage', numberOfAyahs: 78, revelationType: 'Medinan' },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Mu\'minun', englishNameTranslation: 'The Believers', numberOfAyahs: 118, revelationType: 'Meccan' },
  { number: 24, name: 'النور', englishName: 'An-Nur', englishNameTranslation: 'The Light', numberOfAyahs: 64, revelationType: 'Medinan' },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqan', englishNameTranslation: 'The Criterion', numberOfAyahs: 77, revelationType: 'Meccan' },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shu\'ara', englishNameTranslation: 'The Poets', numberOfAyahs: 227, revelationType: 'Meccan' },
  { number: 27, name: 'النمل', englishName: 'An-Naml', englishNameTranslation: 'The Ant', numberOfAyahs: 93, revelationType: 'Meccan' },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', englishNameTranslation: 'The Stories', numberOfAyahs: 88, revelationType: 'Meccan' },
  { number: 29, name: 'العنكبوت', englishName: 'Al-\'Ankabut', englishNameTranslation: 'The Spider', numberOfAyahs: 69, revelationType: 'Meccan' },
  { number: 30, name: 'الروم', englishName: 'Ar-Rum', englishNameTranslation: 'The Romans', numberOfAyahs: 60, revelationType: 'Meccan' },
  { number: 31, name: 'لقمان', englishName: 'Luqman', englishNameTranslation: 'Luqman', numberOfAyahs: 34, revelationType: 'Meccan' },
  { number: 32, name: 'السجدة', englishName: 'As-Sajdah', englishNameTranslation: 'The Prostration', numberOfAyahs: 30, revelationType: 'Meccan' },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', englishNameTranslation: 'The Combined Forces', numberOfAyahs: 73, revelationType: 'Medinan' },
  { number: 34, name: 'سبإ', englishName: 'Saba', englishNameTranslation: 'Sheba', numberOfAyahs: 54, revelationType: 'Meccan' },
  { number: 35, name: 'فاطر', englishName: 'Fatir', englishNameTranslation: 'Originator', numberOfAyahs: 45, revelationType: 'Meccan' },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', englishNameTranslation: 'Ya-Sin', numberOfAyahs: 83, revelationType: 'Meccan' },
  { number: 37, name: 'الصافات', englishName: 'As-Saffat', englishNameTranslation: 'Those who set the Ranks', numberOfAyahs: 182, revelationType: 'Meccan' },
  { number: 38, name: 'ص', englishName: 'Sad', englishNameTranslation: 'The Letter "Saad"', numberOfAyahs: 88, revelationType: 'Meccan' },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', englishNameTranslation: 'The Troops', numberOfAyahs: 75, revelationType: 'Meccan' },
  { number: 40, name: 'غافر', englishName: 'Ghafir', englishNameTranslation: 'The Forgiver', numberOfAyahs: 85, revelationType: 'Meccan' },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', englishNameTranslation: 'Explained in Detail', numberOfAyahs: 54, revelationType: 'Meccan' },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura', englishNameTranslation: 'The Consultation', numberOfAyahs: 53, revelationType: 'Meccan' },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', englishNameTranslation: 'The Ornaments of Gold', numberOfAyahs: 89, revelationType: 'Meccan' },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan', englishNameTranslation: 'The Smoke', numberOfAyahs: 59, revelationType: 'Meccan' },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jathiyah', englishNameTranslation: 'The Crouching', numberOfAyahs: 37, revelationType: 'Meccan' },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', englishNameTranslation: 'The Wind-Curved Sandhills', numberOfAyahs: 35, revelationType: 'Meccan' },
  { number: 47, name: 'محمد', englishName: 'Muhammad', englishNameTranslation: 'Muhammad', numberOfAyahs: 38, revelationType: 'Medinan' },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', englishNameTranslation: 'The Victory', numberOfAyahs: 29, revelationType: 'Medinan' },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat', englishNameTranslation: 'The Rooms', numberOfAyahs: 18, revelationType: 'Medinan' },
  { number: 50, name: 'ق', englishName: 'Qaf', englishNameTranslation: 'The Letter "Qaf"', numberOfAyahs: 45, revelationType: 'Meccan' },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', englishNameTranslation: 'The Winnowing Winds', numberOfAyahs: 60, revelationType: 'Meccan' },
  { number: 52, name: 'الطور', englishName: 'At-Tur', englishNameTranslation: 'The Mount', numberOfAyahs: 49, revelationType: 'Meccan' },
  { number: 53, name: 'النجم', englishName: 'An-Najm', englishNameTranslation: 'The Star', numberOfAyahs: 62, revelationType: 'Meccan' },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', englishNameTranslation: 'The Moon', numberOfAyahs: 55, revelationType: 'Meccan' },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', englishNameTranslation: 'The Beneficent', numberOfAyahs: 78, revelationType: 'Medinan' },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqi\'ah', englishNameTranslation: 'The Inevitable', numberOfAyahs: 96, revelationType: 'Meccan' },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', englishNameTranslation: 'The Iron', numberOfAyahs: 29, revelationType: 'Medinan' },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujadila', englishNameTranslation: 'The Pleading Woman', numberOfAyahs: 22, revelationType: 'Medinan' },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', englishNameTranslation: 'The Exile', numberOfAyahs: 24, revelationType: 'Medinan' },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahanah', englishNameTranslation: 'She that is to be examined', numberOfAyahs: 13, revelationType: 'Medinan' },
  { number: 61, name: 'الصف', englishName: 'As-Saf', englishNameTranslation: 'The Ranks', numberOfAyahs: 14, revelationType: 'Medinan' },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumu\'ah', englishNameTranslation: 'The Congregation', numberOfAyahs: 11, revelationType: 'Medinan' },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', englishNameTranslation: 'The Hypocrites', numberOfAyahs: 11, revelationType: 'Medinan' },
  { number: 64, name: 'التغابن', englishName: 'At-Taghabun', englishNameTranslation: 'The Mutual Disillusion', numberOfAyahs: 18, revelationType: 'Medinan' },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaq', englishNameTranslation: 'The Divorce', numberOfAyahs: 12, revelationType: 'Medinan' },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', englishNameTranslation: 'The Prohibition', numberOfAyahs: 12, revelationType: 'Medinan' },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', numberOfAyahs: 30, revelationType: 'Meccan' },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', englishNameTranslation: 'The Pen', numberOfAyahs: 52, revelationType: 'Meccan' },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haqqah', englishNameTranslation: 'The Inevitable Reality', numberOfAyahs: 52, revelationType: 'Meccan' },
  { number: 70, name: 'المعارج', englishName: 'Al-Ma\'arij', englishNameTranslation: 'The Ascending Stairways', numberOfAyahs: 44, revelationType: 'Meccan' },
  { number: 71, name: 'نوح', englishName: 'Nuh', englishNameTranslation: 'Noah', numberOfAyahs: 28, revelationType: 'Meccan' },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', englishNameTranslation: 'The Jinn', numberOfAyahs: 28, revelationType: 'Meccan' },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', englishNameTranslation: 'The Enshrouded One', numberOfAyahs: 20, revelationType: 'Meccan' },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', englishNameTranslation: 'The Cloaked One', numberOfAyahs: 56, revelationType: 'Meccan' },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyamah', englishNameTranslation: 'The Resurrection', numberOfAyahs: 40, revelationType: 'Meccan' },
  { number: 76, name: 'الانسان', englishName: 'Al-Insan', englishNameTranslation: 'Man', numberOfAyahs: 31, revelationType: 'Medinan' },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', englishNameTranslation: 'The Emissaries', numberOfAyahs: 50, revelationType: 'Meccan' },
  { number: 78, name: 'النبإ', englishName: 'An-Naba', englishNameTranslation: 'The Tidings', numberOfAyahs: 40, revelationType: 'Meccan' },
  { number: 79, name: 'النازعات', englishName: 'An-Nazi\'at', englishNameTranslation: 'Those who drag forth', numberOfAyahs: 46, revelationType: 'Meccan' },
  { number: 80, name: 'عبس', englishName: '\'Abasa', englishNameTranslation: 'He Frowned', numberOfAyahs: 42, revelationType: 'Meccan' },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', englishNameTranslation: 'The Overthrowing', numberOfAyahs: 29, revelationType: 'Meccan' },
  { number: 82, name: 'الإنفطار', englishName: 'Al-Infitar', englishNameTranslation: 'The Cleaving', numberOfAyahs: 19, revelationType: 'Meccan' },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', englishNameTranslation: 'The Defrauding', numberOfAyahs: 36, revelationType: 'Meccan' },
  { number: 84, name: 'الإنشقاق', englishName: 'Al-Inshiqaq', englishNameTranslation: 'The Splitting Asunder', numberOfAyahs: 25, revelationType: 'Meccan' },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj', englishNameTranslation: 'The Mansions of the Stars', numberOfAyahs: 22, revelationType: 'Meccan' },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq', englishNameTranslation: 'The Morning Star', numberOfAyahs: 17, revelationType: 'Meccan' },
  { number: 87, name: 'الأعلى', englishName: 'Al-A\'la', englishNameTranslation: 'The Most High', numberOfAyahs: 19, revelationType: 'Meccan' },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', englishNameTranslation: 'The Overwhelming', numberOfAyahs: 26, revelationType: 'Meccan' },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', englishNameTranslation: 'The Dawn', numberOfAyahs: 30, revelationType: 'Meccan' },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', englishNameTranslation: 'The City', numberOfAyahs: 20, revelationType: 'Meccan' },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', englishNameTranslation: 'The Sun', numberOfAyahs: 15, revelationType: 'Meccan' },
  { number: 92, name: 'الليل', englishName: 'Al-Layl', englishNameTranslation: 'The Night', numberOfAyahs: 21, revelationType: 'Meccan' },
  { number: 93, name: 'الضحى', englishName: 'Ad-Duhaa', englishNameTranslation: 'The Morning Hours', numberOfAyahs: 11, revelationType: 'Meccan' },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', englishNameTranslation: 'The Relief', numberOfAyahs: 8, revelationType: 'Meccan' },
  { number: 95, name: 'التين', englishName: 'At-Tin', englishNameTranslation: 'The Fig', numberOfAyahs: 8, revelationType: 'Meccan' },
  { number: 96, name: 'العلق', englishName: 'Al-\'Alaq', englishNameTranslation: 'The Clot', numberOfAyahs: 19, revelationType: 'Meccan' },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', englishNameTranslation: 'The Power', numberOfAyahs: 5, revelationType: 'Meccan' },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyinah', englishNameTranslation: 'The Clear Proof', numberOfAyahs: 8, revelationType: 'Medinan' },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah', englishNameTranslation: 'The Earthquake', numberOfAyahs: 8, revelationType: 'Medinan' },
  { number: 100, name: 'العاديات', englishName: 'Al-\'Adiyat', englishNameTranslation: 'The Courser', numberOfAyahs: 11, revelationType: 'Meccan' },
  { number: 101, name: 'القارعة', englishName: 'Al-Qari\'ah', englishNameTranslation: 'The Calamity', numberOfAyahs: 11, revelationType: 'Meccan' },
  { number: 102, name: 'التكاثر', englishName: 'At-Takathur', englishNameTranslation: 'The Rivalry in World Increase', numberOfAyahs: 8, revelationType: 'Meccan' },
  { number: 103, name: 'العصر', englishName: 'Al-\'Asr', englishNameTranslation: 'The Declining Day', numberOfAyahs: 3, revelationType: 'Meccan' },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humazah', englishNameTranslation: 'The Traducer', numberOfAyahs: 9, revelationType: 'Meccan' },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', englishNameTranslation: 'The Elephant', numberOfAyahs: 5, revelationType: 'Meccan' },
  { number: 106, name: 'قريش', englishName: 'Quraysh', englishNameTranslation: 'Quraysh', numberOfAyahs: 4, revelationType: 'Meccan' },
  { number: 107, name: 'الماعون', englishName: 'Al-Ma\'un', englishNameTranslation: 'The Small Kindness', numberOfAyahs: 7, revelationType: 'Meccan' },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', englishNameTranslation: 'The Abundance', numberOfAyahs: 3, revelationType: 'Meccan' },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', englishNameTranslation: 'The Disbelievers', numberOfAyahs: 6, revelationType: 'Meccan' },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', englishNameTranslation: 'The Divine Support', numberOfAyahs: 3, revelationType: 'Medinan' },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', englishNameTranslation: 'The Palm Fiber', numberOfAyahs: 5, revelationType: 'Meccan' },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', englishNameTranslation: 'The Sincerity', numberOfAyahs: 4, revelationType: 'Meccan' },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', numberOfAyahs: 5, revelationType: 'Meccan' },
  { number: 114, name: 'الناس', englishName: 'An-Nas', englishNameTranslation: 'Mankind', numberOfAyahs: 6, revelationType: 'Meccan' },
];

// Curated authentic Surah verses bundled offline for instant, lightning-fast rendering
export const BUNDLED_SURAHS: Record<number, SurahDetail> = {
  // Surah Al-Fatihah (1)
  1: {
    ...ALL_SURAHS[0],
    bismillahPre: false,
    ayahs: [
      {
        numberInSurah: 1,
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillāhir-Raḥmānir-Raḥīm',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      },
      {
        numberInSurah: 2,
        arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        transliteration: 'Al-ḥamdu lillāhi Rabbil-\'ālamīn',
        translation: '[All] praise is [due] to Allah, Lord of the worlds -',
      },
      {
        numberInSurah: 3,
        arabicText: 'الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Ar-Raḥmānir-Raḥīm',
        translation: 'The Entirely Merciful, the Especially Merciful,',
      },
      {
        numberInSurah: 4,
        arabicText: 'مَالِكِ يَوْمِ الدِّينِ',
        transliteration: 'Māliki yawmid-dīn',
        translation: 'Sovereign of the Day of Recompense.',
      },
      {
        numberInSurah: 5,
        arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        transliteration: 'Iyyāka na\'budu wa iyyāka nasta\'īn',
        translation: 'It is You we worship and You we ask for help.',
      },
      {
        numberInSurah: 6,
        arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        transliteration: 'Ihdināṣ-ṣirāṭal-mustaqīm',
        translation: 'Guide us to the straight path -',
      },
      {
        numberInSurah: 7,
        arabicText: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        transliteration: 'Ṣirāṭalladhīna an\'amta \'alayhim ghayril-maghḍūbi \'alayhim wa laḍ-ḍāllīn',
        translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
      },
    ],
  },

  // Surah Al-Ikhlas (112)
  112: {
    ...ALL_SURAHS[111],
    bismillahPre: true,
    ayahs: [
      {
        numberInSurah: 1,
        arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        transliteration: 'Qul Huwallāhu Aḥad',
        translation: 'Say, "He is Allah, [who is] One,',
      },
      {
        numberInSurah: 2,
        arabicText: 'اللَّهُ الصَّمَدُ',
        transliteration: 'Allāhuṣ-Ṣamad',
        translation: 'Allah, the Eternal Refuge.',
      },
      {
        numberInSurah: 3,
        arabicText: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        transliteration: 'Lam yalid wa lam yūlad',
        translation: 'He neither begets nor is born,',
      },
      {
        numberInSurah: 4,
        arabicText: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        transliteration: 'Wa lam yakul-lahū kufuwan aḥad',
        translation: 'Nor is there to Him any equivalent."',
      },
    ],
  },

  // Surah Al-Falaq (113)
  113: {
    ...ALL_SURAHS[112],
    bismillahPre: true,
    ayahs: [
      {
        numberInSurah: 1,
        arabicText: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        transliteration: 'Qul a\'ūdhu bi-Rabbil-falaq',
        translation: 'Say, "I seek refuge in the Lord of daybreak',
      },
      {
        numberInSurah: 2,
        arabicText: 'مِن شَرِّ مَا خَلَقَ',
        transliteration: 'Min sharri mā khalaq',
        translation: 'From the evil of that which He created',
      },
      {
        numberInSurah: 3,
        arabicText: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        transliteration: 'Wa min sharri ghāsiqin idhā waqab',
        translation: 'And from the evil of darkness when it settles',
      },
      {
        numberInSurah: 4,
        arabicText: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        transliteration: 'Wa min sharrin-naffāthāti fīl-\'uqad',
        translation: 'And from the evil of the blowers in knots',
      },
      {
        numberInSurah: 5,
        arabicText: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        transliteration: 'Wa min sharri ḥāsidin idhā ḥasad',
        translation: 'And from the evil of an envier when he envies."',
      },
    ],
  },

  // Surah An-Nas (114)
  114: {
    ...ALL_SURAHS[113],
    bismillahPre: true,
    ayahs: [
      {
        numberInSurah: 1,
        arabicText: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        transliteration: 'Qul a\'ūdhu bi-Rabbin-nās',
        translation: 'Say, "I seek refuge in the Lord of mankind,',
      },
      {
        numberInSurah: 2,
        arabicText: 'مَلِكِ النَّاسِ',
        transliteration: 'Malikin-nās',
        translation: 'The Sovereign of mankind,',
      },
      {
        numberInSurah: 3,
        arabicText: 'إِلَٰهِ النَّاسِ',
        transliteration: 'Ilāhin-nās',
        translation: 'The God of mankind,',
      },
      {
        numberInSurah: 4,
        arabicText: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        transliteration: 'Min sharril-waswāsil-khannās',
        translation: 'From the evil of the retreating whisperer -',
      },
      {
        numberInSurah: 5,
        arabicText: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        transliteration: 'Alladhī yuwaswisu fī ṣudūrin-nās',
        translation: 'Who whispers [evil] into the breasts of mankind -',
      },
      {
        numberInSurah: 6,
        arabicText: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
        transliteration: 'Minal-jinnati wan-nās',
        translation: 'From among the jinn and mankind."',
      },
    ],
  },

  // Surah Al-Kawthar (108)
  108: {
    ...ALL_SURAHS[107],
    bismillahPre: true,
    ayahs: [
      {
        numberInSurah: 1,
        arabicText: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
        transliteration: 'Innā a\'ṭaynākal-kawthar',
        translation: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.',
      },
      {
        numberInSurah: 2,
        arabicText: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
        transliteration: 'Fa-ṣalli li-Rabbika wanḥar',
        translation: 'So pray to your Lord and sacrifice [to Him alone].',
      },
      {
        numberInSurah: 3,
        arabicText: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
        transliteration: 'Inna shāni\'aka huwal-abtar',
        translation: 'Indeed, your enemy is the one cut off.',
      },
    ],
  },

  // Surah Al-Asr (103)
  103: {
    ...ALL_SURAHS[102],
    bismillahPre: true,
    ayahs: [
      {
        numberInSurah: 1,
        arabicText: 'وَالْعَصْرِ',
        transliteration: 'Wal-\'aṣr',
        translation: 'By time,',
      },
      {
        numberInSurah: 2,
        arabicText: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
        transliteration: 'Innal-insāna lafī khusr',
        translation: 'Indeed, mankind is in loss,',
      },
      {
        numberInSurah: 3,
        arabicText: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
        transliteration: 'Illalladhīna āmanū wa \'amiluṣ-ṣāliḥāti wa tawāṣaw bil-ḥaqqi wa tawāṣaw biṣ-ṣabr',
        translation: 'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.',
      },
    ],
  },

  // Surah Al-Mulk (67) sample first 5 key verses
  67: {
    ...ALL_SURAHS[66],
    bismillahPre: true,
    ayahs: [
      {
        numberInSurah: 1,
        arabicText: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        transliteration: 'Tabārakalladhī bi-yadihil-mulku wa huwa \'alā kulli shay\'in qadīr',
        translation: 'Blessed is He in whose hand is dominion, and He is over all things competent -',
      },
      {
        numberInSurah: 2,
        arabicText: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
        transliteration: 'Alladhī khalaqal-mawta wal-ḥayāta li-yabluwakum ayyukum aḥsanu \'amalā, wa huwal-\'Azīzul-Ghafūr',
        translation: '[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -',
      },
      {
        numberInSurah: 3,
        arabicText: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ',
        transliteration: 'Alladhī khalaqa sab\'a samāwātin ṭibāqan, mā tarā fī khalqir-Raḥmāni min tafāwut, farji\'il-baṣara hal tarā min fuṭūr',
        translation: '[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision [to the sky]; do you see any breaks?',
      },
      {
        numberInSurah: 4,
        arabicText: 'ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ',
        transliteration: 'Thummar-ji\'il-baṣara karratayni yanqalib ilaykal-baṣaru khāsi\'an wa huwa ḥasīr',
        translation: 'Then return [your] vision twice again. [Your] vision will return to you humbled while it is fatigued.',
      },
      {
        numberInSurah: 5,
        arabicText: 'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ',
        transliteration: 'Wa laqad zayyannās-samā\'ad-dunyā bi-maṣābīḥa wa ja\'alnāhā rujūman lish-shayāṭīn, wa a\'tadnā lahum \'adhābas-sa\'īr',
        translation: 'And We have certainly beautified the nearest heaven with stars and have made [from] them what is thrown at the devils and have prepared for them the punishment of the Blaze.',
      },
    ],
  },
};

/**
 * Service to fetch Surah data.
 * Checks bundled data first; otherwise fetches from verified Quran API
 */
export async function fetchSurahDetail(surahNumber: number): Promise<SurahDetail> {
  // If we have bundled, check if it has all ayahs or needs more
  const bundled = BUNDLED_SURAHS[surahNumber];
  const meta = ALL_SURAHS.find(s => s.number === surahNumber) || ALL_SURAHS[0];

  if (bundled && bundled.ayahs.length === meta.numberOfAyahs) {
    return bundled;
  }

  try {
    // Reputable authentic free public Quran API: api.alquran.cloud
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,en.transliteration`
    );
    if (!response.ok) throw new Error('API failed');

    const data = await response.json();
    if (data.code === 200 && data.data && data.data.length >= 2) {
      const arabicEdition = data.data[0];
      const englishEdition = data.data[1];
      const transliterationEdition = data.data[2] || null;

      const ayahs = arabicEdition.ayahs.map((ayahItem: { numberInSurah: number; text: string }, idx: number) => {
        let arabic = ayahItem.text;
        // Clean out bismillah prefix for surahs other than Al-Fatihah if prefixed
        if (surahNumber !== 1 && surahNumber !== 9 && idx === 0 && arabic.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ')) {
          arabic = arabic.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
        }

        return {
          numberInSurah: ayahItem.numberInSurah,
          arabicText: arabic,
          transliteration: transliterationEdition?.ayahs[idx]?.text || '',
          translation: englishEdition.ayahs[idx]?.text || '',
        };
      });

      return {
        ...meta,
        bismillahPre: surahNumber !== 1 && surahNumber !== 9,
        ayahs,
      };
    }
  } catch {
    // If offline or network issue, fallback to bundled if exists or minimal structure
    if (bundled) {
      return bundled;
    }
  }

  // Fallback placeholder structure if completely offline
  return {
    ...meta,
    bismillahPre: surahNumber !== 1 && surahNumber !== 9,
    ayahs: [
      {
        numberInSurah: 1,
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillāhir-Raḥmānir-Raḥīm',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      }
    ],
  };
}
