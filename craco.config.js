const CracoLessPlugin = require("craco-less");

module.exports = {
	plugins: [
		{
			plugin: CracoLessPlugin,
			options: {
				lessLoaderOptions: {
					lessOptions: {
						modifyVars: {
							"@layout-header-background": "#cccccc",
							"@menu-bg": "#cccccc",
							"@primary-color": "#F10203"
						},
						javascriptEnabled: true,
					}
				},
			},
		},
	],
};
