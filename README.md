# İkinciel - Classified Ads Platform

A modern, full-featured classified ads platform built with Next.js 15, TypeScript, and Tailwind CSS. Similar to platforms like tap.az, OLX, and Craigslist.

## Features

- 🎨 Modern, responsive UI built with Tailwind CSS
- 📱 Mobile-first design
- 🔍 Advanced search and filtering
- 📂 Category-based browsing
- 💳 Product listings with image galleries
- 👤 User profiles and authentication ready
- ⭐ Favorites and messaging system ready
- 🎯 Featured and promoted listings support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom component library
- **Code Quality**: ESLint

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── listings/                 # Listings page
│   ├── products/[id]/           # Product detail page
│   ├── categories/[slug]/       # Category pages
│   ├── profile/                 # User profile pages
│   ├── auth/                    # Authentication pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles & Tailwind config
│
├── components/
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Select.tsx
│   │   └── Textarea.tsx
│   │
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Container.tsx
│   │
│   └── features/                # Feature-specific components
│       ├── products/
│       │   ├── ProductCard.tsx
│       │   └── ProductGrid.tsx
│       ├── categories/
│       │   ├── CategoryCard.tsx
│       │   └── CategoryGrid.tsx
│       ├── search/
│       │   └── SearchBar.tsx
│       └── filters/
│           └── FilterPanel.tsx
│
├── types/                       # TypeScript type definitions
│   └── index.ts
│
├── lib/                         # Utility functions
│   └── utils.ts
│
├── constants/                   # App constants
│   └── index.ts
│
├── hooks/                       # Custom React hooks
├── services/                    # API service functions
└── public/                      # Static assets

```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ikinciel-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## UI Components

### Base Components

All base UI components are located in `components/ui/`:

- **Button**: Supports multiple variants (primary, secondary, outline, ghost, danger) and sizes
- **Input**: Text input with label, error, and helper text support
- **Card**: Flexible card component with Header, Body, and Footer sub-components
- **Badge**: Small status indicators with color variants
- **Select**: Dropdown select with label and error support
- **Textarea**: Multi-line text input

### Feature Components

- **ProductCard**: Display product listings in a grid
- **CategoryCard**: Display categories with icons and product counts
- **SearchBar**: Full-text search functionality
- **FilterPanel**: Advanced filtering sidebar

## Styling

The project uses Tailwind CSS v4 with a custom theme:

### Custom Colors
- Primary: Blue (#3b82f6)
- Secondary: Green (#10b981)
- Accent: Amber (#f59e0b)
- Error: Red (#ef4444)

### Custom Utilities
- `container-custom`: Responsive container with padding
- `card-shadow`: Subtle card shadow
- `card-shadow-hover`: Elevated card shadow on hover

## Type Definitions

Key TypeScript interfaces:

- `Product`: Product/listing data structure
- `Category`: Category information
- `User`: User profile data
- `Location`: Location information
- `SearchFilters`: Search and filter parameters
- `PaginatedResponse`: API pagination wrapper

## Routes

- `/` - Home page with featured listings
- `/listings` - All listings with filters
- `/products/[id]` - Product detail page
- `/categories/[slug]` - Category-specific listings
- `/profile` - User profile (to be implemented)
- `/auth/login` - Login page (to be implemented)
- `/auth/register` - Registration page (to be implemented)

## Next Steps

### Backend Integration
1. Set up API routes in `app/api/`
2. Create service functions in `services/`
3. Implement data fetching with React Server Components
4. Add error boundaries and loading states

### Authentication
1. Implement authentication flow
2. Add protected routes
3. Integrate user session management

### Additional Features
1. Image upload functionality
2. Real-time messaging
3. Payment integration
4. Email notifications
5. Analytics and tracking

### Performance Optimization
1. Image optimization with Next.js Image
2. Code splitting and lazy loading
3. Caching strategies
4. SEO optimization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
