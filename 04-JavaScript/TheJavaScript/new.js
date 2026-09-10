        // ==================== 2. 职责单一的函数 ====================

        /**
         * 数据清洗与校验（对应研究任务2：正则表达式初探）
         */
        function validateAndClean(member) {
            // 初步清洗数据：使用正则去除姓名和手机号中的所有多余空格
            const cleanName = member.name ? member.name.replace(/\s+/g, '') : '';
            const cleanPhone = member.phone ? member.phone.replace(/\s+/g, '') : '';
            
            // 正则校验手机号：以1开头，第二位为3-9，后接9位数字
            const phoneRegex = /^1[3-9]\d{9}$/;
            
            // 如果姓名为空或手机号不符合规则，视为非法输入，返回null
            if (!cleanName || !phoneRegex.test(cleanPhone)) {
                return null; 
            }
            return { ...member, name: cleanName, phone: cleanPhone };
        }

        /**
         * 计算总费用（使用reduce）
         */
        function calculateTotalFee(members) {
            return members.reduce((total, member) => {
                return total + member.rent + member.activityFee;
            }, 0);
        }

        // ==================== 3. 主流程执行与结果输出 ====================
        console.log("1. 开始清洗和校验数据...");
        
        // 使用 map 和 filter 进行数据清洗与过滤
        const validMembers = rawMembers
            .map(validateAndClean)          
            .filter(member => member !== null); 

        console.log(`合法报名人数: ${validMembers.length} 人`);
        console.log("合法名单数据:", validMembers);
        
        const totalFee = calculateTotalFee(validMembers);
        console.log(`活动总费用统计：${totalFee} 元`);