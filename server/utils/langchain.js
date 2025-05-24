const { PineconeClient } = require('@pinecone-database/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { OpenAI } = require('langchain/llms/openai');
const { RetrievalQAChain } = require('langchain/chains');

const PINECONE_INDEX_NAME = 'disaster-data';
const PINECONE_NAMESPACE = 'disaster-info';

const initializePinecone = async () => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  return client;
};

const getDisasterContext = async (query, context = {}) => {
  try {
    const pinecone = await initializePinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex: index, namespace: PINECONE_NAMESPACE }
    );

    const model = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
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

module.exports = {
  getDisasterContext
};
