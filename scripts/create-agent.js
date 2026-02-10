/**
 * Creates the workflow automation agent in Azure AI Foundry and outputs the asst_ ID.
 *
 * Usage:  node scripts/create-agent.js
 *
 * After running, copy the printed AZURE_AI_AGENT_ID value into your .env file.
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

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'get_checks_for_loan',
      description:
        'Get all checks available for printing for a given loan. Returns a list of checks with amounts, dates, payee info, and status.',
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
      description:
        'Submit selected checks for printing. Returns confirmation with count and total amount.',
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
            description:
              'Array of check IDs to print. Pass empty array or omit to print all available checks.',
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
      description:
        'Send a lender notification of electronic deposit after checks are printed.',
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
            description:
              'How to select notices - by transmission date, payment date, or due date',
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
            description:
              'Replace borrower name with primary property name (default: false)',
          },
          displayLateCharges: {
            type: 'boolean',
            description:
              'Display late charges separately on the notification (default: false)',
          },
        },
        required: ['loanId'],
      },
    },
  },
];

const SYSTEM_PROMPT = `You are a workflow automation assistant for a mortgage servicing company. You help users automate repetitive tasks related to loan management.

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

async function main() {
  const endpoint =
    process.env.AZURE_AI_PROJECT_ENDPOINT ||
    process.env.AZURE_EXISTING_AIPROJECT_ENDPOINT;

  if (!endpoint) {
    console.error('ERROR: AZURE_AI_PROJECT_ENDPOINT is not set in .env');
    process.exit(1);
  }

  console.log(`Endpoint: ${endpoint}\n`);

  const credential = getCredential();
  const projectClient = AIProjectClient.fromEndpoint(endpoint, credential);
  const agentsClient = projectClient.agents;

  console.log('Creating agent "hackstreet-agent" with workflow tools...\n');

  try {
    const agent = await agentsClient.createAgent('gpt-4o', {
      name: 'hackstreet-agent',
      instructions: SYSTEM_PROMPT,
      tools: TOOL_DEFINITIONS,
    });

    console.log('Agent created successfully!\n');
    console.log(`  Name:   ${agent.name}`);
    console.log(`  ID:     ${agent.id}`);
    console.log(`  Model:  ${agent.model}`);
    console.log(`  Tools:  ${agent.tools?.length || 0} registered`);

    console.log('\n========================================');
    console.log('  UPDATE YOUR .env FILE WITH THIS ID:');
    console.log(`  AZURE_AI_AGENT_ID=${agent.id}`);
    console.log('========================================\n');
  } catch (error) {
    console.error('Error creating agent:', error.message || error);

    if (
      error.message?.includes('401') ||
      error.message?.includes('403') ||
      error.message?.includes('Unauthorized')
    ) {
      console.error(
        '\nAuth failed. Run "az login" or set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET.'
      );
    }

    if (error.message?.includes('model') || error.message?.includes('deployment')) {
      console.error(
        '\nThe model "gpt-4o" may not be deployed in your project. Check Azure AI Foundry portal for available model deployments.'
      );
    }
  }
}

main();
