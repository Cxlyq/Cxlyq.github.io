// 获取canvas并设置上下文
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 用户可自定义的参数
const config = {
    backgroundColor: '#ffffff',  // 背景颜色
    dotColor: '#e5be79',         // 点的颜色
    lineColor: '#e5be79',        // 线的颜色
    maxDots: 100,                // 最大点数
    maxLineDistance: 150,        // 生成线的最大距离
    lineProbability: 1,        // 生成连接线的概率（0到1之间）
    pointGenerationInterval: 100 // 鼠标生成点的时间间隔（毫秒）
};

// 初始化canvas大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 点的数组
const dots = [];
const mouse = { x: null, y: null };
let lastPointGenerationTime = 0; // 用于记录上次生成点的时间

// 生成随机的浮动点
function createDots() {
    for (let i = 0; i < config.maxDots; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 4 + 2,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2
        });
    }
}

// 更新点的位置
function updateDots() {
    for (let dot of dots) {
        dot.x += dot.dx;
        dot.y += dot.dy;

        // 边界检测，碰到边缘反弹
        if (dot.x < 0 || dot.x > canvas.width) dot.dx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.dy *= -1;

        // 绘制点
        drawDot(dot);
    }
}

// 绘制点
function drawDot(dot) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    ctx.fillStyle = config.dotColor;
    ctx.fill();
    ctx.closePath();
}

// 绘制点之间的连接线
function drawLines() {
    for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
            const dist = getDistance(dots[i], dots[j]);

            // 仅当距离小于最大距离且满足概率时绘制连接线
            if (dist < config.maxLineDistance && Math.random() < config.lineProbability) {
                ctx.beginPath();
                ctx.moveTo(dots[i].x, dots[i].y);
                ctx.lineTo(dots[j].x, dots[j].y);
                ctx.strokeStyle = `rgba(${hexToRgb(config.lineColor)}, ${1 - dist / config.maxLineDistance})`;
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// 计算两点之间的距离
function getDistance(dot1, dot2) {
    const dx = dot1.x - dot2.x;
    const dy = dot1.y - dot2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// 处理鼠标悬停事件，增加新的点（根据设定的时间间隔）
canvas.addEventListener('mousemove', (event) => {
    const currentTime = Date.now();

    // 检查是否达到生成点的时间间隔
    if (currentTime - lastPointGenerationTime >= config.pointGenerationInterval) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;

        // 如果点数达到最大值，删除最早的点
        if (dots.length >= config.maxDots) {
            dots.shift();  // 删除最早的点
        }

        // 添加新的点
        dots.push({
            x: mouse.x,
            y: mouse.y,
            radius: Math.random() * 4 + 2,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2
        });

        // 更新最后一次生成点的时间
        lastPointGenerationTime = currentTime;
    }
});

// 将十六进制颜色转换为RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}

// 动画循环
function animate() {
    // 清除背景并填充用户定义的背景颜色
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateDots();
    drawLines();
    requestAnimationFrame(animate);
}

// 初始化点并启动动画
createDots();
animate();

// 窗口大小变化时调整canvas大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
