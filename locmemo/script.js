// global var for location
var gxx = 0, gyy = 0;

const addButton = document.querySelector('#add');

// write data into storage
const updateLSData = () => {
    const notesData = document.querySelectorAll('.note');
    const notes = [];
    // console.log(notesData);

    notesData.forEach((note) => {
        const textArea = note.querySelector('textarea');
        const xx = note.dataset.xx || '0'; // Get xx from data attribute or default to '0'
        const yy = note.dataset.yy || '0'; // Get yy from data attribute or default to '0'
        notes.push({ text: textArea.value, xx: xx, yy: yy });
    })

    // console.log(notes);
    localStorage.setItem('notes', JSON.stringify(notes));

}

const addNewNote =  (noteData = { text: '', xx: '0', yy: '0' }) => {
    const { text, xx, yy } = noteData;

    const note = document.createElement('div');
    note.dataset.xx = xx;
    note.dataset.yy = yy;
    note.classList.add('note');

    console.log("addNewNote() : "+noteData.xx);

    if (xx === '0' && yy === '0') {
      // If no location data, get locationuse 
      getgxxgyy();
      console.log('1st getgxxgyy - gxx, gyy :'+ gxx + ', ' + gyy);
    }
    
    
    const htmlData = `
    <div class="operation">
    <button class="edit" title="Edit"><i class="fas fa-edit"></i></button>
    <button class="delete" title="Delete"><i class="fas fa-trash-alt"></i></button>
    </div>

    <div class="main ${text ? "" : "hidden"} "> </div>
    <textarea class="${text ? "hidden" : ""} "></textarea> 
    <div class="dist"></div>`;
    note.insertAdjacentHTML('afterbegin', htmlData);

    // References
    const editButton = note.querySelector('.edit');
    const delButton = note.querySelector('.delete');
    const mainDiv = note.querySelector('.main');
    const textArea = note.querySelector('textarea');
    const distDiv = note.querySelector('.dist');

    // Deleting
    delButton.addEventListener('click', () => {
        note.remove();
        updateLSData();
    })

    // Toggle
    textArea.value = text; // Set the text content
    mainDiv.innerHTML = text;
    distDiv.innerHTML = "dist :" + ((xx - gxx)**2 + (yy - gyy)**2) ;

    editButton.addEventListener('click', () => {
        mainDiv.classList.toggle('hidden');
        textArea.classList.toggle('hidden');
    })

    textArea.addEventListener('change', (event) => {
        const value = event.target.value;
        // console.log(value);
        mainDiv.innerHTML = value;
        // Store xx and yy as data attributes on the note element
        note.dataset.xx = gxx;
        note.dataset.yy = gyy;
        console.log("writing xx "+note.dataset.xx);
        updateLSData();
    })

    document.body.appendChild(note);

}

// get location
getgxxgyy_and_load();
console.log("after call getgxxgyy");



addButton.addEventListener('click', () => addNewNote());

/////////// location function ///////////////////////////////////
async function getCurrentPositionAsync(options) {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
});
}

async function getLocation() {
  try {
    console.log("after 1");
    const position = await getCurrentPositionAsync();
    console.log("after 2");
    return position; // 🔄 위치 정보 반환
  } catch (err) {
    console.error("위치 정보를 얻는 데 실패했습니다:", err);
    throw err; // 필요시 throw
  }
}


async function getgxxgyy() {
  const pos = await getLocation();
  gyy = pos.coords.longitude;
  gxx = pos.coords.latitude;
  
}

async function getgxxgyy_and_load() {
  const pos = await getLocation();
  gyy = pos.coords.longitude;
  gxx = pos.coords.latitude;
  
  //read data from storage
  console.log("start storage loading... gxx : "+gxx)
  const notes = JSON.parse(localStorage.getItem('notes'));

  if (notes) {
    // gxx,gyy로부터의 거리로 정렬.
    notes.sort((a, b) => ((a.xx - gxx)**2 + (a.yy - gyy)**2)  - ((b.xx - gxx)**2 + (b.yy - gyy)**2));
    
    notes.forEach((noteData) => {
        // Ensure noteData has xx and yy properties, default if not present
        addNewNote({ text: noteData.text || '', xx: noteData.xx || '0', yy: noteData.yy || '0' });
    });
  };
}

