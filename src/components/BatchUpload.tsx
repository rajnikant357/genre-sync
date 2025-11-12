import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BatchResult {
  counts: Record<string, number>;
}

const BatchUpload = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BatchResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast.error("Please select a valid CSV file");
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Parse CSV and make predictions for each row
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      // Validate CSV format
      const requiredCols = ['tempo', 'energy', 'danceability', 'loudness', 'acousticness', 'instrumentalness', 'key'];
      const hasAllCols = requiredCols.every(col => headers.some(h => h.trim().toLowerCase() === col));
      
      if (!hasAllCols) {
        throw new Error('CSV must contain: tempo, energy, danceability, loudness, acousticness, instrumentalness, key');
      }

      const predictions: string[] = [];
      
      // Process each row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length) continue;
        
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header.trim().toLowerCase()] = values[idx]?.trim();
        });

        // Make prediction for this row
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-genre`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tempo: parseFloat(row.tempo),
            energy: parseFloat(row.energy),
            danceability: parseFloat(row.danceability),
            loudness: parseFloat(row.loudness),
            acousticness: parseFloat(row.acousticness),
            instrumentalness: parseFloat(row.instrumentalness),
            key: row.key || 'C'
          })
        });

        if (response.ok) {
          const data = await response.json();
          predictions.push(data.predicted_genre);
        }
      }

      // Count predictions
      const counts: Record<string, number> = {};
      predictions.forEach(genre => {
        counts[genre] = (counts[genre] || 0) + 1;
      });

      setResult({ counts });
      toast.success(`Processed ${predictions.length} tracks!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process file");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Upload a CSV file containing columns: tempo, energy, danceability, loudness, acousticness, instrumentalness, and key.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="csvFile">CSV File</Label>
          <div className="flex items-center gap-4">
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
              className="flex-1"
            />
          </div>
          {file && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading || !file} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload and Predict
            </>
          )}
        </Button>
      </form>

      {result && (
        <Card className="p-6 bg-card/50">
          <h3 className="text-lg font-semibold mb-4">Prediction Summary</h3>
          <div className="space-y-3">
            {Object.entries(result.counts).map(([genre, count]) => (
              <div key={genre} className="flex items-center justify-between">
                <span className="text-sm font-medium">{genre}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-music rounded-full transition-all"
                      style={{ 
                        width: `${(count / Math.max(...Object.values(result.counts))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Total tracks processed: {Object.values(result.counts).reduce((a, b) => a + b, 0)}
          </p>
        </Card>
      )}

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-sm">CSV Format Example:</h4>
        <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`tempo,energy,danceability,loudness,acousticness,instrumentalness,key
120.5,0.85,0.72,-5.2,0.12,0.001,C
95.0,0.45,0.60,-8.5,0.65,0.85,D#
140.0,0.92,0.88,-3.1,0.05,0.0,F`}
        </pre>
      </div>
    </div>
  );
};

export default BatchUpload;
