import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music2, TrendingUp } from "lucide-react";

interface ResultsDisplayProps {
  result: {
    predicted_genre: string;
    probabilities: Record<string, number> | null;
  };
  inputValues: Record<string, string>;
}

const ResultsDisplay = ({ result, inputValues }: ResultsDisplayProps) => {
  const sortedProbs = result.probabilities 
    ? Object.entries(result.probabilities).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 bg-gradient-music border-0">
        <div className="flex items-center gap-3 mb-2">
          <Music2 className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Predicted Genre</h3>
        </div>
        <p className="text-4xl font-bold mb-2">{result.predicted_genre}</p>
        <p className="text-sm text-foreground/80">Based on the analyzed music features</p>
      </Card>

      {result.probabilities && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Confidence Scores</h3>
          </div>
          <div className="space-y-3">
            {sortedProbs.map(([genre, probability]) => (
              <div key={genre} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{genre}</span>
                  <span className="text-muted-foreground">{(probability * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-energy rounded-full transition-all duration-500"
                    style={{ width: `${probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-card/50">
        <h3 className="font-semibold mb-4">Input Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(inputValues).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground capitalize">{key}</span>
              <Badge variant="secondary" className="w-fit">
                {value}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
