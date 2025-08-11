// Python Backend API Client
class PythonApiClient {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making request to: ${url}`, config);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const responseText = await response.text();
        try {
          // Try to parse the error response as JSON
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.detail || errorJson.error || `Request failed: ${response.status}`);
        } catch (e) {
          // If it's not JSON, the responseText itself is the error
          throw new Error(`Server error (${response.status}): ${responseText}`);
        }
      }
      
      // Handle successful responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log(`Python API response:`, data);
        return data;
      }
      
      // Handle cases where the response is not JSON
      return response.text();

    } catch (error) {
      console.error(`Python API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Assessment endpoints
  async generateAssessment(assessmentData) {
    // Transform frontend data to match Python backend schema
    const selectedTypes = this.getSelectedQuestionTypes(assessmentData.questionTypes);
    const questionDistribution = this.distributeQuestions(parseInt(assessmentData.numQuestions), selectedTypes);
    
    const pythonSchema = {
      test_title: assessmentData.title,
      grade_level: assessmentData.grade,
      subject: assessmentData.subject,
      topic: assessmentData.topic,
      assessment_type: selectedTypes.length === 1 ? this.mapSingleQuestionType(selectedTypes[0]) : 'Mixed',
      question_types: selectedTypes,
      question_distribution: questionDistribution,
      test_duration: `${assessmentData.duration} minutes`,
      number_of_questions: parseInt(assessmentData.numQuestions),
      difficulty_level: assessmentData.difficulty,
      user_prompt: this.buildUserPrompt(assessmentData),
      learning_objectives: assessmentData.learningObjectives || '',
      anxiety_triggers: assessmentData.anxietyTriggers || ''
    };

    console.log('Sending assessment request:', pythonSchema);
    return this.makeRequest('/assessment_endpoint', {
      method: 'POST',
      body: JSON.stringify(pythonSchema)
    });
  }

  // Content generation endpoints
  async generateContent(contentData) {
    // map frontend feature toggles to generator options
    const additional_ai_options = [];
    if (contentData.adaptiveLevel) additional_ai_options.push('adaptive difficulty');
    if (contentData.includeAssessment) additional_ai_options.push('include assessment');
    if (contentData.multimediaSuggestions) additional_ai_options.push('multimedia suggestion');

    const pythonSchema = {
      content_type: contentData.contentType.replace('-', ' '), // "lesson plan" | "worksheet" | "presentation" | "quiz"
      subject: contentData.subject,
      lesson_topic: contentData.topic,
      grade: `${contentData.grade}th Grade`,
      learning_objective: contentData.objectives || 'Not specified',
      emotional_consideration: contentData.emotionalFlags || 'None',
      // allow both old/new forms; backend accepts both via regex
      instructional_depth: contentData.instructionalDepth || 'standard',     // e.g., 'standard' | 'basic' | 'advanced' | 'low' | 'high'
      content_version: contentData.contentVersion || 'standard',             // e.g., 'standard' | 'simplified' | 'enriched' | 'low' | 'high'
      web_search_enabled: contentData.webSearchEnabled || true,
      additional_ai_options: additional_ai_options.length ? additional_ai_options : undefined,
    };

    console.log('Sending content request:', pythonSchema);
    return this.makeRequest('/teaching_content_endpoint', {
      method: 'POST',
      body: JSON.stringify(pythonSchema)
    });
  }

  // NEW: Presentation generation endpoint
  async generatePresentation(presentationData) {
    // Transform frontend data to match Python backend schema
    const pythonSchema = {
      plain_text: presentationData.topic,
      custom_user_instructions: presentationData.customInstructions || '',
      length: parseInt(presentationData.slideCount),
      language: presentationData.language || 'ENGLISH',
      fetch_images: presentationData.includeImages !== false,
      verbosity: presentationData.verbosity || 'standard'
    };

    console.log('Sending presentation request:', pythonSchema);
    return this.makeRequest('/presentation_endpoint', {
      method: 'POST',
      body: JSON.stringify(pythonSchema)
    });
  }

  // Chatbot endpoint
  async sendChatMessage(sessionId, query, files = [], history = [], webSearchEnabled = false) {
    const formData = new FormData();
    
    // Add request data
    formData.append('request', JSON.stringify({
      session_id: sessionId,
      query: query,
      history: history,
      web_search_enabled: webSearchEnabled
    }));

    // Add files if any
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append('files', file);
      });
    }

    return this.makeRequest('/chatbot_endpoint', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health', {
      method: 'GET'
    });
  }

  // Helper methods
  getSelectedQuestionTypes(questionTypes) {
    const selected = [];
    if (questionTypes.mcq) selected.push('mcq');
    if (questionTypes.true_false) selected.push('true_false');
    if (questionTypes.short_answer) selected.push('short_answer');
    return selected;
  }

  distributeQuestions(totalQuestions, questionTypes) {
    if (questionTypes.length === 1) {
      return { [questionTypes[0]]: totalQuestions };
    }

    const distribution = {};
    const questionsPerType = Math.floor(totalQuestions / questionTypes.length);
    const remainder = totalQuestions % questionTypes.length;

    questionTypes.forEach((type, index) => {
      distribution[type] = questionsPerType + (index < remainder ? 1 : 0);
    });

    return distribution;
  }

  mapSingleQuestionType(type) {
    const typeMap = {
      'mcq': 'MCQ',
      'true_false': 'True or False',
      'short_answer': 'Short Answer'
    };
    return typeMap[type] || 'MCQ';
  }

  buildUserPrompt(assessmentData) {
    let prompt = '';
    
    if (assessmentData.learningObjectives) {
      prompt += `Learning Objectives: ${assessmentData.learningObjectives}. `;
    }
    
    if (assessmentData.anxietyTriggers) {
      prompt += `Consider these anxiety factors: ${assessmentData.anxietyTriggers}. `;
    }
    
    if (assessmentData.customPrompt) {
      prompt += assessmentData.customPrompt;
    }
    
    return prompt || 'None.';
  }

  // Legacy method for backward compatibility
  mapQuestionTypesToPython(questionTypes) {
    if (questionTypes.true_false) return 'True or False';
    if (questionTypes.short_answer) return 'Short Answer';
    if (questionTypes.mcq) return 'MCQ';
    return 'MCQ'; // Default fallback
  }

  // Image generation endpoint
  async generateImage(imageData) {
    const pythonSchema = {
      topic: imageData.topic,
      grade_level: imageData.gradeLevel,
      preferred_visual_type: imageData.visualType, // 'image' | 'chart' | 'diagram'
      subject: imageData.subject,
      difficulty_flag: (imageData.difficultyFlag ? 'true' : 'false'),
      instructions: imageData.instructions,
    };

    console.log('Sending image generation request:', pythonSchema);
    return this.makeRequest('/image_generation_endpoint', {
      method: 'POST',
      body: JSON.stringify(pythonSchema),
    });
  }

  // Web search endpoint
  async runWebSearch(searchData) {
    const pythonSchema = {
      topic: searchData.topic,
      grade_level: searchData.gradeLevel,
      subject: searchData.subject,
      content_type: searchData.contentType, // e.g., 'articles', 'videos'
      language: searchData.language || 'English',
      comprehension: searchData.comprehension || 'intermediate',
      max_results: parseInt(searchData.maxResults),
    };

    console.log('Sending web search request:', pythonSchema);
    return this.makeRequest('/web_search_endpoint', {
      method: 'POST',
      body: JSON.stringify(pythonSchema),
    });
  }

  // Comics streaming: returns the raw fetch Response
  async startComicsStream(comicsData) {
    const url = `${this.baseUrl}/comics_stream_endpoint`;
    const payload = {
      instructions: comicsData.instructions,
      grade_level: comicsData.gradeLevel,
      num_panels: parseInt(comicsData.numPanels),
    };
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
}

export default new PythonApiClient(); 