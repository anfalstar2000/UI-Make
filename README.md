# UI Make - Figma Plugin

A comprehensive design system generator for Figma, featuring shadcn/ui style components, 3000+ icons from Remix Icon, and quick effects application.

## Features

### 🧩 Components (57 Components)
Generate ready-to-use UI components organized in 7 categories:
- **Buttons**: Button, Button Group, Toggle, Toggle Group
- **Forms**: Input, Textarea, Checkbox, Radio, Switch, Select, Slider, Date Picker, etc.
- **Layout**: Card, Accordion, Tabs, Separator, Scroll Area, etc.
- **Navigation**: Breadcrumb, Navigation Menu, Pagination, Sidebar
- **Feedback**: Alert, Toast, Progress, Spinner, Skeleton
- **Overlay**: Dialog, Drawer, Sheet, Popover, Tooltip, Dropdown Menu
- **Data Display**: Avatar, Badge, Table, Chart, Typography

### 🎨 Icons (3,229 Icons)
Full Remix Icon library integration with:
- 21 categories (Arrows, System, Media, Logos, etc.)
- Search functionality
- Multiple sizes (16px, 20px, 24px, 32px, 48px)
- One-click insertion

### ✨ Effects
Apply effects to selected layers:
- **Shadows**: Soft, Medium, Strong, Inner
- **Blur**: Light, Medium, Strong, Background
- **Borders**: Thin, Medium, Accent, Dashed
- **Opacity**: 90%, 75%, 50%, 25%

## Installation

1. Download or clone this repository
2. Open Figma Desktop
3. Go to Plugins > Development > Import plugin from manifest
4. Select the `manifest.json` file

## Development

### Prerequisites
- Node.js (https://nodejs.org/)
- npm

### Setup
```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch for changes during development
npm run watch
```

### Project Structure
```
UI Make/
├── manifest.json      # Figma plugin manifest
├── ui.html           # Plugin UI
├── code.ts           # Plugin backend (TypeScript)
├── code.js           # Compiled plugin backend
├── icons/            # Remix Icon SVG files
├── icon-paths.ts     # Generated icon paths
└── icon-paths.json   # Icon data for UI
```

### Regenerating Icons
If you update the icons folder:
```bash
node generate-icons.js
node build-code.js
```

## Usage

1. Open Figma and run the plugin
2. **Components Tab**: Select a component and click "Generate"
3. **Icons Tab**: Browse categories, search, select size, and click "Insert icon"
4. **Effects Panel**: Select a layer in Figma, choose an effect, click "add"

## Credits

- Components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Remix Icon](https://remixicon.com/)

## License

MIT License - Feel free to use in personal and commercial projects.
