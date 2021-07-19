'use strict';

// const inputDuration = document.querySelector('.form__input--duration');

class Memory {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, memo, icon, type) {
    this.coords = coords; //[lat,lng]
    this.memo = memo;
    this.icon = icon;
    this.type = type;

    this._setDescription();
  }
  _setDescription() {
    // prettier-ignore
    // const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(
      1
    )} Memory`;
  }
}

///////////////////////////
//Application Architecture
const form = document.querySelector('.form');
const containerMemories = document.querySelector('.memories');
const inputType = document.querySelector('.form__input--type');
const inputMemo = document.querySelector('.form__input--memo');

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
    form.addEventListener('submit', this._newMemo.bind(this));
    inputType.addEventListener('change', this._toggleIcon);
    containerMemories.addEventListener('click', this._moveToPopup.bind(this));
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
        accessToken: `{accessToken}`,
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
    inputMemo.focus();
  }
  _hideForm() {
    //clear input field
    inputMemo.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }
  _toggleIcon() {
    //TODO change to color of icon pink to orange
    console.log('change icon');
  }

  _newMemo(e) {
    e.preventDefault();
    //Get data from form
    const type = inputType.value; //special or happy
    const story = inputMemo.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let icon;
    let memory;
    //if special,create a special object
    //if happy,create a happy object
    type === 'special' ? (icon = 'pink') : (icon = 'orange');
    //check if data is valid
    if (story === '') {
      return alert('please enter your story');
    }
    memory = new Memory([lat, lng], story, icon, type);
    //add a new object to memory array
    this.#memories.push(memory);
    console.log(memory);
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
      .setPopupContent(memory.memo);
    // .openPopup();
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
    </li>
  `;

    form.insertAdjacentHTML('afterend', html);
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
    localStorage.removeItem('memories');
    location.reload();
  }
}

//actual house
const app = new App();
