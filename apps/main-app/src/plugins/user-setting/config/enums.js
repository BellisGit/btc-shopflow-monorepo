/**
 * 设置面板相关枚举定义
 */
// 菜单类型
export var MenuTypeEnum;
(function (MenuTypeEnum) {
    MenuTypeEnum["LEFT"] = "left";
    MenuTypeEnum["TOP"] = "top";
    MenuTypeEnum["TOP_LEFT"] = "top-left";
    MenuTypeEnum["DUAL_MENU"] = "dual-menu";
})(MenuTypeEnum || (MenuTypeEnum = {}));
// 系统主题类型
export var SystemThemeEnum;
(function (SystemThemeEnum) {
    SystemThemeEnum["DARK"] = "dark";
    SystemThemeEnum["LIGHT"] = "light";
    SystemThemeEnum["AUTO"] = "auto";
})(SystemThemeEnum || (SystemThemeEnum = {}));
// 菜单主题类型
export var MenuThemeEnum;
(function (MenuThemeEnum) {
    MenuThemeEnum["DARK"] = "dark";
    MenuThemeEnum["LIGHT"] = "light";
    MenuThemeEnum["DESIGN"] = "design";
})(MenuThemeEnum || (MenuThemeEnum = {}));
// 容器宽度类型
export var ContainerWidthEnum;
(function (ContainerWidthEnum) {
    ContainerWidthEnum["FULL"] = "100%";
    ContainerWidthEnum["BOXED"] = "1200px";
})(ContainerWidthEnum || (ContainerWidthEnum = {}));
// 盒子样式类型
export var BoxStyleType;
(function (BoxStyleType) {
    BoxStyleType["BORDER"] = "border-mode";
    BoxStyleType["SHADOW"] = "shadow-mode";
})(BoxStyleType || (BoxStyleType = {}));
