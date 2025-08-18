const DeepSeekAdapter = require('../models/deepseek');
const GPT4Adapter = require('../models/gpt4');
const GPT4oAdapter = require('../models/gpt4o');

class Phase5Controller {
  constructor(deepseekApiKey, gpt4ApiKey, gpt4oApiKey) {
    this.deepseek = new DeepSeekAdapter(deepseekApiKey);
    this.gpt4 = new GPT4Adapter(gpt4ApiKey);
    this.gpt4o = new GPT4oAdapter(gpt4oApiKey);
  }

  async execute(problemAnalysis, failedCode, errorDetails, testCases, language = 'cpp') {
    console.log('🚀 Phase 5: Final Solution Attempt');
    const startTime = Date.now();

    try {
      // Step 1: DeepSeek creates final solution
      console.log('🔍 Step 1: DeepSeek Final Solution Creation');
      const finalSolution = await this.deepseek.createFinalSolution(
        failedCode,
        errorDetails,
        testCases,
        JSON.stringify(problemAnalysis),
        language
      );

      // Step 2: GPT-4.1 optimizes the final code
      console.log('⚡ Step 2: GPT-4.1 Final Code Optimization');
      const optimizedCode = await this.gpt4.optimizeCode(
        this.extractCode(finalSolution, language),
        language,
        JSON.stringify(problemAnalysis)
      );

      // Step 3: GPT-4o executes final test cases
      console.log('🧪 Step 3: GPT-4o Final Test Case Execution');
      const optimized = this.extractCode(optimizedCode, language);
      const fresh = this.extractCode(finalSolution, language);
      const finalCode = optimized && optimized.length > 10 ? optimized : fresh;
      const testResults = await this.gpt4o.executeTestCases(
        finalCode,
        language,
        testCases,
        JSON.stringify(problemAnalysis)
      );

      // Analyze test results
      const testAnalysis = this.analyzeTestResults(testResults);
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ Phase 5 completed in ${executionTime}ms`);

      return {
        success: testAnalysis.allPassed,
        phase: 5,
        executionTime,
        code: finalCode,
        testResults: testAnalysis,
        testCases,
        finalSolution: this.extractCode(finalSolution, language),
        optimizedCode: finalCode,
        errorDetails: testAnalysis.failedTests.length > 0 ? testAnalysis.failedTests : null,
        isFinalAttempt: true
      };

    } catch (error) {
      console.error('❌ Phase 5 failed:', error.message);
      return {
        success: false,
        phase: 5,
        error: error.message,
        executionTime: Date.now() - startTime,
        isFinalAttempt: true
      };
    }
  }

  extractCode(response, language) {
    // Extract code from AI response
    const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, 'i');
    const match = response.match(codeBlockRegex);
    
    if (match) {
      return match[1].trim();
    }

    // Fallback: look for code blocks without language specification
    const genericCodeRegex = /```\n([\s\S]*?)```/;
    const genericMatch = response.match(genericCodeRegex);
    
    if (genericMatch) {
      return genericMatch[1].trim();
    }

    // Last resort: return the entire response
    return response;
  }

  analyzeTestResults(testResults) {
    const lines = testResults.split('\n');
    const analysis = {
      allPassed: true,
      passedTests: [],
      failedTests: [],
      totalTests: 0,
      errorMessages: []
    };

    let currentTest = null;
    let inErrorSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('test case') && trimmed.includes(':')) {
        currentTest = trimmed;
        analysis.totalTests++;
      } else if (trimmed.toLowerCase().includes('pass') || trimmed.toLowerCase().includes('✅')) {
        if (currentTest) {
          analysis.passedTests.push(currentTest);
        }
      } else if (trimmed.toLowerCase().includes('fail') || trimmed.toLowerCase().includes('❌')) {
        if (currentTest) {
          analysis.failedTests.push(currentTest);
          analysis.allPassed = false;
        }
      } else if (trimmed.toLowerCase().includes('error')) {
        inErrorSection = true;
        analysis.errorMessages.push(trimmed);
      } else if (inErrorSection && trimmed) {
        analysis.errorMessages.push(trimmed);
      }
    }

    return analysis;
  }
}

module.exports = Phase5Controller; 