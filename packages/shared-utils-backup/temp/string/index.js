"use strict";
/**
 * 字符串工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalize = capitalize;
exports.camelCase = camelCase;
exports.kebabCase = kebabCase;
exports.truncate = truncate;
exports.randomString = randomString;
/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写的字符串
 */
function capitalize(str) {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
/**
 * 驼峰命名转换
 * @param str 字符串
 * @returns 驼峰命名字符串
 */
function camelCase(str) {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''));
}
/**
 * 短横线命名转换
 * @param str 字符串
 * @returns 短横线命名字符串
 */
function kebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}
/**
 * 截断字符串
 * @param str 字符串
 * @param length 最大长度
 * @param suffix 后缀
 * @returns 截断后的字符串
 */
function truncate(str, length, suffix = '...') {
    if (str.length <= length)
        return str;
    return str.slice(0, length - suffix.length) + suffix;
}
/**
 * 生成随机字符串
 * @param length 长度
 * @param chars 字符集
 * @returns 随机字符串
 */
function randomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
