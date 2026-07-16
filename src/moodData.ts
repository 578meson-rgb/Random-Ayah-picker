export interface MoodPreset {
  surah: number;
  ayah: number;
}

export interface MoodInfo {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  presets: MoodPreset[];
}

export const MOODS_LIST: MoodInfo[] = [
  {
    id: "grateful",
    name: "Grateful & Happy",
    emoji: "😊",
    color: "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/50 hover:border-emerald-300",
    description: "Channel your joy and express gratitude for your blessings.",
    presets: [
      { surah: 14, ayah: 7 },   // Ibrahim:7 "If you are grateful, I will surely increase you..."
      { surah: 55, ayah: 60 },  // Ar-Rahman:60 "Is the reward for good anything but good?"
      { surah: 93, ayah: 11 },  // Ad-Duha:11 "And as for the favor of your Lord, report [it]."
      { surah: 2, ayah: 152 },  // Al-Baqarah:152 "So remember Me; I will remember you. And be grateful..."
      { surah: 39, ayah: 66 },  // Az-Zumar:66 "Rather, worship Allah [alone] and be among the grateful."
      { surah: 31, ayah: 12 },  // Luqman:12 "And We had certainly given Luqman wisdom... 'Be grateful to Allah'..."
      { surah: 27, ayah: 19 },  // An-Naml:19 Solomon's prayer: "My Lord, enable me to be grateful for Your favor..."
      { surah: 34, ayah: 13 },  // Saba:13 "...And few of My servants are grateful."
    ]
  },
  {
    id: "sad",
    name: "Sad & Grieving",
    emoji: "😢",
    color: "bg-blue-50/70 border-blue-200/80 text-blue-900 hover:bg-blue-100/50 hover:border-blue-300",
    description: "Seeking comfort, reassurance, and emotional healing during heavy times.",
    presets: [
      { surah: 9, ayah: 40 },   // At-Tawbah:40 "Do not grieve; indeed Allah is with us."
      { surah: 3, ayah: 139 },  // Ali 'Imran:139 "So do not weaken and do not grieve, for you will be superior..."
      { surah: 12, ayah: 86 },  // Yusuf:86 "I only complain of my suffering and my grief to Allah..."
      { surah: 94, ayah: 5 },   // Ash-Sharh:5 "For indeed, with hardship [will be] ease."
      { surah: 94, ayah: 6 },   // Ash-Sharh:6 "Indeed, with hardship [will be] ease."
      { surah: 2, ayah: 156 },  // Al-Baqarah:156 "Who, when disaster strikes them, say, 'Indeed we belong to Allah...'"
      { surah: 2, ayah: 155 },  // Al-Baqarah:155 "And We will surely test you with something of fear and hunger and a loss of wealth..."
      { surah: 35, ayah: 34 },  // Fatir:34 "And they will say, 'Praise to Allah, who has removed from us [all] sorrow...'"
    ]
  },
  {
    id: "anxious",
    name: "Anxious & Stressed",
    emoji: "😰",
    color: "bg-amber-50/70 border-amber-200/80 text-amber-900 hover:bg-amber-100/50 hover:border-amber-300",
    description: "Calming a busy mind, finding peace, and placing trust in God's plan.",
    presets: [
      { surah: 13, ayah: 28 },  // Ar-Ra'd:28 "Unquestionably, by the remembrance of Allah hearts find rest."
      { surah: 2, ayah: 286 },  // Al-Baqarah:286 "Allah does not burden a soul beyond that it can bear..."
      { surah: 20, ayah: 25 },  // Taha:25 "My Lord, expand for me my breast [with assurance]"
      { surah: 65, ayah: 3 },   // At-Talaq:3 "And whoever relies upon Allah - then He is sufficient for him."
      { surah: 3, ayah: 173 },  // Ali 'Imran:173 "Sufficient for us is Allah, and [He is] the best Disposer of affairs."
      { surah: 2, ayah: 186 },  // Al-Baqarah:186 "When My servants ask you concerning Me, indeed I am near..."
      { surah: 8, ayah: 30 },   // Al-Anfal:30 "And Allah is the best of planners."
      { surah: 57, ayah: 22 },  // Al-Hadid:22 "No disaster strikes upon the earth or among yourselves except that it is in a register..."
    ]
  },
  {
    id: "demotivated",
    name: "Demotivated & Weak",
    emoji: "😔",
    color: "bg-purple-50/70 border-purple-200/80 text-purple-900 hover:bg-purple-100/50 hover:border-purple-300",
    description: "Re-igniting hope, reminding yourself of your purpose, and finding energy.",
    presets: [
      { surah: 39, ayah: 53 },  // Az-Zumar:53 "Say, 'O My servants who have transgressed... do not despair of the mercy of Allah...'"
      { surah: 12, ayah: 87 },  // Yusuf:87 "...and despair not of relief from Allah. Indeed, no one despairs..."
      { surah: 2, ayah: 214 },  // Al-Baqarah:214 "...When will the help of Allah come? Unquestionably, the help of Allah is near."
      { surah: 29, ayah: 69 },  // Al-Ankabut:69 "And those who strive for Us - We will surely guide them to Our ways..."
      { surah: 3, ayah: 159 },  // Ali 'Imran:159 "And when you have decided, then rely upon Allah..."
      { surah: 40, ayah: 60 },  // Ghafir:60 "Call upon Me; I will respond to you."
      { surah: 94, ayah: 1 },   // Ash-Sharh:1 "Did We not expand for you, [O Muhammad], your breast?"
      { surah: 3, ayah: 200 },  // Ali 'Imran:200 "O you who have believed, persevere and endure and remain station..."
    ]
  },
  {
    id: "angry",
    name: "Angry & Impatient",
    emoji: "😠",
    color: "bg-red-50/70 border-red-200/80 text-red-900 hover:bg-red-100/50 hover:border-red-300",
    description: "Restraining anger, developing patience, and restoring inner calmness.",
    presets: [
      { surah: 3, ayah: 134 },  // Ali 'Imran:134 "Who spend [in the cause of Allah]... and who restrain anger..."
      { surah: 42, ayah: 37 },  // Ash-Shura:37 "And when they are angry, they forgive."
      { surah: 103, ayah: 3 },  // Al-Asr:3 "...and advised each other to truth and advised each other to patience."
      { surah: 16, ayah: 127 }, // An-Nahl:127 "And be patient, and your patience is not but through Allah..."
      { surah: 2, ayah: 153 },  // Al-Baqarah:153 "O you who have believed, seek help through patience and prayer..."
      { surah: 41, ayah: 34 },  // Fussilat:34 "Repel [evil] by that [deed] which is better..."
      { surah: 8, ayah: 46 },   // Al-Anfal:46 "...And be patient. Indeed, Allah is with the patient."
      { surah: 31, ayah: 17 },  // Luqman:17 "...and be patient over what befalls you. Indeed, [all] that is of the matters..."
    ]
  },
  {
    id: "lost",
    name: "Lost & Seeking Direction",
    emoji: "🧭",
    color: "bg-teal-50/70 border-teal-200/80 text-teal-900 hover:bg-teal-100/50 hover:border-teal-300",
    description: "Seeking direction, clarity, and firm guidance when feelings are uncertain.",
    presets: [
      { surah: 93, ayah: 7 },   // Ad-Duha:7 "And He found you lost and guided [you]."
      { surah: 1, ayah: 6 },    // Al-Fatihah:6 "Guide us to the straight path."
      { surah: 2, ayah: 185 },  // Al-Baqarah:185 "The month of Ramadhan [is that] in which was revealed the Qur'an, a guidance..."
      { surah: 6, ayah: 162 },  // Al-An'am:162 "Say, 'Indeed, my prayer, my rites of sacrifice, my living and my dying...'"
      { surah: 5, ayah: 16 },   // Al-Ma'idah:16 "By which Allah guides those who pursue His pleasure to the ways of peace..."
      { surah: 10, ayah: 57 },  // Yunus:57 "O mankind, there has come to you an instruction... healing for what is in the breasts and guidance..."
      { surah: 3, ayah: 8 },    // Ali 'Imran:8 "[Who say], 'Our Lord, let not our hearts deviate after You have guided us...'"
      { surah: 29, ayah: 45 },  // Al-Ankabut:45 "Recite, what has been revealed to you of the Book and establish prayer..."
    ]
  }
];
