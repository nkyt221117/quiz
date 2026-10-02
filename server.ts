import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '20mb' }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment.');
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint: Generate child riddle quiz
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { inputMode, targetName, category, imageData, mimeType, ageGroup = '3~5세' } = req.body;

    const systemInstruction = `당신은 3세, 5세 어린아이들과 함께 놀아주는 다정하고 유쾌한 유아용 "비밀 퀴즈쇼 MC" (랄라 MC)입니다.
사용자가 동물이나 음식 이름을 알려주거나 사진을 올리면, 아이들의 눈높이에 맞춘 다정한 수수께끼(퀴즈)를 만들어주세요.

[답변 작성 규칙]:
1. 힌트는 아이들이 쉽게 맞출 수 있도록 특징(소리, 색깔, 좋아하는 것, 움직임 등)을 담아 2~3줄의 다정한 구어체로 작성해주세요.
   (예: "나는 꿀을 아주 좋아하고, 숲속에서 곰돌이 인형처럼 걸어다녀요. 엉덩이를 씰룩쌜룩 흔들며 걸어요. 내가 누구일까요?")
2. 정답은 힌트 바로 아래에 적어두되, 사용자가 '정답 알기!' 버튼을 누르거나 물어볼 때 확실하게 공개되도록 [정답: OOO] 형태로 명확하게 구분해주세요.
3. 정답이 공개될 때 아이가 환호할 수 있도록 긍정적이고 신나는 멘트를 덧붙여주세요.

[출력 형식 규칙]:
formattedOutput 필드는 반드시 아래 형식을 정확하게 지켜야 합니다:
---
🎤 [비밀 퀴즈쇼 코너]
[아이 눈높이에 맞춘 다정한 2~3줄 수수께끼 힌트]

✨ [정답 확인 코너]
- 정답: [동물 또는 음식 이름]
- 해설 멘트: "와아! 정답은 바로 [OOO]였어요! 참 잘했어요 짝짝짝!"
---`;

    let contentsParts: any[] = [];

    if (inputMode === 'image' && imageData) {
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageData,
        },
      });
      contentsParts.push({
        text: `사진 속의 동물이나 음식(사물)을 인식하고, 3~5세 아이를 위한 다정하고 신나는 비밀 수수께끼 퀴즈쇼를 만들어주세요. 대상 연령: ${ageGroup}`,
      });
    } else if (inputMode === 'random') {
      const selectedCategory = category || 'animal_or_food';
      contentsParts.push({
        text: `3~5세 유아가 신나게 맞출 수 있는 재미있는 ${selectedCategory === 'animal' ? '동물' : selectedCategory === 'food' ? '음식/과일' : '동물 또는 맛있는 음식'} 하나를 비밀로 골라서, 멋진 비밀 퀴즈쇼 수수께끼를 만들어주세요. 대상 연령: ${ageGroup}`,
      });
    } else {
      contentsParts.push({
        text: `키워드: "${targetName || '토끼'}" (카테고리: ${category || '동물/음식'}). 이 대상에 대해 3~5세 아이들을 위한 비밀 퀴즈쇼 수수께끼를 만들어주세요. 대상 연령: ${ageGroup}`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contentsParts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            target: {
              type: Type.STRING,
              description: '정답인 동물 또는 음식 이름 (예: 호랑이, 사과, 강아지, 딸기)',
            },
            category: {
              type: Type.STRING,
              description: '카테고리 (동물, 음식, 과일, 탈것 등)',
            },
            emoji: {
              type: Type.STRING,
              description: '대상과 어울리는 귀여운 대표 이모지 1개',
            },
            riddle: {
              type: Type.STRING,
              description: '아이 눈높이에 맞춘 다정하고 생생한 2~3줄 구어체 수수께끼 힌트 (의성어, 의태어, 색깔 등 포함)',
            },
            praiseComment: {
              type: Type.STRING,
              description: '정답 공개 시 아이가 환호할 수 있는 긍정적이고 신나는 축하 해설 멘트 (예: "와아! 정답은 바로 [OOO]였어요! 참 잘했어요 짝짝짝!")',
            },
            formattedOutput: {
              type: Type.STRING,
              description: '요구된 정해진 텍스트 형식 (🎤 [비밀 퀴즈쇼 코너] ... ✨ [정답 확인 코너] ...)',
            },
            soundClue: {
              type: Type.STRING,
              description: '짧은 소리 또는 행동 힌트 (예: "어흥~! 용감한 줄무늬!", "새콤달콤 빨간 꼬마 요정!")',
            },
            curiosityTip: {
              type: Type.STRING,
              description: '아이들에게 들려줄 흥미롭고 귀여운 1문장 토막 지식 (예: "토끼는 귀가 쫑긋해서 멀리서 나는 소리도 잘 들어요!")',
            },
          },
          required: ['target', 'category', 'emoji', 'riddle', 'praiseComment', 'formattedOutput'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('AI 모델로부터 응답을 받지 못했습니다.');
    }

    const quizData = JSON.parse(text);
    return res.json({ success: true, data: quizData });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '퀴즈 생성 중 오류가 발생했습니다.',
    });
  }
});

// API endpoint: Text-to-speech for MC voice (using gemini-3.8-flash-lite-tts)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, style = 'cheerful child show host' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 300), // Keep concise for toddler riddle / praise
              speechMetadata: {
                style: `Korean preschool children quiz show host, bright, playful, loving, enthusiastic. ${style}`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Warm, clear voice
          },
        },
      },
    });

    const base64Audio =
      ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(502).json({ error: 'TTS audio data was not generated' });
    }

    return res.json({
      success: true,
      audioData: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    // Graceful fallback response so client can fall back to Web Speech API
    return res.status(500).json({
      success: false,
      error: error.message || 'TTS generation failed',
    });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: '우당탕탕 비밀 퀴즈쇼 MC' });
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
});
