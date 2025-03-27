# Survey Application

A modern survey application built with Next.js, React, Prisma, and MongoDB, featuring separate user and admin interfaces, authentication, and comprehensive testing.

## Features

- **Authentication System**: Secure login and registration with JWT
- **Role-Based Access Control**: Separate dashboards for users and administrators
- **Survey Management**: Create, manage, and analyze surveys
- **API Routes**: RESTful API endpoints for all operations
- **Database Integration**: MongoDB integration via Prisma ORM
- **UI Components**: Built with modern React components and Tailwind CSS
- **Testing**: Jest and React Testing Library setup for unit testing
- **Content Management**: Strapi CMS integration for managing articles, survey guides, privacy policies, and other content

## Getting Started

### Prerequisites

- Node.js (version 20.x or newer)
- MongoDB instance (local or cloud)

### Environment Setup

1. Clone the repository
2. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_for_jwt
   ```

### Installation

```bash
# Install dependencies
npm install

# Setup the database schema
npx prisma generate

# Seed the database with initial data
npx prisma db seed

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Default Admin Credentials

- Email: admin@gmail.com
- Password: admin123!

## Testing

The application includes comprehensive test coverage using Jest:

```bash
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Technology Stack

- **Frontend**: React 19, Next.js 15
- **API**: Next.js API Routes
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Custom JWT implementation
- **Testing**: Jest, React Testing Library
- **Form Validation**: React Hook Form with Zod
- **UI Components**: Radix UI primitives
- **CMS**: Strapi for content management

## Project Structure

- `/src/app`: Next.js App Router components and pages
- `/src/components`: Reusable UI components
- `/src/lib`: Utility functions, API helpers, and validations
- `/prisma`: Database schema and seed scripts
- `/public`: Static assets
- `/cms`: Strapi CMS configuration and content types

## CMS Integration

The application integrates with Strapi as a headless CMS to manage articles, survey guides, privacy policies, and other content:

### Content Types
- **Articles**: Blog posts and content pieces with rich text, media, and relationships
- **Authors**: Content creators with profiles and article relationships
- **Categories**: Organizational structure for content
- **Pages**: Static content like privacy policies and survey guides
- **Survey**: FAQ and guidance content for surveys
- **Surveypage**: Single page content specifically for survey instructions

### User-Facing Content
The CMS manages important user-facing content such as:
- **Survey Guides**: Step-by-step instructions for completing surveys
- **Privacy Policies**: Legal information about data handling
- **Terms of Service**: User agreement information
- **Help Content**: Support information for users

### Content Display
The application includes a `ContentDisplay` component that specifically filters and displays survey guides and privacy policies to users when taking surveys.

### CMS Setup

```bash
# Start the Strapi CMS server
cd cms
npm install
npm run develop
```

Access the Strapi admin panel at [http://localhost:1337/admin](http://localhost:1337/admin)

## Demo

https://survey-webs-app.vercel.app/

[![Watch the video](https://drive.google.com/uc?export=view&id=1KGiSPnAMsCz3Kos0_mhyw8hLnDfLo-bi)](https://drive.google.com/file/d/1KGiSPnAMsCz3Kos0_mhyw8hLnDfLo-bi/view?usp=sharing)

