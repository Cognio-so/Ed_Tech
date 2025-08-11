import { NextResponse } from 'next/server';
import pythonApi from '@/lib/pythonApi';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    console.log('Generating assessment with data:', body);
    
    const result = await pythonApi.generateAssessment(body);
    
    console.log('Python API result:', result);
    
    const { questions, solutions } = parseAssessmentContent(result.assessment, body.questionTypes);
    
    // Include all required fields from the schema
    return NextResponse.json({
      success: true,
      questions,
      solutions,
      rawContent: result.assessment,
      title: body.title,
      grade: body.grade,
      subject: body.subject,
      duration: parseInt(body.duration),
      status: 'draft',
      clerkId: userId  // Include the clerkId
    });
  } catch (error) {
    console.error('Assessment generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}

function parseAssessmentContent(content, selectedQuestionTypes = {}) {
    const questions = [];
    const solutions = [];
    const answerKey = {};

    const separatorRegex = /---\s*(\r\n|\n)+\s*\*\*Solutions\*\*/i;
    const match = content.match(separatorRegex);

    let questionsPart = content;
    let solutionsPart = '';

    if (match) {
        questionsPart = content.substring(0, match.index);
        solutionsPart = content.substring(match.index + match[0].length);
    }

    if (solutionsPart) {
        const solutionLines = solutionsPart.trim().split('\n');
        for (const line of solutionLines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            const answerMatch = trimmedLine.match(/^(\d+)\.\s*(.+)/);
            if (answerMatch) {
                const questionNum = answerMatch[1];
                const answer = answerMatch[2].trim();
                answerKey[questionNum] = answer;
                solutions.push({
                    questionNumber: parseInt(questionNum, 10),
                    answer: answer,
                });
            }
        }
    }

    const questionLines = questionsPart.trim().split('\n');
    let currentQuestion = null;

    for (const line of questionLines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const questionMatch = trimmedLine.match(/^(?:\(([^)]+)\)\s*)?(\d+)\.\s*(.*)/);
        
        if (questionMatch) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            
            const explicitType = questionMatch[1] ? questionMatch[1].toLowerCase() : null;
            const questionNumber = questionMatch[2];
            const questionText = questionMatch[3].trim();
            
            currentQuestion = {
                id: questionNumber,
                question: questionText,
                type: determineQuestionType(explicitType, selectedQuestionTypes),
                options: [],
                correctAnswer: answerKey[questionNumber] || '',
                points: 1
            };
        } else if (currentQuestion) { 
            const optionMatch = trimmedLine.match(/^(?:([A-D])\)|[A-D]\.|\*)\s*(.*)/);
            if (optionMatch) {
                const optionText = optionMatch[2].trim();
                currentQuestion.options.push(optionText);
            }
        }
    }

    if (currentQuestion) {
        questions.push(currentQuestion);
    }
    
    questions.forEach(q => {
        if (q.type === 'true_false' && q.options.length === 0) {
            q.options = ['True', 'False'];
        } else if (q.options.length === 0 && q.type !== 'true_false') {
            q.type = 'short_answer';
        }

        const answerFromKey = answerKey[q.id];
        if (answerFromKey) {
            if (/^[A-D]$/i.test(answerFromKey)) {
                const optionIndex = answerFromKey.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
                if (q.options && q.options[optionIndex]) {
                    q.correctAnswer = q.options[optionIndex];
                }
            } else {
                q.correctAnswer = answerFromKey;
            }
        }
    });
    
    console.log(`[FIXED PARSING] Parsed ${questions.length} questions and ${solutions.length} solutions.`);
    
    return { questions, solutions };
}

function determineQuestionType(explicitType, selectedQuestionTypes) {
  if (explicitType) {
    const typeMap = {
      'mcq': 'mcq', 'mc': 'mcq', 'multiple choice': 'mcq',
      't/f': 'true_false', 'true/false': 'true_false', 'tf': 'true_false',
      'sa': 'short_answer', 'short answer': 'short_answer', 'short': 'short_answer'
    };
    return typeMap[explicitType] || 'mcq';
  }
  
  if (selectedQuestionTypes) {
    if (selectedQuestionTypes.mcq) return 'mcq';
    if (selectedQuestionTypes.true_false) return 'true_false';
    if (selectedQuestionTypes.short_answer) return 'short_answer';
  }
  
  return 'mcq';
} 