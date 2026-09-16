let photos = [];

// 获取DOM元素
const photoForm = document.getElementById('photo-form');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const ratingInput = document.getElementById('rating');
const photoList = document.getElementById('photo-list');
const totalCount = document.getElementById('total-count');

// 动态渲染函数
function render() {
    photoList.innerHTML = '';
    photos.forEach(photo => {
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
    totalCount.textContent = `当前共 ${photos.length} 件作品`;
}

// 添加功能
photoForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    const newPhoto = {
        id: Date.now().toString(),
        title: titleInput.value.trim(),
        author: authorInput.value.trim(),
        rating: parseInt(ratingInput.value)
    };
    photos.push(newPhoto); // 先改数组
    render();              // 再调 render
    photoForm.reset();     
});

// 基础删除功能 (此时还没重构为事件委托)
photoList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        photos = photos.filter(photo => photo.id !== id);
        render();
    }
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