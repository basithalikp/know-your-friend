import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

// Smart offline fallback questions if no API key is provided
const FALLBACK_BANK = [
  {
    category: 'comfort food and guilty pleasures',
    question: "What is my absolute go-to comfort meal when I've had a chaotic day?",
    options: ["Extra-cheesy deep dish pizza", "Spicy ramen with extra egg", "Late-night street tacos with extra lime", "Double cheeseburger and fries"],
  },
  {
    category: 'quirks and daily habits',
    question: "Which of these weird daily habits am I most guilty of?",
    options: ["Having 47 open tabs and refusing to close any", "Setting 7 alarms 3 minutes apart", "Starting 3 cups of coffee and finishing none", "Pacing in circles while talking on the phone"],
  },
  {
    category: 'travel stories and vacations',
    question: "What would my biggest vacation disaster look like?",
    options: ["Forgetting my passport at home", "Accidentally booking a non-refundable hostel with 12 bunk beds", "Getting terrible food poisoning on day one", "Losing my phone in the ocean"],
  },
  {
    category: 'hypothetical reactions',
    question: "If a zombie apocalypse broke out right now, what would I do first?",
    options: ["Raid the nearest convenience store for snacks", "Try to negotiate or befriend the zombies", "Find the tallest roof and panic quietly", "Take tactical charge and establish a fortress"],
  },
  {
    category: 'pet peeves and red flags',
    question: "What is guaranteed to make me roll my eyes immediately?",
    options: ["Chewing loudly with an open mouth", "Leaving people on 'Read' for days", "Walking super slowly in the middle of the sidewalk", "Spoiling movie endings before I watch them"],
  },
  {
    category: 'late night cravings',
    question: "It's 1:30 AM on a Friday. What am I most likely doing?",
    options: ["Deep-diving a bizarre Wikipedia rabbit hole", "Rewatching a sitcom for the 5th time", "Snacking on whatever is in the fridge", "Asleep with my phone still on my chest"],
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { creatorName = 'I', previousQuestions = [], topicCategory } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is available, use real Gemini 2.5 Flash
    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const categories = [
          'quirks and daily habits',
          'comfort food and guilty pleasures',
          'travel stories and vacation nightmares',
          'hypothetical panic reactions',
          'pet peeves and red flags',
          'childhood dreams vs current reality',
          'favorite late night cravings',
        ];

        const selectedCategory = topicCategory || categories[Math.floor(Math.random() * categories.length)];

        const prompt = `
You are creating a fun, engaging, and witty "How well do you know me?" friend quiz for ${creatorName}.
Category: ${selectedCategory}.

Rules:
1. Generate 1 realistic, humorous trivia question specifically focused on ${creatorName}'s personality, habits, or preferences.
2. Provide exactly 4 plausible, distinct answer choices that friends would genuinely debate over.
3. Keep the choices concise (under 12 words each).
4. Do NOT duplicate or closely rephrase any of these previous questions: ${JSON.stringify(previousQuestions)}.
5. Return strictly structured JSON matching the schema.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: 'The trivia question about the creator',
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  minItems: 4,
                  maxItems: 4,
                  description: 'Array of exactly 4 plausible options',
                },
                suggestedCategory: {
                  type: Type.STRING,
                  description: 'Theme category of the question',
                },
              },
              required: ['question', 'options'],
            },
          },
        });

        const data = JSON.parse(response.text || '{}');
        if (data.question && Array.isArray(data.options) && data.options.length === 4) {
          return NextResponse.json(data);
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to smart bank:', geminiError.message);
      }
    }

    // Fallback: Pick an unused question from the bank
    const available = FALLBACK_BANK.filter(
      (item) => !previousQuestions.some((prev: string) => prev.toLowerCase().includes(item.question.slice(0, 20).toLowerCase()))
    );

    const pool = available.length > 0 ? available : FALLBACK_BANK;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    // Customize question with creatorName if applicable
    const customizedQuestion = picked.question.replace(/\b(my|I)\b/gi, (match) => {
      return match.toLowerCase() === 'my' ? `${creatorName}'s` : creatorName;
    });

    return NextResponse.json({
      question: customizedQuestion,
      options: picked.options,
      suggestedCategory: picked.category,
      isFallback: !apiKey,
    });
  } catch (error: any) {
    console.error('AI question generation route error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question', details: error.message },
      { status: 500 }
    );
  }
}
