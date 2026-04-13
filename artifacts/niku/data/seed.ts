export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  japanese: string;
  romaji: string;
  indonesian: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  xpReward: number;
}

export interface Lesson {
  id: string;
  title: string;
  titleJp: string;
  category: "partikel" | "konjugasi" | "kosakata" | "kanji";
  categoryLabel: string;
  estimatedMinutes: number;
  locked: boolean;
  unlockedBy?: string;
  content: string[];
  quiz: QuizQuestion[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  requirement: { type: "xp" | "streak" | "lessons" | "quizzes"; value: number };
}

export interface NotificationItem {
  id: string;
  from: string;
  role: string;
  message: string;
  time: string;
  read: boolean;
}

export const LESSONS: Lesson[] = [
  {
    id: "partikel-wa",
    title: "Partikel は (wa) - Penanda Topik",
    titleJp: "は",
    category: "partikel",
    categoryLabel: "Partikel",
    estimatedMinutes: 5,
    locked: false,
    content: [
      "Partikel は (wa) berfungsi sebagai penanda topik dalam kalimat Jepang.",
      "は menunjukkan subjek atau topik yang sedang dibicarakan.",
      "Contoh: 私は学生です (Watashi wa gakusei desu) = Saya adalah pelajar.",
      "Berbeda dengan が (ga) yang menandai subjek baru, は digunakan untuk topik yang sudah diketahui.",
      "は juga digunakan untuk menyatakan kontras: 私は行きますが、彼は行きません.",
    ],
    quiz: [
      {
        id: "pw-q1",
        japanese: "私は学生です。",
        romaji: "Watashi wa gakusei desu.",
        indonesian: "Saya adalah pelajar.",
        options: [
          { id: "a", text: "Kamu adalah guru" },
          { id: "b", text: "Saya adalah pelajar" },
          { id: "c", text: "Dia adalah mahasiswa" },
          { id: "d", text: "Mereka adalah teman" },
        ],
        correctOptionId: "b",
        explanation: "私 (watashi) = saya, は (wa) = penanda topik, 学生 (gakusei) = pelajar, です (desu) = adalah.",
        xpReward: 10,
      },
      {
        id: "pw-q2",
        japanese: "これは本ですか。",
        romaji: "Kore wa hon desu ka.",
        indonesian: "Apakah ini sebuah buku?",
        options: [
          { id: "a", text: "Ini adalah buku" },
          { id: "b", text: "Di mana buku ini?" },
          { id: "c", text: "Apakah ini sebuah buku?" },
          { id: "d", text: "Ini bukan buku" },
        ],
        correctOptionId: "c",
        explanation: "これ (kore) = ini, は (wa) = penanda topik, 本 (hon) = buku, ですか (desu ka) = apakah ... ?",
        xpReward: 10,
      },
      {
        id: "pw-q3",
        japanese: "田中さんは先生です。",
        romaji: "Tanaka-san wa sensei desu.",
        indonesian: "Pak/Bu Tanaka adalah guru.",
        options: [
          { id: "a", text: "Tanaka adalah dokter" },
          { id: "b", text: "Pak/Bu Tanaka adalah guru" },
          { id: "c", text: "Saya adalah Tanaka" },
          { id: "d", text: "Tanaka adalah teman saya" },
        ],
        correctOptionId: "b",
        explanation: "田中さん (Tanaka-san) = nama orang, は (wa) = penanda topik, 先生 (sensei) = guru.",
        xpReward: 10,
      },
      {
        id: "pw-q4",
        japanese: "今日は暑いです。",
        romaji: "Kyou wa atsui desu.",
        indonesian: "Hari ini (cuacanya) panas.",
        options: [
          { id: "a", text: "Kemarin sangat panas" },
          { id: "b", text: "Besok akan panas" },
          { id: "c", text: "Hari ini (cuacanya) panas" },
          { id: "d", text: "Di sini panas sekali" },
        ],
        correctOptionId: "c",
        explanation: "今日 (kyou) = hari ini, は (wa) = penanda topik, 暑い (atsui) = panas.",
        xpReward: 10,
      },
      {
        id: "pw-q5",
        japanese: "日本語は難しいです。",
        romaji: "Nihongo wa muzukashii desu.",
        indonesian: "Bahasa Jepang itu sulit.",
        options: [
          { id: "a", text: "Bahasa Jepang itu mudah" },
          { id: "b", text: "Saya tidak suka bahasa Jepang" },
          { id: "c", text: "Bahasa Jepang itu menyenangkan" },
          { id: "d", text: "Bahasa Jepang itu sulit" },
        ],
        correctOptionId: "d",
        explanation: "日本語 (nihongo) = bahasa Jepang, は (wa) = penanda topik, 難しい (muzukashii) = sulit.",
        xpReward: 10,
      },
      {
        id: "pw-q6",
        japanese: "私は学生ではありません。",
        romaji: "Watashi wa gakusei dewa arimasen.",
        indonesian: "Saya bukan pelajar.",
        options: [
          { id: "a", text: "Saya bukan pelajar" },
          { id: "b", text: "Kamu bukan pelajar" },
          { id: "c", text: "Dia adalah pelajar" },
          { id: "d", text: "Saya adalah pelajar" },
        ],
        correctOptionId: "a",
        explanation: "ではありません (dewa arimasen) adalah bentuk negatif dari です (desu), artinya 'bukan'.",
        xpReward: 10,
      },
      {
        id: "pw-q7",
        japanese: "これは何ですか。",
        romaji: "Kore wa nan desu ka.",
        indonesian: "Ini apa?",
        options: [
          { id: "a", text: "Apakah ini mahal?" },
          { id: "b", text: "Ini apa?" },
          { id: "c", text: "Di mana ini?" },
          { id: "d", text: "Ini milik siapa?" },
        ],
        correctOptionId: "b",
        explanation: "何 (nan/nani) = apa, ですか (desu ka) = kalimat tanya. Jadi 'Ini apa?'",
        xpReward: 10,
      },
      {
        id: "pw-q8",
        japanese: "あの人は誰ですか。",
        romaji: "Ano hito wa dare desu ka.",
        indonesian: "Siapa orang itu?",
        options: [
          { id: "a", text: "Orang itu ada di sana" },
          { id: "b", text: "Orang itu tinggi" },
          { id: "c", text: "Siapa orang itu?" },
          { id: "d", text: "Kapan orang itu datang?" },
        ],
        correctOptionId: "c",
        explanation: "あの人 (ano hito) = orang itu, は (wa) = penanda topik, 誰 (dare) = siapa.",
        xpReward: 10,
      },
      {
        id: "pw-q9",
        japanese: "猫はかわいいです。",
        romaji: "Neko wa kawaii desu.",
        indonesian: "Kucing itu lucu/imut.",
        options: [
          { id: "a", text: "Anjing itu lucu" },
          { id: "b", text: "Kucing itu lucu/imut" },
          { id: "c", text: "Hewan itu berbahaya" },
          { id: "d", text: "Saya suka kucing" },
        ],
        correctOptionId: "b",
        explanation: "猫 (neko) = kucing, は (wa) = penanda topik, かわいい (kawaii) = lucu/imut.",
        xpReward: 10,
      },
      {
        id: "pw-q10",
        japanese: "私の名前は山田です。",
        romaji: "Watashi no namae wa Yamada desu.",
        indonesian: "Nama saya adalah Yamada.",
        options: [
          { id: "a", text: "Nama teman saya Yamada" },
          { id: "b", text: "Saya kenal Yamada" },
          { id: "c", text: "Yamada adalah teman saya" },
          { id: "d", text: "Nama saya adalah Yamada" },
        ],
        correctOptionId: "d",
        explanation: "私の (watashi no) = milik saya, 名前 (namae) = nama, は (wa) = penanda topik.",
        xpReward: 10,
      },
    ],
  },
  {
    id: "partikel-ni",
    title: "Partikel に (ni) - Penanda Tujuan",
    titleJp: "に",
    category: "partikel",
    categoryLabel: "Partikel",
    estimatedMinutes: 5,
    locked: true,
    unlockedBy: "partikel-wa",
    content: [
      "Partikel に (ni) memiliki banyak fungsi dalam bahasa Jepang.",
      "Fungsi 1: Menandai tujuan/arah gerakan. Contoh: 学校に行きます (Sekolah ke pergi).",
      "Fungsi 2: Menandai waktu/tempat terjadinya suatu aksi.",
      "Fungsi 3: Menandai penerima dari suatu tindakan. Contoh: 友達に手紙を書く.",
      "Fungsi 4: Menandai tujuan akhir keberadaan. Contoh: 東京に住んでいます.",
    ],
    quiz: [
      {
        id: "pn-q1",
        japanese: "学校に行きます。",
        romaji: "Gakkou ni ikimasu.",
        indonesian: "Saya pergi ke sekolah.",
        options: [
          { id: "a", text: "Saya pergi ke sekolah" },
          { id: "b", text: "Sekolah itu bagus" },
          { id: "c", text: "Saya berada di sekolah" },
          { id: "d", text: "Saya dari sekolah" },
        ],
        correctOptionId: "a",
        explanation: "学校 (gakkou) = sekolah, に (ni) = ke/menuju, 行きます (ikimasu) = pergi.",
        xpReward: 10,
      },
      {
        id: "pn-q2",
        japanese: "東京に住んでいます。",
        romaji: "Toukyou ni sunde imasu.",
        indonesian: "Saya tinggal di Tokyo.",
        options: [
          { id: "a", text: "Saya pergi ke Tokyo" },
          { id: "b", text: "Saya suka Tokyo" },
          { id: "c", text: "Saya tinggal di Tokyo" },
          { id: "d", text: "Tokyo itu besar" },
        ],
        correctOptionId: "c",
        explanation: "東京 (Toukyou) = Tokyo, に (ni) = di, 住んでいます (sunde imasu) = tinggal.",
        xpReward: 10,
      },
      {
        id: "pn-q3",
        japanese: "七時に起きます。",
        romaji: "Shichiji ni okimasu.",
        indonesian: "Saya bangun pukul 7.",
        options: [
          { id: "a", text: "Saya tidur jam 7" },
          { id: "b", text: "Saya bangun pukul 7" },
          { id: "c", text: "Jam 7 sudah siang" },
          { id: "d", text: "Saya makan jam 7" },
        ],
        correctOptionId: "b",
        explanation: "七時 (shichiji) = jam 7, に (ni) = pada (waktu), 起きます (okimasu) = bangun.",
        xpReward: 10,
      },
      {
        id: "pn-q4",
        japanese: "友達に電話します。",
        romaji: "Tomodachi ni denwa shimasu.",
        indonesian: "Saya menelepon teman.",
        options: [
          { id: "a", text: "Teman saya menelepon" },
          { id: "b", text: "Saya menelepon teman" },
          { id: "c", text: "Saya bertemu teman" },
          { id: "d", text: "Teman saya datang" },
        ],
        correctOptionId: "b",
        explanation: "友達 (tomodachi) = teman, に (ni) = kepada, 電話します (denwa shimasu) = menelepon.",
        xpReward: 10,
      },
      {
        id: "pn-q5",
        japanese: "駅に着きました。",
        romaji: "Eki ni tsukimashita.",
        indonesian: "Saya tiba di stasiun.",
        options: [
          { id: "a", text: "Saya pergi ke stasiun" },
          { id: "b", text: "Stasiun itu dekat" },
          { id: "c", text: "Saya tiba di stasiun" },
          { id: "d", text: "Saya meninggalkan stasiun" },
        ],
        correctOptionId: "c",
        explanation: "駅 (eki) = stasiun, に (ni) = di, 着きました (tsukimashita) = tiba (bentuk lampau).",
        xpReward: 10,
      },
      {
        id: "pn-q6",
        japanese: "日曜日に映画を見ます。",
        romaji: "Nichiyoubi ni eiga wo mimasu.",
        indonesian: "Saya menonton film pada hari Minggu.",
        options: [
          { id: "a", text: "Saya suka film Minggu" },
          { id: "b", text: "Saya menonton film pada hari Minggu" },
          { id: "c", text: "Hari Minggu saya pergi keluar" },
          { id: "d", text: "Film itu bagus pada hari Minggu" },
        ],
        correctOptionId: "b",
        explanation: "日曜日 (nichiyoubi) = hari Minggu, に (ni) = pada, 映画を見ます = menonton film.",
        xpReward: 10,
      },
      {
        id: "pn-q7",
        japanese: "母にプレゼントをあげます。",
        romaji: "Haha ni purezento wo agemasu.",
        indonesian: "Saya memberi hadiah kepada ibu.",
        options: [
          { id: "a", text: "Ibu memberi hadiah kepada saya" },
          { id: "b", text: "Saya membeli hadiah untuk ibu" },
          { id: "c", text: "Saya memberi hadiah kepada ibu" },
          { id: "d", text: "Ibu mendapat hadiah dari teman" },
        ],
        correctOptionId: "c",
        explanation: "母 (haha) = ibu saya, に (ni) = kepada, プレゼントをあげます = memberi hadiah.",
        xpReward: 10,
      },
      {
        id: "pn-q8",
        japanese: "図書館に本があります。",
        romaji: "Toshokan ni hon ga arimasu.",
        indonesian: "Ada buku di perpustakaan.",
        options: [
          { id: "a", text: "Saya pergi ke perpustakaan" },
          { id: "b", text: "Ada buku di perpustakaan" },
          { id: "c", text: "Perpustakaan itu besar" },
          { id: "d", text: "Saya membaca buku di perpustakaan" },
        ],
        correctOptionId: "b",
        explanation: "図書館 (toshokan) = perpustakaan, に (ni) = di (keberadaan), 本があります = ada buku.",
        xpReward: 10,
      },
      {
        id: "pn-q9",
        japanese: "バスに乗ります。",
        romaji: "Basu ni norimasu.",
        indonesian: "Saya naik bus.",
        options: [
          { id: "a", text: "Saya menunggu bus" },
          { id: "b", text: "Bus itu datang" },
          { id: "c", text: "Saya naik bus" },
          { id: "d", text: "Saya turun dari bus" },
        ],
        correctOptionId: "c",
        explanation: "バス (basu) = bus, に (ni) = ke/pada, 乗ります (norimasu) = naik (kendaraan).",
        xpReward: 10,
      },
      {
        id: "pn-q10",
        japanese: "先生に質問します。",
        romaji: "Sensei ni shitsumon shimasu.",
        indonesian: "Saya bertanya kepada guru.",
        options: [
          { id: "a", text: "Guru bertanya kepada saya" },
          { id: "b", text: "Saya bertanya kepada guru" },
          { id: "c", text: "Guru menjawab pertanyaan" },
          { id: "d", text: "Saya mendengarkan guru" },
        ],
        correctOptionId: "b",
        explanation: "先生 (sensei) = guru, に (ni) = kepada, 質問します (shitsumon shimasu) = bertanya.",
        xpReward: 10,
      },
    ],
  },
  {
    id: "konjugasi-te",
    title: "Konjugasi て-Form",
    titleJp: "動",
    category: "konjugasi",
    categoryLabel: "Konjugasi",
    estimatedMinutes: 8,
    locked: false,
    content: [
      "て-form adalah bentuk konjugasi kata kerja yang sangat penting.",
      "Digunakan untuk menghubungkan dua aksi berurutan: 食べて、寝ます (Makan lalu tidur).",
      "Digunakan dalam bentuk progresif: している (sedang melakukan).",
      "Digunakan untuk permintaan sopan: 待ってください (Tolong tunggu).",
      "Pola pembentukan: Kata kerja Grup 1: く→いて, ぐ→いで, む/ぬ/ぶ→んで, う/つ/る→って, す→して.",
    ],
    quiz: [
      {
        id: "kt-q1",
        japanese: "本を読んでいます。",
        romaji: "Hon wo yonde imasu.",
        indonesian: "Saya sedang membaca buku.",
        options: [
          { id: "a", text: "Saya membaca buku kemarin" },
          { id: "b", text: "Saya ingin membaca buku" },
          { id: "c", text: "Saya sedang membaca buku" },
          { id: "d", text: "Saya sudah selesai membaca buku" },
        ],
        correctOptionId: "c",
        explanation: "読んで (yonde) adalah て-form dari 読む (yomu = membaca). ～ています berarti 'sedang ~'.",
        xpReward: 10,
      },
      {
        id: "kt-q2",
        japanese: "ちょっと待ってください。",
        romaji: "Chotto matte kudasai.",
        indonesian: "Tolong tunggu sebentar.",
        options: [
          { id: "a", text: "Tolong tunggu sebentar" },
          { id: "b", text: "Saya tidak bisa menunggu" },
          { id: "c", text: "Berapa lama saya harus menunggu?" },
          { id: "d", text: "Dia sedang menunggu" },
        ],
        correctOptionId: "a",
        explanation: "待って (matte) adalah て-form dari 待つ (matsu = menunggu). ～てください = 'tolong lakukan ~'.",
        xpReward: 10,
      },
      {
        id: "kt-q3",
        japanese: "ご飯を食べて、学校に行きます。",
        romaji: "Gohan wo tabete, gakkou ni ikimasu.",
        indonesian: "Saya makan nasi, lalu pergi ke sekolah.",
        options: [
          { id: "a", text: "Saya pergi ke sekolah tanpa makan" },
          { id: "b", text: "Setelah sekolah, saya makan nasi" },
          { id: "c", text: "Saya makan nasi, lalu pergi ke sekolah" },
          { id: "d", text: "Saya makan di sekolah" },
        ],
        correctOptionId: "c",
        explanation: "食べて (tabete) adalah て-form dari 食べる (taberu = makan), menghubungkan dua aksi berurutan.",
        xpReward: 10,
      },
      {
        id: "kt-q4",
        japanese: "音楽を聴いています。",
        romaji: "Ongaku wo kiite imasu.",
        indonesian: "Saya sedang mendengarkan musik.",
        options: [
          { id: "a", text: "Saya menyukai musik" },
          { id: "b", text: "Saya sedang mendengarkan musik" },
          { id: "c", text: "Musiknya bagus sekali" },
          { id: "d", text: "Saya ingin mendengarkan musik" },
        ],
        correctOptionId: "b",
        explanation: "聴いて (kiite) adalah て-form dari 聴く (kiku = mendengarkan). ～ています = sedang ~.",
        xpReward: 10,
      },
      {
        id: "kt-q5",
        japanese: "窓を開けてください。",
        romaji: "Mado wo akete kudasai.",
        indonesian: "Tolong buka jendelanya.",
        options: [
          { id: "a", text: "Jendela sudah terbuka" },
          { id: "b", text: "Tolong tutup jendelanya" },
          { id: "c", text: "Saya membuka jendela" },
          { id: "d", text: "Tolong buka jendelanya" },
        ],
        correctOptionId: "d",
        explanation: "開けて (akete) adalah て-form dari 開ける (akeru = membuka). ～てください = tolong ~.",
        xpReward: 10,
      },
      {
        id: "kt-q6",
        japanese: "シャワーを浴びて、寝ます。",
        romaji: "Shawaa wo abite, nemasu.",
        indonesian: "Saya mandi, lalu tidur.",
        options: [
          { id: "a", text: "Saya tidur sebelum mandi" },
          { id: "b", text: "Saya mandi, lalu tidur" },
          { id: "c", text: "Saya tidak bisa tidur" },
          { id: "d", text: "Saya mandi setiap malam" },
        ],
        correctOptionId: "b",
        explanation: "浴びて (abite) adalah て-form dari 浴びる (abiru = mandi). Menghubungkan dua aksi berurutan.",
        xpReward: 10,
      },
      {
        id: "kt-q7",
        japanese: "日本語を勉強しています。",
        romaji: "Nihongo wo benkyou shite imasu.",
        indonesian: "Saya sedang belajar bahasa Jepang.",
        options: [
          { id: "a", text: "Saya ingin belajar bahasa Jepang" },
          { id: "b", text: "Saya sudah bisa bahasa Jepang" },
          { id: "c", text: "Saya sedang belajar bahasa Jepang" },
          { id: "d", text: "Bahasa Jepang itu sulit" },
        ],
        correctOptionId: "c",
        explanation: "勉強して (benkyou shite) adalah て-form dari 勉強する (benkyou suru = belajar). ～ています = sedang ~.",
        xpReward: 10,
      },
      {
        id: "kt-q8",
        japanese: "電気を消してください。",
        romaji: "Denki wo keshite kudasai.",
        indonesian: "Tolong matikan lampunya.",
        options: [
          { id: "a", text: "Tolong nyalakan lampunya" },
          { id: "b", text: "Lampu sudah mati" },
          { id: "c", text: "Tolong matikan lampunya" },
          { id: "d", text: "Lampu itu terang sekali" },
        ],
        correctOptionId: "c",
        explanation: "消して (keshite) adalah て-form dari 消す (kesu = mematikan/memadamkan). ～てください = tolong ~.",
        xpReward: 10,
      },
      {
        id: "kt-q9",
        japanese: "友達と話しています。",
        romaji: "Tomodachi to hanashite imasu.",
        indonesian: "Saya sedang berbicara dengan teman.",
        options: [
          { id: "a", text: "Saya ingin bicara dengan teman" },
          { id: "b", text: "Teman saya berbicara" },
          { id: "c", text: "Saya sedang berbicara dengan teman" },
          { id: "d", text: "Saya dan teman bertemu" },
        ],
        correctOptionId: "c",
        explanation: "話して (hanashite) adalah て-form dari 話す (hanasu = berbicara). ～ています = sedang ~.",
        xpReward: 10,
      },
      {
        id: "kt-q10",
        japanese: "手を洗ってから、食べます。",
        romaji: "Te wo aratte kara, tabemasu.",
        indonesian: "Setelah mencuci tangan, saya makan.",
        options: [
          { id: "a", text: "Setelah makan, saya cuci tangan" },
          { id: "b", text: "Setelah mencuci tangan, saya makan" },
          { id: "c", text: "Saya cuci tangan saja" },
          { id: "d", text: "Saya makan tanpa cuci tangan" },
        ],
        correctOptionId: "b",
        explanation: "洗って (aratte) adalah て-form dari 洗う (arau = mencuci). ～てから = setelah melakukan ~.",
        xpReward: 10,
      },
    ],
  },
  {
    id: "kosakata-sehari",
    title: "Kosakata Sehari-hari",
    titleJp: "語",
    category: "kosakata",
    categoryLabel: "Kosakata",
    estimatedMinutes: 10,
    locked: false,
    content: [
      "Kosakata dasar untuk percakapan sehari-hari dalam bahasa Jepang.",
      "Ekspresi salam: おはようございます (Ohayou gozaimasu) = Selamat pagi.",
      "Terima kasih: ありがとうございます (Arigatou gozaimasu) = Terima kasih.",
      "Minta maaf: すみません (Sumimasen) = Permisi/Maaf.",
      "Kata-kata penting: いくら (ikura) = berapa harga, どこ (doko) = di mana, いつ (itsu) = kapan.",
    ],
    quiz: [
      {
        id: "ks-q1",
        japanese: "おはようございます。",
        romaji: "Ohayou gozaimasu.",
        indonesian: "Selamat pagi.",
        options: [
          { id: "a", text: "Selamat siang" },
          { id: "b", text: "Selamat malam" },
          { id: "c", text: "Selamat pagi" },
          { id: "d", text: "Sampai jumpa" },
        ],
        correctOptionId: "c",
        explanation: "おはようございます (ohayou gozaimasu) digunakan sebagai salam di pagi hari.",
        xpReward: 10,
      },
      {
        id: "ks-q2",
        japanese: "ありがとうございます。",
        romaji: "Arigatou gozaimasu.",
        indonesian: "Terima kasih (banyak).",
        options: [
          { id: "a", text: "Permisi" },
          { id: "b", text: "Terima kasih (banyak)" },
          { id: "c", text: "Maaf" },
          { id: "d", text: "Sama-sama" },
        ],
        correctOptionId: "b",
        explanation: "ありがとうございます (arigatou gozaimasu) adalah ucapan terima kasih yang formal dan sopan.",
        xpReward: 10,
      },
      {
        id: "ks-q3",
        japanese: "すみません、トイレはどこですか。",
        romaji: "Sumimasen, toire wa doko desu ka.",
        indonesian: "Permisi, di mana toilet?",
        options: [
          { id: "a", text: "Tolong bantu saya ke toilet" },
          { id: "b", text: "Toilet ini bersih" },
          { id: "c", text: "Permisi, di mana toilet?" },
          { id: "d", text: "Saya pergi ke toilet" },
        ],
        correctOptionId: "c",
        explanation: "すみません (sumimasen) = permisi, トイレ (toire) = toilet, どこ (doko) = di mana.",
        xpReward: 10,
      },
      {
        id: "ks-q4",
        japanese: "いくらですか。",
        romaji: "Ikura desu ka.",
        indonesian: "Berapa harganya?",
        options: [
          { id: "a", text: "Apa ini?" },
          { id: "b", text: "Berapa harganya?" },
          { id: "c", text: "Ini mahal" },
          { id: "d", text: "Saya ingin membeli ini" },
        ],
        correctOptionId: "b",
        explanation: "いくら (ikura) = berapa (harga), ですか (desu ka) = kata tanya.",
        xpReward: 10,
      },
      {
        id: "ks-q5",
        japanese: "また来てください。",
        romaji: "Mata kite kudasai.",
        indonesian: "Tolong datang lagi.",
        options: [
          { id: "a", text: "Jangan datang lagi" },
          { id: "b", text: "Saya akan datang besok" },
          { id: "c", text: "Sampai jumpa lagi" },
          { id: "d", text: "Tolong datang lagi" },
        ],
        correctOptionId: "d",
        explanation: "また (mata) = lagi, 来て (kite) = て-form dari 来る (kuru = datang), ください = tolong.",
        xpReward: 10,
      },
      {
        id: "ks-q6",
        japanese: "わかりました。",
        romaji: "Wakarimashita.",
        indonesian: "Saya mengerti.",
        options: [
          { id: "a", text: "Saya tidak mengerti" },
          { id: "b", text: "Saya mengerti" },
          { id: "c", text: "Tolong jelaskan lagi" },
          { id: "d", text: "Saya lupa" },
        ],
        correctOptionId: "b",
        explanation: "わかりました (wakarimashita) adalah bentuk lampau dari わかる (wakaru = mengerti/paham).",
        xpReward: 10,
      },
      {
        id: "ks-q7",
        japanese: "お元気ですか。",
        romaji: "Ogenki desu ka.",
        indonesian: "Apa kabar?",
        options: [
          { id: "a", text: "Siapa namamu?" },
          { id: "b", text: "Dari mana kamu?" },
          { id: "c", text: "Apa kabar?" },
          { id: "d", text: "Berapa umurmu?" },
        ],
        correctOptionId: "c",
        explanation: "お元気 (ogenki) = sehat/baik-baik (dengan awalan hormat お), ですか = kalimat tanya.",
        xpReward: 10,
      },
      {
        id: "ks-q8",
        japanese: "少し待ってください。",
        romaji: "Sukoshi matte kudasai.",
        indonesian: "Tolong tunggu sebentar.",
        options: [
          { id: "a", text: "Tolong datang sebentar" },
          { id: "b", text: "Saya tunggu kamu" },
          { id: "c", text: "Tolong tunggu sebentar" },
          { id: "d", text: "Jangan pergi dulu" },
        ],
        correctOptionId: "c",
        explanation: "少し (sukoshi) = sedikit/sebentar, 待って (matte) = て-form dari 待つ (menunggu), ください = tolong.",
        xpReward: 10,
      },
      {
        id: "ks-q9",
        japanese: "おやすみなさい。",
        romaji: "Oyasumi nasai.",
        indonesian: "Selamat malam / Selamat tidur.",
        options: [
          { id: "a", text: "Selamat pagi" },
          { id: "b", text: "Selamat siang" },
          { id: "c", text: "Sampai jumpa besok" },
          { id: "d", text: "Selamat malam / Selamat tidur" },
        ],
        correctOptionId: "d",
        explanation: "おやすみなさい (oyasumi nasai) adalah salam malam hari, digunakan saat akan tidur.",
        xpReward: 10,
      },
      {
        id: "ks-q10",
        japanese: "よろしくお願いします。",
        romaji: "Yoroshiku onegaishimasu.",
        indonesian: "Saya mohon bimbingannya.",
        options: [
          { id: "a", text: "Selamat berkenalan" },
          { id: "b", text: "Saya mohon bimbingannya" },
          { id: "c", text: "Terima kasih atas bantuannya" },
          { id: "d", text: "Saya senang bertemu kamu" },
        ],
        correctOptionId: "b",
        explanation: "よろしくお願いします adalah ungkapan sopan saat perkenalan atau meminta tolong kepada seseorang.",
        xpReward: 10,
      },
    ],
  },
  {
    id: "kanji-n5",
    title: "Kanji Dasar JLPT N5",
    titleJp: "漢",
    category: "kanji",
    categoryLabel: "Kanji",
    estimatedMinutes: 12,
    locked: false,
    content: [
      "Kanji adalah karakter Cina yang diadaptasi ke dalam bahasa Jepang.",
      "JLPT N5 memerlukan penguasaan sekitar 100 kanji dasar.",
      "Kanji memiliki dua jenis bacaan: on'yomi (音読み) dan kun'yomi (訓読み).",
      "Contoh: 日 dibaca 'nichi/jitsu' (on) atau 'hi/ka' (kun). 日本語 dibaca 'nihongo'.",
      "Kanji dasar N5: 日, 月, 火, 水, 木, 金, 土 (hari dalam seminggu).",
    ],
    quiz: [
      {
        id: "kn-q1",
        japanese: "日曜日",
        romaji: "Nichiyoubi",
        indonesian: "Hari Minggu",
        options: [
          { id: "a", text: "Hari Senin" },
          { id: "b", text: "Hari Minggu" },
          { id: "c", text: "Hari Sabtu" },
          { id: "d", text: "Hari Jumat" },
        ],
        correctOptionId: "b",
        explanation: "日 (nichi) = matahari/hari, 曜 (you) = hari dalam seminggu, 日 (bi) = hari. 日曜日 = hari matahari = Minggu.",
        xpReward: 10,
      },
      {
        id: "kn-q2",
        japanese: "山",
        romaji: "Yama",
        indonesian: "Gunung",
        options: [
          { id: "a", text: "Laut" },
          { id: "b", text: "Sungai" },
          { id: "c", text: "Gunung" },
          { id: "d", text: "Hutan" },
        ],
        correctOptionId: "c",
        explanation: "山 (yama/san) berarti gunung. Contoh: 富士山 (Fujisan) = Gunung Fuji.",
        xpReward: 10,
      },
      {
        id: "kn-q3",
        japanese: "水",
        romaji: "Mizu",
        indonesian: "Air",
        options: [
          { id: "a", text: "Api" },
          { id: "b", text: "Angin" },
          { id: "c", text: "Tanah" },
          { id: "d", text: "Air" },
        ],
        correctOptionId: "d",
        explanation: "水 (mizu/sui) berarti air. 水曜日 (suiyoubi) = hari Rabu (hari air).",
        xpReward: 10,
      },
      {
        id: "kn-q4",
        japanese: "大学",
        romaji: "Daigaku",
        indonesian: "Universitas",
        options: [
          { id: "a", text: "Sekolah dasar" },
          { id: "b", text: "Universitas" },
          { id: "c", text: "Rumah sakit" },
          { id: "d", text: "Kantor" },
        ],
        correctOptionId: "b",
        explanation: "大 (dai) = besar, 学 (gaku) = belajar/ilmu. 大学 = institusi belajar besar = universitas.",
        xpReward: 10,
      },
      {
        id: "kn-q5",
        japanese: "人",
        romaji: "Hito",
        indonesian: "Orang",
        options: [
          { id: "a", text: "Orang" },
          { id: "b", text: "Anak" },
          { id: "c", text: "Teman" },
          { id: "d", text: "Keluarga" },
        ],
        correctOptionId: "a",
        explanation: "人 (hito/jin/nin) berarti orang/manusia. 日本人 (nihonjin) = orang Jepang.",
        xpReward: 10,
      },
      {
        id: "kn-q6",
        japanese: "本",
        romaji: "Hon",
        indonesian: "Buku",
        options: [
          { id: "a", text: "Pensil" },
          { id: "b", text: "Kertas" },
          { id: "c", text: "Buku" },
          { id: "d", text: "Tas" },
        ],
        correctOptionId: "c",
        explanation: "本 (hon) berarti buku. Juga berarti 'asli/asal' seperti dalam 日本 (Nihon) = Jepang (asal matahari).",
        xpReward: 10,
      },
      {
        id: "kn-q7",
        japanese: "月",
        romaji: "Tsuki/Gatsu",
        indonesian: "Bulan",
        options: [
          { id: "a", text: "Matahari" },
          { id: "b", text: "Bintang" },
          { id: "c", text: "Bulan" },
          { id: "d", text: "Langit" },
        ],
        correctOptionId: "c",
        explanation: "月 (tsuki/gatsu/gетsu) berarti bulan. 月曜日 (getsuyoubi) = hari Senin (hari bulan).",
        xpReward: 10,
      },
      {
        id: "kn-q8",
        japanese: "食べ物",
        romaji: "Tabemono",
        indonesian: "Makanan",
        options: [
          { id: "a", text: "Minuman" },
          { id: "b", text: "Makanan" },
          { id: "c", text: "Buah-buahan" },
          { id: "d", text: "Sayuran" },
        ],
        correctOptionId: "b",
        explanation: "食べ (tabe) dari 食べる (taberu = makan), 物 (mono) = benda/hal. 食べ物 = hal yang dimakan = makanan.",
        xpReward: 10,
      },
      {
        id: "kn-q9",
        japanese: "電車",
        romaji: "Densha",
        indonesian: "Kereta listrik",
        options: [
          { id: "a", text: "Mobil" },
          { id: "b", text: "Bus" },
          { id: "c", text: "Kereta listrik" },
          { id: "d", text: "Pesawat" },
        ],
        correctOptionId: "c",
        explanation: "電 (den) = listrik, 車 (sha/kuruma) = kendaraan/mobil. 電車 = kendaraan listrik = kereta listrik.",
        xpReward: 10,
      },
      {
        id: "kn-q10",
        japanese: "学校",
        romaji: "Gakkou",
        indonesian: "Sekolah",
        options: [
          { id: "a", text: "Sekolah" },
          { id: "b", text: "Perpustakaan" },
          { id: "c", text: "Toko" },
          { id: "d", text: "Rumah" },
        ],
        correctOptionId: "a",
        explanation: "学 (gaku) = belajar, 校 (kou) = institusi/sekolah. 学校 = tempat belajar = sekolah.",
        xpReward: 10,
      },
    ],
  },
];

export const BADGES: Badge[] = [
  {
    id: "first-lesson",
    title: "Pemula Bersemangat",
    description: "Selesaikan kuis pertama",
    iconName: "star",
    requirement: { type: "quizzes", value: 1 },
  },
  {
    id: "streak-3",
    title: "Streak 3 Hari",
    description: "Belajar 3 hari berturut-turut",
    iconName: "flame",
    requirement: { type: "streak", value: 3 },
  },
  {
    id: "xp-100",
    title: "Pengumpul XP",
    description: "Kumpulkan 100 XP",
    iconName: "trophy",
    requirement: { type: "xp", value: 100 },
  },
  {
    id: "xp-300",
    title: "Petarung XP",
    description: "Kumpulkan 300 XP",
    iconName: "medal",
    requirement: { type: "xp", value: 300 },
  },
  {
    id: "all-partikel",
    title: "Pejuang Partikel",
    description: "Lulus semua kuis Partikel",
    iconName: "ribbon",
    requirement: { type: "lessons", value: 2 },
  },
  {
    id: "nihongo-master",
    title: "Nihongo Scholar",
    description: "Lulus 4 kuis berbeda",
    iconName: "school",
    requirement: { type: "quizzes", value: 4 },
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    from: "Sensei Tanaka",
    role: "Dosen Bahasa Jepang",
    message: "Materi baru tentang Partikel に sudah tersedia. Selesaikan dulu materi は ya!",
    time: "2 jam lalu",
    read: false,
  },
  {
    id: "n2",
    from: "Sensei Yamamoto",
    role: "Dosen Konjugasi",
    message: "Jangan lupa berlatih て-form setiap hari. Konsistensi adalah kunci!",
    time: "1 hari lalu",
    read: false,
  },
  {
    id: "n3",
    from: "Sistem NIKU",
    role: "Notifikasi",
    message: "Selamat! Kamu sudah belajar selama 3 hari berturut-turut. Pertahankan streakmu!",
    time: "2 hari lalu",
    read: true,
  },
];

export const LEVEL_TITLES: { minXP: number; title: string; titleJp: string }[] = [
  { minXP: 0, title: "Pemula", titleJp: "初心者" },
  { minXP: 100, title: "Dasar", titleJp: "初級" },
  { minXP: 300, title: "Menengah", titleJp: "中級" },
  { minXP: 600, title: "Mahir", titleJp: "上級" },
  { minXP: 1000, title: "Master", titleJp: "先生" },
];

export function getLevelInfo(xp: number): { level: number; title: string; titleJp: string; nextLevelXP: number } {
  let level = 1;
  let title = LEVEL_TITLES[0].title;
  let titleJp = LEVEL_TITLES[0].titleJp;
  let nextLevelXP = LEVEL_TITLES[1].minXP;

  for (let i = 0; i < LEVEL_TITLES.length; i++) {
    if (xp >= LEVEL_TITLES[i].minXP) {
      level = i + 1;
      title = LEVEL_TITLES[i].title;
      titleJp = LEVEL_TITLES[i].titleJp;
      nextLevelXP = i + 1 < LEVEL_TITLES.length ? LEVEL_TITLES[i + 1].minXP : LEVEL_TITLES[i].minXP;
    }
  }
  return { level, title, titleJp, nextLevelXP };
}
