// API service to connect to Flask backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface PredictionRequest {
  stock: string;
  no_of_days: number;
}

export interface HistoricalDataPoint {
  date: string;
  original: number;
  predicted: number;
}

export interface PredictionResponse {
  success: boolean;
  stock: string;
  stock_name: string;
  current_price: number;
  mse: number;
  rmse: number;
  historical_data: HistoricalDataPoint[];
  future_predictions: number[];
  total_data_points: number;
  error?: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
}

/**
 * Fetch cryptocurrency price predictions from Flask backend
 */
export async function getPrediction(
  request: PredictionRequest
): Promise<PredictionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch prediction');
    }

    const data: PredictionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching prediction:', error);
    throw error;
  }
}

/**
 * Check if the Flask backend is healthy and model is loaded
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    
    if (!response.ok) {
      throw new Error('Health check failed');
    }

    const data: HealthResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking backend health:', error);
    throw error;
  }
}

/**
 * Get predictions for multiple cryptocurrencies
 */
export async function getMultiplePredictions(
  stocks: string[],
  no_of_days: number = 10
): Promise<Map<string, PredictionResponse>> {
  const results = new Map<string, PredictionResponse>();

  // Fetch predictions sequentially to avoid overloading the backend
  for (const stock of stocks) {
    try {
      const prediction = await getPrediction({ stock, no_of_days });
      results.set(stock, prediction);
    } catch (error) {
      console.error(`Error fetching prediction for ${stock}:`, error);
      // Continue with other stocks even if one fails
    }
  }

  return results;
}
