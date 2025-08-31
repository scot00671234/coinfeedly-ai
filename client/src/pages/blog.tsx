import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ArrowRightIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { NavigationMenu } from "../components/navigation-menu";
import { SmartBackButton } from "../components/smart-back-button";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedDate: string;
  readTime: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "ai-crypto-forecasting",
    title: "The Future of AI-Powered Cryptocurrency Forecasting",
    excerpt: "How artificial intelligence is revolutionizing crypto price predictions and what this means for traders and investors.",
    content: "In an era where artificial intelligence is reshaping industries, cryptocurrency trading stands at the forefront of this transformation...",
    publishedDate: "August 23, 2025",
    readTime: "6 min read",
    category: "AI & Markets"
  }
];

export default function Blog() {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20 pointer-events-none" />
      
      {/* Enhanced Header */}
      <header className="sticky top-0 w-full z-50 border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[16px] border-l-transparent border-r-transparent border-b-foreground"></div>
              <span className="text-xl font-semibold text-foreground">Coin Feedly</span>
            </Link>
            
            <NavigationMenu currentPath={location} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <SmartBackButton className="mb-12" />
        
        {/* Page Header */}
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground leading-tight tracking-tight">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights, analysis, and perspectives on AI-powered cryptocurrency forecasting
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {blogPosts.map((post, index) => (
            <BlogPostCard key={post.id} post={post} index={index} />
          ))}
        </motion.div>
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

function BlogPostCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
    >
      <Card className="bg-background/50 border-border/30 hover:bg-background/80 transition-all duration-300 group cursor-pointer">
        <CardContent className="p-8">
          <div className="space-y-4">
            {/* Category & Metadata */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                {post.category}
              </span>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{post.publishedDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>

            {/* Title & Excerpt */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            {/* Read More Button */}
            <Link href={`/blog/${post.id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto text-foreground hover:text-primary transition-colors group-hover:translate-x-1 transform duration-200"
              >
                <span className="text-sm font-medium">Read article</span>
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}