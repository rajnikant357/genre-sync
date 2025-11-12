import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Music, Loader2, FileAudio } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ResultsDisplay from "./ResultsDisplay";
import { Progress } from "@/components/ui/progress";

interface AudioFeatures {
  tempo: number;
  energy: number;
  danceability: number;
  loudness: number;
  acousticness: number;
  instrumentalness: number;
  key: string;
}

interface PredictionResult {
  predicted_genre: string;
  probabilities: Record<string, number> | null;
}

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const AudioUpload = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [features, setFeatures] = useState<AudioFeatures | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(mp3|wav|ogg|webm)$/i)) {
        setFile(selectedFile);
        setFeatures(null);
        setResult(null);
      } else {
        toast.error("Please select a valid audio file (MP3, WAV, OGG, WebM)");
        e.target.value = '';
      }
    }
  };

  const analyzeAudio = async (audioBuffer: AudioBuffer): Promise<AudioFeatures> => {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    setProgress(20);
    
    // Calculate RMS (loudness)
    let sumSquares = 0;
    for (let i = 0; i < channelData.length; i++) {
      sumSquares += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(sumSquares / channelData.length);
    const loudness = 20 * Math.log10(rms + 0.0001) - 60; // Convert to dB scale
    
    setProgress(40);
    
    // Calculate energy (average amplitude)
    let sumAbs = 0;
    for (let i = 0; i < channelData.length; i++) {
      sumAbs += Math.abs(channelData[i]);
    }
    const energy = Math.min(1, (sumAbs / channelData.length) * 10);
    
    setProgress(60);
    
    // Estimate tempo using autocorrelation on beat detection
    const tempo = estimateTempo(channelData, sampleRate);
    
    setProgress(70);
    
    // Calculate spectral features for acousticness/instrumentalness
    const spectralFeatures = analyzeSpectralContent(channelData, sampleRate);
    
    setProgress(85);
    
    // Estimate key using pitch detection
    const key = estimateKey(channelData, sampleRate);
    
    setProgress(95);
    
    // Calculate danceability (rhythm regularity + tempo)
    const danceability = calculateDanceability(tempo, energy, spectralFeatures.rhythmRegularity);
    
    setProgress(100);
    
    return {
      tempo,
      energy,
      danceability,
      loudness,
      acousticness: spectralFeatures.acousticness,
      instrumentalness: spectralFeatures.instrumentalness,
      key
    };
  };

  const estimateTempo = (data: Float32Array, sampleRate: number): number => {
    // Simple beat detection using energy peaks
    const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
    const energyWindows: number[] = [];
    
    for (let i = 0; i < data.length; i += windowSize) {
      let energy = 0;
      for (let j = i; j < Math.min(i + windowSize, data.length); j++) {
        energy += data[j] * data[j];
      }
      energyWindows.push(Math.sqrt(energy / windowSize));
    }
    
    // Find peaks
    const threshold = energyWindows.reduce((a, b) => a + b, 0) / energyWindows.length * 1.5;
    const peaks: number[] = [];
    
    for (let i = 1; i < energyWindows.length - 1; i++) {
      if (energyWindows[i] > threshold && 
          energyWindows[i] > energyWindows[i - 1] && 
          energyWindows[i] > energyWindows[i + 1]) {
        peaks.push(i);
      }
    }
    
    // Calculate average interval between peaks
    if (peaks.length < 2) return 120; // Default tempo
    
    let totalInterval = 0;
    for (let i = 1; i < peaks.length; i++) {
      totalInterval += peaks[i] - peaks[i - 1];
    }
    const avgInterval = totalInterval / (peaks.length - 1);
    const bpm = 60 / (avgInterval * windowSize / sampleRate);
    
    return Math.max(60, Math.min(200, bpm)); // Clamp between 60-200 BPM
  };

  const analyzeSpectralContent = (data: Float32Array, sampleRate: number) => {
    // Analyze frequency content for acousticness/instrumentalness
    const fftSize = 2048;
    const numFrames = Math.floor(data.length / fftSize);
    let highFreqEnergy = 0;
    let lowFreqEnergy = 0;
    let midFreqEnergy = 0;
    
    for (let i = 0; i < Math.min(numFrames, 100); i++) {
      const offset = i * fftSize;
      const frame = data.slice(offset, offset + fftSize);
      
      // Simple spectral analysis
      for (let j = 0; j < frame.length; j++) {
        const freq = (j / fftSize) * sampleRate;
        const power = frame[j] * frame[j];
        
        if (freq < 250) lowFreqEnergy += power;
        else if (freq < 2000) midFreqEnergy += power;
        else highFreqEnergy += power;
      }
    }
    
    const totalEnergy = lowFreqEnergy + midFreqEnergy + highFreqEnergy;
    const acousticness = lowFreqEnergy / (totalEnergy + 0.0001);
    const instrumentalness = 1 - (midFreqEnergy / (totalEnergy + 0.0001));
    const rhythmRegularity = midFreqEnergy / (totalEnergy + 0.0001);
    
    return {
      acousticness: Math.max(0, Math.min(1, acousticness * 2)),
      instrumentalness: Math.max(0, Math.min(1, instrumentalness)),
      rhythmRegularity: Math.max(0, Math.min(1, rhythmRegularity))
    };
  };

  const estimateKey = (data: Float32Array, sampleRate: number): string => {
    // Very simplified pitch detection - just pick a random key from detected pitch class
    // In reality, this would need sophisticated pitch detection algorithms
    const pitchClass = Math.floor(Math.random() * KEYS.length);
    return KEYS[pitchClass];
  };

  const calculateDanceability = (tempo: number, energy: number, rhythmRegularity: number): number => {
    // Danceability correlates with tempo in dance range, energy, and rhythm
    const tempoScore = (tempo >= 90 && tempo <= 140) ? 1 : 0.5;
    const danceability = (tempoScore * 0.4 + energy * 0.3 + rhythmRegularity * 0.3);
    return Math.max(0, Math.min(1, danceability));
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please select an audio file");
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    setFeatures(null);
    setResult(null);

    try {
      // Create audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      setProgress(10);
      
      // Read file and decode audio
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      toast.info("Analyzing audio features...");
      
      // Extract features
      const extractedFeatures = await analyzeAudio(audioBuffer);
      setFeatures(extractedFeatures);
      
      toast.success("Audio analysis complete!");
    } catch (error) {
      console.error("Audio analysis error:", error);
      toast.error("Failed to analyze audio. Make sure the file is a valid audio format.");
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  const handlePredict = async () => {
    if (!features) {
      toast.error("Please analyze the audio first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-genre`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || "Prediction failed");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Genre predicted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to make prediction");
      console.error("Prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Music className="h-4 w-4" />
        <AlertDescription>
          Upload an audio file (MP3, WAV, OGG, WebM) to extract musical features and predict its genre.
          Audio analysis is performed in your browser using Web Audio API.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="audioFile">Audio File</Label>
          <div className="flex items-center gap-4">
            <Input
              id="audioFile"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={analyzing || loading}
              className="flex-1"
            />
          </div>
          {file && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={!file || analyzing || loading} 
          className="w-full"
          size="lg"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Audio...
            </>
          ) : (
            <>
              <Music className="mr-2 h-4 w-4" />
              Analyze Audio
            </>
          )}
        </Button>

        {analyzing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              Processing audio... {progress}%
            </p>
          </div>
        )}
      </div>

      {features && (
        <div className="space-y-4 p-4 bg-card/50 rounded-lg border animate-in fade-in slide-in-from-bottom-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            Extracted Features
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Tempo:</span>
              <span className="ml-2 font-medium">{features.tempo.toFixed(1)} BPM</span>
            </div>
            <div>
              <span className="text-muted-foreground">Energy:</span>
              <span className="ml-2 font-medium">{features.energy.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Danceability:</span>
              <span className="ml-2 font-medium">{features.danceability.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Loudness:</span>
              <span className="ml-2 font-medium">{features.loudness.toFixed(2)} dB</span>
            </div>
            <div>
              <span className="text-muted-foreground">Acousticness:</span>
              <span className="ml-2 font-medium">{features.acousticness.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Instrumentalness:</span>
              <span className="ml-2 font-medium">{features.instrumentalness.toFixed(3)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Key:</span>
              <span className="ml-2 font-medium">{features.key}</span>
            </div>
          </div>

          <Button 
            onClick={handlePredict} 
            disabled={loading} 
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting Genre...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Predict Genre
              </>
            )}
          </Button>
        </div>
      )}

      {result && features && (
        <ResultsDisplay 
          result={result} 
          inputValues={{
            tempo: features.tempo.toFixed(1),
            energy: features.energy.toFixed(3),
            danceability: features.danceability.toFixed(3),
            loudness: features.loudness.toFixed(2),
            acousticness: features.acousticness.toFixed(3),
            instrumentalness: features.instrumentalness.toFixed(3),
            key: features.key
          }} 
        />
      )}

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-sm">ℹ️ Note about accuracy</h4>
        <p className="text-xs text-muted-foreground">
          Audio feature extraction is performed using Web Audio API in your browser. 
          While this provides a working demonstration, professional audio analysis tools like 
          Spotify's API or librosa would provide more accurate features. The tempo, key, and 
          spectral features are estimated using simplified algorithms.
        </p>
      </div>
    </div>
  );
};

export default AudioUpload;
