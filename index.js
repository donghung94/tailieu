const listEl = document.getElementById('sets');
async function probeSet(x) {
  try {
    const mod = await import(`./questions/questions${x}.js`);
    const data = mod.default || [];
    if (Array.isArray(data) && data.length > 0) {
      addItem(x, data.length);
    }
  } catch (e) {}
}
function addItem(x, count) {
  const li = document.createElement('li');
  li.innerHTML = `<a class="btn" href="exam.html?set=${x}">Đề ${x} <span class="pill">${count} câu</span></a>`;
  listEl.appendChild(li);
}
for (let i=1; i<=50; i++) probeSet(i);
setTimeout(()=>{
  if (!listEl.children.length) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.innerHTML = 'Chưa có đề nào. Hãy thêm file <code>questions1.js</code> vào thư mục <code>/questions/</code>.';
    listEl.appendChild(li);
  }
}, 1500);
