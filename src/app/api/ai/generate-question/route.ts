import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bundledQuestions from '@/data/questions.json';

interface QuestionItem {
  id?: string;
  category: string;
  question: string;
  options: string[];
}

// Function to load the 50 questions from questions.json (with bundled fallback)
function loadFallbackBank(): QuestionItem[] {
  try {
    const rootPath = path.join(process.cwd(), 'questions.json');
    if (fs.existsSync(rootPath)) {
      const content = fs.readFileSync(rootPath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read root questions.json, using bundled data:', err);
  }

  return bundledQuestions as QuestionItem[];
}

import { inferFallbackAvatar } from '@/lib/dicebear';
import { AvatarConfig } from '@/types/quiz';

const DICEBEAR_CATALOG = [
  {
    style: "fun-emoji",
    tags: ["humor", "emotions", "social", "reactions", "embarrassing", "fun", "dating"],
    description: "Expressive 2D emoji faces. Great for quirky personal habits, funny memories, and emotions.",
    seed_guidance: "Use emotional descriptors like: 'crying-laughing', 'shocked', 'blushing', 'sleepy', 'cool'"
  },
  {
    style: "icons",
    tags: ["food", "beverages", "tools", "everyday-objects", "habits", "travel", "sports", "tech"],
    description: "Crisp monochrome geometric icon glyphs. Ideal for literal items like coffee, bikes, books, and cameras.",
    seed_guidance: "Use concrete noun keys: 'cupHot', 'bicycle', 'camera', 'book', 'briefcase', 'heart', 'car'"
  },
  {
    style: "notionists",
    tags: ["work", "habits", "college", "reading", "personality", "routine", "minimal"],
    description: "Notion-inspired minimalist black-and-white character sketches.",
    seed_guidance: "Use character vibes: 'scholar', 'night-owl', 'overthinker', 'coffee-drinker'"
  },
  {
    style: "lorelei",
    tags: ["childhood", "looks", "fashion", "appearance", "romance", "friends"],
    description: "Charming modern illustrated human portraits with diverse hairstyles and smiles.",
    seed_guidance: "Use persona names or styles: 'vintage', 'curly-hair', 'cheerful', 'gamer'"
  },
  {
    style: "bottts",
    tags: ["gaming", "tech", "nerd-culture", "automation", "sci-fi", "quirks"],
    description: "Playful customizable robots.",
    seed_guidance: "Use robotic names or quirks: 'glitch', 'retro-bot', 'pixel', 'cyborg'"
  },
  {
    style: "thumbs",
    tags: ["opinions", "guilty-pleasures", "hot-takes", "agreements", "debates"],
    description: "Animated thumb characters with expressions giving approvals and reactions.",
    seed_guidance: "Use attitude tags: 'thumbs-up', 'clumsy', 'proud', 'confused'"
  },
  {
    style: "shapes",
    tags: ["abstract", "nostalgia", "random", "philosophical", "deep-talk"],
    description: "Soft geometric abstract art tiles.",
    seed_guidance: "Use abstract words: 'calm', 'vibrant', 'mystery', 'midnight'"
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { creatorName = 'I', previousQuestions = [], topicCategory } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Attempt Gemini 3.8 Flash with a strict 10-second timeout
    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
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
4. Provide a witty, funny remark in "suggestedRemarks" from ${creatorName}'s perspective explaining or joking about the correct choice.
5. Choose an appropriate DiceBear avatar for the Question ("avatar") and for EACH of the 4 options ("optionAvatars" array with 4 items).
Use this DiceBear catalog to pick the best style and seed for the question and options:
${JSON.stringify(DICEBEAR_CATALOG, null, 2)}
Valid styles are strictly: "fun-emoji" | "icons" | "notionists" | "lorelei" | "bottts" | "thumbs" | "shapes".
Seeds should follow the catalog's seed_guidance (e.g. 'crying-laughing', 'cupHot', 'overthinker', 'cheerful', 'pixel', 'thumbs-up', 'midnight').
6. Do NOT duplicate or closely rephrase any of these previous questions: ${JSON.stringify(previousQuestions)}.
7. Return strictly structured JSON matching the schema.
`;

      const candidateModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'];

      // Wrap Gemini generation with a strict 10-second timeout promise
      const generateWithGemini = async () => {
        for (const model of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model,
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
                    avatar: {
                      type: Type.OBJECT,
                      description: 'DiceBear avatar for the overall question',
                      properties: {
                        style: {
                          type: Type.STRING,
                          description: 'One of the 7 DiceBear styles',
                        },
                        seed: {
                          type: Type.STRING,
                          description: 'Keyword/descriptor seed for the avatar',
                        },
                      },
                      required: ['style', 'seed'],
                    },
                    optionAvatars: {
                      type: Type.ARRAY,
                      minItems: 4,
                      maxItems: 4,
                      description: 'Array of exactly 4 DiceBear avatars corresponding to each of the 4 options',
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          style: {
                            type: Type.STRING,
                            description: 'One of the 7 DiceBear styles',
                          },
                          seed: {
                            type: Type.STRING,
                            description: 'Keyword/descriptor seed for the option avatar',
                          },
                        },
                        required: ['style', 'seed'],
                      },
                    },
                    suggestedCategory: {
                      type: Type.STRING,
                      description: 'Theme category of the question',
                    },
                    suggestedRemarks: {
                      type: Type.STRING,
                      description: 'A witty remark or commentary from the creator about the true answer',
                    },
                  },
                  required: ['question', 'options', 'avatar', 'optionAvatars'],
                },
              },
            });

            const data = JSON.parse(response.text || '{}');
            if (data.question && Array.isArray(data.options) && data.options.length === 4) {
              return {
                ...data,
                modelUsed: model,
                isFallback: false,
              };
            }
          } catch (modelError: any) {
            console.warn(`Model ${model} failed, attempting next candidate:`, modelError.message);
          }
        }
        throw new Error('All Gemini models failed to generate content');
      };

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API generation timed out after 10 seconds')), 10000)
      );

      try {
        const geminiResult = await Promise.race([generateWithGemini(), timeoutPromise]);
        return NextResponse.json(geminiResult);
      } catch (geminiError: any) {
        console.warn('Gemini generation failed or timed out:', geminiError.message);
        console.log('Switching to fast local questions.json fallback with inferred avatars...');
      }
    }

    // 2. Fallback: Select a question randomly from the 50 questions in questions.json
    const questionsBank = loadFallbackBank();

    // Filter out questions already in previousQuestions
    const available = questionsBank.filter((item) => {
      const qLower = item.question.toLowerCase();
      return !previousQuestions.some((prev: string) => {
        const pLower = prev.toLowerCase();
        return qLower.includes(pLower.slice(0, 25)) || pLower.includes(qLower.slice(0, 25));
      });
    });

    const pool = available.length > 0 ? available : questionsBank;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    // Personalize question with creatorName if applicable
    let customizedQuestion = picked.question;
    const trimmedName = creatorName.trim();
    if (trimmedName && !['i', 'me', 'my'].includes(trimmedName.toLowerCase())) {
      customizedQuestion = picked.question
        .replace(/\bmy\b/g, `${trimmedName}'s`)
        .replace(/\bMy\b/g, `${trimmedName}'s`)
        .replace(/\bI\b/g, trimmedName)
        .replace(/\bme\b/g, trimmedName);
    }

    // Infer DiceBear avatars for fallback question and each of its 4 options
    const questionAvatar: AvatarConfig = inferFallbackAvatar(customizedQuestion, picked.category);
    const optionAvatars: AvatarConfig[] = picked.options.map((opt) =>
      inferFallbackAvatar(opt, picked.category)
    );

    return NextResponse.json({
      question: customizedQuestion,
      options: picked.options,
      avatar: questionAvatar,
      optionAvatars: optionAvatars,
      suggestedCategory: picked.category,
      suggestedRemarks: `This is 100% true about me! Real friends know the story behind this.`,
      isFallback: true,
      fallbackSource: 'questions.json',
    });
  } catch (error: any) {
    console.error('AI question generation route error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question', details: error.message },
      { status: 500 }
    );
  }
}

