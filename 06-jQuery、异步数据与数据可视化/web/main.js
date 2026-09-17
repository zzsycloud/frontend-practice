// 全局变量
let rawData1 = [];
let rawData2 = [];
let myECharts, myChartJS;

// DOM 状态切换函数
function showStatus(state) {
    $('#status-loading, #status-error, #status-empty').addClass('hidden');
    $('#charts').addClass('hidden');
    
    if (state === 'loading') $('#status-loading').removeClass('hidden');
    if (state === 'error') $('#status-error').removeClass('hidden');
    if (state === 'empty') $('#status-empty').removeClass('hidden');
    if (state === 'success') $('#charts').removeClass('hidden');
}

// 数据加载函数（研究任务1：并行请求）
async function loadDashboardData() {
    showStatus('loading');
    const startTime = performance.now(); // 开始计时

    try {
        // 使用 Promise.all 并行请求两份 JSON
        const [res1, res2] = await Promise.all([
            fetch('./data1.json').then(r => {
                if (!r.ok) throw new Error('data1 加载失败');
                return r.json();
            }),
            fetch('./data2.json').then(r => {
                if (!r.ok) throw new Error('data2 加载失败');
                return r.json();
            })
        ]);

        const endTime = performance.now(); // 结束计时
        $('#time-display').text(`并行加载耗时: ${(endTime - startTime).toFixed(2)} ms`);

        // 空数据状态判断
        if (!res1.length || !res2.length) {
            showStatus('empty');
            return;
        }

        rawData1 = res1;
        rawData2 = res2;
        
        showStatus('success');
        renderECharts(rawData1);
        renderChartJS(rawData2);

    } catch (error) {
        console.error("数据加载失败:", error);
        showStatus('error');
    }
}

// 渲染 ECharts 柱状图
function renderECharts(data) {
    if (!myECharts) {
        myECharts = echarts.init(document.getElementById('chart1'));
    }
    const option = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: data.map(item => item.name) },
        yAxis: { type: 'value', name: '人数' },
        series: [{
            data: data.map(item => item.value),
            type: 'bar',
            itemStyle: { color: '#3498db' },
            barWidth: '50%'
        }]
    };
    myECharts.setOption(option, true); // true 表示不合并，重新渲染
}

// 渲染 Chart.js 折线图
function renderChartJS(data) {
    const ctx = document.getElementById('chart2').getContext('2d');
    if (myChartJS) {
        myChartJS.destroy(); // 销毁旧实例，防止重复渲染
    }
    myChartJS = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.month),
            datasets: [{
                label: '月度投稿量',
                data: data.map(item => item.count),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: '数量 (张)' } }
            }
        }
    });
}

// 页面加载完成后执行
$(document).ready(function() {
    loadDashboardData();
});