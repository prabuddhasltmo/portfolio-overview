/**
 * Lists all agents in your Azure AI Foundry project so you can find the correct asst_ ID.
 * 
 * Usage:  node scripts/list-agents.js
 * 
 * Requires: AZURE_AI_PROJECT_ENDPOINT set in .env (and valid Azure credentials via az login
 *           or AZURE_TENANT_ID + AZURE_CLIENT_ID + AZURE_CLIENT_SECRET).
 */
import 'dotenv/config';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { AIProjectClient } from '@azure/ai-projects';

function getCredential() {
  const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET } = process.env;
  if (AZURE_TENANT_ID && AZURE_CLIENT_ID && AZURE_CLIENT_SECRET) {
    return new ClientSecretCredential(AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET);
  }
  return new DefaultAzureCredential();
}

async function main() {
  const endpoint =
    process.env.AZURE_AI_PROJECT_ENDPOINT ||
    process.env.AZURE_EXISTING_AIPROJECT_ENDPOINT;

  if (!endpoint) {
    console.error('ERROR: AZURE_AI_PROJECT_ENDPOINT is not set in .env');
    process.exit(1);
  }

  console.log(`Connecting to: ${endpoint}\n`);

  const credential = getCredential();
  const projectClient = AIProjectClient.fromEndpoint(endpoint, credential);
  const agentsClient = projectClient.agents;

  console.log('Listing agents in your project...\n');

  try {
    const agents = await agentsClient.listAgents();

    if (!agents.data || agents.data.length === 0) {
      console.log('No agents found in this project.');
      return;
    }

    console.log(`Found ${agents.data.length} agent(s):\n`);
    console.log('-'.repeat(80));

    for (const agent of agents.data) {
      console.log(`  Name:          ${agent.name || '(unnamed)'}`);
      console.log(`  ID:            ${agent.id}`);
      console.log(`  Model:         ${agent.model || 'N/A'}`);
      console.log(`  Created:       ${agent.createdAt ? new Date(agent.createdAt * 1000).toISOString() : 'N/A'}`);
      console.log(`  Instructions:  ${agent.instructions ? agent.instructions.substring(0, 100) + '...' : 'N/A'}`);
      console.log('-'.repeat(80));
    }

    // Try to find the agent named "hackstreet-agent"
    const targetName = process.env.AZURE_AI_AGENT_ID || process.env.AZURE_EXISTING_AGENT_ID;
    const match = agents.data.find(
      (a) => a.name === targetName || a.name?.toLowerCase().includes('hackstreet')
    );

    if (match) {
      console.log(`\n>>> MATCH FOUND for "${targetName}"!`);
      console.log(`>>> Use this in your .env:`);
      console.log(`>>>   AZURE_AI_AGENT_ID=${match.id}`);
    } else {
      console.log(`\nCould not find an agent matching "${targetName}".`);
      console.log('Copy the correct ID from the list above and update AZURE_AI_AGENT_ID in .env.');
    }
  } catch (error) {
    console.error('Error listing agents:', error.message || error);
    if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('Unauthorized')) {
      console.error('\nAuthentication failed. Make sure you have run "az login" or set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET in .env.');
    }
  }
}

main();
