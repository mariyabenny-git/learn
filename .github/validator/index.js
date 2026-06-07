const fs = require('fs');
const path = require('path');

async function runCorePipeline() {
  const targetProject = process.env.PROJECT_TYPE;
  const targetCodebasePath = process.env.STUDENT_REPO_PATH;
  const resultsOutputFilePath = path.join(__dirname, 'evaluation-output.json');

  console.log(`Initializing suite rule parser for target platform configuration: ${targetProject}`);
  console.log(`Evaluating local repository workspace directory mapping: ${targetCodebasePath}`);

  let metrics = { baseScore: 0, extraPoints: 0, assertionsPassed: [], systemFailures: [] };

  try {
    const strategyModulePath = path.join(__dirname, 'validators', `${targetProject}.js`);
    if (!fs.existsSync(strategyModulePath)) {
      throw new Error(`Critical System Setup Fault: Configuration validator rule maps missing at ${strategyModulePath}`);
    }

    const testExecutionStrategy = require(strategyModulePath);
    metrics = await testExecutionStrategy(targetCodebasePath);

  } catch (executionException) {
    console.error('System Engine Failure Interruption:', executionException.message);
    metrics.systemFailures.push(executionException.message);
    metrics.baseScore = 0;
    metrics.extraPoints = 0;
  }

  fs.writeFileSync(resultsOutputFilePath, JSON.stringify(metrics, null, 2), 'utf-8');
  console.log('Automated validation engine tracking completed smoothly. Results saved safely.');
}

runCorePipeline();
