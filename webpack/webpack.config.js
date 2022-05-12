const { merge } = require('webpack-merge');

const common = require('./webpack.config.common');
const server = require('./webpack.config.server');
const production = require('./webpack.config.production');
const development = require('./webpack.config.development');

const modes = {
	development: (mode, serve) => {
		if (serve) {
			return merge(common, server, { mode });
		}

		return merge(common, development, { mode });
	},
	production: mode => merge(common, production, { mode }),
	default: mode => {
		throw new Error(`Trying to use an unknown mode, ${mode}`);
	},
};

module.exports = (env, argv) => {
	const { mode } = argv;
	const serve = true === env.WEBPACK_SERVE;

	return (modes[mode] || modes.default)(mode, serve);
};
