
# Agentic Security Scanner

## Overview

The Agentic Security Scanner is an AI-powered security analysis tool that automatically detects vulnerabilities in code repositories. Built with React, TypeScript, and OpenAI's capabilities, it provides comprehensive security scanning with detailed reporting and actionable insights.

**Live Demo:** [https://security.agentics.org/](https://security.agentics.org/)

## Features

- **Static Code Analysis**: Scans code for hardcoded secrets and insecure patterns
- **Dependency Scanning**: Checks for known vulnerabilities in dependencies
- **Configuration Analysis**: Validates security settings in config files
- **Pattern Matching**: Uses vector similarity to find known vulnerability patterns
- **Web Search Enhancement**: Uses OpenAI's web search to find latest CVEs
- **Historical Analysis**: Tracks security posture over time
- **GitHub Issues Integration**: Creates issues for critical findings
- **Email Reporting**: Sends detailed security reports via email

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS for styling
- shadcn/ui component library
- OpenAI for intelligent analysis
- Edge Functions for serverless backend
- Local storage for result persistence

## Development Plans

The project follows a structured multi-phase development approach:

| Plan | Description |
|------|-------------|
| [Guidance](./src/plans/Guidance.md) | Coding standards, best practices, and project organization principles |
| [Phase 1](./src/plans/Phase1.md) | Core Security Scanner Setup - basic structure and functionality |
| [Phase 2](./src/plans/Phase2.md) | Advanced Features and Edge Function Integration |
| [Phase 3](./src/plans/Phase3.md) | GitHub Integration and Automation features |
| [Tests](./src/plans/Tests.md) | Complete testing strategy and specifications |
| [Implementation Progress](./src/plans/Implementation.md) | Current development status and completed features |
| [SEO Optimization](./src/plans/SEO.md) | Search engine optimization strategy |
| [Plans Overview](./src/plans/README.md) | Summary of all planning documents |

## Edge Function Details

The Security Scanner Edge Function (`security-scanner`) provides the backend scanning capabilities with comprehensive code analysis features:

### Key Features

- **Severity Classification**: Categorizes findings into critical, high, medium, low, and info levels
- **Code Context Analysis**: Extracts vulnerable code snippets with file path and line number information
- **Detailed Remediation**: Provides specific recommendations for fixing each vulnerability
- **Reference Links**: Includes security reference documentation and standards
- **GitHub Integration**: Creates issues for critical and high severity findings
- **Historical Tracking**: Maintains scan history with trend analysis
- **Email Reporting**: Sends detailed scan reports with customizable content
- **Configurable Scanning**: Allows customization of scan depth, file types, and focus areas

### Implementation Details

The Security Scanner edge function is implemented as a Deno-based serverless function with:

- CORS support for cross-origin requests
- Comprehensive error handling and logging
- Mock data generation for development and testing

### AI-Powered Analysis Technology

The security scanner leverages advanced AI capabilities through:

#### Vector Store & Semantic Search

The `vector-file` edge function enables powerful code analysis through:

- **Vector Embeddings**: Code snippets and patterns are converted to vector representations for semantic similarity matching
- **Storage Management**: Creates and manages vector stores with file indexing and chunking strategies
- **Hybrid Search**: Combines semantic and keyword search for high-precision vulnerability detection
- **Context-Aware Analysis**: Uses surrounding code context to understand vulnerability patterns

#### OpenAI Agent Integration

- **GPT-4o Integration**: Leverages OpenAI's latest models for vulnerability analysis
- **Web-Enhanced Security Data**: Utilizes GPT-4o-search-preview to find the latest CVEs and security advisories
- **Auto-Learning**: Saves web search results back into the vector store for future reference
- **Multi-Modal Security Analysis**: Text, code, and configuration files are analyzed together
- **Remediation Generation**: Uses AI to generate detailed, context-aware fix recommendations
- **Severity Classification**: AI-powered determination of vulnerability severity levels

#### Vector File Edge Function Endpoints

The vector-file edge function provides these key capabilities:

- `/create-store`: Creates a new vector store for a repository
  ```
  POST /vector-file/create-store
  Body: { "name": "repo-name", "expiresAfter": "30d" }
  Returns: { "id": "vs_..." }
  ```

- `/upload-file`: Uploads code files for analysis
  ```
  POST /vector-file/upload-file
  FormData: file
  Returns: { "id": "file_..." }
  ```

- `/add-file`: Adds a file to a vector store with chunking options
  ```
  POST /vector-file/add-file
  Body: { "vectorStoreId": "vs_...", "fileId": "file_...", "chunkingStrategy": {...} }
  Returns: { "success": true }
  ```

- `/search`: Performs semantic search across codebase
  ```
  POST /vector-file/search
  Body: { "vectorStoreId": "vs_...", "query": "insecure password storage", "maxResults": 10 }
  Returns: Vector search results
  ```

- `/query`: Enhanced search with web augmentation
  ```
  POST /vector-file/query
  Body: { "vectorStoreId": "vs_...", "question": "Are there any SQL injection vulnerabilities?", "webSearch": {"enabled": true} }
  Returns: { "vector_results": [...], "web_results": [...], "answer": "..." }
  ```

For a detailed walkthrough of how this project was built using Roo Code Power Steering and our process-focused development methodology, see the [tutorial.md](./tutorial.md) file.

### Available API Endpoints

1. `/init-scan`: Initialize a vector store for a repository
   ```
   POST /init-scan
   Body: { "repo": "owner/repo" }
   Returns: { "vectorStoreId": "vs_..." }
   ```

2. `/scan-repo`: Run a full security scan
   ```
   POST /scan-repo
   Body: { "repo": "owner/repo", "branch": "main" }
   Returns: ScanResult object
   ```

3. `/scan-results`: Get historical scan results
   ```
   POST /scan-results
   Body: { "repo": "owner/repo", "limit": 10 }
   Returns: { "results": ScanResult[] }
   ```

4. `/create-issues`: Create GitHub issues for findings
   ```
   POST /create-issues
   Body: { "repo": "owner/repo", "findings": SecurityFinding[] }
   Returns: { "created": number, "issues": string[] }
   ```

5. `/cron-trigger`: Endpoint for GitHub Actions to trigger nightly scans
   ```
   POST /cron-trigger
   Body: { "repo": "owner/repo", "branch": "main", "sendReport": true, "recipient": "user@example.com" }
   Returns: { "scanId": "scan_...", "message": "Scan queued successfully" }
   ```

6. `/send-report`: Send a security report via email
   ```
   POST /send-report
   Body: { "repo": "owner/repo", "recipient": "user@example.com", "includeRecommendations": true }
   Returns: { "success": true, "message": "Report sent successfully" }
   ```

### Environment Variables

- `API_KEY`: Required for API authentication
- `AUTH_TOKEN`: Token used for GitHub API authorization
- `OPENAI_API_KEY`: Required for OpenAI API integration (similarity detection and recommendations)
- `GITHUB_TOKEN`: GitHub API token for repository access and issue creation
- `RESEND_API_KEY`: API key for the Resend email service

## Vulnerability Testing Resources

The `vulnerabilities/` directory contains a comprehensive collection of sample security issues that can be used for:

- Testing the scanner's detection capabilities
- Demonstrating different severity levels (Critical, High, Medium, Low)
- Showing vulnerability patterns across multiple languages and technologies
- Training and educational purposes

### Sample Vulnerabilities

The collection includes examples of:
- SQL injection in Python and PHP
- Cross-site scripting (XSS) in React/JSX
- Hardcoded credentials in JavaScript
- Command injection in Ruby
- Insecure Docker configurations
- Path traversal vulnerabilities
- And many more security issues that security scanners should detect

## Development Approach

This project was built using a multi-phase development approach with Roo Code Power Steering to optimize development costs and efficiency:

### Multi-Phase Development 

Instead of creating a single monolithic design document, the project is structured into phases:

- **Guidance.md**: Defines coding standards, naming conventions, and best practices
- **Phase1.md, Phase2.md, Phase3.md**: Breaks development into incremental, test-driven phases
- **Tests.md**: Specifies unit and integration tests to validate each phase
- **Implementation.md**: Tracks progress as features are completed

### Roo Code Power Steering

The project uses Gemini 2.0 Pro with Roo Code's Power Steering for efficient development:

- **Cost Optimization**: Reduces token costs by 98.75% for input tokens and 99% for output tokens compared to other AI assistants
- **Scalable Context**: Leverages Gemini Pro's 1M token context window (5x larger than alternatives)
- **Test-Driven Development**: Each function is completed and tested before moving to the next
- **Implementation Tracking**: Updates Implementation.md after each successful step
- **Environment Variable Protection**: Ensures environment variables are never hardcoded

## Local Development

1. Clone the repository:
```sh
git clone <repository-url>
cd agentic-security-scanner
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

4. Visit `http://localhost:8080` to see the application

## Testing

Run the test suite with:

```sh
npm test
```

For integration tests with the edge function:

```sh
npm run test:integration
```

## Deployment

The application can be deployed to any static hosting provider:

```sh
npm run build
```

Then deploy the contents of the `dist` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Supported by the [Agentics Foundation](https://agentics.org)
- Powered by OpenAI and Gemini 2.0 Pro
- Built with Roo Code Power Steering methodology
