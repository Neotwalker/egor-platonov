
const $=(s,c=document)=>c.querySelector(s);const $$=(s,c=document)=>[...c.querySelectorAll(s)];
$('.burger')?.addEventListener('click',()=>$('.menu').classList.toggle('is-open'));
$$('[data-modal]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();$('#leadModal').classList.add('is-open');$('#modalTitle').textContent=btn.dataset.modal||'Получить расчет';}));
$$('.close,.modal').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)$('#leadModal').classList.remove('is-open')}));
$$('.form').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();form.innerHTML='<div class="card"><h3>Заявка готова к отправке</h3><p>Это статическая GitHub-версия. Для WordPress подключите обработчик формы, CRM, Telegram или почту.</p></div>';}));
