import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { NavigationMenu } from "../components/navigation-menu";
import OverallModelRankings from "@/components/dashboard/overall-model-rankings";
import AllCommoditiesView from "@/components/dashboard/all-commodities-view";
import { CompositeIndexGauge } from "@/components/CompositeIndexGauge";
import PredictionStatsCard from "@/components/PredictionStatsCard";
import MarketStatusCard from "@/components/MarketStatusCard";
import BottomBanner from "@/components/ads/BottomBanner";
import { motion } from "framer-motion";
import type { Commodity } from "@shared/schema";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();

  const { data: commodities = [] } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"],
  });

  // Filter commodities based on search query
  const filteredCommodities = commodities.filter(commodity =>
    commodity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commodity.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commodity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative">
      
      {/* Modern background pattern matching landing page */}
      <div className="absolute inset-0">
        {/* Clean gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/15" />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-grid-minimal" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/98 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="font-semibold text-lg text-foreground">AIForecast Hub</span>
            </Link>
          
            <div className="flex items-center space-x-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search commodities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-48 sm:w-56 md:w-64 bg-background/60 dark:bg-white/10 border-border/50 dark:border-white/20 focus:border-border/80 dark:focus:border-white/30 placeholder:text-muted-foreground min-h-[44px] transition-all duration-200 focus:scale-105"
                  data-testid="input-search-commodities"
                />
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl ring-1 ring-slate-900/10 dark:ring-slate-100/20 max-h-60 overflow-y-auto z-50">
                    {filteredCommodities.length > 0 ? (
                      filteredCommodities.map(commodity => (
                        <div
                          key={commodity.id}
                          className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors duration-150"
                          onClick={() => {
                            // Don't clear search query - keep the filtering active
                            // Better scroll targeting - look for the commodity card more reliably
                            const commodityCard = document.querySelector(`[data-commodity-id="${commodity.id}"]`) || 
                                                 document.getElementById(`commodity-${commodity.id}`) ||
                                                 document.querySelector(`[data-testid="commodity-card-${commodity.id}"]`);
                            if (commodityCard) {
                              commodityCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            } else {
                              // Fallback: scroll to all commodities section
                              document.querySelector('[data-testid="all-commodities-section"]')?.scrollIntoView({ behavior: 'smooth' });
                            }
                            
                            // Close the search dropdown after a short delay
                            setTimeout(() => {
                              const searchInput = document.querySelector('[data-testid="input-search-commodities"]') as HTMLInputElement;
                              searchInput?.blur();
                            }, 100);
                          }}
                          data-testid={`search-result-${commodity.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{commodity.name}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{commodity.symbol} • {commodity.category}</p>
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-500 font-medium">
                              {commodity.unit}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-600 dark:text-slate-400 text-center font-medium">
                        No commodities found
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <NavigationMenu currentPath={location} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-24">
        
        {/* Hero Section */}
        <motion.section 
          className="mb-20 md:mb-32"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground mb-4 md:mb-6 tracking-tight">
              AI Prediction Performance
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Real-time analysis of AI model accuracy across commodity markets
            </p>
          </div>
        </motion.section>

        <div className="space-y-20 md:space-y-32">
          {/* Dashboard Cards Grid */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              >
                <CompositeIndexGauge />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                <PredictionStatsCard />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              >
                <MarketStatusCard />
              </motion.div>
            </div>
          </motion.section>
          
          {/* Overall Model Rankings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <OverallModelRankings />
          </motion.div>
          
          {/* All Commodities View */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <AllCommoditiesView filteredCommodities={searchQuery ? filteredCommodities : undefined} />
          </motion.div>
        </div>
      </main>

      {/* Bottom Banner Ad */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <BottomBanner />
      </motion.div>

      {/* Modern Footer - matching landing page */}
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
              <span className="font-semibold text-foreground">AIForecast Hub</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>© 2025 AIForecast Hub</p>
              <p className="text-xs">Loremt ApS CVR-nr 41691360</p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
