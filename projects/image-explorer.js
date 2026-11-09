// Native dialog enables keyboard-accessible inspection of original-resolution figures.
(() => {
 const links=[...document.querySelectorAll('figure a')]; if(!links.length||!HTMLDialogElement.prototype.showModal)return;
 const dialog=document.createElement('dialog');dialog.className='image-explorer';dialog.setAttribute('aria-label','Project image viewer');
 dialog.innerHTML='<div class="explorer-controls"><button type="button" data-prev aria-label="Previous image">← Previous</button><button type="button" data-close>Close ×</button><button type="button" data-next aria-label="Next image">Next →</button></div><img alt=""><p></p>';
 document.body.append(dialog);let current=0,trigger;
 function show(index){current=(index+links.length)%links.length;const link=links[current];dialog.querySelector('img').src=link.href;dialog.querySelector('img').alt=link.querySelector('img').alt;dialog.querySelector('p').textContent=(current+1)+' / '+links.length+' · '+(link.closest('figure').querySelector('figcaption')?.textContent||'');}
 links.forEach((link,i)=>link.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();trigger=link;show(i);dialog.showModal()}));
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.querySelector('[data-prev]').onclick=()=>show(current-1);dialog.querySelector('[data-next]').onclick=()=>show(current+1);
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}});
 dialog.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
})();
