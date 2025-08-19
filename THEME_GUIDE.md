# 🎨 Assalatur Rahman Theme System

A comprehensive, easy-to-customize theme system for the Assalatur Rahman Islamic Association event management app.

## 🚀 Quick Theme Change

To change the entire app's color scheme, simply update these two values in `src/index.css`:

```css
/* Primary Islamic Green Palette */
--brand-primary-hue: 158;        /* Change to any hue: 0-360 */
--brand-primary-saturation: 64%; /* Adjust saturation: 0-100% */
--brand-primary-lightness: 25%;  /* Adjust lightness: 0-100% */

/* Secondary Gold Palette */
--brand-secondary-hue: 45;       /* Change to any hue: 0-360 */
--brand-secondary-saturation: 93%; /* Adjust saturation: 0-100% */
--brand-secondary-lightness: 47%; /* Adjust lightness: 0-100% */
```

## 🎯 Color Examples

### Islamic Green Themes
- **Forest Green**: `hue: 120, saturation: 60%, lightness: 25%`
- **Emerald**: `hue: 158, saturation: 64%, lightness: 25%` *(current)*
- **Sage Green**: `hue: 140, saturation: 30%, lightness: 35%`
- **Pine Green**: `hue: 145, saturation: 80%, lightness: 20%`

### Alternative Color Schemes
- **Royal Blue**: `hue: 220, saturation: 70%, lightness: 30%`
- **Deep Purple**: `hue: 260, saturation: 60%, lightness: 25%`
- **Navy Blue**: `hue: 210, saturation: 80%, lightness: 20%`
- **Burgundy**: `hue: 350, saturation: 70%, lightness: 25%`

## 🎨 Complete Color System

### Primary Colors
- `primary` - Main brand color
- `primary-light` - Lighter shade for hovers
- `primary-dark` - Darker shade for depth
- `primary-subtle` - Very light for backgrounds

### Secondary Colors
- `secondary` - Secondary brand color (gold)
- `gold` - Accent gold color
- `gold-light` - Light gold for highlights
- `gold-dark` - Dark gold for contrast

### State Colors
- `success` - Green for success states
- `warning` - Orange/yellow for warnings
- `destructive` - Red for errors/delete actions
- `info` - Blue for informational content

### Neutral Colors
- `muted` - Subtle background color
- `accent` - Interactive element background
- `border` - Border colors
- `surface` - Card/container backgrounds

## 🎭 Usage Examples

### Buttons
```jsx
<Button variant="default">Primary Action</Button>
<Button variant="hero">Islamic Gradient</Button>
<Button variant="gold">Gold Accent</Button>
<Button variant="mosque">Mosque Style</Button>
```

### Background Gradients
```jsx
<div className="bg-gradient-islamic">Islamic Theme</div>
<div className="bg-gradient-hero">Hero Section</div>
<div className="bg-gradient-gold">Gold Accent</div>
```

### Shadows
```jsx
<Card className="shadow-islamic">Standard Card</Card>
<div className="shadow-mosque">Mosque Style</div>
<div className="shadow-gold">Gold Glow</div>
```

### State Colors
```jsx
<div className="bg-success text-success-foreground">Success</div>
<div className="bg-warning text-warning-foreground">Warning</div>
<div className="bg-destructive text-destructive-foreground">Error</div>
```

## 🌙 Dark Mode

Dark mode is automatically generated from your brand colors. To enable:

```jsx
<html className="dark">
```

## 🔧 Advanced Customization

### Adding New Colors
1. Add CSS variables in `src/index.css`:
```css
--custom-color: 200 85% 45%;
```

2. Add to Tailwind config in `tailwind.config.ts`:
```ts
colors: {
  custom: 'hsl(var(--custom-color))'
}
```

### Custom Gradients
Add new gradients in `src/index.css`:
```css
--gradient-custom: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--custom-color)));
```

Then in Tailwind config:
```ts
backgroundImage: {
  'gradient-custom': 'var(--gradient-custom)'
}
```

## 📱 Responsive Design

All colors work seamlessly across:
- Mobile (sm)
- Tablet (md) 
- Desktop (lg)
- Large Desktop (xl, 2xl)

## ✨ Animation Support

The theme includes Islamic-inspired animations:
- `animate-islamic-glow` - Subtle glow effect
- `animate-fade-in` - Smooth entrance
- Custom transitions: `transition-smooth`, `transition-spring`

## 🛠️ File Structure

```
src/
├── index.css              # Main theme definitions
├── tailwind.config.ts     # Tailwind integration
└── components/
    └── ui/
        └── button.tsx     # Enhanced button variants
```

## 🎨 Design Principles

1. **Semantic Colors**: Use meaningful names instead of literal colors
2. **HSL Format**: All colors use HSL for better manipulation
3. **Automatic Variants**: Light/dark variants generated automatically
4. **Islamic Aesthetics**: Green and gold palette respecting Islamic traditions
5. **Accessibility**: Proper contrast ratios maintained

---

*This theme system ensures your mosque's event management app maintains a cohesive, beautiful, and culturally appropriate design while remaining fully customizable.*