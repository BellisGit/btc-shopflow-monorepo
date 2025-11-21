"use strict";
/**
 * 对象工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepClone = deepClone;
exports.get = get;
exports.pick = pick;
exports.omit = omit;
/**
 * 深拷贝对象
 * @param obj 对象
 * @returns 深拷贝后的对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (obj instanceof Array)
        return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
    return obj;
}
/**
 * 判断是否为对象
 * @param item 项目
 * @returns 是否为对象
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}
/**
 * 获取对象属性值（支持路径）
 * @param obj 对象
 * @param path 路径
 * @param defaultValue 默认值
 * @returns 属性值
 */
function get(obj, path, defaultValue) {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue;
        }
        result = result[key];
    }
    return result !== undefined ? result : defaultValue;
}
/**
 * 选择对象的指定属性
 * @param obj 对象
 * @param keys 键数组
 * @returns 新对象
 */
function pick(obj, keys) {
    const result = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}
/**
 * 排除对象的指定属性
 * @param obj 对象
 * @param keys 键数组
 * @returns 新对象
 */
function omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result;
}
