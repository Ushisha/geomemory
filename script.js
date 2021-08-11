'use strict';

class Memory {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, memo, icon, type, title) {
    this.coords = coords; //[lat,lng]
    this.memo = memo;
    this.icon = icon;
    this.type = type;
    this.title = title;

    this._setDescription();
  }
  _setDescription() {
    this.description = `${this.title[0].toUpperCase()}${this.title.slice(1)}`;
  }
}

///////////////////////////
//Application Architecture
const form = document.querySelector('.form');
const containerMemories = document.querySelector('.memories');
const inputType = document.querySelector('.form__input--type');
const inputMemo = document.querySelector('.form__input--memo');
const inputTitle = document.querySelector('.form__input--title');
const clearAllBtn = document.querySelector('.clear-btn');
const seeAllBtn = document.querySelector('.show-btn');

let deleteBtns;
let editBtns;

class App {
  //private var
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #memories = [];
  constructor() {
    //Get users position
    this._getPosition();
    //get data from local storage
    this._getLocalStrage();
    //attach eventhandlers
    form.addEventListener('submit', this.submitFormHandler.bind(this));
    containerMemories.addEventListener('click', this._moveToPopup.bind(this));
    clearAllBtn.addEventListener('click', this.reset);
    seeAllBtn.addEventListener('click', this.setZoomAndFit.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.co.uk/maps/@${latitude}, ${longitude}`);
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          'pk.eyJ1IjoiaWt1a28iLCJhIjoiY2tyYWprZnd6MDJvNzJvcGVlb2dld3VmaSJ9.0DLefl9LAFUlPSgxR1vdyw',
      }
    ).addTo(this.#map);

    //leaflet eventhandler
    this.#map.on('click', this._showForm.bind(this));
    this.#memories.forEach(memo => {
      this._renderMemoryMarker(memo);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;

    form.classList.remove('hidden');
    inputTitle.focus();
  }

  _hideForm() {
    //clear input field
    inputMemo.value = '';
    inputTitle.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }

  submitFormHandler(e) {
    e.preventDefault();
    //Get data from form

    const type = inputType.value; //special or happy
    const story = inputMemo.value;
    const title = inputTitle.value;
    const { lat, lng } = this.#mapEvent.latlng;
    const coords = [lat, lng];

    let icon;

    //if special,create a special object
    //if happy,create a happy object
    type === 'special' ? (icon = 'pink') : (icon = 'orange');
    //check if data is valid
    if (title === '' || story === '') {
      return alert('please fill in all the fields');
    }

    const updatedMemories = this.#memories
      .map(memo => (memo.coords.join() !== coords.join() ? memo : null))
      .filter(item => item !== null);
    this.#memories = updatedMemories;
    this._setLocalStorage();
    location.reload();
    this._newMemo(coords, story, icon, type, title);
  }

  _newMemo(coords, story, icon, type, title) {
    // e.preventDefault();
    // //Get data from form
    // const type = inputType.value; //special or happy
    // const story = inputMemo.value;
    // const title = inputTitle.value;
    // const { lat, lng } = this.mapEvent.latlng;
    // let icon;
    // let memory;
    // //if special,create a special object
    // //if happy,create a happy object
    // type === 'special' ? (icon = 'pink') : (icon = 'orange');
    // //check if data is valid
    // if (title === '' || story === '') {
    //   return alert('please fill in all the fields');
    // }

    let memory = new Memory(coords, story, icon, type, title);

    //add a new object to memory array
    this.#memories.push(memory);

    //render memory on map as a marker
    this._renderMemoryMarker(memory);
    //render memory on list
    this._renderMemory(memory);
    //hide form & clear input field
    this._hideForm();
    //set local storage to all memories
    this._setLocalStorage();
  }
  _renderMemoryMarker(memory) {
    var iconType = L.icon({
      iconUrl: `./images/icon-${memory.icon}.png`,
      iconSize: [50, 65],
      iconAnchor: [25, 65],
      popupAnchor: [0, -60],
    });

    L.marker(memory.coords, { icon: iconType })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${memory.type}-popup`,
        })
      )
      .setPopupContent(memory.description)
      .openPopup();
  }
  _renderMemory(memory) {
    const html = `
    <li class="memory memory--${memory.type} " data-id="${memory.id}">
      <h2 class="memory__title">
      ${memory.description}
      </h2>
      <div class="memory__details">
        <p class="memory__value">
          ${memory.memo}
        </p>
      </div> 
 
        <button class ="btn edit-btn">
          <img class="edit-icon" src="./images/edit.svg"/>
        </button>
        <button class="btn delete-btn">
         &times
        </button>    
     
    </li>
    
  `;

    form.insertAdjacentHTML('afterend', html);
    deleteBtns = document
      .querySelectorAll('.delete-btn')
      .forEach(btn =>
        btn.addEventListener('click', this.deleteMemory.bind(this))
      );
    editBtns = document
      .querySelectorAll('.edit-btn')
      .forEach(btn =>
        btn.addEventListener('click', this.editMemory.bind(this))
      );
  }

  _moveToPopup(e) {
    if (!this.#map) return;
    const memoryEl = e.target.closest('.memory');
    if (!memoryEl) return;

    const memory = this.#memories.find(memo => memo.id === memoryEl.dataset.id);

    this.#map.flyTo(memory.coords, 13, {
      animation: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('memories', JSON.stringify(this.#memories));
  }

  _getLocalStrage() {
    const data = JSON.parse(localStorage.getItem('memories'));

    if (!data) return;

    this.#memories = data;
    this.#memories.forEach(memo => {
      this._renderMemory(memo);
    });
  }

  reset() {
    if (confirm('Are you sure you want to clear all the logs?')) {
      console.log('All the logs hav been cleared!');
    } else {
      return;
    }
    localStorage.removeItem('memories');
    location.reload();
  }

  deleteMemory(e) {
    const memoryEl = e.target.closest('.memory');

    const updatedMemories = this.#memories.filter(
      memo => memo.id !== memoryEl.dataset.id
    );
    this.#memories = updatedMemories;
    this._setLocalStorage();
    location.reload();
  }

  editMemory(e) {
    const memoryEl = e.target.closest('.memory');
    if (!memoryEl) return;
    const index = this.#memories.findIndex(
      memo => memo.id === memoryEl.dataset.id
    );
    const memory = this.#memories[index];
    const objCoords = {
      latlng: {
        lat: memory.coords[0],
        lng: memory.coords[1],
      },
    };
    inputMemo.value = memory.memo;
    inputTitle.value = memory.title;
    inputType.value = memory.type;

    this._showForm(objCoords);
  }

  setZoomAndFit() {
    console.log(this.#memories);
    if (this.#memories.length === 1)
      return this.setViewToPopup(this.#memories[0]);

    const allCoords = this.#memories.map(memory => memory.coords);
    console.log(allCoords);
    this.#map.fitBounds(allCoords, { padding: [10, 10] });
  }
}

//actual house
const app = new App();
