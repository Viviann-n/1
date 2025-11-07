let currentTask = null;
let steps = [];
let currentPriority = 'medium';

document.addEventListener('DOMContentLoaded', function() {
    // 从sessionStorage获取任务数据
    const savedTask = sessionStorage.getItem('editingTask');
    if (savedTask) {
        currentTask = JSON.parse(savedTask);
        steps = currentTask.steps || [];
        currentPriority = currentTask.priority || 'medium';
        loadTaskData();
    }
    
    // 设置默认日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('dueDate').min = tomorrow.toISOString().split('T')[0];
});

function loadTaskData() {
    if (currentTask) {
        document.getElementById('taskTitle').value = currentTask.title || '';
        document.getElementById('taskDescription').value = currentTask.description || '';
        document.getElementById('dueDate').value = currentTask.dueDate || '';
        setPriority(currentTask.priority || 'medium');
        renderSteps();
    }
}

function addStep() {
    steps.push({ text: '', completed: false });
    renderSteps();
}

function removeStep(index) {
    steps.splice(index, 1);
    renderSteps();
}

function updateStepText(index, text) {
    if (steps[index]) {
        steps[index].text = text;
    }
}

function renderSteps() {
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';
    
    steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step-input-item';
        stepElement.innerHTML = `
            <input type="text" 
                   class="step-input" 
                   placeholder="步骤 ${index + 1}"
                   value="${step.text}"
                   oninput="updateStepText(${index}, this.value)">
            <button type="button" class="remove-step" onclick="removeStep(${index})">删除</button>
        `;
        stepsList.appendChild(stepElement);
    });
}

function setPriority(priority) {
    currentPriority = priority;
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const dueDate = document.getElementById('dueDate').value;
    
    if (title === '') {
        alert('请输入任务标题！');
        return;
    }
    
    // 过滤空步骤
    const validSteps = steps.filter(step => step.text.trim() !== '');
    
    const taskData = {
        ...currentTask,
        title: title,
        description: description,
        dueDate: dueDate,
        priority: currentPriority,
        steps: validSteps,
        updatedAt: new Date().toISOString()
    };
    
    // 保存到主任务列表
    saveTaskToList(taskData);
    goBack();
}

function saveTaskToList(updatedTask) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    const existingIndex = tasks.findIndex(task => task.id === updatedTask.id);
    
    if (existingIndex >= 0) {
        // 更新现有任务
        tasks[existingIndex] = updatedTask;
    } else {
        // 添加新任务
        tasks.push(updatedTask);
    }
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function goBack() {
    window.location.href = 'index.html';
}