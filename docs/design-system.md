# AIForecast Hub Design System

## Design Philosophy

The AIForecast Hub design system follows a clean, modern aesthetic with emphasis on:
- **Clean typography** with clear hierarchy and optimal readability
- **Light-first design** with seamless dark mode support
- **Strategic color usage** for AI model differentiation and status indicators
- **Card-based layout** with subtle shadows and rounded corners
- **Triangle brand identity** as a geometric logo element
- **Sidebar navigation** with contextual sections and smooth interactions

## Color System

### Dark Theme (Primary)
```css
--background-primary: hsl(0, 0%, 2%)         /* Pure black background */
--background-secondary: hsl(0, 0%, 4%)       /* Slightly elevated surfaces */
--background-tertiary: hsl(0, 0%, 8%)        /* Card backgrounds */
--text-primary: hsl(0, 0%, 98%)              /* Primary text */
--text-secondary: hsl(0, 0%, 65%)            /* Secondary text */
--text-muted: hsl(0, 0%, 45%)                /* Muted text */
--accent-blue: hsl(210, 100%, 60%)           /* Primary accent */
--accent-green: hsl(142, 76%, 36%)           /* Success/positive */
--border-subtle: hsl(0, 0%, 12%)             /* Subtle borders */
--border-prominent: hsl(0, 0%, 18%)          /* Prominent borders */
```

### Light Theme
```css
--background-primary: hsl(0, 0%, 99%)        /* Pure white background */
--background-secondary: hsl(0, 0%, 97%)      /* Slightly elevated surfaces */
--background-tertiary: hsl(0, 0%, 95%)       /* Card backgrounds */
--text-primary: hsl(0, 0%, 8%)               /* Primary text */
--text-secondary: hsl(0, 0%, 35%)            /* Secondary text */
--text-muted: hsl(0, 0%, 55%)                /* Muted text */
--accent-blue: hsl(210, 100%, 50%)           /* Primary accent */
--accent-green: hsl(142, 76%, 36%)           /* Success/positive */
--border-subtle: hsl(0, 0%, 88%)             /* Subtle borders */
--border-prominent: hsl(0, 0%, 82%)          /* Prominent borders */
```

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### Type Scale
```css
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 1.875rem    /* 30px */
--text-4xl: 2.25rem     /* 36px */
--text-5xl: 3rem        /* 48px */
```

### Font Weights
```css
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

## Spacing System

### Spacing Scale
```css
--space-1: 0.25rem      /* 4px */
--space-2: 0.5rem       /* 8px */
--space-3: 0.75rem      /* 12px */
--space-4: 1rem         /* 16px */
--space-5: 1.25rem      /* 20px */
--space-6: 1.5rem       /* 24px */
--space-8: 2rem         /* 32px */
--space-10: 2.5rem      /* 40px */
--space-12: 3rem        /* 48px */
--space-16: 4rem        /* 64px */
--space-20: 5rem        /* 80px */
--space-24: 6rem        /* 96px */
```

## Component Guidelines

### Cards
- **Background**: Clean white/light gray with subtle shadows
- **Border**: Subtle border with rounded corners (12px radius)
- **Layout**: Grid-based commodity cards with consistent spacing
- **Content**: Commodity name, current price, percentage change, model accuracy scores
- **Hover states**: Subtle elevation increase and "Click for detailed analysis" prompts

### Buttons
- **Primary**: Dark background with subtle border
- **Secondary**: Transparent background with border
- **Hover States**: Subtle scale (1.02x) and opacity changes
- **Border Radius**: 8px
- **Padding**: 12px 24px for regular buttons

### Navigation
- **Slide-out sidebar** triggered by hamburger menu in top-right
- **Contextual sections**: Dashboard, Indices, About, FAQ, Blog, Policy
- **Clean typography** with section descriptions
- **Smooth slide animations** for sidebar open/close
- **Header logo**: Triangle geometric shape with "AIForecast Hub" text

### Data Visualization
- **Model accuracy display**: Horizontal list with colored indicators
- **AI model colors**: Claude (green), ChatGPT (blue), Deepseek (purple)
- **Percentage displays**: Clear accuracy scores with ranking (#1, #2, #3)
- **Price indicators**: Large price values with percentage change indicators
- **Status colors**: Green for positive, red for negative, gray for neutral

### Layout Principles
- **Generous whitespace** between sections
- **Maximum content width**: 1200px
- **Grid system**: 12-column responsive grid
- **Vertical rhythm**: Consistent 24px baseline

## Component Specifications

### Commodity Cards
```css
.commodity-card {
  background: var(--background-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 200ms ease;
}

.commodity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

### AI Model Indicators
```css
.model-claude { color: hsl(142, 76%, 36%); }     /* Green */
.model-chatgpt { color: hsl(210, 100%, 50%); }   /* Blue */
.model-deepseek { color: hsl(271, 76%, 53%); }   /* Purple */
```

## Animation Guidelines

### Transitions
- **Duration**: 200ms for micro-interactions, 300ms for larger changes
- **Easing**: cubic-bezier(0.25, 0.46, 0.45, 0.94) for natural feel
- **Properties**: opacity, transform, filter

### Hover Effects
- **Scale**: 1.02x maximum
- **Opacity**: 0.8 for subtle effects
- **Transform**: translateY(-2px) for lift effect

## Responsive Breakpoints

```css
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
--breakpoint-2xl: 1536px
```

## Implementation Rules

1. **Card-First Design**: Primary content organized in clean, hoverable cards
2. **AI Model Consistency**: Claude (green), ChatGPT (blue), Deepseek (purple) throughout
3. **Navigation Pattern**: Slide-out sidebar for all major sections
4. **Typography Hierarchy**: Clear price prominence with supporting accuracy data
5. **Interactive States**: Subtle hover effects on all clickable elements
6. **Theme Support**: Seamless light/dark mode switching
7. **Responsive Grid**: Fluid card layout that adapts to screen size
8. **Accessibility**: WCAG AA compliance with proper contrast and focus states

## Quality Checklist

Before shipping any component:
- [ ] Follows card-based layout patterns
- [ ] Uses correct AI model colors (Claude=green, ChatGPT=blue, Deepseek=purple)
- [ ] Implements proper commodity data hierarchy (name → price → change → accuracy)
- [ ] Includes both light and dark theme variants
- [ ] Has hover states for interactive elements
- [ ] Maintains 12px border radius for cards
- [ ] Includes "Click for detailed analysis" interactions
- [ ] Shows proper navigation sidebar integration
- [ ] Displays percentage changes with appropriate colors
- [ ] Passes accessibility checks with proper focus management