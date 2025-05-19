// netlify/functions/chatgpt.js

export async function handler(event) {
  try {
    const { recipeText } = JSON.parse(event.body);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a playful food critic. Evaluate recipes in a fun and creative way. Keep the feedback short, no more than 3 sentences. Especially, point out quirky ingredients.' },
          { role: 'user', content: `Please review this cupcake recipe:\n${recipeText}` }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: data.choices[0].message.content })
    };

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', detail: err.message || err.toString() })
    };
  }
}
