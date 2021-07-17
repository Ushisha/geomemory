'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.memories');
const inputType = document.querySelector('.form__input--type');
const inputMemo = document.querySelector('.form__input--memo');
// const inputDuration = document.querySelector('.form__input--duration');
// const inputCadence = document.querySelector('.form__input--cadence');
// const inputElevation = document.querySelector('.form__input--elevation');

class Memory {
  date = new Date();
  id = new Date().getTime();
  constructor(coords, memo) {
    this.coords = coords; //[lat,lng]
    this.memo = memo;
  }
}

class Happy extends Memory {
  constructor(coords, memo) {
    super(coords, memo);
  }
}

class Special extends Memory {
  constructor(coords, memo) {
    super(coords, memo);
  }
}

// const memo1 = new Happy([39, -12], 'met some for the first time');
// console.log(memo1);
///////////////////////////
//Application Architecture

class App {
  //private var
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newMemo.bind(this));

    inputType.addEventListener('change', this._toggleIcon);
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
    console.log(`https://www.google.co.uk/maps/@${latitude}, ${longitude}`);
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //leaflet eventhandler

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputMemo.focus();
  }
  _toggleIcon() {
    //TODO change to color of icon pink to orange
    console.log('change icon');
  }

  _newMemo(e) {
    e.preventDefault();
    console.log(this);
    //clear input field
    inputMemo.value = '';
    //Display marker
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'memo-popup',
        })
      )
      .setPopupContent('Momory')
      .openPopup();
  }
}
//actual house
const app = new App();
