const proxy = {
	'/dev/': {
		target: 'http://localhost:8002',
		changeOrigin: true,
		rewrite: (path: string) => path
	},

	'/prod/': {
		target: 'https://show.cool-admin.com',
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/prod/, '/api')
	}
};

const value = 'dev';
const host = proxy[`/${value}/`]?.target;

export { proxy, host, value };
