import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Training dataset embedded (from music_genre_dataset.csv)
const TRAINING_DATA = [
  { tempo: 141.2, energy: 0.806, danceability: 0.569, loudness: -7.55, acousticness: 0.126, instrumentalness: 0.11, key: "Bb", genre: "Rock" },
  { tempo: 86.3, energy: 0.341, danceability: 0.128, loudness: -5.14, acousticness: 0.925, instrumentalness: 0.992, key: "Am", genre: "Classical" },
  { tempo: 120.2, energy: 0.755, danceability: 0.742, loudness: -9.32, acousticness: 0.253, instrumentalness: 0.149, key: "C", genre: "Pop" },
  { tempo: 87.3, energy: 0.348, danceability: 0.301, loudness: -17.67, acousticness: 0.739, instrumentalness: 0.827, key: "E", genre: "Classical" },
  { tempo: 67.6, energy: 0.267, danceability: 0.053, loudness: -26.64, acousticness: 0.951, instrumentalness: 0.855, key: "A", genre: "Classical" },
  { tempo: 91.7, energy: 0.258, danceability: 0.311, loudness: -16.05, acousticness: 0.953, instrumentalness: 0.847, key: "E", genre: "Classical" },
  { tempo: 148.7, energy: 0.734, danceability: 0.667, loudness: -5.01, acousticness: 0.059, instrumentalness: 0.129, key: "C", genre: "Rock" },
  { tempo: 125.6, energy: 0.849, danceability: 0.6, loudness: -7.24, acousticness: 0.073, instrumentalness: 0.102, key: "D", genre: "Rock" },
  { tempo: 76.1, energy: 0.317, danceability: 0.289, loudness: -11.26, acousticness: 0.728, instrumentalness: 0.846, key: "Em", genre: "Classical" },
  { tempo: 137.3, energy: 0.914, danceability: 0.556, loudness: -5.43, acousticness: 0.13, instrumentalness: 0.168, key: "D", genre: "Rock" },
  { tempo: 148.9, energy: 0.899, danceability: 0.418, loudness: -2.99, acousticness: 0.139, instrumentalness: 0.165, key: "A", genre: "Rock" },
  { tempo: 85.6, energy: 0.344, danceability: 0.226, loudness: -19.4, acousticness: 0.904, instrumentalness: 0.854, key: "A", genre: "Classical" },
  { tempo: 84.1, energy: 0.26, danceability: 0.181, loudness: -12.67, acousticness: 0.795, instrumentalness: 0.841, key: "E", genre: "Classical" },
  { tempo: 127.2, energy: 0.636, danceability: 0.729, loudness: -9.59, acousticness: 0.114, instrumentalness: 0.0, key: "D", genre: "Pop" },
  { tempo: 132.8, energy: 0.833, danceability: 0.582, loudness: -4.65, acousticness: 0.029, instrumentalness: 0.321, key: "A", genre: "Rock" },
  { tempo: 129.7, energy: 0.77, danceability: 0.828, loudness: -7.92, acousticness: 0.075, instrumentalness: 0.106, key: "Bb", genre: "Rock" },
  { tempo: 144.3, energy: 0.859, danceability: 0.66, loudness: -5.05, acousticness: 0.207, instrumentalness: 0.096, key: "E", genre: "Rock" },
  { tempo: 111.3, energy: 0.702, danceability: 0.773, loudness: -4.92, acousticness: 0.157, instrumentalness: 0.0, key: "C", genre: "Pop" },
  { tempo: 85.8, energy: 0.386, danceability: 0.203, loudness: -12.68, acousticness: 0.91, instrumentalness: 0.82, key: "D", genre: "Classical" },
  { tempo: 103.7, energy: 0.766, danceability: 0.818, loudness: -11.96, acousticness: 0.134, instrumentalness: 0.0, key: "C", genre: "Pop" },
  { tempo: 118.2, energy: 0.227, danceability: 0.264, loudness: -20.06, acousticness: 0.839, instrumentalness: 0.922, key: "C", genre: "Classical" },
  { tempo: 66.3, energy: 0.5, danceability: 0.258, loudness: -15.33, acousticness: 0.773, instrumentalness: 0.861, key: "Em", genre: "Classical" },
  { tempo: 117.5, energy: 0.593, danceability: 0.728, loudness: -6.9, acousticness: 0.168, instrumentalness: 0.093, key: "C", genre: "Pop" },
  { tempo: 140.7, energy: 0.84, danceability: 0.465, loudness: -4.8, acousticness: 0.075, instrumentalness: 0.103, key: "G", genre: "Rock" },
  { tempo: 92.4, energy: 0.213, danceability: 0.07, loudness: -17.64, acousticness: 0.82, instrumentalness: 0.995, key: "E", genre: "Classical" },
  { tempo: 151.7, energy: 0.841, danceability: 0.686, loudness: -0.71, acousticness: 0.213, instrumentalness: 0.096, key: "D", genre: "Rock" },
  { tempo: 91.1, energy: 0.453, danceability: 0.313, loudness: -15.02, acousticness: 0.768, instrumentalness: 0.871, key: "F", genre: "Classical" },
  { tempo: 122.9, energy: 0.931, danceability: 0.549, loudness: -7.08, acousticness: 0.0, instrumentalness: 0.319, key: "E", genre: "Rock" },
  { tempo: 85.4, energy: 0.461, danceability: 0.329, loudness: -25.06, acousticness: 0.901, instrumentalness: 0.897, key: "G", genre: "Classical" },
  { tempo: 99.7, energy: 0.665, danceability: 0.793, loudness: -1.31, acousticness: 0.127, instrumentalness: 0.162, key: "G", genre: "Pop" },
  { tempo: 129.0, energy: 0.814, danceability: 0.613, loudness: -2.18, acousticness: 0.06, instrumentalness: 0.026, key: "E", genre: "Rock" },
  { tempo: 82.5, energy: 0.456, danceability: 0.244, loudness: -20.3, acousticness: 0.716, instrumentalness: 0.847, key: "D", genre: "Classical" },
  { tempo: 152.5, energy: 0.884, danceability: 0.356, loudness: -10.95, acousticness: 0.104, instrumentalness: 0.157, key: "A", genre: "Rock" },
  { tempo: 142.1, energy: 0.859, danceability: 0.513, loudness: -2.09, acousticness: 0.045, instrumentalness: 0.128, key: "Am", genre: "Rock" },
  { tempo: 133.2, energy: 0.799, danceability: 0.856, loudness: -9.83, acousticness: 0.0, instrumentalness: 0.123, key: "Bb", genre: "Rock" },
  { tempo: 113.1, energy: 0.706, danceability: 0.647, loudness: -3.56, acousticness: 0.093, instrumentalness: 0.077, key: "Am", genre: "Pop" },
  { tempo: 101.2, energy: 0.816, danceability: 0.822, loudness: -13.86, acousticness: 0.123, instrumentalness: 0.046, key: "D", genre: "Pop" },
  { tempo: 146.2, energy: 0.957, danceability: 0.547, loudness: -6.44, acousticness: 0.059, instrumentalness: 0.113, key: "Am", genre: "Rock" },
  { tempo: 138.6, energy: 0.901, danceability: 0.641, loudness: -5.83, acousticness: 0.09, instrumentalness: 0.282, key: "Bb", genre: "Rock" },
  { tempo: 93.6, energy: 0.173, danceability: 0.217, loudness: -17.73, acousticness: 0.889, instrumentalness: 0.87, key: "Em", genre: "Classical" },
  { tempo: 69.4, energy: 0.301, danceability: 0.143, loudness: -16.26, acousticness: 0.812, instrumentalness: 0.809, key: "C", genre: "Classical" },
  { tempo: 107.7, energy: 0.644, danceability: 0.773, loudness: -5.72, acousticness: 0.15, instrumentalness: 0.052, key: "Am", genre: "Pop" },
  { tempo: 71.6, energy: 0.381, danceability: 0.0, loudness: -19.12, acousticness: 0.678, instrumentalness: 0.941, key: "E", genre: "Classical" },
  { tempo: 147.9, energy: 0.91, danceability: 0.454, loudness: -2.18, acousticness: 0.127, instrumentalness: 0.293, key: "Am", genre: "Rock" },
  { tempo: 146.1, energy: 0.878, danceability: 0.622, loudness: -3.85, acousticness: 0.014, instrumentalness: 0.196, key: "F", genre: "Rock" },
  { tempo: 127.6, energy: 0.658, danceability: 0.718, loudness: -6.22, acousticness: 0.214, instrumentalness: 0.207, key: "Am", genre: "Pop" },
  { tempo: 98.5, energy: 0.476, danceability: 0.161, loudness: -7.95, acousticness: 0.788, instrumentalness: 0.886, key: "F", genre: "Classical" },
  { tempo: 121.1, energy: 0.78, danceability: 0.824, loudness: -2.99, acousticness: 0.173, instrumentalness: 0.0, key: "Em", genre: "Pop" },
  { tempo: 87.1, energy: 0.485, danceability: 0.271, loudness: -26.77, acousticness: 0.903, instrumentalness: 0.804, key: "C", genre: "Classical" },
  { tempo: 113.9, energy: 0.732, danceability: 0.762, loudness: -6.56, acousticness: 0.175, instrumentalness: 0.043, key: "E", genre: "Pop" },
  { tempo: 106.9, energy: 0.767, danceability: 0.691, loudness: -5.74, acousticness: 0.171, instrumentalness: 0.091, key: "E", genre: "Pop" },
  { tempo: 119.0, energy: 0.867, danceability: 0.802, loudness: -7.44, acousticness: 0.135, instrumentalness: 0.015, key: "Em", genre: "Pop" },
  { tempo: 110.5, energy: 0.652, danceability: 0.815, loudness: -3.53, acousticness: 0.048, instrumentalness: 0.067, key: "C", genre: "Pop" },
  { tempo: 113.1, energy: 0.759, danceability: 0.7, loudness: -1.93, acousticness: 0.115, instrumentalness: 0.208, key: "F", genre: "Pop" },
  { tempo: 111.3, energy: 0.898, danceability: 0.723, loudness: -1.39, acousticness: 0.218, instrumentalness: 0.0, key: "A", genre: "Pop" },
  { tempo: 119.3, energy: 0.727, danceability: 0.627, loudness: -7.94, acousticness: 0.186, instrumentalness: 0.063, key: "C", genre: "Pop" },
  { tempo: 111.2, energy: 0.702, danceability: 0.774, loudness: -4.92, acousticness: 0.113, instrumentalness: 0.0, key: "A", genre: "Pop" },
  { tempo: 116.9, energy: 0.749, danceability: 0.703, loudness: -6.11, acousticness: 0.101, instrumentalness: 0.039, key: "Bb", genre: "Pop" },
  { tempo: 81.0, energy: 0.439, danceability: 0.336, loudness: -16.5, acousticness: 0.98, instrumentalness: 0.913, key: "F", genre: "Classical" },
  { tempo: 147.4, energy: 0.848, danceability: 0.547, loudness: -6.25, acousticness: 0.136, instrumentalness: 0.238, key: "E", genre: "Rock" },
];

// Key encoding map (matching LabelEncoder behavior)
const KEY_ENCODING: Record<string, number> = {
  "A": 0, "Am": 1, "Bb": 2, "C": 3, "D": 4, "E": 5, "Em": 6, "F": 7, "G": 8
};

// MinMax scaler for tempo (from training data)
const TEMPO_MIN = 66.3;
const TEMPO_MAX = 152.5;

function scaleTempo(tempo: number): number {
  return (tempo - TEMPO_MIN) / (TEMPO_MAX - TEMPO_MIN);
}

function encodeKey(key: string): number {
  return KEY_ENCODING[key] ?? 0;
}

// Euclidean distance calculation
function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

// K-Nearest Neighbors classifier
function predictGenre(features: number[], k: number = 5): { genre: string; probabilities: Record<string, number> } {
  // Calculate distances to all training samples
  const distances = TRAINING_DATA.map(sample => {
    const sampleFeatures = [
      scaleTempo(sample.tempo),
      sample.energy,
      sample.danceability,
      sample.loudness,
      sample.acousticness,
      sample.instrumentalness,
      encodeKey(sample.key)
    ];
    return {
      distance: euclideanDistance(features, sampleFeatures),
      genre: sample.genre
    };
  });

  // Sort by distance and take k nearest
  distances.sort((a, b) => a.distance - b.distance);
  const nearest = distances.slice(0, k);

  // Count votes
  const votes: Record<string, number> = {};
  nearest.forEach(({ genre }) => {
    votes[genre] = (votes[genre] || 0) + 1;
  });

  // Calculate probabilities
  const probabilities: Record<string, number> = {};
  Object.entries(votes).forEach(([genre, count]) => {
    probabilities[genre] = count / k;
  });

  // Get predicted genre (most votes)
  const predictedGenre = Object.entries(votes).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  return { genre: predictedGenre, probabilities };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tempo, energy, danceability, loudness, acousticness, instrumentalness, key } = await req.json();

    console.log('Prediction request:', { tempo, energy, danceability, loudness, acousticness, instrumentalness, key });

    // Validate inputs
    if (typeof tempo !== 'number' || typeof energy !== 'number' || typeof danceability !== 'number' ||
        typeof loudness !== 'number' || typeof acousticness !== 'number' || typeof instrumentalness !== 'number') {
      return new Response(
        JSON.stringify({ error: 'All numeric features are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare features for prediction
    const features = [
      scaleTempo(tempo),
      energy,
      danceability,
      loudness,
      acousticness,
      instrumentalness,
      encodeKey(key || 'C')
    ];

    // Make prediction
    const result = predictGenre(features, 5);

    console.log('Prediction result:', result);

    return new Response(
      JSON.stringify({
        predicted_genre: result.genre,
        probabilities: result.probabilities
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Prediction error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
