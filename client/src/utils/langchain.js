import { PineconeClient } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { OpenAI } from 'langchain/llms/openai';
import { RetrievalQAChain } from 'langchain/chains';

const PINECONE_INDEX_NAME = 'disaster-data';
const PINECONE_NAMESPACE = 'disaster-info';

export const initializePinecone = async () => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.REACT_APP_PINECONE_API_KEY,
    environment: process.env.REACT_APP_PINECONE_ENVIRONMENT,
  });
  return client;
};

export const getDisasterContext = async (query, context = {}) => {
  try {
    const pinecone = await initializePinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY }),
      { pineconeIndex: index, namespace: PINECONE_NAMESPACE }
    );

    const model = new OpenAI({
      openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
      temperature: 0,
    });

    const chain = RetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever()
    );

    const response = await chain.call({
      query: query,
    });

    return response.text;
  } catch (error) {
    console.error('Error getting disaster context:', error);
    return 'Sorry, I encountered an error while fetching disaster information.';
  }
};
