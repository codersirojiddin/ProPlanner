let folders = Storage.load();
let currentFolderId = null;
let modalCallback = null;

const folderListUI = document.getElementById('folder-list');
const taskListUI = document.getElementById('task-list');
const taskSection = document.getElementById('task-section');
const noSelection = document.getElementById('no-selection');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const modalInput = document.getElementById('modal-input');
const modalTitle = document.getElementById('modal-title');
const modalSave = document.getElementById('modal-save');
const modalCancel = document.getElementById('modal-cancel');

// --- Modal Logic ---
function openModal(title, defaultValue, callback) {
    modalTitle.innerText = title;
    modalInput.value = defaultValue;
    modalOverlay.classList.remove('hidden');
    modalInput.focus();
    modalCallback = callback;
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    modalInput.value = '';
    modalCallback = null;
}

modalSave.onclick = () => {
    if (modalInput.value.trim() !== "" && modalCallback) {
        modalCallback(modalInput.value.trim());
        closeModal();
    }
};

modalCancel.onclick = closeModal;

// --- Folder Logic ---
function addFolder() {
    openModal("Create New Folder", "", (name) => {
        const newFolder = { id: Date.now(), name: name, tasks: [] };
        folders.push(newFolder);
        Storage.save(folders);
        renderFolders();
    });
}

function editFolder(e, id) {
    e.stopPropagation(); // Papkani tanlash hodisasi ishlab ketmasligi uchun
    const folder = folders.find(f => f.id === id);
    openModal("Rename Folder", folder.name, (newName) => {
        folder.name = newName;
        Storage.save(folders);
        renderFolders();
        if (currentFolderId === id) {
            document.getElementById('current-folder-title').innerText = newName;
        }
    });
}

function deleteFolder(e, id) {
    e.stopPropagation();
    if (confirm("Are you sure? All tasks in this folder will be deleted!")) {
        folders = folders.filter(f => f.id !== id);
        if (currentFolderId === id) {
            currentFolderId = null;
            taskSection.classList.add('hidden');
            noSelection.classList.remove('hidden');
        }
        Storage.save(folders);
        renderFolders();
    }
}

function renderFolders() {
    folderListUI.innerHTML = '';
    folders.forEach(folder => {
        const li = document.createElement('li');
        li.className = `folder-item ${currentFolderId === folder.id ? 'active' : ''}`;
        li.innerHTML = `
            <div class="folder-info" onclick="selectFolder(${folder.id})">
                <i class="far fa-folder"></i>
                <span>${folder.name}</span>
            </div>
            <div class="folder-ctrls">
                <button onclick="editFolder(event, ${folder.id})" title="Rename"><i class="fas fa-edit"></i></button>
                <button class="f-delete" onclick="deleteFolder(event, ${folder.id})" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        folderListUI.appendChild(li);
    });
}

function selectFolder(id) {
    currentFolderId = id;
    const folder = folders.find(f => f.id === id);
    noSelection.classList.add('hidden');
    taskSection.classList.remove('hidden');
    document.getElementById('current-folder-title').innerText = folder.name;
    renderFolders();
    renderTasks();
}

// --- Task Logic ---
function addTask() {
    const input = document.getElementById('task-input');
    if (!input.value.trim() || !currentFolderId) return;
    const folder = folders.find(f => f.id === currentFolderId);
    folder.tasks.push({ id: Date.now(), text: input.value.trim(), status: 'pending' });
    input.value = '';
    Storage.save(folders);
    renderTasks();
}

function setTaskStatus(taskId, status) {
    const folder = folders.find(f => f.id === currentFolderId);
    const task = folder.tasks.find(t => t.id === taskId);
    task.status = (task.status === status) ? 'pending' : status;
    Storage.save(folders);
    renderTasks();
}

function editTask(taskId) {
    const folder = folders.find(f => f.id === currentFolderId);
    const task = folder.tasks.find(t => t.id === taskId);
    openModal("Edit Task", task.text, (newText) => {
        task.text = newText;
        Storage.save(folders);
        renderTasks();
    });
}

function deleteTask(taskId) {
    const folder = folders.find(f => f.id === currentFolderId);
    folder.tasks = folder.tasks.filter(t => t.id !== taskId);
    Storage.save(folders);
    renderTasks();
}

function renderTasks() {
    taskListUI.innerHTML = '';
    const folder = folders.find(f => f.id === currentFolderId);
    if (!folder) return;

    folder.tasks.forEach(task => {
        const li = document.createElement('li');
        let statusClass = task.status === 'done' ? 'completed' : (task.status === 'failed' ? 'failed' : '');
        li.className = `task-item ${statusClass}`;
        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="check-btn" onclick="setTaskStatus(${task.id}, 'done')"><i class="fas fa-check"></i></button>
                <button class="fail-btn" onclick="setTaskStatus(${task.id}, 'failed')"><i class="fas fa-times"></i></button>
                <button class="edit-btn" onclick="editTask(${task.id})"><i class="fas fa-pen"></i></button>
                <button class="delete-btn" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        taskListUI.appendChild(li);
    });
}

// Global Listeners
document.getElementById('add-folder-btn').addEventListener('click', addFolder);
document.getElementById('add-task-btn').addEventListener('click', addTask);
document.getElementById('task-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') addTask(); });

renderFolders();