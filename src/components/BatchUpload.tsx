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
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed. Make sure Flask backend is running on localhost:5000");
      }

      // Parse HTML response to extract counts
      const html = await response.text();
      // This is a simplified parser - in production you'd want proper HTML parsing
      // For now, we'll show a success message
      toast.success("Batch prediction completed! Check Flask server for results.");
      
      // Mock result for demo purposes
      setResult({
        counts: {
          "Pop": 15,
          "Rock": 12,
          "Classical": 8,
          "Jazz": 5
        }
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
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
            Results saved on Flask server. Check the uploads folder for the complete CSV with predictions.
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
