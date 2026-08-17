/* AFTERLIGHT
   The constellation is staged but intentionally EMPTY of live letter links.
   When the arc closes: add titles + hrefs, confirm weights, then set complete=true.
   Weight controls visual significance only: quiet | present | anchor.
*/
const AFTERLIGHT={
  complete:false,
  letters:[
    {id:'I',title:'',href:null,weight:'present'},
    {id:'II',title:'',href:null,weight:'anchor'},
    {id:'III',title:'',href:null,weight:'present'},
    {id:'IV',title:'',href:null,weight:'present'},
    {id:'V',title:'',href:null,weight:'quiet'},
    {id:'VI',title:'',href:null,weight:'present'},
    {id:'VII',title:'',href:null,weight:'quiet'},
    {id:'VIII',title:'',href:null,weight:'anchor'},
    {id:'IX',title:'',href:null,weight:'anchor'}
  ]
};

const stars=[...document.querySelectorAll('.star')];
stars.forEach((star,i)=>{
  const letter=AFTERLIGHT.letters[i];
  if(!letter)return;
  star.dataset.letter=letter.id;
  star.dataset.weight=letter.weight || 'present';
  star.classList.add(`weight-${letter.weight || 'present'}`);
  if(letter.title)star.setAttribute('aria-label',letter.title);
  if(letter.href){
    star.classList.remove('placeholder');
    star.style.cursor='pointer';
    star.addEventListener('click',()=>{
      document.body.classList.add('star-travel');
      setTimeout(()=>location.href=letter.href,700);
    });
  }
});
if(AFTERLIGHT.complete)document.body.classList.add('constellation-complete');