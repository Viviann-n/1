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
            addTask();
        }
    });
});

// 添加任务
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const text = taskInput.value.trim();
    
    if (text === '') {
        alert('请输入任务内容！');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };
    
    tasks.unshift(task); // 新任务添加到开头
    saveTasks();
    renderTasks();
    updateStats();
    
    taskInput.value = '';
    taskInput.focus();
}

// 切换任务完成状态
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
    updateStats();
}

// 删除任务
function deleteTask(id) {
    if (confirm('确定要删除这个任务吗？')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 过滤任务
function filterTasks(filter) {
    currentFilter = filter;
    
    // 更新过滤按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTasks();
}

// 渲染任务列表
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>📝 还没有任务，添加一个吧！</p>
            </div>
        `;
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="delete-btn" onclick="deleteTask(${task.id})">删除</button>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
}

// 更新统计信息
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
}

// 清除已完成任务
function clearCompleted() {
    if (confirm('确定要清除所有已完成的任务吗？')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 清除所有任务
function clearAll() {
    if (confirm('确定要清除所有任务吗？此操作不可撤销！')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 保存任务到本地存储
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}