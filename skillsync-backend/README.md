# SkillSync Backend

This is the backend API for the SkillSync application, a platform for skill sharing and micro-task management.

## Local Development

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Set up environment variables:
   Create a `.env` file in the root directory with:
   \`\`\`
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:3000
   \`\`\`

3. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

## Deployment to Heroku

### 1. Push to GitHub

1. Create a new GitHub repository:
   \`\`\`
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/skillsync-backend.git
   git push -u origin main
   \`\`\`

### 2. Deploy on Heroku

1. Sign up or log in to [Heroku](https://heroku.com)

2. Install the Heroku CLI:
   \`\`\`
   npm install -g heroku
   \`\`\`

3. Log in to Heroku CLI:
   \`\`\`
   heroku login
   \`\`\`

4. Create a new Heroku app:
   \`\`\`
   heroku create skillsync-backend
   \`\`\`

5. Add the MongoDB add-on (optional, if you want to use Heroku's MongoDB):
   \`\`\`
   heroku addons:create mongodb:sandbox
   \`\`\`

6. Set environment variables:
   \`\`\`
   heroku config:set MONGO_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set GEMINI_API_KEY=your_gemini_api_key
   heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app
   \`\`\`

7. Deploy to Heroku:
   \`\`\`
   git push heroku main
   \`\`\`

8. Open your app:
   \`\`\`
   heroku open
   \`\`\`

### 3. Update Environment Variables

You can update environment variables through the Heroku CLI or dashboard:

Using CLI:
\`\`\`
heroku config:set VARIABLE_NAME=new_value
\`\`\`

Using Dashboard:
1. Go to your app in the Heroku dashboard
2. Navigate to "Settings" > "Config Vars"
3. Add or update variables as needed

### 4. Redeploy After Changes

When you make changes to your code:

\`\`\`
git add .
git commit -m "Your commit message"
git push origin main
git push heroku main
\`\`\`

## Important Notes

- Make sure your MongoDB instance is accessible from Heroku
- The `Procfile` tells Heroku how to run your application
- CORS is configured to accept requests from the URL specified in `FRONTEND_URL`
- For security, generate a strong random string for `JWT_SECRET`
- Monitor your application logs with `heroku logs --tail`
- Consider using Heroku's MongoDB add-on or MongoDB Atlas for your database

## API Health Check

You can verify your API is running by accessing:
\`\`\`
https://your-app-name.herokuapp.com/api/health
\`\`\`

This should return a JSON response with status "ok".
