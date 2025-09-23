// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react-swc'
// // import dotenv from 'dotenv';

// // dotenv.config({path:'./config.env'});


// // export default defineConfig({
// //   plugins: [react()],

// //   define: {
// //     'process.env': process.env
// //   },
// //     server: {
// //     historyApiFallback: true
// //   },
// //   optimizeDeps: {
// //     include: ['xlsx'],
// //   },

// // })


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import dotenv from 'dotenv';
// dotenv.config({path:'/config.env'});
// import path from 'path';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     // This affects only local dev; deployment is handled by the app.yaml config
//     historyApiFallback: true
//   },
//   define: {
//         'process.env': process.env
//       },
//   build: {
//     outDir: 'dist',  // Ensure output is directed to the 'dist' folder
//     rollupOptions: {
//       input: './index.html', // Your app's entry point
//     },
//   },
//   optimizeDeps: {
//     include: ['xlsx'],  // This is fine if you're optimizing dependencies
//   },
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, '/src'),
//     },
//   },
// })


// // import { defineConfig } from 'vite';
// // import react from '@vitejs/plugin-react-swc';
// // import path from 'path';

// // export default defineConfig({
// //   plugins: [react()],
// //   server: {
// //     historyApiFallback: true, // Ensures SPA fallback for local dev
// //   },
// //   define: {
// //     'process.env': {}, // Use this if you're manually injecting env variables
// //   },
// //   resolve: {
// //     alias: {
// //       '@': path.resolve(__dirname, 'src'), // Alias for src directory
// //     },
// //   },
// //   build: {
// //     outDir: 'dist', // Ensure output goes to 'dist'
// //     build: {
// //       rollupOptions: {
// //         input: './index.html',
// //         external: ['/src/main.jsx'], // Explicitly externalize main.jsx
// //       },
// //     },
    
// //   },
// //   optimizeDeps: {
// //     include: ['xlsx'], // Optimize specific dependencies if needed
// //   },
// //   define: {
// //     __DEBUG__: true,
// //   },
// // });


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './config.env' });

export default defineConfig({
  root: '.', 
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  server: {
    historyApiFallback: true,
  },
  optimizeDeps: {
    include: ['xlsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Ensure this points to the correct `src` directory
    },
  },
});
