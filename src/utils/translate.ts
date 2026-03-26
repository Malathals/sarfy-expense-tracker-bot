export const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

export const translateToEnglish = async (text: string): Promise<string> => {
  try {
    const apiKey = process.env['GEMINI_API_KEY'];
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate the following Arabic expense item to English. Reply with only the translated word or short phrase, nothing else.\n\n"${text}"`,
                },
              ],
            },
          ],
        }),
      }
    );
    const data = await res.json();
    console.log('Gemini raw response:', JSON.stringify(data));
    const translated = (data as { candidates: { content: { parts: { text: string }[] } }[] })
      .candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() ?? text;
    console.log(`Translated "${text}" to "${translated}"`);
    return translated;
  } catch (error) {
    console.error(`Translation failed for "${text}", using original text`);
    console.error(error);
    return text;
  }
};
