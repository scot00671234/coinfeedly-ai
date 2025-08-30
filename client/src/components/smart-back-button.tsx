import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SmartBackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export function SmartBackButton({ fallbackPath = "/", className = "" }: SmartBackButtonProps) {
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if there's history to go back to
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (canGoBack && window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to home or specified path
      window.location.href = fallbackPath;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Button 
        variant="ghost" 
        onClick={handleBack}
        className="flex items-center space-x-2 hover:scale-105 transition-all duration-200 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back</span>
      </Button>
    </motion.div>
  );
}