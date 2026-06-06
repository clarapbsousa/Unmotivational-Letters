export const generateLetterViaProxy = async (
  messages: { role: string; content: string }[]
): Promise<string> => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate letter');
  }

  return data.choices[0]?.message?.content || '';
};
