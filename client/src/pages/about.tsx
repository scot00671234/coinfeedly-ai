import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { BrainIcon, TargetIcon, TrendingUpIcon, DatabaseIcon } from "lucide-react";
import { NavigationMenu } from "../components/navigation-menu";
import { SmartBackButton } from "../components/smart-back-button";
import { motion } from "framer-motion";

export default function About() {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20 pointer-events-none" />
      {/* Header */}
      <header className="sticky top-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="text-lg font-medium text-foreground">Coin Feedly</span>
            </Link>
            
            <NavigationMenu currentPath={location} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-24">
        <SmartBackButton className="mb-12" />
        
        {/* Hero Section */}
        <motion.section 
          className="text-center mb-20 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 sm:mb-8 tracking-tight">
            About Coin Feedly
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Transparent AI-powered commodity price prediction platform providing unbiased analysis and performance tracking.
          </p>
        </motion.section>

        <div className="space-y-16 md:space-y-20">
          {/* Mission */}
          <section>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TargetIcon className="h-5 w-5" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  Coin Feedly was created to bring transparency and accountability to AI-powered market predictions. 
                  We believe that as artificial intelligence becomes increasingly important in financial decision-making, 
                  there must be reliable, unbiased platforms to evaluate and compare AI model performance.
                </p>
                <p className="text-foreground leading-relaxed">
                  Our platform provides real-time tracking and analysis of commodity price predictions from leading AI models, 
                  helping users understand which AI systems perform best under different market conditions.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* How It Works */}
          <section>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BrainIcon className="h-5 w-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Data Collection</h4>
                    <p className="text-sm text-muted-foreground">
                      We collect real-time commodity price data from Yahoo Finance covering 14 major commodities 
                      including crude oil, gold, natural gas, coffee, corn, and more.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">AI Predictions</h4>
                    <p className="text-sm text-muted-foreground">
                      Leading AI models (Claude, ChatGPT, Deepseek) generate monthly price predictions with 
                      3, 6, 9, and 12-month timeframes using comprehensive market analysis.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Accuracy Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      We calculate prediction accuracy using multiple metrics including directional accuracy, 
                      mean absolute percentage error (MAPE), and threshold-based analysis.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Performance Rankings</h4>
                    <p className="text-sm text-muted-foreground">
                      Models are ranked by performance across different commodities and time periods, 
                      with detailed analytics and trend analysis available.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Technology */}
          <section>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <DatabaseIcon className="h-5 w-5" />
                  Technology & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed"> 
                  Coin Feedly processes thousands of data points daily to provide accurate, 
                  up-to-date performance metrics.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-semibold text-foreground mb-1">14</div>
                    <div className="text-xs text-muted-foreground">Commodities Tracked</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-semibold text-foreground mb-1">3</div>
                    <div className="text-xs text-muted-foreground">AI Models Compared</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-semibold text-foreground mb-1">4</div>
                    <div className="text-xs text-muted-foreground">Prediction Timeframes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Values */}
          <section>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUpIcon className="h-5 w-5" />
                  Our Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Transparency</h4>
                    <p className="text-sm text-muted-foreground">
                      All prediction methodologies, accuracy calculations, and data sources are openly documented and accessible.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Objectivity</h4>
                    <p className="text-sm text-muted-foreground">
                      We maintain strict neutrality, presenting unbiased comparisons without favoring any AI model or provider.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Accuracy</h4>
                    <p className="text-sm text-muted-foreground">
                      Real-time data integration and robust accuracy metrics ensure reliable performance tracking and analysis.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Innovation</h4>
                    <p className="text-sm text-muted-foreground">
                      Continuously improving our analytics and expanding coverage to provide the most comprehensive AI evaluation platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="p-8">
                <h3 className="text-xl font-medium text-foreground mb-4">
                  Ready to Explore AI Predictions?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Access our comprehensive dashboard and start analyzing AI model performance across commodity markets.
                </p>
                <Button asChild>
                  <Link href="/dashboard">
                    View Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Modern Footer */}
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
              <span className="font-semibold text-foreground">Coin Feedly</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>© 2025 Coin Feedly</p>
              <p className="text-xs">Loremt ApS CVR-nr 41691360</p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}