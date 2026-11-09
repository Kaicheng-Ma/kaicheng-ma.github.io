// Retain native keyboard disclosure behavior and animate only visible content.
(() => {
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const active=new Set();
 document.querySelectorAll('.study-details').forEach(detail=>detail.addEventListener('toggle',()=>{
  if(!detail.open||preference.matches)return;
  [...detail.children].filter(child=>child.tagName!=='SUMMARY').forEach(child=>{
   if(!child.animate)return;
   const animation=child.animate([{opacity:.4,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});
   active.add(animation);animation.finished.then(()=>active.delete(animation),()=>active.delete(animation));
  });
 }));
 preference.addEventListener('change',()=>{if(preference.matches)active.forEach(animation=>animation.cancel())});
})();
// Pointer-responsive lighting follows the actual card interaction; it creates no additional UI.
if(matchMedia('(hover:hover) and (pointer:fine)').matches){document.querySelectorAll('.project-row').forEach(card=>card.addEventListener('pointermove',event=>{const r=card.getBoundingClientRect();card.style.setProperty('--pointer-x',event.clientX-r.left+'px');card.style.setProperty('--pointer-y',event.clientY-r.top+'px')},{passive:true}))}
