import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { HelpCircleIcon } from "lucide-react";
import { NavigationMenu } from "../components/navigation-menu";
import { SmartBackButton } from "../components/smart-back-button";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const [location] = useLocation();
  
  const faqs = [
    {
      id: "accuracy",
      question: "How do you calculate AI prediction accuracy?",
      answer: "We use multiple metrics including Mean Absolute Percentage Error (MAPE), directional accuracy (whether predictions correctly identify price direction), and threshold-based analysis. Each AI model's predictions are compared against actual market prices at the prediction timeframe endpoints (3, 6, 9, and 12 months)."
    },
    {
      id: "models", 
      question: "Which AI models do you track and why?",
      answer: "We currently track Claude (Anthropic), ChatGPT (OpenAI), and Deepseek. These models were chosen for their advanced reasoning capabilities, market analysis skills, and widespread adoption. We plan to add more AI models as they become available and demonstrate cryptocurrency prediction capabilities."
    },
    {
      id: "data-sources",
      question: "Where does your price data come from?",
      answer: "All cryptocurrency price data is sourced from reliable market data providers including CoinGecko API, providing real-time and historical market data. This ensures consistency, reliability, and industry-standard pricing information for accurate prediction evaluation."
    },
    {
      id: "prediction-frequency",
      question: "How often are new predictions generated?",
      answer: "New AI predictions are generated monthly on the 1st of each month. This provides sufficient time for meaningful price movements while maintaining a robust dataset for accuracy analysis. Each prediction includes 3, 6, 9, and 12-month forecasts."
    },
    {
      id: "cryptocurrencies",
      question: "What cryptocurrencies do you track?",
      answer: "We track major cryptocurrencies across multiple categories: Layer 1 (Bitcoin, Ethereum, Solana, Cardano), DeFi Tokens (Uniswap, Aave, Compound), Layer 2 Solutions (Polygon, Arbitrum), and Stablecoins (USDC, USDT). Our focus is on established cryptocurrencies with significant market capitalization and trading volume."
    },
    {
      id: "free-access",
      question: "Is the platform free to use?",
      answer: "Yes, Coin Feedly is completely free to use. Our mission is to provide transparent AI prediction analysis to help users make informed decisions. All dashboards, analytics, and historical data are accessible without any fees or subscriptions."
    },
    {
      id: "methodology",
      question: "What methodology do AI models use for predictions?",
      answer: "Each AI model analyzes multiple factors including historical price patterns, market trends, blockchain metrics, adoption indicators, regulatory developments, and market sentiment. The specific prompts and analysis frameworks are designed to ensure comprehensive crypto market evaluation while maintaining consistency across models."
    },
    {
      id: "reliability",
      question: "How reliable are AI cryptocurrency predictions?",
      answer: "AI predictions should be viewed as analytical tools rather than guaranteed forecasts. Our platform's purpose is to track and compare AI model performance transparently. Historical accuracy data helps users understand which models perform better under different crypto market conditions, but no prediction system is infallible."
    },
    {
      id: "updates",
      question: "How often is the data updated?",
      answer: "Price data is updated in real-time during market hours through Yahoo Finance integration. Prediction accuracy metrics and rankings are recalculated daily. The dashboard reflects the most current performance data available for comprehensive analysis."
    },
    {
      id: "mobile",
      question: "Is the platform mobile-friendly?",
      answer: "Yes, Coin Feedly is fully responsive and optimized for mobile devices. All features, charts, and analytics are accessible on smartphones and tablets, ensuring you can track AI prediction performance wherever you are."
    },
    {
      id: "contact",
      question: "How can I get in touch or provide feedback?",
      answer: "We welcome feedback and suggestions for improving Coin Feedly. You can reach us through our official channels. We're constantly working to enhance the platform based on user needs and market developments."
    }
  ];

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
            Frequently Asked Questions
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Everything you need to know about AI cryptocurrency prediction tracking and platform functionality.
          </p>
        </motion.section>

        <div className="space-y-12 md:space-y-16">
          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Card className="border-border/30 bg-background/50 hover:bg-background/80 transition-colors duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
                  <HelpCircleIcon className="h-6 w-6" />
                  Common Questions
                </CardTitle>
              </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          </motion.div>

          {/* Still Have Questions */}
          <motion.section 
            className="text-center py-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Card className="border-border/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all duration-300">
              <CardContent className="p-10">
                <h3 className="text-2xl font-semibold text-foreground mb-6">
                  Still Have Questions?
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Explore our dashboard to see AI prediction tracking in action, or read our detailed methodology in the blog.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button asChild size="lg" className="font-semibold">
                    <Link href="/dashboard">
                      View Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="lg" className="font-semibold">
                    <Link href="/about">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
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