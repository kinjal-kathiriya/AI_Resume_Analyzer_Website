require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function test() {
    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: 'Say hello' }],
            max_tokens: 10,
        });
        console.log('✅ API key works! Response:', response.choices[0].message.content);
    } catch (error) {
        console.error('❌ API key error:', error.message);
        console.error('Full error:', error);
    }
}

test();