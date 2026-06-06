const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  pt: 'Portuguese',
  de: 'German',
  da: 'Danish',
  es: 'Spanish',
  it: 'Italian',
};

export const buildSystemPrompt = (style: string, tone: string, language: string = 'en', maxLength: number = 3000): string => {
  const langName = LANGUAGE_NAMES[language] || 'English';

  const styleInstructions: Record<string, string> = {
    formal: 'Use formal language, traditional structure, and professional vocabulary. Avoid contractions.',
    balanced: 'Use a mix of professional and approachable language. Be clear and concise.',
    creative: 'Use engaging, dynamic language with a modern touch. Show personality while remaining professional.',
  };

  const toneInstructions: Record<string, string> = {
    enthusiastic: 'Convey genuine excitement and passion for the opportunity.',
    confident: 'Project self-assurance and competence without arrogance.',
    humble: 'Show modesty while still highlighting relevant strengths.',
    assertive: 'Be direct and decisive about your qualifications and fit.',
  };

  return `You are an expert career coach and professional writer specializing in motivation/cover letters.

Your task is to write a compelling, personalized motivation letter based on the provided job description and candidate's CV.

CRITICAL: You MUST write the entire letter in ${langName}. Every single word of the output must be in ${langName}.

Requirements:
- ${styleInstructions[style] || styleInstructions.balanced}
- ${toneInstructions[tone] || toneInstructions.confident}
- STRICTLY limit the letter to a maximum of ${maxLength} characters (approximately one A4 page).
- Do NOT use markdown formatting (no asterisks, no bullet points, no headers).
- Output ONLY the letter text.
- The letter should be addressed "Dear Hiring Manager" or similar in ${langName}.
- Include a compelling opening, 2-3 body paragraphs, and a professional closing.
- Do NOT include the candidate's contact details in the body (those will be added separately).
- If additional context is provided, weave it naturally into the letter.
- For regeneration/variation requests, incorporate the user's specific instructions while maintaining the core message.`;
};

export const buildUserPrompt = (
  jobDescription: string,
  cvText: string,
  additionalContext: string,
  language: string = 'en',
  variationInstructions?: string,
  previousLetter?: string
): string => {
  const langName = LANGUAGE_NAMES[language] || 'English';

  let prompt = `Job Description:\n${jobDescription}\n\nCandidate's CV/Resume:\n${cvText}`;

  if (additionalContext) {
    prompt += `\n\nAdditional Context:\n${additionalContext}`;
  }

  if (previousLetter && variationInstructions) {
    prompt += `\n\nPrevious Letter:\n${previousLetter}\n\nVariation Instructions: ${variationInstructions}`;
  }

  prompt += `\n\nPlease write the motivation letter now. Remember: the entire letter MUST be written in ${langName}.`;

  return prompt;
};
