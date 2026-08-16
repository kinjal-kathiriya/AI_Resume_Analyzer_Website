require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const app = express();

// Enable CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Check for API key
let groq = null;
try {
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-key-here') {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        console.log('✅ Groq API initialized');
    } else {
        console.log('⚠️ No Groq API key found. Using fallback mode.');
    }
} catch (error) {
    console.log('⚠️ Groq initialization failed. Using fallback mode.');
}

console.log('🚀 Running with REAL AI SCORING (Groq)');

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running!' });
});

app.post('/analyze', async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        
        console.log('📝 Analyzing resume with AI...');
        console.log('Resume length:', resumeText?.length || 0);
        console.log('JD length:', jobDescription?.length || 0);

        // If no Groq API key, use fallback
        if (!groq) {
            console.log('⚠️ No AI key, using fallback');
            return res.json(await getFallbackAnalysis(resumeText, jobDescription));
        }

        // --- REAL AI ANALYSIS ---
        const systemPrompt = `You are a Senior Technical Recruiter with 20 years of experience at top tech companies.
Your task is to analyze a candidate's resume against a job description and provide a detailed, honest assessment.

Analyze the resume and return a JSON object with these EXACT fields:
{
  "overall_match": number (0-100) - Overall fit for the role
  "jd_match": number (0-100) - How well skills/keywords align
  "technical_match": number (0-100) - Technical skills match
  "experience_match": number (0-100) - Experience relevance
  "education_match": number (0-100) - Education fit
  "clarity_match": number (0-100) - Resume quality and structure
  "matched_skills": array of strings - Skills found in both resume and JD
  "missing_skills": array of strings - Important skills from JD missing in resume
  "jd_keywords": array of strings - Top 5-7 key terms from the JD
  "suggestions": array of strings - 3-5 actionable improvements
  "title": string - Short headline summary
  "summary": string - Detailed 2-3 sentence summary
}

Be realistic. Consider:
- Years of experience vs. required
- Specific technologies mentioned
- Project quality and complexity
- Leadership or initiative shown
- Career progression
- Domain relevance (fintech, security, healthcare, etc.)
- Soft skills and communication

Return ONLY valid JSON.`;

        console.log('🔄 Calling Groq AI...');
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile', // ChatGPT-quality model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}` }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        console.log('📨 Received AI response');
        
        let result;
        try {
            result = JSON.parse(content);
        } catch (parseError) {
            console.error('❌ Failed to parse AI response:', parseError.message);
            console.log('Raw response:', content.substring(0, 200));
            // Use fallback if AI response is malformed
            return res.json(await getFallbackAnalysis(resumeText, jobDescription));
        }

        // Ensure all fields exist
        const defaultFields = {
            overall_match: 60,
            jd_match: 60,
            technical_match: 60,
            experience_match: 60,
            education_match: 60,
            clarity_match: 60,
            matched_skills: [],
            missing_skills: [],
            jd_keywords: [],
            suggestions: ['Review your resume for better alignment with the job description.'],
            title: 'Analysis Complete',
            summary: 'Your resume has been analyzed against the job description.'
        };

        // Merge with defaults
        result = { ...defaultFields, ...result };

        // Ensure numeric fields are numbers
        ['overall_match', 'jd_match', 'technical_match', 'experience_match', 'education_match', 'clarity_match'].forEach(field => {
            result[field] = Math.min(Math.max(Number(result[field]) || 60, 0), 100);
        });

        // Ensure arrays are arrays
        ['matched_skills', 'missing_skills', 'jd_keywords', 'suggestions'].forEach(field => {
            if (!Array.isArray(result[field])) result[field] = [];
        });

        // Trim arrays to reasonable size
        result.matched_skills = result.matched_skills.slice(0, 8);
        result.missing_skills = result.missing_skills.slice(0, 10);
        result.jd_keywords = result.jd_keywords.slice(0, 8);
        result.suggestions = result.suggestions.slice(0, 5);

        console.log('✅ AI Analysis complete!');
        console.log('📊 Overall score:', result.overall_match);
        console.log('📋 Matched:', result.matched_skills.length, 'Missing:', result.missing_skills.length);
        
        res.json(result);
    } catch (error) {
        console.error('❌ Server error:', error.message);
        // Fallback to keyword matching
        try {
            const fallback = await getFallbackAnalysis(req.body.resumeText, req.body.jobDescription);
            res.json(fallback);
        } catch (fallbackError) {
            // Ultimate fallback
            res.json({
                overall_match: 50,
                jd_match: 50,
                technical_match: 50,
                experience_match: 50,
                education_match: 50,
                clarity_match: 50,
                matched_skills: ['Error processing request'],
                missing_skills: ['Please try again'],
                jd_keywords: ['Error'],
                suggestions: [
                    'There was an error analyzing your resume.',
                    'Please try again or check your inputs.',
                    'Make sure you have a valid resume and JD.'
                ],
                title: 'Analysis Error',
                summary: 'An error occurred during analysis. Please try again.'
            });
        }
    }
});

// ─── FALLBACK ANALYSIS (Keyword-based, used when no AI key) ───
async function getFallbackAnalysis(resumeText, jobDescription) {
    const jdText = jobDescription || '';
    const jdLower = jdText.toLowerCase();
    const resumeLower = (resumeText || '').toLowerCase();

    // Skill database with weights
    const skillDatabase = [
        // Programming Languages
        { name: 'Python', weight: 10 },
        { name: 'JavaScript', weight: 8 },
        { name: 'Java', weight: 8 },
        { name: 'TypeScript', weight: 8 },
        { name: 'C++', weight: 6 },
        { name: 'Go', weight: 6 },
        { name: 'Rust', weight: 5 },
        { name: 'PHP', weight: 6 },
        { name: 'Ruby', weight: 5 },
        { name: 'Swift', weight: 6 },
        // Frameworks
        { name: 'React', weight: 8 },
        { name: 'Node.js', weight: 8 },
        { name: 'Express', weight: 7 },
        { name: 'Django', weight: 7 },
        { name: 'Flask', weight: 7 },
        { name: 'FastAPI', weight: 8 },
        { name: 'Next.js', weight: 7 },
        { name: 'Angular', weight: 6 },
        { name: 'Vue', weight: 6 },
        // Cloud
        { name: 'AWS', weight: 10 },
        { name: 'Azure', weight: 8 },
        { name: 'GCP', weight: 7 },
        { name: 'Docker', weight: 8 },
        { name: 'Kubernetes', weight: 8 },
        { name: 'Terraform', weight: 6 },
        { name: 'CI/CD', weight: 7 },
        // Databases
        { name: 'SQL', weight: 7 },
        { name: 'PostgreSQL', weight: 7 },
        { name: 'MongoDB', weight: 7 },
        { name: 'Redis', weight: 6 },
        { name: 'MySQL', weight: 6 },
        // APIs
        { name: 'REST API', weight: 7 },
        { name: 'GraphQL', weight: 6 },
        { name: 'WebSockets', weight: 6 },
        { name: 'Microservices', weight: 7 },
        // Data/ML
        { name: 'Machine Learning', weight: 8 },
        { name: 'AI', weight: 8 },
        { name: 'LLM', weight: 8 },
        { name: 'NLP', weight: 7 },
        { name: 'TensorFlow', weight: 7 },
        { name: 'PyTorch', weight: 7 },
        { name: 'Data Science', weight: 7 },
        { name: 'Pandas', weight: 6 },
        { name: 'PySpark', weight: 6 },
        { name: 'Data Pipelines', weight: 7 },
        // Security
        { name: 'Security', weight: 10 },
        { name: 'Cybersecurity', weight: 10 },
        { name: 'Threat Modeling', weight: 8 },
        { name: 'SOC', weight: 8 },
        { name: 'Compliance', weight: 7 },
        // Soft skills
        { name: 'Agile', weight: 5 },
        { name: 'Scrum', weight: 5 },
        { name: 'Leadership', weight: 6 },
        { name: 'Git', weight: 6 },
        { name: 'Project Management', weight: 5 },
    ];

    // Extract JD keywords
    const jdKeywords = [];
    const jdWeights = {};
    
    skillDatabase.forEach(skill => {
        const skillLower = skill.name.toLowerCase();
        const variations = {
            'Python': ['python', 'py'],
            'JavaScript': ['javascript', 'js'],
            'TypeScript': ['typescript', 'ts'],
            'React': ['react', 'react.js', 'reactjs'],
            'Node.js': ['node', 'node.js', 'nodejs'],
            'SQL': ['sql', 'mysql', 'postgresql'],
            'Docker': ['docker', 'container'],
            'Kubernetes': ['kubernetes', 'k8s'],
            'Machine Learning': ['machine learning', 'ml'],
            'AI': ['ai', 'artificial intelligence'],
            'LLM': ['llm', 'large language model'],
            'REST API': ['rest', 'rest api', 'api']
        };
        
        const toCheck = [skillLower, ...(variations[skill.name] || [])];
        for (const variant of toCheck) {
            if (jdLower.includes(variant) && !jdKeywords.includes(skill.name)) {
                jdKeywords.push(skill.name);
                jdWeights[skill.name] = skill.weight;
                break;
            }
        }
    });

    if (jdKeywords.length === 0) {
        // Extract frequent words from JD
        const words = jdText.toLowerCase().replace(/[^a-z0-9#+]/g, ' ').split(/\s+/);
        const freq = {};
        const stopWords = ['the','and','for','with','you','are','have','from','they','will','can','our','your','about','this','that'];
        words.forEach(w => {
            if (w.length > 3 && !stopWords.includes(w)) {
                freq[w] = (freq[w] || 0) + 1;
            }
        });
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        const topWords = sorted.slice(0, 8).map(entry => entry[0]);
        topWords.forEach(word => {
            jdKeywords.push(word.charAt(0).toUpperCase() + word.slice(1));
            jdWeights[word.charAt(0).toUpperCase() + word.slice(1)] = 5;
        });
    }

    // Check which skills are in resume
    const matchedSkills = [];
    const missingSkills = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    jdKeywords.forEach(skill => {
        const weight = jdWeights[skill] || 5;
        totalWeight += weight;
        if (resumeLower.includes(skill.toLowerCase())) {
            matchedSkills.push(skill);
            matchedWeight += weight;
        } else {
            missingSkills.push(skill);
        }
    });

    const jdMatchScore = totalWeight > 0 ? Math.min(Math.round((matchedWeight / totalWeight) * 100), 95) : 0;
    const overall = Math.min(Math.max(jdMatchScore + 5, 30), 95);

    // Generate suggestions
    const suggestions = [];
    if (missingSkills.length > 0) {
        suggestions.push(`Add these skills to your resume: ${missingSkills.slice(0, 3).join(', ')}.`);
        suggestions.push(`You're missing ${missingSkills.length} key skill${missingSkills.length>1?'s':''} from this job description.`);
    }
    if (matchedSkills.length > 0) {
        suggestions.push(`✅ Your resume includes: ${matchedSkills.slice(0, 3).join(', ')}.`);
    }
    if (suggestions.length === 0) {
        suggestions.push('Your resume is well-aligned with the job description!');
        suggestions.push('Consider adding quantifiable achievements and metrics.');
    }

    return {
        overall_match: overall,
        jd_match: jdMatchScore,
        technical_match: Math.min(Math.max(jdMatchScore + 5, 30), 90),
        experience_match: Math.min(Math.max(jdMatchScore - 3, 25), 85),
        education_match: Math.min(Math.max(jdMatchScore + 10, 40), 95),
        clarity_match: Math.min(Math.max(jdMatchScore + 3, 35), 90),
        matched_skills: matchedSkills.slice(0, 8),
        missing_skills: missingSkills.slice(0, 10),
        jd_keywords: jdKeywords.slice(0, 8),
        suggestions: suggestions.slice(0, 4),
        title: overall >= 75 ? 'Strong Match!' : overall >= 60 ? 'Good Fit' : 'Needs Improvement',
        summary: `${matchedSkills.length} of ${jdKeywords.length} keywords matched (${jdMatchScore}% match). ${overall >= 75 ? 'Excellent alignment!' : overall >= 60 ? 'Good alignment overall.' : 'Consider adding missing skills to improve your match.'}`
    };
}

// ─── 404 Handler ────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Start Server ──────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    if (groq) {
        console.log('🧠 AI Mode: ENABLED (Groq)');
        console.log('📊 Scoring: AI-powered (like ChatGPT)');
    } else {
        console.log('🧠 AI Mode: DISABLED (using fallback)');
        console.log('📊 Scoring: Keyword-based (basic)');
        console.log('💡 Add GROQ_API_KEY to .env for real AI scoring');
    }
});