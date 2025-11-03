let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let searchQuery = '';

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function updateProgress() {
    if (todos.length === 0) {
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('progressText').textContent = '0%';
        return;
    }
    const completed = todos.filter(t => t.completed).length;
    const percentage = Math.round((completed / todos.length) * 100);
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressText').textContent = percentage + '%';
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    const statsContainer = document.getElementById('statsContainer');
    
    let filteredTodos = todos.filter(todo => {
        if (searchQuery && !todo.text.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (currentFilter === 'all') return true;
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        if (currentFilter === 'high') return todo.priority === 'high';
        return true;
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">hiç görev bulunamadı.</div>';
    } else {
        todoList.innerHTML = '';
        
        filteredTodos.forEach((todo, index) => {
            const actualIndex = todos.indexOf(todo);
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            const categoryNames = {
                'work': '💼 iş',
                'personal': '👤 kişisel',
                'shopping': '🛒 alışveriş',
                'other': '📌 diğer'
            };

            let metaHTML = `<span class="meta-tag">${categoryNames[todo.category]}</span>`;
            if (todo.date) {
                metaHTML += `<span class="meta-tag">📅 ${new Date(todo.date).toLocaleDateString('tr-TR')}</span>`;
            }
            
            li.innerHTML = `
                <div class="priority-indicator priority-${todo.priority}"></div>
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${actualIndex})"
                >
                <div class="todo-content">
                    <div class="todo-text">${todo.text}</div>
                    <div class="todo-meta">${metaHTML}</div>
                </div>
                <div class="todo-actions">
                    <button class="todo-btn edit-btn" onclick="editTodo(${actualIndex})">düzenle</button>
                    <button class="todo-btn delete-btn" onclick="deleteTodo(${actualIndex})">sil</button>
                </div>
            `;
            
            todoList.appendChild(li);
        });
    }

    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;
    const pending = total - completed;
    const highPriority = todos.filter(t => t.priority === 'high' && !t.completed).length;
    
    if (total > 0) {
        statsContainer.innerHTML = `
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-number">${total}</span>
                    <span class="stat-label">toplam</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${completed}</span>
                    <span class="stat-label">tamamlandı</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${pending}</span>
                    <span class="stat-label">bekliyor</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${highPriority}</span>
                    <span class="stat-label">yüksek öncelik</span>
                </div>
            </div>
        `;
    } else {
        statsContainer.innerHTML = '';
    }

    updateProgress();
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    const priority = document.getElementById('prioritySelect').value;
    const category = document.getElementById('categorySelect').value;
    const date = document.getElementById('dateInput').value;
    
    if (text === '') {
        return;
    }
    
    todos.push({
        text: text,
        completed: false,
        priority: priority,
        category: category,
        date: date,
        createdAt: new Date().toISOString()
    });
    
    input.value = '';
    document.getElementById('dateInput').value = '';
    saveTodos();
    renderTodos();
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function editTodo(index) {
    const newText = prompt('görevi düzenle:', todos[index].text);
    if (newText !== null && newText.trim() !== '') {
        todos[index].text = newText.trim();
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(index) {
    if (confirm('bu görevi silmek istediğinize emin misiniz?')) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
    }
}

function filterTodos(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Not: event.target tarayıcıda çalışır. Burada filter'ı çağıran butonu bulmak gerekir
    // Bu kodun düzgün çalışması için HTML'deki `onclick` metodunu güncelledik.
    // Ancak bu ortamda `event` nesnesine erişim kısıtlı olduğundan, bu kısım tarayıcıda düzgün çalışacaktır.
    
    // Geçici çözüm: Yüksek öncelik filtresi için aktif sınıfını manuel yönetelim.
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(filter) || (filter === 'all' && btn.textContent.toLowerCase().includes('tümü'))) {
             btn.classList.add('active');
        } else if (filter === 'high' && btn.textContent.toLowerCase().includes('yüksek')) {
            btn.classList.add('active');
        }
    });

    renderTodos();
}

function searchTodos() {
    searchQuery = document.getElementById('searchInput').value;
    renderTodos();
}

function clearCompleted() {
    if (confirm('tamamlanan tüm görevleri silmek istediğinize emin misiniz?')) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
    }
}

function exportData() {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todo-list-backup.json';
    link.click();
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}

// Başlangıç İşlemleri
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}

updateClock();
setInterval(updateClock, 1000);
renderTodos();