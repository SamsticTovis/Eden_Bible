export type Mood = "happy" | "sad" | "anxious" | "grateful" | "angry" | "lonely" | "hopeful" | "tired";

export interface BibleVerse {
  text: string;
  reference: string;
  reflection: string;
}

export const moodEmojis: Record<Mood, string> = {
  happy: "😊", sad: "😢", anxious: "😰", grateful: "🙏",
  angry: "😤", lonely: "💙", hopeful: "🌅", tired: "😴",
};

export const moodLabels: Record<Mood, string> = {
  happy: "Joyful", sad: "Down", anxious: "Worried", grateful: "Thankful",
  angry: "Frustrated", lonely: "Lonely", hopeful: "Hopeful", tired: "Weary",
};

export const moodColors: Record<Mood, string> = {
  happy: "bg-secondary/10 border-secondary/20",
  sad: "bg-primary/10 border-primary/20",
  anxious: "bg-secondary/10 border-secondary/20",
  grateful: "bg-primary/10 border-primary/20",
  angry: "bg-destructive/10 border-destructive/20",
  lonely: "bg-primary/10 border-primary/20",
  hopeful: "bg-secondary/10 border-secondary/20",
  tired: "bg-muted/50 border-muted-foreground/20",
};

export const versesByMood: Record<Mood, BibleVerse[]> = {
  happy: [
    { text: "This is the day the Lord has made; let us rejoice and be glad in it.", reference: "Psalm 118:24", reflection: "Your joy is a gift from God. Let it overflow and bless everyone around you today!" },
    { text: "A cheerful heart is good medicine, but a crushed spirit dries up the bones.", reference: "Proverbs 17:22", reflection: "Keep that beautiful smile going — God delights in your happiness." },
    { text: "Rejoice always, pray continually, give thanks in all circumstances.", reference: "1 Thessalonians 5:16-18", reflection: "Channel this joy into gratitude. You're radiating God's light right now!" },
  ],
  sad: [
    { text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", reference: "Psalm 34:18", reflection: "You're not alone. God is sitting right beside you in this moment." },
    { text: "He heals the brokenhearted and binds up their wounds.", reference: "Psalm 147:3", reflection: "Let yourself feel, and know that healing is already on its way." },
    { text: "Weeping may stay for the night, but rejoicing comes in the morning.", reference: "Psalm 30:5", reflection: "This season won't last forever. Dawn is coming, friend." },
  ],
  anxious: [
    { text: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7", reflection: "Take a deep breath. You can literally hand your worries over to God right now." },
    { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", reference: "Philippians 4:6", reflection: "Try this: name one worry and consciously release it to God." },
    { text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives.", reference: "John 14:27", reflection: "God's peace isn't like a temporary fix — it goes deeper than any worry." },
  ],
  grateful: [
    { text: "Give thanks to the Lord, for he is good; his love endures forever.", reference: "Psalm 107:1", reflection: "Your grateful heart is beautiful. Keep noticing God's goodness!" },
    { text: "Every good and perfect gift is from above.", reference: "James 1:17", reflection: "Being thankful opens your eyes to see even more blessings. You're on the right track." },
    { text: "Enter his gates with thanksgiving and his courts with praise.", reference: "Psalm 100:4", reflection: "Gratitude is the gateway to God's presence. You're already there!" },
  ],
  angry: [
    { text: "In your anger do not sin. Do not let the sun go down while you are still angry.", reference: "Ephesians 4:26", reflection: "It's okay to feel angry — even Jesus did. The key is what you do with it." },
    { text: "A gentle answer turns away wrath, but a harsh word stirs up anger.", reference: "Proverbs 15:1", reflection: "Before you react, pause. Let God's gentleness flow through you." },
    { text: "Be still, and know that I am God.", reference: "Psalm 46:10", reflection: "Sometimes the bravest thing is to stop, breathe, and let God handle it." },
  ],
  lonely: [
    { text: "The Lord himself goes before you and will be with you; he will never leave you nor forsake you.", reference: "Deuteronomy 31:8", reflection: "Even when the room feels empty, God's presence fills every corner." },
    { text: "God sets the lonely in families.", reference: "Psalm 68:6", reflection: "Connection is coming. God sees your loneliness and is working on it." },
    { text: "I am with you always, to the very end of the age.", reference: "Matthew 28:20", reflection: "Jesus' last words to his friends were about never leaving. That includes you." },
  ],
  hopeful: [
    { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11", reflection: "Your hope is well-placed. God's plans for you are incredible!" },
    { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", reference: "Isaiah 40:31", reflection: "Keep holding on to that hope — you're about to soar!" },
    { text: "Now faith is confidence in what we hope for and assurance about what we do not see.", reference: "Hebrews 11:1", reflection: "Hope isn't wishful thinking — it's trust in God's promises. And He delivers." },
  ],
  tired: [
    { text: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28", reflection: "You have permission to rest. Jesus is literally inviting you to." },
    { text: "He gives strength to the weary and increases the power of the weak.", reference: "Isaiah 40:29", reflection: "You don't have to push through alone. Let God be your energy today." },
    { text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures.", reference: "Psalm 23:1-2", reflection: "Picture it: green pastures, still waters. That rest is available to you right now." },
  ],
};

export function getRandomVerse(mood: Mood): BibleVerse {
  const verses = versesByMood[mood];
  return verses[Math.floor(Math.random() * verses.length)];
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  funFact: string;
}

export const triviaQuestions: TriviaQuestion[] = [
  { question: "How many books are in the Bible?", options: ["64", "66", "70", "72"], correctIndex: 1, funFact: "39 in the Old Testament and 27 in the New Testament!" },
  { question: "Who built the ark?", options: ["Moses", "Abraham", "Noah", "David"], correctIndex: 2, funFact: "It took Noah about 75 years to build it!" },
  { question: "What's the shortest verse in the Bible?", options: ["Jesus wept", "God is love", "Pray always", "Be still"], correctIndex: 0, funFact: "John 11:35 — just two words, but so powerful!" },
  { question: "How many days did God take to create the world?", options: ["5", "6", "7", "10"], correctIndex: 1, funFact: "He rested on the 7th day — even God values rest!" },
  { question: "Who was swallowed by a big fish?", options: ["Jonah", "Peter", "Paul", "Daniel"], correctIndex: 0, funFact: "Jonah was inside the fish for 3 days and 3 nights!" },
  { question: "What are the first words in the Bible?", options: ["God said", "In the beginning", "The Lord is", "Let there be"], correctIndex: 1, funFact: "'In the beginning God created the heavens and the earth' — Genesis 1:1" },
  { question: "How many plagues did God send on Egypt?", options: ["7", "9", "10", "12"], correctIndex: 2, funFact: "The 10th plague — death of the firstborn — led to the first Passover." },
  { question: "Who defeated Goliath?", options: ["Saul", "David", "Jonathan", "Samuel"], correctIndex: 1, funFact: "David was just a teenager with a sling and five stones!" },
];
