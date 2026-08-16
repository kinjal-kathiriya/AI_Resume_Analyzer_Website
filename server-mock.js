require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

app.post('/analyze', (req, res) => {
    const data = {
        overall_match: 68,
        jd_match: 70,
        technical_match: 72,
        experience_match: 65,
        education_match: 60,
        clarity_match: 75,
        matched_skills: ['Python', 'API', 'SQL', 'Cloud'],
        missing_skills: ['Security Pipelines', 'Threat Modeling', 'Prompt Engineering'],
        jd_keywords: ['Python', 'Data Connectors', 'Cybersecurity', 'AI', 'Cloud'],
        suggestions: [
            'Add specific experience with security data pipelines.',
            'Highlight any AI/LLM projects you\'ve worked on.',
            'Quantify your impact (e.g., "processed 1M+ records").',
            'Mention any threat modeling or security certifications.'
        ],
        title: 'Strong fit, but needs security specialization',
        summary: 'The candidate has solid Python and engineering background, but needs more security-specific experience.'
    };
    res.json(data);
});

app.listen(3000, () => console.log('✅ Mock server running on port 3000'));