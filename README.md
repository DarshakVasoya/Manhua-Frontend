
yarn dev

# Manhua-Frontend

A modern Next.js frontend for reading manga and manhwa online. Designed for easy rebranding, API integration, and Docker deployment.

## Features
- Next.js 15, React 18, TypeScript 5
- Dynamic site name, API base, analytics, and other config via environment variables
- Responsive, fast, and ad-free UI
- SEO optimized (metadata, canonical, JSON-LD)
- Google Analytics integration
- Docker-ready for production deployment
- Easy rebranding: change site name and config in `.env.local`

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- (Optional) Docker

### Installation
1. Clone the repository:
	```bash
	git clone https://github.com/DarshakVasoya/Manhua-Frontend.git
	cd Manhua-Frontend
	```
2. Install dependencies:
	```bash
	npm install
	# or
	yarn install
	```
3. Configure environment variables:
	- Copy `.env.local.example` to `.env.local` (if example exists)
	- Edit `.env.local`:
	  ```env
	  NEXT_PUBLIC_SITE_NAME=manhwagalaxy
	  NEXT_PUBLIC_GA_ID=G-YXWMQFBJ8G
	  NEXT_PUBLIC_SITE_URL=https://manhwagalaxy.org
	  NEXT_PUBLIC_PAGE_SIZE=24
	  NEXT_PUBLIC_API_BASE_URL=http://your-api-host:8000
	  ```

### Running Locally
```bash
npm run dev
# or

```
Visit `http://localhost:3000` in your browser.

### Docker Deployment
1. Build the Docker image:
	```bash
	docker build -t manhua-frontend .
	```
2. Run the container:
	```bash
	docker run -p 3000:3000 --env-file .env.local manhua-frontend
	```

#### Multi-Container Setup (API + Frontend)
- Use Docker networks for best practice:
  ```bash
  docker network create manhua-net
  docker run --name api-container --network manhua-net -p 8000:8000 your-api-image
  docker run --name frontend-container --network manhua-net -p 3000:3000 --env-file .env.local manhua-frontend
  ```
- Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to `http://api-container:8000`

## Environment Variables
| Variable                   | Description                                 |
|---------------------------|---------------------------------------------|
| NEXT_PUBLIC_SITE_NAME      | Site name for branding                      |
| NEXT_PUBLIC_GA_ID         | Google Analytics ID                         |
| NEXT_PUBLIC_SITE_URL       | Public site URL for SEO                     |
| NEXT_PUBLIC_PAGE_SIZE      | Items per page in listings                  |
| NEXT_PUBLIC_API_BASE_URL   | Base URL for backend API requests           |

## File Structure
```
Manhua-Frontend/
├── src/
│   ├── app/
│   │   ├── HomeClient.tsx
│   │   ├── layout.tsx
│   │   ├── ...
│   ├── components/
│   │   ├── MangaCardRef.tsx
│   │   ├── ...
│   ├── constants/
│   │   ├── categories.ts
├── public/
│   ├── icon/
│   ├── ...
├── .env.local
├── Dockerfile
├── package.json
├── README.md
```

## Rebranding
To launch the site under a new name, update `NEXT_PUBLIC_SITE_NAME` in `.env.local` and restart the app. All branding, metadata, and references will update automatically.

## Troubleshooting
- **API not loading:** Ensure `NEXT_PUBLIC_API_BASE_URL` is correct and API is reachable from the frontend container.
- **CORS issues:** Configure your API to allow requests from your frontend's origin.
- **Docker networking:** Use container names and Docker networks for reliable communication.
- **Environment variables:** Always restart the frontend after changing `.env.local`.

## License
MIT

## Author
Darshak Vasoya
