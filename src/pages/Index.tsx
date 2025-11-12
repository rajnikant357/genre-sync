import { useState } from "react";
import { Music, Upload, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PredictionForm from "@/components/PredictionForm";
import BatchUpload from "@/components/BatchUpload";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [activeTab, setActiveTab] = useState("predict");

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <div className="bg-gradient-music pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Genre Detection</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            Music Genre Predictor
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Analyze music features and predict genres with machine learning. 
            Get instant predictions or process tracks in bulk.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <Card className="p-6 shadow-glow border-border/50 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="predict" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Single Prediction
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Batch Upload
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="predict">
              <PredictionForm />
            </TabsContent>
            
            <TabsContent value="batch">
              <BatchUpload />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Features section */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 mb-20">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Feature Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Analyzes tempo, energy, danceability, and more
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">AI Predictions</h3>
            <p className="text-sm text-muted-foreground">
              Machine learning model trained on thousands of tracks
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Batch Processing</h3>
            <p className="text-sm text-muted-foreground">
              Upload CSV files for bulk genre predictions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
