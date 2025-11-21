"use strict";
/**
 * 数字工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPrecision = toPrecision;
exports.clamp = clamp;
exports.random = random;
exports.isEven = isEven;
exports.isOdd = isOdd;
exports.padZero = padZero;
/**
 * 数字精度处理
 * @param num 数字
 * @param precision 精度
 * @returns 处理后的数字
 */
function toPrecision(num, precision = 2) {
    return Number(num.toFixed(precision));
}
/**
 * 数字范围限制
 * @param num 数字
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数字
 */
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
/**
 * 随机数生成
 * @param min 最小值
 * @param max 最大值
 * @param integer 是否为整数
 * @returns 随机数
 */
function random(min = 0, max = 1, integer = false) {
    const num = Math.random() * (max - min) + min;
    return integer ? Math.floor(num) : num;
}
/**
 * 判断是否为偶数
 * @param num 数字
 * @returns 是否为偶数
 */
function isEven(num) {
    return num % 2 === 0;
}
/**
 * 判断是否为奇数
 * @param num 数字
 * @returns 是否为奇数
 */
function isOdd(num) {
    return num % 2 !== 0;
}
/**
 * 数字补零
 * @param num 数字
 * @param length 长度
 * @returns 补零后的字符串
 */
function padZero(num, length = 2) {
    return num.toString().padStart(length, '0');
}
