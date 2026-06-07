const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

module.exports = async function validateQuizAppWorkspace(basePath) {
  let baseScore = 0;
  let extraPoints = 0;
  const assertionsPassed = [];
  const systemFailures = [];

  const requiredWorkspaceFiles = ['index.html', 'style.css', 'script.js', 'questions.json'];
  requiredWorkspaceFiles.forEach(file => {
    if (fs.existsSync(path.join(basePath, file))) {
      baseScore += 10;
      assertionsPassed.push(`File system matching: Found structural asset configuration file targets at ${file}.`);
    } else {
      systemFailures.push(`Missing structural workspace file: ${file}`);
    }
  });

  const jsonPath = path.join(basePath, 'questions.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const dataPayload = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const activeArrayPayload = dataPayload.questions || dataPayload;
      if (Array.isArray(activeArrayPayload) && activeArrayPayload.length >= 5) {
        baseScore += 25;
        assertionsPassed.push(`JSON Engine Validation: Confirmed structure matching target schema requirements with ${activeArrayPayload.length} objects.`);
      } else {
        systemFailures.push('JSON Structure Verification Warning: Quiz platform requirements expect a collection tracking >= 5 question blocks');
      }
    } catch {
      systemFailures.push('JSON Core Engine Exception: Fatal reading interruption formatting issues caught in questions.json');
    }
  }

  const jsPath = path.join(basePath, 'script.js');
  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    if (jsContent.includes('score') || jsContent.includes('currentQuestion') || jsContent.includes('index')) {
      baseScore += 25;
      assertionsPassed.push('JS Core Runtime Engine: State variable declarations are correctly scoped.');
    } else {
      systemFailures.push('JS State Management Warning: Tracking values managing score or index variables appear missing');
    }

    if (jsContent.includes('click') || jsContent.includes('addEventListener')) {
      baseScore += 25;
      assertionsPassed.push('JS Runtime Handlers: Registered click listener tracking wrappers.');
    } else {
      systemFailures.push('JS Interface Action Warning: User touch input event triggers are unmapped');
    }
  }

  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    if (jsContent.includes('setInterval') || jsContent.includes('setTimeout') || jsContent.includes('Math.random')) {
      extraPoints += 15;
      assertionsPassed.push('Bonus Checklist Goal Met: Advanced dynamic processing engines deployed via timed loops or randomized options sorting algorithms.');
    }
  }

  return { baseScore, extraPoints, assertionsPassed, systemFailures };
};
