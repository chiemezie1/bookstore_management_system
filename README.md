# 📚 Advanced Bookstore Management System

A modern, full-stack bookstore management system built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. This application helps bookstore owners manage their inventory, sales, loans, and customer relationships efficiently.

![Bookstore Dashboard](./public/dashboard-preview.png)

## 🌟 Features

### 📖 Book Management
- Comprehensive book catalog with detailed information
- Cover image management with cloud storage
- ISBN lookup and validation
- Multiple categories and tags support
- Book condition tracking
- Cost and retail price management
- Inventory tracking with low stock alerts

### 💰 Sales & Transactions
- Point of Sale (POS) system
- Multiple payment methods support
- Transaction history
- Sales analytics and reports
- Bulk operations support
- Returns and refunds processing

### 📅 Loan Management
- Book lending system
- Due date tracking
- Automated reminders
- Late fee calculation
- Loan history per customer

### 📊 Inventory Management
- Real-time stock tracking
- Low stock alerts
- Automated reorder suggestions
- Multiple location support
- Stock transfer between locations
- Inventory audit tools

### 👥 Customer Management
- Customer profiles
- Purchase history
- Loan history
- Loyalty program
- Communication preferences

### 📈 Analytics & Reporting
- Sales analytics
- Inventory reports
- Revenue tracking
- Popular books tracking
- Customer insights
- Custom report generation

## 🛠 Technical Stack

- **Frontend**: Next.js 13 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form, Zod
- **State Management**: React Context
- **Analytics**: Custom analytics implementation

## 📋 Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm
- Supabase account
- Git

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/bookstore-management.git
cd bookstore-management
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment Setup**

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Database Setup**

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Create tables
create table public.books (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  isbn text not null unique,
  author_id uuid references public.authors(id),
  publisher text,
  publication_date date,
  description text,
  cover_image_url text,
  price decimal(10,2) not null,
  cost_price decimal(10,2) not null,
  page_count integer,
  language text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add more table creation scripts...
```

5. **Start the development server**
```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
├── src/
│   ├── actions/         # Server actions
│   ├── app/            # Next.js 13 app directory
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utility functions
│   ├── styles/         # Global styles
│   └── types/          # TypeScript types
├── public/             # Static assets
├── prisma/            # Database schema
└── tests/             # Test files
```

## 🔐 Authentication

The system uses Supabase Authentication with the following roles:
- Admin: Full system access
- Manager: Inventory and staff management
- Staff: Daily operations
- Customer: Self-service portal

## 💾 Database Schema

![Database Schema](./public/database-schema.png)

Key tables:
- `books`: Book information
- `authors`: Author details
- `categories`: Book categories
- `inventory`: Stock tracking
- `transactions`: Sales and loans
- `customers`: Customer information
- `users`: System users

## 🔄 API Routes

### Books
- `GET /api/books`: List all books
- `POST /api/books`: Create a new book
- `GET /api/books/:id`: Get book details
- `PUT /api/books/:id`: Update book
- `DELETE /api/books/:id`: Delete book

[More API documentation...]

## 📱 Features by Page

### Dashboard (`/`)
- Quick statistics
- Recent transactions
- Low stock alerts
- Due books today

### Books (`/books`)
- Book listing with filters
- Add/Edit books
- Bulk operations
- Category management

### Transactions (`/transactions`)
- New sale/loan
- Transaction history
- Returns processing
- Payment management

### Calendar (`/calendar`)
- Due date tracking
- Event scheduling
- Visual transaction history
- Reminder management

## 🛠 Development

### Commands
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run tests
pnpm db:migrate   # Run database migrations
```

### Code Style
- ESLint configuration
- Prettier setup
- Husky pre-commit hooks
- Conventional commits

## 🧪 Testing

- Unit tests with Jest
- Integration tests with Testing Library
- E2E tests with Playwright
- API tests with Supertest

## 📦 Deployment

### Production Deployment
1. Build the application
```bash
pnpm build
```

2. Start the production server
```bash
pnpm start
```

### Docker Deployment
```bash
docker build -t bookstore .
docker run -p 3000:3000 bookstore
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👥 Team

- Project Lead: [Name]
- Frontend Developer: [Name]
- Backend Developer: [Name]
- UI/UX Designer: [Name]

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Supabase](https://supabase.com/) for backend services
- [Vercel](https://vercel.com/) for hosting

## 📞 Support

For support, email support@yourbookstore.com or join our Discord channel.

## 🗺 Roadmap

- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Integration with external book APIs
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Advanced reporting system

## 📚 Documentation

For detailed documentation, visit our [Wiki](wiki-link) or [Documentation Site](docs-link).
