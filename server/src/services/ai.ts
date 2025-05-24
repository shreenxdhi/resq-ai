import OpenAI from 'openai';
import { fallbackTips } from '../data/fallbackTips';

// Initialize OpenAI client if API key is available
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Generate disaster response tips using OpenAI or fallback to static tips
 * @param disaster The type of disaster
 * @param city The city where the disaster is occurring
 * @returns An array of tips
 */
export async function generateTips(disaster: string, city: string): Promise<string[]> {
  // Normalize disaster type to lowercase for matching with fallback tips
  const disasterType = disaster.toLowerCase();
  
  // If OpenAI is configured, try to use it
  if (openai) {
    try {
      console.log(`Generating AI tips for ${disaster} in ${city}`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a disaster response expert providing clear, concise, and actionable advice for emergency situations. Provide specific, practical tips that can save lives."
          },
          {
            role: "user",
            content: `Generate 5 actionable tips for ${disaster} in ${city}. Each tip should be a single sentence and directly applicable.`
          }
        ],
        temperature: 0.7,
        max_tokens: 350
      });
      
      // Extract the tips from the response
      const content = response.choices[0]?.message?.content || '';
      
      // Parse the content into individual tips
      // This handles both numbered lists and bullet points
      const tips = content
        .split(/\n+/)
        .filter(line => line.match(/^(\d+\.|\*|\-)\s+/) || line.length > 10)
        .map(line => line.replace(/^(\d+\.|\*|\-)\s+/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 5); // Ensure we only take up to 5 tips
      
      // If we got valid tips, return them
      if (tips.length > 0) {
        return tips;
      }
      
      // Fall through to fallback tips if OpenAI didn't give us valid results
      console.log('AI response did not contain valid tips, using fallbacks');
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      // Fall through to fallback tips
    }
  }
  
  // Use fallback tips if OpenAI is not available or failed
  return fallbackTips[disasterType as keyof typeof fallbackTips] || fallbackTips.default;
} 