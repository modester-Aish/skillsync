# SkillSync Frontend

This is the frontend for the SkillSync application, a platform for skill sharing and micro-task management.

## Local Development

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Set up environment variables:
   Create a `.env` file in the root directory with:
   \`\`\`
   REACT_APP_API_URL=http://localhost:5000/api
   \`\`\`

3. Start the development server:
   \`\`\`
   npm start
   \`\`\`

## Deployment to Vercel

### 1. Push to GitHub

1. Create a new GitHub repository:
   \`\`\`
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/skillsync-frontend.git
   git push -u origin main
   \`\`\`

### 2. Deploy on Vercel

1. Sign up or log in to [Vercel](https://vercel.com)

2. Click "New Project" and import your GitHub repository

3. Configure the project:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Root Directory: `./` (or leave empty)

4. Set up environment variables:
   - Add `REACT_APP_API_URL` with your backend URL (e.g., `https://skillsync-backend.herokuapp.com/api`)

5. Click "Deploy"

### 3. Update Environment Variables

After deployment, you can update environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add or update the `REACT_APP_API_URL` variable with your production backend URL

### 4. Redeploy After Changes

When you make changes to your code:

\`\`\`
git add .
git commit -m "Your commit message"
git push origin main
\`\`\`

Vercel will automatically redeploy your application.

## Important Notes

- The frontend expects the backend API to be available at the URL specified in `REACT_APP_API_URL`
- Make sure CORS is properly configured on your backend to accept requests from your Vercel domain
- For production, use HTTPS URLs for your backend API
\`\`\`

```plaintext file="skillsync-backend/Procfile"
web: node src/index.js
