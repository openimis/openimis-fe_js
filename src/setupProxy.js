import pkg from '../package.json';

export function createViteProxy() {
  const baseApiUrlRaw = process.env.VITE_REACT_APP_API_URL || '/api';
  const baseApiUrl = baseApiUrlRaw.startsWith('/') ? baseApiUrlRaw : `/${baseApiUrlRaw}`;

  return {
    [baseApiUrl]: {
      target: pkg.proxy, // should be http://localhost:8000
      changeOrigin: true,
      configure: (proxy, options) => {
        proxy.on('proxyReq', (proxyReq, req) => {
          if (process.env.VITE_REMOTE_USER) {
            proxyReq.setHeader('Remote-User', process.env.VITE_REMOTE_USER);
          }
        });
      },
    }
  };
}