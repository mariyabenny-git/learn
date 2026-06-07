const fs = require('fs');
const path = require('path');

async function broadcastMetricsToGateway() {
  const syncPayloadPath = path.join(__dirname, 'evaluation-output.json');
  let evaluationData = { baseScore: 0, extraPoints: 0, assertionsPassed: [], systemFailures: ["Evaluation output file unreadable"] };

  if (fs.existsSync(syncPayloadPath)) {
    try {
      evaluationData = JSON.parse(fs.readFileSync(syncPayloadPath, 'utf-8'));
    } catch (parseError) {
      console.error("Critical System Level Error parsing validation output:", parseError.message);
    }
  }

  const finalScoreSummation = Number(evaluationData.baseScore || 0) + Number(evaluationData.extraPoints || 0);

  const databaseSyncPayload = {
    github_username: process.env.GITHUB_USERNAME,
    repo_url: process.env.REPO_URL,
    project_type: process.env.PROJECT_TYPE,
    score: finalScoreSummation,
    assertions: evaluationData.assertionsPassed || [],
    errors: evaluationData.systemFailures || []
  };

  console.log(`Syncing calculated execution values directly to the live database endpoint... Total Calculated: ${finalScoreSummation}`);

  try {
    const targetSupabaseWebhookURL = `${process.env.SUPABASE_URL}/functions/v1/update-score`;
    const gatewayResponse = await fetch(targetSupabaseWebhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_FUNCTION_KEY}`
      },
      body: JSON.stringify(databaseSyncPayload)
    });

    if (!gatewayResponse.ok) {
      const serverErrText = await gatewayResponse.text();
      throw new Error(`Supabase Gateway connection interrupted status: ${gatewayResponse.status} - ${serverErrText}`);
    }

    console.log('Metrics successfully updated on the live leaderboard database.');
  } catch (syncError) {
    console.error('Leaderboard database synchronization failure:', syncError.message);
    process.exit(1);
  }
}

broadcastMetricsToGateway();
