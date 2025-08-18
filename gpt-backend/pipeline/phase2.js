const GPT4Adapter = require('../models/gpt4');
const Claude4Adapter = require('../models/claude4');
const GPT4oAdapter = require('../models/gpt4o');

class Phase2Controller {
  constructor(gpt4ApiKey, claude4ApiKey, gpt4oApiKey) {
    this.gpt4 = new GPT4Adapter(gpt4ApiKey);
    this.claude4 = new Claude4Adapter(claude4ApiKey);
    this.gpt4o = new GPT4oAdapter(gpt4oApiKey);
  }

  async execute(problemAnalysis, language = 'cpp') {
    console.log('🚀 Phase 2: First Solution Attempt');
    const startTime = Date.now();

    try {
      // Step 1: GPT-4.1 selects algorithm and implements code
      console.log('📝 Step 1: GPT-4.1 Algorithm Selection & Implementation');
      const initialCode = await this.gpt4.selectAlgorithmAndImplement(
        JSON.stringify(problemAnalysis), 
        language
      );

      // Step 2: Claude-4 optimizes the code
      console.log('⚡ Step 2: Claude-4 Code Optimization');
      const optimizedCode = await this.claude4.optimizeCode(
        this.extractCode(initialCode, language),
        language,
        JSON.stringify(problemAnalysis)
      );

      // Step 3: GPT-4o generates and executes test cases
      console.log('🧪 Step 3: GPT-4o Test Case Generation & Execution');
      const testCases = await this.gpt4o.generateTestCases(
        JSON.stringify(problemAnalysis),
        10
      );

      // Prefer initial implementation if optimization stripped code fences
      const optimized = this.extractCode(optimizedCode, language);
      const initial = this.extractCode(initialCode, language);
      const finalCode = optimized && optimized.length > 10 ? optimized : initial;
      const testResults = await this.gpt4o.executeTestCases(
        finalCode,
        language,
        testCases,
        JSON.stringify(problemAnalysis)
      );

      // Analyze test results
      const testAnalysis = this.analyzeTestResults(testResults);
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ Phase 2 completed in ${executionTime}ms`);

      return {
        success: testAnalysis.allPassed,
        phase: 2,
        executionTime,
        code: finalCode,
        testResults: testAnalysis,
        testCases,
        initialCode: this.extractCode(initialCode, language),
        optimizedCode: finalCode,
        errorDetails: testAnalysis.failedTests.length > 0 ? testAnalysis.failedTests : null
      };

    } catch (error) {
      console.error('❌ Phase 2 failed:', error.message);
      return {
        success: false,
        phase: 2,
        error: error.message,
        executionTime: Date.now() - startTime
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

module.exports = Phase2Controller; 