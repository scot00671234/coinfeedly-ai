import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation, Link } from "wouter";
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  ZapIcon, 
  MenuIcon, 
  BrainIcon,
  DollarSignIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckIcon,
  BotIcon,
  TargetIcon,
  ActivityIcon,
  PlayIcon,
  ClockIcon
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { AI_MODELS } from "@/lib/constants";
import { motion } from "framer-motion";
import { LivePriceCard } from "@/components/LivePriceCard";
import { useQuery } from "@tanstack/react-query";
import LandingChart from "@/components/dashboard/landing-chart";

export default function Landing() {
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  // Fetch live cryptocurrencies data for the landing page
  const { data: cryptocurrencies = [] } = useQuery<any[]>({
    queryKey: ['/api/cryptocurrencies'],
    staleTime: 300000, // 5 minutes
  });

  const features = [
    {
      icon: BotIcon,
      title: "AI Model Comparison",
      description: "Compare prediction accuracy between Claude, ChatGPT, and Deepseek AI models side-by-side with real performance data."
    },
    {
      icon: BarChart3Icon,
      title: "Real-Time Data",
      description: "Live cryptocurrency price tracking from CoinGecko covering 14 major digital assets including Bitcoin, Ethereum, and DeFi tokens."
    },
    {
      icon: TargetIcon,
      title: "Accuracy Analytics",
      description: "Detailed performance metrics, ranking systems, and trend analysis to track AI prediction reliability."
    }
  ];

  const benefits = [
    "Track 14 major cryptocurrencies including Bitcoin, Ethereum, Solana, and more",
    "Compare Claude, ChatGPT, and Deepseek prediction accuracy",
    "Real-time CoinGecko cryptocurrency price data integration",
    "Performance rankings and analytics dashboard", 
    "Historical prediction data and trend analysis",
    "Clean, minimalist interface with dark/light themes"
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Banner */}
      <div className="bg-foreground text-background text-center py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium">
            <span className="inline-block bg-background/20 text-background px-2 py-1 rounded-full text-xs font-semibold mr-3">New</span>
            AI Cryptocurrency Prediction Platform - Compare Claude, ChatGPT & Deepseek accuracy
            <Link href="/dashboard" className="ml-2 underline hover:no-underline font-semibold">
              Try Now →
            </Link>
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="text-lg font-semibold text-foreground">Coin Feedly</span>
            </div>
            
            {/* Navigation - hidden on mobile, shown on desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button 
                onClick={handleGetStarted}
                size="sm" 
                variant="minimal"
                className="hidden md:inline-flex text-xs font-medium"
                data-testid="header-cta-button"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 lg:py-28 px-4 md:px-6 relative overflow-hidden">
        {/* Clean static background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(var(--primary)_/_0.1)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(var(--muted-foreground)_/_0.05)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 backdrop-blur-[0.5px]" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            className="space-y-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-8">
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              >
                Compare AI Models on
                <span className="block text-muted-foreground font-normal mt-1">
                  Crypto Predictions
                </span>
              </motion.h1>
              <motion.p 
                className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal px-4 sm:px-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                Track and analyze the prediction accuracy of Claude, ChatGPT, and Deepseek 
                across 14 major cryptocurrencies with real market data.
              </motion.p>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="px-6 py-2.5 text-sm font-medium rounded-lg shadow-sm hover:shadow-md"
                data-testid="get-started-button"
              >
                Start Analyzing <ArrowRightIcon className="ml-2 h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/about")}
                className="px-6 py-2.5 text-sm font-medium rounded-lg"
                data-testid="learn-more-button"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-6 md:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(var(--muted-foreground)_/_0.03)_0%,_transparent_70%)]" />
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get comprehensive insights into AI prediction performance with real-time market data
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <Card className="border-border/20 bg-background hover:bg-muted/30 hover:scale-[1.02] transition-all duration-200 h-full">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-medium mb-2">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-center leading-relaxed text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 tracking-tight">
              AI Models Compared
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Track and compare prediction accuracy across leading AI models
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {Object.entries(AI_MODELS).map(([key, model], index) => (
              <motion.div 
                key={key} 
                className="text-center p-6 rounded-xl border border-border/20 bg-background hover:bg-muted/30 hover:scale-[1.02] transition-all duration-200"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div 
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${model.color}15`, border: `1px solid ${model.color}30` }}
                >
                  <BrainIcon className="h-6 w-6" style={{ color: model.color }} />
                </div>
                <h3 className="text-lg font-medium mb-2">{model.name}</h3>
                <p className="text-muted-foreground text-sm">{model.provider}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Chart Preview Section */}
      <section className="py-16 md:py-24 px-6 md:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(var(--primary)_/_0.05)_0%,_transparent_70%)]" />
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Live Predictions</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 tracking-tight">
              Real AI Prediction Chart
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              See how our AI models compare with real market data and predictions
            </p>
          </motion.div>
          
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Card className="border-border/20 bg-background/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-background via-muted/5 to-background p-6 border-b border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <h3 className="text-lg font-semibold text-foreground">Bitcoin Price Predictions</h3>
                      <span className="text-sm text-muted-foreground bg-muted/40 px-3 py-1 rounded-full">Live Data</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white dark:bg-black rounded-full"></div>
                        <span className="text-muted-foreground">Actual Price</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-muted-foreground">Claude</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-muted-foreground">ChatGPT</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-muted-foreground">Deepseek</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {cryptocurrencies.length > 0 && (
                    <LandingChart 
                      cryptocurrencyId={cryptocurrencies.find(c => c.name === 'Bitcoin')?.id || cryptocurrencies[0]?.id} 
                      period="3mo" 
                      height={400} 
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <p className="text-muted-foreground mb-6">
              Interactive charts with 14 cryptocurrencies and real-time AI predictions
            </p>
            <Button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-xl font-normal transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
            >
              Explore All Charts <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        </div>
      </section>

      {/* Live Market Data Section */}
      <section className="py-16 md:py-24 px-6 md:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(var(--muted-foreground)_/_0.03)_0%,_transparent_70%)]" />
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Live Prices</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 tracking-tight">
              Real-Time Market Data
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Live cryptocurrency prices powered by our optimized CoinGecko integration
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            {cryptocurrencies.slice(0, 8).map((cryptocurrency, index: number) => (
              <motion.div
                key={cryptocurrency.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <LivePriceCard
                  cryptocurrencyId={cryptocurrency.id}
                  name={cryptocurrency.name}
                  symbol={cryptocurrency.symbol}
                  unit={cryptocurrency.unit}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {cryptocurrencies.length > 8 && (
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                + {cryptocurrencies.length - 8} more cryptocurrencies tracked
              </p>
              <Button
                onClick={handleGetStarted}
                variant="outline"
                size="sm"
                className="px-4 py-2 text-sm font-medium rounded-lg"
              >
                View All Markets <ArrowRightIcon className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 md:py-24 px-6 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 tracking-tight">
              See It In Action
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get a preview of our comprehensive analytics dashboard
            </p>
          </motion.div>
          
          <motion.div 
            className="relative max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="relative bg-gradient-to-br from-background via-background to-muted/40 rounded-2xl border border-border/40 p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">aiforecasthub.com/dashboard</span>
                </div>
                <Button
                  onClick={handleGetStarted}
                  size="sm"
                  variant="outline"
                  className="backdrop-blur-sm"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Open Dashboard
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {/* AI Composite Index Mock */}
                  <Card className="border-border/40 bg-background h-[260px] md:h-[280px] flex flex-col">
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ActivityIcon className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-medium text-foreground">AI Composite Index</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs font-medium px-2 py-1">BULLISH</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col justify-center">
                      <div className="text-center space-y-1 md:space-y-2">
                        <div className="text-3xl md:text-4xl font-bold text-foreground">68.0</div>
                        <div className="text-sm text-muted-foreground font-medium">AI Bullish</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6 mt-3 md:mt-5">
                        <div className="text-center space-y-1">
                          <div className="text-lg md:text-xl font-semibold text-foreground">68.2</div>
                          <div className="text-xs text-muted-foreground font-medium">Hard Commodities</div>
                        </div>
                        <div className="text-center space-y-1">
                          <div className="text-lg md:text-xl font-semibold text-foreground">67.8</div>
                          <div className="text-xs text-muted-foreground font-medium">Soft Commodities</div>
                        </div>
                      </div>
                      <div className="text-center mt-3 md:mt-4">
                        <div className="text-xs text-muted-foreground">336 predictions analyzed</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Prediction Stats Mock */}
                  <Card className="border-border/40 bg-background h-[260px] md:h-[280px] flex flex-col">
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-center gap-2">
                        <TargetIcon className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-medium text-foreground">Prediction Stats</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col space-y-4 md:space-y-5">
                      <div className="grid grid-cols-2 gap-6 md:gap-8">
                        <div className="text-center space-y-1">
                          <div className="text-3xl md:text-4xl font-bold text-foreground">336</div>
                          <div className="text-xs text-muted-foreground font-medium">Total Predictions</div>
                        </div>
                        <div className="text-center space-y-1">
                          <div className="text-3xl md:text-4xl font-bold text-foreground">3</div>
                          <div className="text-xs text-muted-foreground font-medium">AI Models</div>
                        </div>
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-center py-1.5 md:py-2 border-b border-border/30">
                          <span className="text-xs text-muted-foreground font-medium">Coverage</span>
                          <span className="text-xs font-semibold text-foreground">14 Commodities</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 md:py-2">
                          <span className="text-xs text-muted-foreground font-medium">Recent Activity</span>
                          <div className="px-2 py-1 bg-muted/50 text-foreground text-xs rounded-full font-medium">Active</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Market Status Mock */}
                  <Card className="border-border/40 bg-background h-[260px] md:h-[280px] flex flex-col">
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3Icon className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-medium text-foreground">Market Status</CardTitle>
                        </div>
                        <div className="text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1.5 bg-muted/50 text-muted-foreground border border-border/50">
                          <ClockIcon className="h-3 md:h-4 w-3 md:w-4" />
                          <span className="hidden sm:inline">Market Closed</span>
                          <span className="sm:hidden">Closed</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col justify-center">
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex justify-between items-center py-1.5 md:py-2 border-b border-border/30">
                          <span className="text-xs text-muted-foreground font-medium">Data Source</span>
                          <span className="text-xs font-semibold text-foreground">Yahoo Finance</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 md:py-2 border-b border-border/30">
                          <span className="text-xs text-muted-foreground font-medium">Freshness</span>
                          <span className="text-xs font-semibold text-foreground">Real-time</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 md:py-2">
                          <span className="text-xs text-muted-foreground font-medium">Schedule</span>
                          <span className="text-xs font-semibold text-foreground">
                            <span className="hidden sm:inline">Market opens Monday 9 AM</span>
                            <span className="sm:hidden">Mon 9 AM</span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-light text-foreground">AI Model Performance</h2>
                    <div className="text-xs font-semibold px-2 py-1 rounded-md bg-background border border-border/40 text-muted-foreground">
                      Last 30 Days
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 hover:bg-muted/20 -mx-2 px-2 rounded-md transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground font-light">#1</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-sm font-light text-foreground">Deepseek</span>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-light text-foreground">87.4%</div>
                        <div className="text-xs text-muted-foreground font-light">Accuracy</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 hover:bg-muted/20 -mx-2 px-2 rounded-md transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground font-light">#2</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-light text-foreground">Claude</span>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-light text-foreground">84.2%</div>
                        <div className="text-xs text-muted-foreground font-light">Accuracy</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 hover:bg-muted/20 -mx-2 px-2 rounded-md transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground font-light">#3</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        <span className="text-sm font-light text-foreground">ChatGPT</span>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-light text-foreground">81.9%</div>
                        <div className="text-xs text-muted-foreground font-light">Accuracy</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-light pt-2 border-t border-border/20">
                    <span>Based on predictions across all commodities</span>
                    <span>Best performer: 87.4% accuracy</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-medium text-foreground mb-3">
              Why Choose Coin Feedly
            </h2>
            <p className="text-base text-muted-foreground">
              Everything you need to analyze AI prediction performance
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-6 bg-muted/20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">
              Start Analyzing AI Predictions Today
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get instant access to comprehensive AI model comparisons and real-time commodity price tracking.
            </p>
            <div className="pt-2">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="px-6 py-2.5 text-sm font-medium rounded-lg shadow-sm hover:shadow-md"
                data-testid="cta-button"
              >
                Access Dashboard <ArrowRightIcon className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-muted-foreground"></div>
              <span className="text-base font-semibold text-foreground">Coin Feedly</span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                About
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                FAQ
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                Blog
              </Link>
              <Link href="/policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                Policy
              </Link>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right space-y-1">
              <p>© 2025 Coin Feedly</p>
              <p className="text-xs">Loremt ApS CVR-nr 41691360</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}