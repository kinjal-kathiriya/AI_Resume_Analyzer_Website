require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function testAPI() {
    try {
        console.log('Testing Groq API...');
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are a helpful assistant. Return a JSON with a "score" field.' },
                { role: 'user', content: 'Say hello and return {"score": 50}' }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });
        console.log('✅ API Response:', response.choices[0].message.content);
    } catch (error) {
        console.error('❌ API Error:', error.message);
        console.error('Full error:', error);
    }
}

testAPI();