/* ============================= GLOBAL UI & REVEAL MODULE ============================= */
export function initReveal() {
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});

  document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

  document.querySelectorAll('#statsRow .stat-card').forEach((el,i)=>{
    el.style.transitionDelay = (i*110)+'ms';
  });
}