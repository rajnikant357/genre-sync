import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ResultsDisplay from "./ResultsDisplay";

const MUSIC_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

interface PredictionResult {
  predicted_genre: string;
  probabilities: Record<string, number> | null;
}

const PredictionForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState({
    tempo: "120",
    energy: "0.8",
    danceability: "0.7",
    loudness: "-5",
    acousticness: "0.1",
    instrumentalness: "0.0",
    key: "C"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tempo: parseFloat(formData.tempo),
          energy: parseFloat(formData.energy),
          danceability: parseFloat(formData.danceability),
          loudness: parseFloat(formData.loudness),
          acousticness: parseFloat(formData.acousticness),
          instrumentalness: parseFloat(formData.instrumentalness),
          key: formData.key
        })
      });

      if (!response.ok) {
        throw new Error("Prediction failed. Make sure Flask backend is running on localhost:5000");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Genre predicted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect to backend");
      console.error("Prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tempo */}
          <div className="space-y-2">
            <Label htmlFor="tempo">Tempo (BPM)</Label>
            <Input
              id="tempo"
              type="number"
              step="0.1"
              value={formData.tempo}
              onChange={(e) => handleInputChange("tempo", e.target.value)}
              placeholder="e.g., 120"
              required
            />
            <p className="text-xs text-muted-foreground">Beats per minute (typical range: 60-200)</p>
          </div>

          {/* Energy */}
          <div className="space-y-2">
            <Label htmlFor="energy">Energy</Label>
            <Input
              id="energy"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.energy}
              onChange={(e) => handleInputChange("energy", e.target.value)}
              placeholder="0.0 - 1.0"
              required
            />
            <p className="text-xs text-muted-foreground">Intensity and activity level (0.0 to 1.0)</p>
          </div>

          {/* Danceability */}
          <div className="space-y-2">
            <Label htmlFor="danceability">Danceability</Label>
            <Input
              id="danceability"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.danceability}
              onChange={(e) => handleInputChange("danceability", e.target.value)}
              placeholder="0.0 - 1.0"
              required
            />
            <p className="text-xs text-muted-foreground">How suitable for dancing (0.0 to 1.0)</p>
          </div>

          {/* Loudness */}
          <div className="space-y-2">
            <Label htmlFor="loudness">Loudness (dB)</Label>
            <Input
              id="loudness"
              type="number"
              step="0.1"
              value={formData.loudness}
              onChange={(e) => handleInputChange("loudness", e.target.value)}
              placeholder="e.g., -5"
              required
            />
            <p className="text-xs text-muted-foreground">Overall loudness in decibels (typically -60 to 0)</p>
          </div>

          {/* Acousticness */}
          <div className="space-y-2">
            <Label htmlFor="acousticness">Acousticness</Label>
            <Input
              id="acousticness"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.acousticness}
              onChange={(e) => handleInputChange("acousticness", e.target.value)}
              placeholder="0.0 - 1.0"
              required
            />
            <p className="text-xs text-muted-foreground">Confidence the track is acoustic (0.0 to 1.0)</p>
          </div>

          {/* Instrumentalness */}
          <div className="space-y-2">
            <Label htmlFor="instrumentalness">Instrumentalness</Label>
            <Input
              id="instrumentalness"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.instrumentalness}
              onChange={(e) => handleInputChange("instrumentalness", e.target.value)}
              placeholder="0.0 - 1.0"
              required
            />
            <p className="text-xs text-muted-foreground">Predicts if track contains no vocals (0.0 to 1.0)</p>
          </div>

          {/* Key */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="key">Musical Key</Label>
            <Select value={formData.key} onValueChange={(value) => handleInputChange("key", value)}>
              <SelectTrigger id="key">
                <SelectValue placeholder="Select key" />
              </SelectTrigger>
              <SelectContent>
                {MUSIC_KEYS.map(key => (
                  <SelectItem key={key} value={key}>{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">The key the track is in</p>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Predicting...
            </>
          ) : (
            "Predict Genre"
          )}
        </Button>
      </form>

      {result && <ResultsDisplay result={result} inputValues={formData} />}
    </div>
  );
};

export default PredictionForm;
