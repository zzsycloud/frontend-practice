// ==================== 1. 原始数据定义 (数组+对象) ====================
const rawMembers = [
    { name: " 张三 ", phone: "13800138000", gear: "镜头", rent: 50, activityFee: 30 },
    { name: "李四", phone: "13900139000", gear: "三脚架", rent: 20, activityFee: 30 },
    { name: "王五", phone: "123456", gear: "镜头", rent: 50, activityFee: 30 }, // 非法手机号
    { name: "赵六 ", phone: " 13700137000 ", gear: "机身", rent: 0, activityFee: 30 }, // 带空格需清洗
    { name: "孙七", phone: "15800158000", gear: "三脚架", rent: 20, activityFee: 30 },
    { name: "周八", phone: "18900189000", gear: "镜头", rent: 50, activityFee: 30 },
    null, // 非法输入（空数据），测试程序健壮性
    { name: "", phone: "13100131000", gear: "三脚架", rent: 20, activityFee: 30 } // 非法姓名
];

// ==================== 2. 职责单一的函数 ====================

/**
 * 函数1：数据清洗与校验（对应研究任务2：正则表达式初探）
 * @param {Object} member - 原始报名成员对象
 * @returns {Object|null} - 清洗合法后的对象，若非法则返回null
 */
function validateAndClean(member) {
    // 防御性编程：处理null或undefined，防止程序崩溃 (要求5)
    if (!member) {
        console.warn(`拦截到非法输入已跳过:`, member);
        return null;
    }

    // 清洗数据：使用正则去除姓名和手机号中的所有多余空格
    const cleanName = member.name ? member.name.replace(/\s+/g, '') : '';
    const cleanPhone = member.phone ? member.phone.replace(/\s+/g, '') : '';
    
    // 正则校验手机号：以1开头，第二位为3-9，后接9位数字
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    // 如果姓名为空或手机号不符合规则，视为非法输入，返回null
    if (!cleanName || !phoneRegex.test(cleanPhone)) {
        console.warn(` 拦截到非法输入已跳过:`, member);
        return null;
    }

    // 返回清洗后的合法数据对象
    return { ...member, name: cleanName, phone: cleanPhone };
}

/**
 * 函数2：计算总费用（对应要求4：reduce）
 * @param {Array} members - 合法的成员列表
 * @returns {Number} - 总费用
 */
function calculateTotalFee(members) {
    return members.reduce((total, member) => {
        return total + member.rent + member.activityFee;
    }, 0);
}

/**
 * 函数3：多字段排序（对应研究任务1：排序深入研究）
 * 规则：先按器材名称字母升序，若器材相同，再按总费用降序
 * @param {Array} members - 合法的成员列表
 * @returns {Array} - 排序后的新数组
 */
function sortMembers(members) {
    // 使用展开运算符复制数组，避免影响原数据
    return [...members].sort((a, b) => {
        // 第一优先级：按器材名称排序 (localeCompare 用于中文字符串比较)
        if (a.gear !== b.gear) {
            return a.gear.localeCompare(b.gear, 'zh');
        }
        // 第二优先级：按总费用降序排列
        const totalA = a.rent + a.activityFee;
        const totalB = b.rent + b.activityFee;
        return totalB - totalA;
    });
}

/**
 * 函数4：性能对比实验（对应研究任务3：性能对比实验）
 * 对比 for循环 与 reduce 的耗时
 * @param {Array} members - 成员列表
 */
function performanceTest(members) {
    console.log("\n === 性能对比实验 (For 循环 vs Reduce) ===");
    
    console.time('for循环耗时');
    let totalFor = 0;
    for (let i = 0; i < members.length; i++) {
        totalFor += members[i].rent + members[i].activityFee;
    }
    console.timeEnd('for循环耗时');

    console.time('reduce耗时');
    const totalReduce = members.reduce((sum, m) => sum + m.rent + m.activityFee, 0);
    console.timeEnd('reduce耗时');

    console.log(` 结果验证: for循环总额 = ${totalFor}, reduce总额 = ${totalReduce}，两者一致: ${totalFor === totalReduce}`);
    console.log(" 结论: 数据量较小时，两者差异微乎其微；但 for 循环可读性略差，reduce 更加声明式。");
}

// ==================== 3. 主流程执行与结果输出 ====================

console.log(" === 摄影社外拍活动费用统计工具启动 ===");
console.log("1. 开始清洗和校验数据...");

const validMembers = rawMembers
    .map(validateAndClean)          
    .filter(member => member !== null); 

console.log(`\n 合法报名人数: ${validMembers.length} 人`);

console.log("\n === 合法报名名单 ===");
console.table(validMembers.map(m => ({
    姓名: m.name,
    手机号: m.phone,
    租赁器材: m.gear,
    租赁费用: m.rent,
    活动费用: m.activityFee
})));

const sortedMembers = sortMembers(validMembers);
console.log("\n === 按器材与费用排序后 (先按器材升序，再按总费用降序) ===");
console.table(sortedMembers.map(m => ({
    器材: m.gear,
    姓名: m.name,
    总费用: m.rent + m.activityFee
})));

const totalFee = calculateTotalFee(validMembers);
console.log(`\n === 活动总费用统计 ===`);
console.log(`本次摄影外拍活动总支出：${totalFee} 元`);

performanceTest(validMembers);

console.log("\n 统计完成，程序正常退出。");