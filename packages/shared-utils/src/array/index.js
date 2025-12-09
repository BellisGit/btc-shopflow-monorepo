/**
 * 数组工具函数
 */
/**
 * 本地化排序
 * @param list 数组
 * @param selector 选择器函数
 * @returns 排序后的数组
 */
export function sortByLocale(list, selector) {
    const mapper = selector ?? ((item) => String(item ?? ''));
    return [...list].sort((a, b) => {
        const left = mapper(a) ?? '';
        const right = mapper(b) ?? '';
        return left.localeCompare(right, undefined, { sensitivity: 'base' });
    });
}
/**
 * 数组去重
 * @param arr 数组
 * @param key 去重键（可选）
 * @returns 去重后的数组
 */
export function unique(arr, key) {
    if (!key) {
        return [...new Set(arr)];
    }
    const seen = new Set();
    return arr.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}
/**
 * 数组分组
 * @param arr 数组
 * @param key 分组键或函数
 * @returns 分组后的对象
 */
export function groupBy(arr, key) {
    return arr.reduce((groups, item) => {
        const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
}
/**
 * 数组分块
 * @param arr 数组
 * @param size 块大小
 * @returns 分块后的数组
 */
export function chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}
/**
 * 数组扁平化
 * @param arr 数组
 * @param depth 深度
 * @returns 扁平化后的数组
 */
export function flatten(arr, depth = 1) {
    return depth > 0
        ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
        : arr.slice();
}
/**
 * 数组深度扁平化
 * @param arr 数组
 * @returns 扁平化后的数组
 */
export function flattenDeep(arr) {
    return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flattenDeep(val) : val), []);
}
/**
 * 数组交集
 * @param arr1 数组1
 * @param arr2 数组2
 * @returns 交集数组
 */
export function intersection(arr1, arr2) {
    return arr1.filter(item => arr2.includes(item));
}
/**
 * 数组差集
 * @param arr1 数组1
 * @param arr2 数组2
 * @returns 差集数组
 */
export function difference(arr1, arr2) {
    return arr1.filter(item => !arr2.includes(item));
}
/**
 * 数组并集
 * @param arr1 数组1
 * @param arr2 数组2
 * @returns 并集数组
 */
export function union(arr1, arr2) {
    return unique([...arr1, ...arr2]);
}
/**
 * 随机打乱数组
 * @param arr 数组
 * @returns 打乱后的数组
 */
export function shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
/**
 * 随机取样
 * @param arr 数组
 * @param count 取样数量
 * @returns 取样后的数组
 */
export function sample(arr, count = 1) {
    const shuffled = shuffle(arr);
    return shuffled.slice(0, count);
}
/**
 * 数组求和
 * @param arr 数组
 * @param key 求和键（可选）
 * @returns 求和结果
 */
export function sum(arr, key) {
    if (!key) {
        return arr.reduce((acc, val) => acc + val, 0);
    }
    return arr.reduce((acc, item) => {
        const value = Number(item[key]);
        return acc + (isNaN(value) ? 0 : value);
    }, 0);
}
/**
 * 数组平均值
 * @param arr 数组
 * @param key 平均值键（可选）
 * @returns 平均值
 */
export function average(arr, key) {
    if (arr.length === 0)
        return 0;
    return sum(arr, key) / arr.length;
}
/**
 * 数组最大值
 * @param arr 数组
 * @param key 最大值键（可选）
 * @returns 最大值项
 */
export function maxBy(arr, key) {
    if (arr.length === 0)
        return undefined;
    if (!key) {
        return arr.reduce((max, item) => (item > max ? item : max));
    }
    return arr.reduce((max, item) => {
        return Number(item[key]) > Number(max[key]) ? item : max;
    });
}
/**
 * 数组最小值
 * @param arr 数组
 * @param key 最小值键（可选）
 * @returns 最小值项
 */
export function minBy(arr, key) {
    if (arr.length === 0)
        return undefined;
    if (!key) {
        return arr.reduce((min, item) => (item < min ? item : min));
    }
    return arr.reduce((min, item) => {
        return Number(item[key]) < Number(min[key]) ? item : min;
    });
}
