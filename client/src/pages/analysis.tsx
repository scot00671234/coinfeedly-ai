import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NavigationMenu } from "../components/navigation-menu";
import { SmartBackButton } from "../components/smart-back-button";
import { useLocation, Link } from "wouter";
import { TrendingUpIcon, TrendingDownIcon, ActivityIcon, InfoIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomBanner from "@/components/ads/BottomBanner";
import { motion } from "framer-motion";
import { useState } from "react";

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

interface FearGreedIndex {
  value: number;
  classification: string;
  timestamp: string;
  previousClose: number;
}

interface CategoryCompositeIndex {
  hard: CompositeIndex;
  soft: CompositeIndex;
}

function IndexGauge({ value, title, subtitle, classification, onClick }: {
  value: number;
  title: string;
  subtitle: string;
  classification?: string;
  onClick?: () => void;
}) {
  const getColor = (val: number) => {
    if (val >= 75) return "text-green-600 dark:text-green-400";
    if (val >= 60) return "text-green-500 dark:text-green-300";
    if (val >= 40) return "text-yellow-500 dark:text-yellow-300";
    if (val >= 25) return "text-orange-500 dark:text-orange-300";
    return "text-red-500 dark:text-red-300";
  };

  const getBgColor = (val: number) => {
    if (val >= 75) return "bg-green-100 dark:bg-green-900/20";
    if (val >= 60) return "bg-green-50 dark:bg-green-900/10";
    if (val >= 40) return "bg-yellow-50 dark:bg-yellow-900/10";
    if (val >= 25) return "bg-orange-50 dark:bg-orange-900/10";
    return "bg-red-50 dark:bg-red-900/10";
  };

  const getIcon = (val: number) => {
    if (val >= 50) return <TrendingUpIcon className="h-5 w-5" />;
    return <TrendingDownIcon className="h-5 w-5" />;
  };

  return (
    <Card 
      className={`${getBgColor(value)} border-2 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 aspect-square flex flex-col`}
      onClick={onClick}
    >
      <CardHeader className="pb-4 flex-1">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          {title}
          <div className="flex items-center space-x-2">
            <div className={`${getColor(value)} flex items-center`}>
              {getIcon(value)}
            </div>
            <InfoIcon className="h-4 w-4 text-muted-foreground opacity-60" />
          </div>
        </CardTitle>
        <CardDescription className="text-sm">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className={`text-4xl font-bold ${getColor(value)}`}>
            {value.toFixed(1)}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {classification && (
              <div className={`font-medium ${getColor(value)}`}>
                {classification}
              </div>
            )}
            <div>out of 100</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 w-full bg-muted/30 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              value >= 75 ? 'bg-green-500' :
              value >= 60 ? 'bg-green-400' :
              value >= 40 ? 'bg-yellow-400' :
              value >= 25 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${Math.max(2, value)}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analysis() {
  const [location] = useLocation();
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/export/full-report');
      if (!response.ok) {
        throw new Error('Failed to download report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AIForecast_Hub_Full_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const { data: overallComposite, isLoading: loadingOverall } = useQuery<CompositeIndex>({
    queryKey: ["/api/composite-index/latest"],
  });

  const { data: fearGreedIndex, isLoading: loadingFearGreed } = useQuery<FearGreedIndex>({
    queryKey: ["/api/fear-greed-index"],
  });

  // Use the same data source as dashboard for consistency
  const { data: latestCompositeIndex, isLoading: loadingCategories } = useQuery<CompositeIndex>({
    queryKey: ["/api/composite-index/latest"],
  });

  return (
    <div className="min-h-screen bg-background relative">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20 pointer-events-none" />
      {/* Minimal geometric background pattern */}
      <div className="absolute inset-0 text-foreground pointer-events-none">
        <svg className="w-full h-full object-cover opacity-20" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="indicesGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
            <linearGradient id="indicesFadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"currentColor", stopOpacity:0.03}} />
              <stop offset="50%" style={{stopColor:"currentColor", stopOpacity:0.01}} />
              <stop offset="100%" style={{stopColor:"currentColor", stopOpacity:0.04}} />
            </linearGradient>
          </defs>
          <rect width="800" height="600" fill="url(#indicesGrid)" />
          <rect width="800" height="600" fill="url(#indicesFadeGradient)" />
        </svg>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-foreground"></div>
            <span className="font-medium text-lg text-foreground">AIForecast Hub</span>
          </Link>
          
          <NavigationMenu currentPath={location} />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-16">
        <SmartBackButton className="mb-12" />
        
        <div className="space-y-8 md:space-y-16">
          
          {/* Page Title */}
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
              Analysis
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Real-time market sentiment and AI-powered commodity indices for comprehensive market analysis
            </p>
          </motion.div>

          {/* Market Indices Grid */}
          <section className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {/* Overall AI Commodity Composite Index */}
              {loadingOverall ? (
                <Card className="bg-muted/10 aspect-square flex items-center justify-center">
                  <div className="animate-spin">
                    <ActivityIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>
              ) : (
                <IndexGauge
                  value={parseFloat(overallComposite?.overallIndex || '50')}
                  title="AI Composite Index"
                  subtitle="All Commodities"
                  classification={
                    parseFloat(overallComposite?.overallIndex || '50') >= 75 ? "Extremely Bullish" :
                    parseFloat(overallComposite?.overallIndex || '50') >= 60 ? "Bullish" :
                    parseFloat(overallComposite?.overallIndex || '50') >= 40 ? "Neutral" :
                    parseFloat(overallComposite?.overallIndex || '50') >= 25 ? "Bearish" : "Extremely Bearish"
                  }
                  onClick={() => setSelectedIndex("composite")}
                />
              )}

              {/* Fear & Greed Index */}
              {loadingFearGreed ? (
                <Card className="bg-muted/10 aspect-square flex items-center justify-center">
                  <div className="animate-spin">
                    <ActivityIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>
              ) : (
                <IndexGauge
                  value={fearGreedIndex?.value || 50}
                  title="Fear & Greed"
                  subtitle="Market Sentiment"
                  classification={fearGreedIndex?.classification || "Neutral"}
                  onClick={() => setSelectedIndex("feargreed")}
                />
              )}

              {/* Hard Commodities */}
              {loadingCategories ? (
                <Card className="bg-muted/10 aspect-square flex items-center justify-center">
                  <div className="animate-spin">
                    <ActivityIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>
              ) : (
                <IndexGauge
                  value={parseFloat(latestCompositeIndex?.hardCommoditiesIndex || '50')}
                  title="Hard Commodities"
                  subtitle="Metals & Energy"
                  classification={
                    parseFloat(latestCompositeIndex?.hardCommoditiesIndex || '50') >= 75 ? "Very Bullish" :
                    parseFloat(latestCompositeIndex?.hardCommoditiesIndex || '50') >= 60 ? "Bullish" :
                    parseFloat(latestCompositeIndex?.hardCommoditiesIndex || '50') >= 40 ? "Neutral" :
                    parseFloat(latestCompositeIndex?.hardCommoditiesIndex || '50') >= 25 ? "Bearish" : "Very Bearish"
                  }
                  onClick={() => setSelectedIndex("hard")}
                />
              )}

              {/* Soft Commodities */}
              {loadingCategories ? (
                <Card className="bg-muted/10 aspect-square flex items-center justify-center">
                  <div className="animate-spin">
                    <ActivityIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>
              ) : (
                <IndexGauge
                  value={parseFloat(latestCompositeIndex?.softCommoditiesIndex || '50')}
                  title="Soft Commodities"
                  subtitle="Agriculture & Food"
                  classification={
                    parseFloat(latestCompositeIndex?.softCommoditiesIndex || '50') >= 75 ? "Very Bullish" :
                    parseFloat(latestCompositeIndex?.softCommoditiesIndex || '50') >= 60 ? "Bullish" :
                    parseFloat(latestCompositeIndex?.softCommoditiesIndex || '50') >= 40 ? "Neutral" :
                    parseFloat(latestCompositeIndex?.softCommoditiesIndex || '50') >= 25 ? "Bearish" : "Very Bearish"
                  }
                  onClick={() => setSelectedIndex("soft")}
                />
              )}
            </div>
          </section>

          {/* Data Export Section */}
          <section className="space-y-8 mt-16">
            <motion.div 
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Complete Data Export
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                Download a comprehensive Excel report containing all AI prediction data, commodity information, and model performance metrics across all timeframes.
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="pt-4"
              >
                <Button 
                  onClick={handleDownloadReport} 
                  disabled={isDownloading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium min-h-[44px]"
                  size="lg"
                >
                  <DownloadIcon className="h-5 w-5 mr-3" />
                  {isDownloading ? 'Generating Report...' : 'Download Full Report (Excel)'}
                </Button>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Includes: All predictions • Commodities data • AI model information • Historical performance</p>
                </div>
              </motion.div>
            </motion.div>
          </section>

        </div>
      </main>

      {/* Methodology Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedIndex === "composite" && "AI Commodity Composite Index Methodology"}
              {selectedIndex === "feargreed" && "Fear & Greed Index Methodology"}
              {selectedIndex === "hard" && "Hard Commodities Index Methodology"}
              {selectedIndex === "soft" && "Soft Commodities Index Methodology"}
            </DialogTitle>
            <DialogDescription>
              {selectedIndex === "composite" && "Understanding how we combine multiple AI model predictions into a single market intelligence score"}
              {selectedIndex === "feargreed" && "How we measure market sentiment using volatility and behavioral indicators"}
              {selectedIndex === "hard" && "AI-powered analysis focused on metals, energy, and industrial commodities"}
              {selectedIndex === "soft" && "AI-powered analysis focused on agricultural and food commodities"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedIndex === "composite" && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Calculation Methodology</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="font-medium">Directional Sentiment</span>
                      <span className="text-sm text-muted-foreground">40% weight</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="font-medium">Confidence Score</span>
                      <span className="text-sm text-muted-foreground">25% weight</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="font-medium">Accuracy Weight</span>
                      <span className="text-sm text-muted-foreground">20% weight</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="font-medium">Momentum Component</span>
                      <span className="text-sm text-muted-foreground">15% weight</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Sources</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Claude AI predictions across all commodity categories</li>
                    <li>• ChatGPT (GPT-4) price forecasts and market analysis</li>
                    <li>• DeepSeek AI predictions with confidence intervals</li>
                    <li>• Historical accuracy weighting based on past performance</li>
                    <li>• Real-time price data from Yahoo Finance API</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Index Interpretation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>75-100:</span> <span className="text-green-600">Extremely Bullish</span></div>
                    <div className="flex justify-between"><span>60-74:</span> <span className="text-green-500">Bullish</span></div>
                    <div className="flex justify-between"><span>40-59:</span> <span className="text-yellow-500">Neutral</span></div>
                    <div className="flex justify-between"><span>25-39:</span> <span className="text-orange-500">Bearish</span></div>
                    <div className="flex justify-between"><span>0-24:</span> <span className="text-red-500">Extremely Bearish</span></div>
                  </div>
                </div>
              </>
            )}

            {selectedIndex === "feargreed" && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Calculation Methodology</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <span className="font-medium">VIX Volatility Analysis</span>
                      <p className="text-sm text-muted-foreground mt-1">Uses the CBOE Volatility Index to gauge market fear levels</p>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <span className="font-medium">Price Momentum Indicators</span>
                      <p className="text-sm text-muted-foreground mt-1">Analyzes recent price movements and trends</p>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <span className="font-medium">Market Behavior Patterns</span>
                      <p className="text-sm text-muted-foreground mt-1">Incorporates historical volatility patterns</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">VIX Interpretation Scale</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>VIX 0-12:</span> <span className="text-green-600">Extreme Greed</span></div>
                    <div className="flex justify-between"><span>VIX 12-17:</span> <span className="text-green-500">Greed</span></div>
                    <div className="flex justify-between"><span>VIX 17-25:</span> <span className="text-yellow-500">Neutral</span></div>
                    <div className="flex justify-between"><span>VIX 25-35:</span> <span className="text-orange-500">Fear</span></div>
                    <div className="flex justify-between"><span>VIX 35+:</span> <span className="text-red-500">Extreme Fear</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Sources</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• CBOE VIX (Volatility Index) real-time data</li>
                    <li>• Market volatility patterns and historical analysis</li>
                    <li>• Yahoo Finance API for current market conditions</li>
                    <li>• Sentiment adjustments based on recent price movements</li>
                  </ul>
                </div>
              </>
            )}

            {(selectedIndex === "hard" || selectedIndex === "soft") && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Category-Specific Analysis</h3>
                  <div className="p-3 bg-muted/20 rounded-lg mb-4">
                    <span className="font-medium">
                      {selectedIndex === "hard" ? "Hard Commodities Include:" : "Soft Commodities Include:"}
                    </span>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      {selectedIndex === "hard" ? (
                        <>
                          <li>• Crude Oil, Natural Gas (Energy)</li>
                          <li>• Gold, Silver, Copper (Precious & Base Metals)</li>
                          <li>• Aluminum, Platinum, Palladium (Industrial Metals)</li>
                        </>
                      ) : (
                        <>
                          <li>• Corn, Soybeans, Wheat (Grains)</li>
                          <li>• Coffee, Sugar, Cotton (Soft Commodities)</li>
                          <li>• Agricultural products and food commodities</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Calculation Methodology</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Uses the same AI composite methodology as the overall index</p>
                    <p>• Applies category-specific weighting for relevant commodities</p>
                    <p>• Combines predictions from Claude, ChatGPT, and DeepSeek</p>
                    <p>• Weighted by directional sentiment (40%), confidence (25%), accuracy (20%), momentum (15%)</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Unique Insights</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {selectedIndex === "hard" ? (
                      <>
                        <p>• Energy commodities often drive overall market sentiment</p>
                        <p>• Metals respond strongly to industrial demand and inflation</p>
                        <p>• Geopolitical factors heavily influence hard commodity prices</p>
                      </>
                    ) : (
                      <>
                        <p>• Weather patterns significantly impact agricultural commodities</p>
                        <p>• Seasonal factors create predictable price cycles</p>
                        <p>• Food security and trade policies affect soft commodity markets</p>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Banner Ad */}
      <BottomBanner />

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 mt-20 md:mt-32">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20">
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="font-semibold text-lg text-foreground">AIForecast Hub</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">© 2025 AIForecast Hub</p>
              <p className="text-sm text-muted-foreground">Loremt ApS CVR-nr 41691360</p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}