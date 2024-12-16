import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

async function createThread() {
  const thread = await openai.beta.threads.create();
  return thread;
}

async function addMessageToThread(threadId, userMessage) {
  const message = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: userMessage,
  });
  return message;
}

async function runThread(threadId) {
  try {
    let isApproved = false; // Track approval status

    // Create the run
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
    });

    // Wait for run completion
    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      
      if (runStatus.status === 'requires_action') {
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = toolCalls.map(toolCall => {
          console.log('Tool call:', toolCall.function.name);
          console.log('Arguments:', toolCall.function.arguments);
          
          // Set approval flag if approveTransfer is called
          if (toolCall.function.name === 'approveTransfer') {
            isApproved = true;
          }
          
          return {
            tool_call_id: toolCall.id,
            output: JSON.stringify({ result: "Tool execution completed" })
          };
        });

        // Submit tool outputs
        await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
          tool_outputs: toolOutputs,
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } while (!['completed', 'failed'].includes(runStatus.status));

    if (runStatus.status === 'failed') {
      console.error('Run failed:', runStatus);
      return {
        explanation: 'An error occurred during processing.',
        decision: 'reject_transfert'
      };
    }

    // Récupérer les messages
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0];

    if (!lastMessage || !lastMessage.content || lastMessage.content.length === 0) {
      return {
        explanation: 'No response from assistant.',
        decision: 'reject_transfert'
      };
    }

    // Extract the text content
    const responseText = lastMessage.content[0].text.value;
    console.log('Assistant response:', responseText);

    // Use the tracked approval status to set the decision
    const decision = isApproved ? 'approve_transfert' : 'reject_transfert';
    console.log('Final decision in runThread:', decision);

    return {
      explanation: responseText,
      decision: decision
    };

  } catch (error) {
    console.error('Error in runThread:', error);
    return {
      explanation: `Error: ${error.message}`,
      decision: 'reject_transfert'
    };
  }
}

async function converseWithAI(userMessage) {
  try {
    console.log('Starting conversation with message:', userMessage);
    const thread = await createThread();
    console.log('Thread created:', thread.id);
    
    await addMessageToThread(thread.id, userMessage);
    console.log('Message added to thread');
    
    const response = await runThread(thread.id);
    console.log('Conversation completed');
    
    return response;
  } catch (error) {
    console.error('Error in conversation:', error);
    throw error;
  }
}

export { converseWithAI };