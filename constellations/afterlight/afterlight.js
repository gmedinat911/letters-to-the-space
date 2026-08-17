/* AFTERLIGHT
   This file is intentionally data-driven. When the arc closes, replace null hrefs
   with the existing letter URLs and set complete=true. No animation rewrite needed. */
const AFTERLIGHT={complete:false,letters:[
 {id:'I',title:'',href:null},{id:'II',title:'',href:null},{id:'III',title:'',href:null},
 {id:'IV',title:'',href:null},{id:'V',title:'',href:null},{id:'VI',title:'',href:null},
 {id:'VII',title:'',href:null},{id:'VIII',title:'',href:null},{id:'IX',title:'',href:null}
]};
const stars=[...document.querySelectorAll('.star')];
stars.forEach((star,i)=>{const letter=AFTERLIGHT.letters[i];if(!letter)return;star.dataset.letter=letter.id;if(letter.title)star.setAttribute('aria-label',letter.title);if(letter.href){star.classList.remove('placeholder');star.style.cursor='pointer';star.addEventListener('click',()=>{document.body.classList.add('star-travel');setTimeout(()=>location.href=letter.href,700)});}});
if(AFTERLIGHT.complete)document.body.classList.add('constellation-complete');