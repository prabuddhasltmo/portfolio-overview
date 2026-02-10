/**
 * Azure AI Foundry Agent - Tool Registration Script
 * 
 * This script registers the workflow automation tools on your Azure AI Agent.
 * Run this once to configure the agent with the required function-calling capabilities.
 * 
 * Prerequisites:
 *   1. Install dependencies: npm install @azure/ai-projects @azure/identity
 *   2. Set environment variables (or use values from .env):
 *      - AZURE_AI_PROJECT_ENDPOINT (e.g. https://<your-cognitive-services>.services.ai.azure.com/api/projects/<project-id>)
 *      - AZURE_AI_AGENT_ID (your existing agent's ID, e.g. "hackstreet-agent:1")
 *   Auth uses DefaultAzureCredential (az login or managed identity).
 * 
 * Usage: node scripts/register-agent-tools.js
 */

import 'dotenv/config';

// Note: Uncomment these imports after installing the Azure packages
// import { AIProjectsClient } from '@azure/ai-projects';
// import { DefaultAzureCredential } from '@azure/identity';

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'get_checks_for_loan',
      description: 'Get all checks available for printing for a given loan. Returns a list of checks with amounts, dates, payee info, and status.',
      parameters: {
        type: 'object',
        properties: {
          loanId: {
            type: 'string',
            description: 'The loan account ID (e.g., "LN-2024-001" or "B001000")',
          },
        },
        required: ['loanId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'print_checks',
      description: 'Submit selected checks for printing. Returns confirmation with count and total amount.',
      parameters: {
        type: 'object',
        properties: {
          loanId: {
            type: 'string',
            description: 'The loan account ID',
          },
          checkIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of check IDs to print. Pass empty array or omit to print all available checks.',
          },
        },
        required: ['loanId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_lender_notification',
      description: 'Send a lender notification of electronic deposit after checks are printed.',
      parameters: {
        type: 'object',
        properties: {
          loanId: {
            type: 'string',
            description: 'The loan account ID',
          },
          transmissionType: {
            type: 'string',
            enum: ['transmission_date', 'payment_date', 'due_date'],
            description: 'How to select notices - by transmission date, payment date, or due date',
          },
          fromDate: {
            type: 'string',
            description: 'Start date for notice selection (YYYY-MM-DD format)',
          },
          toDate: {
            type: 'string',
            description: 'End date for notice selection (YYYY-MM-DD format)',
          },
          envelopeSize: {
            type: 'string',
            enum: ['standard', 'large', 'window'],
            description: 'Envelope size for printed notices (optional)',
          },
          replaceBorrowerName: {
            type: 'boolean',
            description: 'Replace borrower name with primary property name (default: false)',
          },
          displayLateCharges: {
            type: 'boolean',
            description: 'Display late charges separately on the notification (default: false)',
          },
        },
        required: ['loanId'],
      },
    },
  },
];

const AGENT_SYSTEM_PROMPT = `You are a workflow automation assistant for a mortgage servicing company. You help users automate repetitive tasks related to loan management.

Your capabilities:
1. Get checks available for printing for any loan
2. Print selected checks
3. Send lender notifications after printing checks

When a user asks to "print checks" or "automate the check workflow" for a loan:
1. First, call get_checks_for_loan to see what checks are available
2. Call print_checks to submit them for printing
3. Call send_lender_notification to notify the lender

Always confirm what you've done with specific numbers (how many checks, total amount, etc.).

If the user doesn't specify which checks to print, print all available checks.
If the user doesn't specify notification options, use sensible defaults (today's date, standard envelope).

Be concise and action-oriented in your responses.`;

async function registerTools() {
  const endpoint = process.env.AZURE_AI_PROJECT_ENDPOINT || process.env.AZURE_EXISTING_AIPROJECT_ENDPOINT;
  const agentId = process.env.AZURE_AI_AGENT_ID || process.env.AZURE_EXISTING_AGENT_ID;

  if (!endpoint) {
    console.error('Error: AZURE_AI_PROJECT_ENDPOINT not set');
    console.log('\nSet AZURE_AI_PROJECT_ENDPOINT to your project URL (e.g. https://<name>.services.ai.azure.com/api/projects/<project-id>)');
    process.exit(1);
  }

  if (!agentId) {
    console.error('Error: AZURE_AI_AGENT_ID not set');
    console.log('\nSet AZURE_AI_AGENT_ID to your agent ID (e.g. hackstreet-agent:1)');
    process.exit(1);
  }

  console.log('Tool definitions to register:\n');
  console.log(JSON.stringify(TOOL_DEFINITIONS, null, 2));
  
  console.log('\n\nSystem prompt for the agent:\n');
  console.log(AGENT_SYSTEM_PROMPT);

  console.log('\n\n--- MANUAL REGISTRATION INSTRUCTIONS ---');
  console.log('\nIf automatic registration is not available, register these tools manually:');
  console.log('\n1. Go to Azure AI Foundry portal > your project > Agents');
  console.log('2. Select your agent and click "Edit"');
  console.log('3. Under "Tools", add each function definition above');
  console.log('4. Update the system prompt with the text above');
  console.log('5. Save the agent');

  // Uncomment below to use the SDK for automatic registration
  /*
  try {
    const credential = new DefaultAzureCredential();
    const projectClient = AIProjectClient.fromEndpoint(endpoint, credential);
    const agentsClient = projectClient.agents;

    console.log(`\nUpdating agent ${agentId} with tools...`);

    const updatedAgent = await agentsClient.updateAgent(agentId, {
      tools: TOOL_DEFINITIONS,
      instructions: AGENT_SYSTEM_PROMPT,
    });

    console.log('Agent updated successfully!');
    console.log('Agent ID:', updatedAgent.id);
    console.log('Tools registered:', updatedAgent.tools?.length || 0);
  } catch (error) {
    console.error('Error updating agent:', error.message);
    process.exit(1);
  }
  */
}

registerTools();
