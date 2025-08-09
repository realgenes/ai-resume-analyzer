import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/auth/callback', 'routes/auth.callback.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/wipe', 'routes/wipe.tsx'),
    
    // API routes
    route('/api/ai', 'routes/api.ai.ts'),
    route('/api/upload', 'routes/api.upload.ts'),
    route('/api/save-resume', 'routes/api.save-resume.ts'),
] satisfies RouteConfig;
