// 从本地存储读取已有作品
let photos = [];
try {
    const storedData = localStorage.getItem('photography_club_data');
    if (storedData) photos = JSON.parse(storedData);
} catch (e) {
    console.error('读取本地存储失败', e);
}

// 获取DOM元素
const photoForm = document.getElementById('photo-form');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const ratingInput = document.getElementById('rating');
const photoList = document.getElementById('photo-list');
const totalCount = document.getElementById('total-count');
const searchInput = document.getElementById('search-input');
const errorMsg = document.getElementById('error-msg');

// 保存作品，并处理本地存储异常
function saveToLocalStorage() {
    try {
        localStorage.setItem('photography_club_data', JSON.stringify(photos));
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            errorMsg.textContent = '存储空间已满，请清理数据后再试！';
        } else {
            errorMsg.textContent = '数据保存失败：' + e.message;
        }
    }
}

// 动态渲染函数
function render(keyword = '') {
    photoList.innerHTML = '';
    const results = photos.filter(photo =>
        photo.title.includes(keyword) || photo.author.includes(keyword)
    );
    results.forEach(photo => {
        const li = document.createElement('li');
        const infoDiv = document.createElement('div');
        infoDiv.className = 'photo-info';
        infoDiv.textContent = `📷 《${photo.title}》 - 摄影师: ${photo.author} | 评分: ${photo.rating}星`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.className = 'delete-btn';
        deleteBtn.dataset.id = photo.id; 

        li.appendChild(infoDiv);
        li.appendChild(deleteBtn);
        photoList.appendChild(li);
    });
    totalCount.textContent = `当前共 ${results.length} 件作品`;
}

// 添加功能
photoForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const rating = parseInt(ratingInput.value);

    if (!title || !author || isNaN(rating)) {
        errorMsg.textContent = '请填写完整信息！';
        return;
    }
    if (rating < 1 || rating > 5) {
        errorMsg.textContent = '评分必须在 1 到 5 之间！';
        return;
    }
    errorMsg.textContent = '';

    photos.push({ id: Date.now().toString(), title, author, rating });
    saveToLocalStorage();
    render();
    photoForm.reset();     
});

// 基础删除功能 (此时还没重构为事件委托)
photoList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        photos = photos.filter(photo => photo.id !== id);
        saveToLocalStorage();
        render();
    }
});

searchInput.addEventListener('input', function() {
    render(searchInput.value.trim());
});

const exportBtn = document.getElementById('export-btn');
exportBtn.addEventListener('click', function() {
    if (photos.length === 0) return;
    const dataStr = JSON.stringify(photos, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photography_club_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

render();