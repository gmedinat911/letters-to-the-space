/* AFTERLIGHT — complete.
   Ten lights, one arc: possibility → projection → invisibility → wound → separation → ambiguity → gold → memory → goodbye → release.
*/
const AFTERLIGHT={
  complete:true,
  letters:[
    {id:'I',title:'The Future I Had Already Met',href:'/letters/the-future-i-had-already-met/',weight:'present'},
    {id:'II',title:'The Space Between Our Words',href:'/letters/the-space-between-our-words/',weight:'anchor'},
    {id:'III',title:'If a Leaf Falls Quietly',href:'/letters/if-a-leaf-falls-quietly/',weight:'present'},
    {id:'IV',title:'Invisible :)',href:'/letters/invisible/',weight:'present'},
    {id:'V',title:'When I’m Ready',href:'/letters/when-im-ready/',weight:'present'},
    {id:'VI',title:'Always Here',href:'/letters/always-here/',weight:'quiet'},
    {id:'VII',title:'Golden',href:'/constellations/golden/?from=afterlight',weight:'anchor'},
    {id:'VIII',title:'Remember Me',href:'/letters/remember-me/',weight:'anchor'},
    {id:'IX',title:'The Goodbye You’ll Never Hear',href:'/letters/the-goodbye-youll-never-hear/',weight:'present'},
    {id:'X',title:'This Is Where I Leave the Light',href:'/letters/this-is-where-i-leave-the-light/',weight:'anchor'}
  ]
};
const stars=[...document.querySelectorAll('.star')];
stars.forEach((star,i)=>{const letter=AFTERLIGHT.letters[i];if(!letter)return;star.dataset.letter=letter.id;star.dataset.weight=letter.weight;star.classList.add(`weight-${letter.weight}`);star.setAttribute('aria-label',letter.title);star.setAttribute('title',letter.title);star.classList.remove('placeholder');star.style.cursor='pointer';star.addEventListener('click',()=>{document.body.classList.add('star-travel');setTimeout(()=>location.href=letter.href,700);});});
document.body.classList.add('constellation-complete');