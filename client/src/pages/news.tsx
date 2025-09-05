import { SearchIcon, FilterIcon, CalendarIcon, TrendingUpIcon, ExternalLinkIcon, RefreshCwIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { NavigationMenu } from "../components/navigation-menu";
import { motion } from "framer-motion";
import type { NewsApiResponse, NewsFilters, NewsSortOption, SortDirection, NewsStats } from "@shared/schema";

export default function News() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [sortBy, setSortBy] = useState<NewsSortOption>("publishedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Fetch news data
  const { data: newsData, isLoading, refetch } = useQuery<NewsApiResponse>({
    queryKey: ["/api/news", {
      search: searchQuery || undefined,
      categories: selectedCategory !== "all" ? [selectedCategory] : undefined,
      sources: selectedSource !== "all" ? [selectedSource] : undefined,
      sentiment: selectedSentiment !== "all" ? selectedSentiment : undefined,
      sort: sortBy,
      direction: sortDirection,
      page: currentPage,
      pageSize
    }],
    enabled: true,
  });

  // Fetch categories and sources for filters
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/news/categories"],
  });

  const { data: sources = [] } = useQuery<string[]>({
    queryKey: ["/api/news/sources"],
  });

  const { data: newsStats } = useQuery<NewsStats>({
    queryKey: ["/api/news/stats"],
  });

  // Fetch news mutation
  const fetchNewsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/news/fetch", { method: "POST" });
      if (!response.ok) throw new Error("Failed to fetch news");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "News Updated",
        description: "Successfully fetched latest crypto news from all sources.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedSource, selectedSentiment, sortBy, sortDirection]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "negative": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "neutral": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      market: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      technology: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      regulation: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      defi: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
      nft: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
      gaming: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  };

  return (
    <div className="min-h-screen bg-background relative">
      
      {/* Modern background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/15" />
        <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-grid-minimal" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/98 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground"></div>
                <span className="font-semibold text-lg text-foreground">Crypto News Hub</span>
              </div>
              <NavigationMenu />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => fetchNewsMutation.mutate()}
                disabled={fetchNewsMutation.isPending}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCwIcon className={`w-4 h-4 ${fetchNewsMutation.isPending ? 'animate-spin' : ''}`} />
                <span>Refresh News</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Crypto News Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest cryptocurrency news from trusted sources
          </p>
          {newsStats && (
            <div className="flex items-center space-x-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <TrendingUpIcon className="w-4 h-4" />
                <span>{newsStats.totalArticles} articles</span>
              </div>
              <div>{newsStats.sourcesCount} sources</div>
              <div>{newsStats.categoriesCount} categories</div>
              <div>Last updated: {formatDate(newsStats.lastUpdate)}</div>
            </div>
          )}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sentiment Filter */}
            <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
              <SelectTrigger>
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={`${sortBy}-${sortDirection}`} onValueChange={(value) => {
              const [sort, direction] = value.split('-') as [NewsSortOption, SortDirection];
              setSortBy(sort);
              setSortDirection(direction);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publishedAt-desc">Latest First</SelectItem>
                <SelectItem value="publishedAt-asc">Oldest First</SelectItem>
                <SelectItem value="impact-desc">High Impact</SelectItem>
                <SelectItem value="sentiment-desc">Most Positive</SelectItem>
                <SelectItem value="sentiment-asc">Most Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* News Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : newsData?.articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-muted-foreground mb-4">No news articles found</div>
            <Button onClick={() => fetchNewsMutation.mutate()} disabled={fetchNewsMutation.isPending}>
              Fetch Latest News
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {newsData?.articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="border-border/50 hover:border-border/80 transition-all duration-200 h-full flex flex-col">
                    {article.imageUrl && (
                      <div className="aspect-video rounded-t-lg overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge className={getCategoryColor(article.category)}>
                          {article.category}
                        </Badge>
                        {article.sentiment && (
                          <Badge className={getSentimentColor(article.sentiment)}>
                            {article.sentiment}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg font-semibold line-clamp-3 leading-tight">
                        {article.title}
                      </CardTitle>
                      {article.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                          {article.summary}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>{article.sourceName}</span>
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>
                      
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {(article.tags as string[]).slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2"
                        >
                          <span>Read Full Article</span>
                          <ExternalLinkIcon className="w-4 h-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {newsData && newsData.total > pageSize && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-center space-x-4"
              >
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {Math.ceil(newsData.total / pageSize)}
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!newsData.hasMore}
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}