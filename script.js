// 任务数组
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    renderTasks();
    updateStats();
    
    // 回车键添加任务
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            createNewTask();
        }
    });
});

// 添加任务
function createNewTask() {
    const taskInput = document.getElementById('taskInput');
    const title = taskInput.value.trim();
    
    if (title === '') {
        alert('请输入任务标题！');
        return;
    }
    
    console.log('正在创建任务:', title); // 调试信息
    
    // 创建临时任务数据
    const tempTask = {
        id: Date.now(),
        title: title,
        description: '',
        dueDate: '',
        priority: 'medium',
        steps: [],
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // 保存到临时存储，然后跳转
    sessionStorage.setItem('editingTask', JSON.stringify(tempTask));
    console.log('准备跳转到详情页'); // 调试信息
    
    // 尝试不同的跳转方式
    try {
        window.location.href = 'task-detail.html';
    } catch (error) {
        console.error('跳转错误:', error);
        alert('跳转失败，请检查task-detail.html文件是否存在');
    }
}

// 切换步骤完成状态 - 支持取消完成
function toggleStep(taskId, stepIndex, event) {
    event.stopPropagation(); // 阻止事件冒泡，避免触发任务卡片点击
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const step = task.steps[stepIndex];
    if (!step) return;
    
    // 切换步骤完成状态
    const newCompletedState = !step.completed;
    
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            const updatedSteps = [...task.steps];
            updatedSteps[stepIndex] = {
                ...updatedSteps[stepIndex],
                completed: newCompletedState
            };
            
            // 检查所有步骤是否完成（只有所有步骤都完成时，任务才标记为完成）
            const allStepsCompleted = updatedSteps.every(step => step.completed);
            const anyStepsCompleted = updatedSteps.some(step => step.completed);
            
            return {
                ...task,
                steps: updatedSteps,
                completed: allStepsCompleted // 只有所有步骤完成，任务才完成
            };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    updateStats();
    
    // 显示状态变化提示
    showStepStatusChange(step.text, newCompletedState);
}

// 显示步骤状态变化提示
function showStepStatusChange(stepText, completed) {
    const message = completed ? 
        `✅ 已完成: ${stepText}` : 
        `↩️ 已取消完成: ${stepText}`;
    
    // 创建临时提示
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${completed ? '#28a745' : '#ffc107'};
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 2秒后自动消失
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// 创建任务卡片
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.onclick = () => viewTaskDetail(task.id);
    
    const completedSteps = task.steps.filter(step => step.completed).length;
    const totalSteps = task.steps.length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
    
    card.innerHTML = `
        <div class="task-header">
            <div class="task-title">${task.title}</div>
            <span class="task-priority priority-${task.priority}">
                ${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
            </span>
        </div>
        <div class="task-meta">
            ${task.dueDate ? `
                <span class="due-date ${isOverdue ? 'overdue' : ''}">
                    📅 ${formatDate(task.dueDate)} ${isOverdue ? '(已过期)' : ''}
                </span>
            ` : ''}
            ${totalSteps > 0 ? `
                <span>📊 ${completedSteps}/${totalSteps} 步骤</span>
            ` : ''}
        </div>
        ${task.description ? `<p style="color: #666; margin: 10px 0;">${task.description}</p>` : ''}
        ${totalSteps > 0 ? `
            <div class="task-steps">
                ${task.steps.slice(0, 3).map((step, stepIndex) => `
                    <div class="step-item ${step.completed ? 'completed' : ''}">
                        <input type="checkbox" ${step.completed ? 'checked' : ''} 
                               onclick="toggleStep(${task.id}, ${stepIndex}, event)" 
                               class="step-checkbox">
                        <span class="step-text">${step.text}</span>
                    </div>
                `).join('')}
                ${totalSteps > 3 ? `<div style="color: #666; font-size: 0.9em;">... 还有 ${totalSteps - 3} 个步骤</div>` : ''}
                <div class="step-progress">
                    <div class="step-progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>
        ` : ''}
    `;
    
    return card;
}

// 查看任务详情
function viewTaskDetail(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        sessionStorage.setItem('editingTask', JSON.stringify(task));
        window.location.href = 'task-detail.html';
    }
}

// 渲染任务卡片
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    let filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>📝 还没有任务，创建一个吧！</p>
            </div>
        `;
        return;
    }
    
    // 改进的排序逻辑：
    // 1. 未完成的任务在前（按创建时间倒序）
    // 2. 已完成的任务在后（按完成时间倒序）
    filteredTasks.sort((a, b) => {
        // 未完成 vs 已完成
        if (!a.completed && b.completed) return -1;
        if (a.completed && !b.completed) return 1;
        
        // 都是未完成，按创建时间倒序（新的在前）
        if (!a.completed && !b.completed) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        
        // 都是已完成，按更新时间倒序（新完成/取消的在前）
        if (a.completed && b.completed) {
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        }
        
        return 0;
    });
    
    filteredTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        taskList.appendChild(taskCard);
    });
}

// 过滤任务
function getFilteredTasks() {
    const now = new Date();
    
    switch (currentFilter) {
        case 'pending':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'overdue':
            return tasks.filter(task => 
                !task.completed && 
                task.dueDate && 
                new Date(task.dueDate) < now
            );
        default:
            return tasks;
    }
}

function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTasks();
}

// 更新统计
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
}

// 清除功能
function clearCompleted() {
    if (confirm('确定要清除所有已完成的任务吗？')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function clearAll() {
    if (confirm('确定要清除所有任务吗？此操作不可撤销！')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 工具函数
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('zh-CN');
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
