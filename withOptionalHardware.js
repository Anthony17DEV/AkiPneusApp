const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withOptionalHardware(config) {
	return withAndroidManifest(config, (config) => {
		const manifest = config.modResults.manifest;

		if (!manifest['uses-feature']) {
			manifest['uses-feature'] = [];
		}

		const features = [
			'android.hardware.screen.portrait',
			'android.hardware.wifi',
		];

		features.forEach((name) => {
			const existing = manifest['uses-feature'].find(
				(f) => f.$ && f.$['android:name'] === name
			);

			if (existing) {
				existing.$['android:required'] = 'false';
			} else {
				manifest['uses-feature'].push({
					$: {
						'android:name': name,
						'android:required': 'false',
					},
				});
			}
		});

		return config;
	});
};