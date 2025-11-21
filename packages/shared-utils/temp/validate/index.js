"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmail = isEmail;
exports.isPhone = isPhone;
exports.isIdCard = isIdCard;
exports.isUrl = isUrl;
exports.isEmpty = isEmpty;
/**
 * 验证邮箱
 * @param email 邮箱地址
 * @returns 是否有效
 */
function isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
/**
 * 验证手机号（中国大陆）
 * @param phone 手机号
 * @returns 是否有效
 */
function isPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}
/**
 * 验证身份证号（中国大陆）
 * @param idCard 身份证号
 * @returns 是否有效
 */
function isIdCard(idCard) {
    return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard);
}
/**
 * 验证URL
 * @param url URL地址
 * @returns 是否有效
 */
function isUrl(url) {
    return /^https?:\/\/.+/.test(url);
}
/**
 * 验证是否为空
 * @param value 值
 * @returns 是否为空
 */
function isEmpty(value) {
    if (value === null || value === undefined)
        return true;
    if (typeof value === 'string')
        return value.trim() === '';
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
}
