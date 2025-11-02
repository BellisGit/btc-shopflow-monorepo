
// Auto-generated SVG register
import { createApp } from 'vue';

const svgIcons = {};

export function registerSvgIcons(app: any) {
	// 注册 SVG 图标
	Object.keys(svgIcons).forEach(name => {
		app.component(`svg-${name}`, {
			template: svgIcons[name]
		});
	});
}

export default svgIcons;
