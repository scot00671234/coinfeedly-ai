import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Activity } from 'lucide-react';

interface CompositeIndex {
  id: string;
  date: string;
  overallIndex: string;
  hardCommoditiesIndex: string;
  softCommoditiesIndex: string;
  directionalComponent: string;
  confidenceComponent: string;
  accuracyComponent: string;
  momentumComponent: string;
  totalPredictions: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  createdAt: string;
}

interface CompositeIndexGaugeProps {
  className?: string;
}

export function CompositeIndexGauge({ className }: CompositeIndexGaugeProps) {
  const [latestIndex, setLatestIndex] = useState<CompositeIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestIndex();
  }, []);

  const fetchLatestIndex = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/composite-index/latest');
      if (response.ok) {
        const data = await response.json();
        setLatestIndex(data);
        setError(null);
      } else if (response.status === 404) {
        setError('No index data available');
      } else {
        throw new Error('Failed to fetch composite index');
      }
    } catch (err) {
      setError('Failed to load composite index');
      console.error('Error fetching composite index:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string): string => {
    return 'text-foreground';
  };

  const getSentimentBadgeVariant = (sentiment: string) => {
    return 'secondary';
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getIndexDescription = (value: number): string => {
    if (value >= 70) return 'Extreme AI Optimism';
    if (value >= 55) return 'AI Bullish';
    if (value >= 45) return 'AI Neutral/Mixed';
    if (value >= 30) return 'AI Bearish';
    return 'Extreme AI Pessimism';
  };

  if (loading) {
    return (
      <Card className={`${className} border-border/40 bg-background h-[280px]`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-foreground">AI Composite Index</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col justify-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">
              Initializing Market Data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !latestIndex) {
    return (
      <Card className={`${className} border-border/40 bg-background h-[280px]`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-foreground">AI Composite Index</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col justify-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                {error || 'No data available'}
              </p>
              <button 
                onClick={fetchLatestIndex}
                className="text-xs text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const indexValue = parseFloat(latestIndex.overallIndex);
  const hardIndex = parseFloat(latestIndex.hardCommoditiesIndex);
  const softIndex = parseFloat(latestIndex.softCommoditiesIndex);

  // Calculate gauge position (0-100 scale)
  const gaugePosition = Math.max(0, Math.min(100, indexValue));
  const gaugeRotation = (gaugePosition / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <Card className={`${className} border-border/40 bg-background h-[280px] flex flex-col`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium text-foreground">
            AI Composite Index
          </CardTitle>
          <Badge variant="outline" className="ml-auto text-xs px-2 py-0.5 border-border/50 text-muted-foreground">
            {latestIndex.marketSentiment.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col space-y-4">
        {/* Compact Gauge */}
        <div className="text-center space-y-3">
          <div className={`text-4xl font-bold ${getSentimentColor(latestIndex.marketSentiment)}`}>
            {indexValue.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">
            {getIndexDescription(indexValue)}
          </div>
          <div className="w-full bg-border/30 rounded-full h-1">
            <div 
              className="bg-foreground/60 h-1 rounded-full transition-all duration-700"
              style={{ width: `${gaugePosition}%` }}
            />
          </div>
        </div>

        {/* Compact Sub-indices */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center space-y-1">
            <div className="text-lg font-semibold text-foreground">
              {hardIndex.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              Hard Commodities
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-semibold text-foreground">
              {softIndex.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              Soft Commodities
            </div>
          </div>
        </div>

        {/* Compact metadata */}
        <div className="text-center mt-auto">
          <div className="text-xs text-muted-foreground">
            {latestIndex.totalPredictions} predictions analyzed
          </div>
        </div>
      </CardContent>
    </Card>
  );
}