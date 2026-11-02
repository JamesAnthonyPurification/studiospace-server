import { env } from './src/config/env.js';
import app from './src/app.js';

// On Vercel the app is exported as a serverless handler; locally we listen on a port.
if (!process.env.VERCEL) {
  app.listen(env.port, () => {
    console.log(`🎬 StudioSpace API running on http://localhost:${env.port}`);
  });
}

export default app;
