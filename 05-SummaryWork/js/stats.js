// ==================== 1. 原始数据定义 (数组 + 对象) ====================
const rawMembers = [
    { name: " 张三 ", phone: "13800138000", gear: "镜头", rent: 50, activityFee: 30 },
    { name: "李四", phone: "13900139000", gear: "三脚架", rent: 20, activityFee: 30 },
    { name: "王五", phone: "123456", gear: "镜头", rent: 50, activityFee: 30 },          // 非法手机号
    { name: "赵六 ", phone: " 13700137000 ", gear: "机身", rent: 0, activityFee: 30 },   // 带空格需清洗
    { name: "孙七", phone: "15800158000", gear: "三脚架", rent: 20, activityFee: 30 },
    { name: "周八", phone: "18900189000", gear: "镜头", rent: 50, activityFee: 30 },
    null,                                                                                 // 非法输入（空数据），测试健壮性
    { name: "", phone: "13100131000", gear: "三脚架", rent: 20, activityFee: 30 }          // 非法姓名
];

function logLine(text, isWarn = false) {
    if (isWarn) console.warn(text);
    else console.log(text);
}

// ==================== 2. 职责单一的函数 ====================

/**
 * 函数1：数据清洗与校验（正则表达式）
 * @param {Object} member - 原始报名成员对象
 * @returns {Object|null} - 清洗合法后的对象，若非法则返回 null
 */
function validateAndClean(member) {
    // 防御性编程：处理 null 或 undefined，防止程序崩溃
    if (!member) {
        logLine('拦截到非法输入（空数据 null）已跳过', true);
        return null;
    }

    // 清洗数据：使用正则去除姓名和手机号中的所有多余空格
    const cleanName = member.name ? member.name.replace(/\s+/g, '') : '';
    const cleanPhone = member.phone ? member.phone.replace(/\s+/g, '') : '';

    // 正则校验手机号：以 1 开头，第二位为 3-9，后接 9 位数字
    const phoneRegex = /^1[3-9]\d{9}$/;

    // 如果姓名为空或手机号不符合规则，视为非法输入，返回 null
    if (!cleanName || !phoneRegex.test(cleanPhone)) {
        logLine(`拦截到非法输入已跳过：姓名="${member.name}" 手机号="${member.phone}"`, true);
        return null;
    }

    // 返回清洗后的合法数据对象
    return { ...member, name: cleanName, phone: cleanPhone };
}

/**
 * 函数2：计算总费用（reduce）
 * @param {Array} members - 合法的成员列表
 * @returns {Number} - 总费用
 */
function calculateTotalFee(members) {
    return members.reduce((total, member) => {
        return total + member.rent + member.activityFee;
    }, 0);
}

/**
 * 函数3：多字段排序
 * 规则：先按器材名称升序，若器材相同，再按总费用降序
 * @param {Array} members - 合法的成员列表
 * @returns {Array} - 排序后的新数组
 */
function sortMembers(members) {
    // 使用展开运算符复制数组，避免影响原数据
    return [...members].sort((a, b) => {
        // 第一优先级：按器材名称排序（localeCompare 用于中文字符串比较）
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
 * 函数4：性能对比实验（for 循环 vs reduce）
 * @param {Array} members - 成员列表
 */
function performanceTest(members) {
    logLine('=== 性能对比实验 (For 循环 vs Reduce) ===');

    const t1 = performance.now();
    let totalFor = 0;
    for (let i = 0; i < members.length; i++) {
        totalFor += members[i].rent + members[i].activityFee;
    }
    const t2 = performance.now();

    const totalReduce = members.reduce((sum, m) => sum + m.rent + m.activityFee, 0);
    const t3 = performance.now();

    logLine(`for 循环耗时：${(t2 - t1).toFixed(4)} ms；reduce 耗时：${(t3 - t2).toFixed(4)} ms`);
    logLine(`结果验证：for=${totalFor}，reduce=${totalReduce}，两者一致：${totalFor === totalReduce}`);
    logLine('结论：数据量较小时两者差异微乎其微；for 循环可读性略差，reduce 更声明式。');
}

// ==================== 3. 渲染工具：把数组渲染成页面表格 ====================
function renderTable(rows, columns) {
    if (!rows.length) return '<p class="text-muted">（无数据）</p>';
    const head = columns.map(c => `<th>${c.label}</th>`).join('');
    const body = rows.map(r =>
        '<tr>' + columns.map(c => `<td>${r[c.key]}</td>`).join('') + '</tr>'
    ).join('');
    return `<table class="stats-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

// ==================== 4. 主流程 ====================
function runStatistics() {
    logLine('=== 摄影社外拍活动费用统计工具启动 ===');
    logLine('1. 开始清洗和校验数据…');

    const validMembers = rawMembers
        .map(validateAndClean)
        .filter(member => member !== null);

    logLine(`合法报名人数：${validMembers.length} 人`);

    // ① 合法名单（页面 + 控制台）
    const validRows = validMembers.map(m => ({
        姓名: m.name, 手机号: m.phone, 租赁器材: m.gear, 租赁费用: m.rent, 活动费用: m.activityFee
    }));
    console.table(validRows);
    document.getElementById('valid-table').innerHTML = renderTable(validRows, [
        { key: '姓名', label: '姓名' },
        { key: '手机号', label: '手机号' },
        { key: '租赁器材', label: '租赁器材' },
        { key: '租赁费用', label: '租赁费用/元' },
        { key: '活动费用', label: '活动费用/元' }
    ]);

    // ② 排序后名单
    const sortedMembers = sortMembers(validMembers);
    const sortedRows = sortedMembers.map(m => ({
        器材: m.gear, 姓名: m.name, 总费用: m.rent + m.activityFee
    }));
    console.table(sortedRows);
    document.getElementById('sorted-table').innerHTML = renderTable(sortedRows, [
        { key: '器材', label: '器材' },
        { key: '姓名', label: '姓名' },
        { key: '总费用', label: '总费用/元' }
    ]);

    // ③ 总费用
    const totalFee = calculateTotalFee(validMembers);
    logLine(`本次摄影外拍活动总支出：${totalFee} 元`);
    document.getElementById('total-fee').innerHTML =
        `<span class="stat-badge">活动总支出：${totalFee} 元</span>`;

    // ④ 性能对比
    performanceTest(validMembers);
    logLine('统计完成，程序正常退出。');
}

// 绑定按钮；页面加载后自动运行一次，方便直接查看结果
document.getElementById('run-btn').addEventListener('click', runStatistics);
runStatistics();
