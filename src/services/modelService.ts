
import { Fund, ModelConfig, ModelSearchResponse, SearchResult } from '@/types/fund';
import { pipeline } from '@huggingface/transformers';
// Remove the conflicting import
import { toast } from '@/components/ui/use-toast';

// Default model configuration
const defaultModelConfig: ModelConfig = {
  modelId: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
  quantized: true,
  enableWebGPU: true
};

// Cache for the model pipeline and fund embeddings
let embeddingModel: any = null;
let modelLoadPromise: Promise<any> | null = null;
let fundEmbeddingsCache: Map<string, number[]> = new Map();
let isPrecomputingEmbeddings = false;

/**
 * Loads the embedding model if not already loaded
 */
export async function loadEmbeddingModel(config: ModelConfig = defaultModelConfig): Promise<any> {
  if (embeddingModel) return embeddingModel;
  
  if (modelLoadPromise) return modelLoadPromise;
  
  // Display loading toast or notification here
  console.log('Loading TinyLlama model...');
  toast({
    title: "Loading Model",
    description: "Setting up the TinyLlama model...",
    duration: 3000,
  });
  
  modelLoadPromise = pipeline(
    'feature-extraction',
    config.modelId,
    {
      // The @huggingface/transformers library API has changed
      // and doesn't support 'quantized' directly in this options object
      device: config.enableWebGPU ? 'webgpu' : 'cpu'
    }
  ).then(model => {
    embeddingModel = model;
    console.log('TinyLlama model loaded successfully');
    toast({
      title: "Model Ready",
      description: "TinyLlama model loaded successfully",
      duration: 3000,
    });
    return model;
  }).catch(error => {
    console.error('Error loading model:', error);
    modelLoadPromise = null;
    toast({
      title: "Model Error",
      description: "Failed to load TinyLlama model. Using fallback search.",
      variant: "destructive",
      duration: 5000,
    });
    throw error;
  });
  
  return modelLoadPromise;
}

/**
 * Generate embeddings for a single text
 */
export async function generateEmbedding(text: string, config: ModelConfig = defaultModelConfig): Promise<number[]> {
  const model = await loadEmbeddingModel(config);
  
  try {
    const result = await model(text, { 
      pooling: 'mean', 
      normalize: true 
    });
    
    return Array.from(result.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Calculate similarity between two embeddings using cosine similarity
 */
function cosineSimilarity(embeddingA: number[], embeddingB: number[]): number {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embeddings must have the same dimensions');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    normA += embeddingA[i] * embeddingA[i];
    normB += embeddingB[i] * embeddingB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Load funds from a JSON file or API
 * For large datasets, this function would load from a file or API endpoint
 */
export async function loadFunds(): Promise<Fund[]> {
  try {
    // In a real implementation, you would:
    // 1. Load funds from a local JSON file or API endpoint
    // 2. Process and return the funds
    
    // For demo purposes, we'll use the sample funds
    // but in production you'd load from an external source
    const { sampleFunds } = await import('@/data/sampleFunds');
    
    console.log(`Loaded ${sampleFunds.length} funds`);
    return sampleFunds;
  } catch (error) {
    console.error('Error loading funds:', error);
    throw error;
  }
}

/**
 * Pre-compute embeddings for all funds to improve search performance
 */
export async function preCacheFundEmbeddings(config: ModelConfig = defaultModelConfig): Promise<void> {
  if (isPrecomputingEmbeddings) return;
  
  isPrecomputingEmbeddings = true;
  
  try {
    const funds = await loadFunds();
    
    // For efficiency with large datasets, process in batches
    const batchSize = 50;
    
    for (let i = 0; i < funds.length; i += batchSize) {
      const batch = funds.slice(i, i + batchSize);
      
      // Use Promise.all to process a batch of funds in parallel
      await Promise.all(batch.map(async (fund) => {
        // Skip if already computed
        if (fundEmbeddingsCache.has(fund.id)) return;
        
        // Create a rich representation of the fund for embedding
        const fundText = `${fund.name} ${fund.shortName || ''} ${fund.fundHouse} ${fund.category} ${fund.subCategory || ''} ${fund.sector || ''}`;
        
        // Generate and cache the embedding
        const embedding = await generateEmbedding(fundText, config);
        fundEmbeddingsCache.set(fund.id, embedding);
        
        console.log(`Generated embedding for ${fund.name}`);
      }));
      
      console.log(`Processed ${Math.min(i + batchSize, funds.length)}/${funds.length} funds`);
    }
    
    console.log(`Completed pre-computing embeddings for ${funds.length} funds`);
  } catch (error) {
    console.error('Error pre-computing fund embeddings:', error);
  } finally {
    isPrecomputingEmbeddings = false;
  }
}

/**
 * Generate a description of why a fund matched the query
 * This is the function causing the conflict - keep the local version
 */
function explainMatch(query: string, fund: Fund): string {
  const fundText = `${fund.name} ${fund.category || ''} ${fund.fundHouse || ''} ${fund.sector || ''}`;
  return `This fund matches your query "${query}" based on its characteristics.`;
}

/**
 * Search funds using the embedding model
 */
export async function searchFundsWithModel(
  query: string, 
  config: ModelConfig = defaultModelConfig
): Promise<ModelSearchResponse & { results?: SearchResult[] }> {
  const startTime = performance.now();
  
  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query, config);
    
    // Load funds (from cache or source)
    const funds = await loadFunds();
    
    // Start pre-computing embeddings in the background if not already done
    if (fundEmbeddingsCache.size === 0 && !isPrecomputingEmbeddings) {
      preCacheFundEmbeddings(config).catch(console.error);
    }
    
    const results: SearchResult[] = [];
    
    for (const fund of funds) {
      let fundEmbedding: number[];
      
      // Use cached embedding if available
      if (fund.id && fundEmbeddingsCache.has(fund.id)) {
        fundEmbedding = fundEmbeddingsCache.get(fund.id)!;
      } else {
        // Otherwise, compute it on-the-fly
        const fundText = `${fund.name} ${fund.shortName || ''} ${fund.fundHouse || ''} ${fund.category || ''} ${fund.subCategory || ''} ${fund.sector || ''}`;
        fundEmbedding = await generateEmbedding(fundText, config);
        
        // Cache for future use
        if (fund.id) {
          fundEmbeddingsCache.set(fund.id, fundEmbedding);
        }
      }
      
      // Calculate similarity
      const similarity = cosineSimilarity(queryEmbedding, fundEmbedding);
      
      // Only include results with decent similarity
      if (similarity > 0.5) {
        results.push({
          fund,
          score: similarity,
          matchReason: explainMatch(query, fund)
        });
      }
    }
    
    // Sort by similarity score
    results.sort((a, b) => b.score - a.score);
    
    // Take top matches (limit to 10 for performance)
    const topResults = results.slice(0, 10);
    
    const timeTaken = performance.now() - startTime;
    
    return {
      modelUsed: config.modelId,
      timeTaken,
      results: topResults
    };
  } catch (error) {
    console.error('Error searching with model:', error);
    
    // Fallback to traditional search
    const { searchFunds } = await import('./searchService');
    const fallbackResults = await searchFunds(query);
    
    return {
      modelUsed: 'fallback-traditional-search',
      timeTaken: performance.now() - startTime,
      results: fallbackResults
    };
  }
}
