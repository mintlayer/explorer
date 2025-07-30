# Mintlayer Explorer

A Next.js-based blockchain explorer for the Mintlayer network, providing comprehensive insights into blocks, transactions, addresses, pools, and delegations on both mainnet and testnet.

## 🚀 Features

- **Block Explorer**: Browse blocks, transactions, and addresses
- **Pool Management**: View staking pools and delegation information
- **Token Support**: Explore tokens and NFTs on the Mintlayer network
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## 📋 Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mintlayer/explorer.git
cd explorer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory (or copy from `.env`):

```bash
cp .env .env.local
```

Configure the following environment variables:

#### Required Variables

```env
# Network configuration (testnet or mainnet)
NETWORK=testnet
NEXT_PUBLIC_NETWORK=testnet

# Server URL for the application
SERVER_URL=http://localhost:3000
```

#### Optional Variables

```env
# Override default API URL (optional)
NODE_API_URL=

# CoinMarketCap API key for price data (optional)
CMC_API_KEY=your_cmc_api_key_here

# Basic authentication (optional, format: username:password)
BASIC_AUTH=

# ERC20 data server URL (optional)
ER20_DATA_SERVER_URL=https://token.api.mintlayer.org/api
```

### 4. Database Setup

The application uses SQLite for caching pool data. The database will be automatically created when you first the pool worker.

### 5. Populate Pool Data

To display pool information, you need to run the pool data worker:

```bash
npm run start:worker
```

This script:
- Fetches all pools from the Mintlayer API
- Retrieves delegation information for each pool
- Calculates effective pool balances
- Stores the processed data in the local SQLite database

**Note**: Run this periodically to keep pool data up-to-date. Consider setting up a cron job for production environments.

## 🏃‍♂️ Development

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the explorer in your browser.

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Data Management
npm run start:worker # Populate pool data

# Code Quality
npm run lint         # Run ESLint
npm run test         # Run Jest tests
```

## 🏗️ Project Structure

```
explorer/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (homepage)/      # Homepage components
│   │   ├── _components/     # Shared UI components
│   │   ├── api/            # API routes
│   │   ├── address/        # Address pages
│   │   ├── block/          # Block pages
│   │   ├── pool/           # Pool pages
│   │   └── ...
│   ├── config/             # Configuration files
│   ├── hooks/              # React hooks
│   ├── lib/                # Utility libraries
│   ├── providers/          # React context providers
│   └── utils/              # Utility functions
├── workers/                # Background workers
│   └── pools.js           # Pool data fetcher
├── public/                 # Static assets
├── .env                   # Environment variables template
└── data.db               # SQLite database (auto-generated)
```

## 🐳 Docker Support

### Build Docker Image

```bash
docker build -t mintlayer-explorer .
```

### Run with Docker

```bash
docker run -p 3000:3000 \
  -e NETWORK=testnet \
  -e NEXT_PUBLIC_NETWORK=testnet \
  mintlayer-explorer
```

### Docker Compose (Optional)

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  explorer:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NETWORK=testnet
      - NEXT_PUBLIC_NETWORK=testnet
      - SERVER_URL=http://localhost:3000
    volumes:
      - ./data.db:/usr/src/app/data.db
```

## 🔧 Configuration

### Network Configuration

The explorer supports two networks:

- **Testnet** (default): `NETWORK=testnet`
- **Mainnet**: `NETWORK=mainnet`

Network configuration affects:
- API endpoints used
- Address format validation
- UI color scheme
- Pool ID prefixes

### API Configuration

By default, the application uses official Mintlayer API servers:
- **Testnet**: `api-server-lovelace.mintlayer.org`
- **Mainnet**: `api-server.mintlayer.org`

Override with `NODE_API_URL` environment variable if needed.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The project uses Jest for testing with TypeScript support.

## 🚀 Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Start Production Server

```bash
npm start
```

### 3. Set Up Pool Data Updates

Set up a cron job to regularly update pool data:

```bash
# Update pool data every 10 minutes
*/10 * * * * cd /path/to/mintlayer-explorer && npm run start:worker
```

## 🔍 Troubleshooting

### Common Issues

1. **Pool data not showing**
   - Run `npm run start:worker` to populate the database
   - Check network connectivity to Mintlayer API servers

2. **Build errors with better-sqlite3**
   - Ensure you have Python and build tools installed
   - On Ubuntu/Debian: `sudo apt-get install python3 build-essential`
   - On macOS: Install Xcode command line tools

3. **WASM module issues**
   - The project includes pre-built WASM binaries
   - If issues persist, check the `src/utils/mintlayer-crypto/pkg/` directory

4. **Environment variables not loading**
   - Ensure `.env.local` exists and contains required variables
   - Restart the development server after changing environment variables

### Performance Optimization

- Pool data is cached in SQLite to reduce API calls
- Consider implementing Redis for production caching
- Use CDN for static assets in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Code Style

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

## 🔗 Links

- [Mintlayer Official Website](https://mintlayer.org)
- [Mintlayer Documentation](https://docs.mintlayer.org)
- [Next.js Documentation](https://nextjs.org/docs)
