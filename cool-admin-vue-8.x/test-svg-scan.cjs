const fs = require('fs');
const path = require('path');

function findSvg(dir) {
	const arr = [];
	const dirs = fs.readdirSync(dir, { withFileTypes: true });
	const moduleName = dir.match(/[/\\](?:src[/\\](?:plugins|modules)[/\\])([^/\\]+)/)?.[1] || "";

	for (const d of dirs) {
		if (d.isDirectory()) {
			arr.push(...findSvg(dir + d.name + "/"));
		} else {
			if (path.extname(d.name) === ".svg") {
				const baseName = path.basename(d.name, ".svg");
				const shouldSkip = ['base', 'theme'].includes(moduleName);
				const iconName = shouldSkip ? baseName : `${moduleName}-${baseName}`;
				arr.push({ file: dir + d.name, iconName, moduleName });
			}
		}
	}

	return arr;
}

const svgs = findSvg('./src/');
console.log('Found SVGs:', JSON.stringify(svgs.filter(s => s.iconName === 'bg'), null, 2));
