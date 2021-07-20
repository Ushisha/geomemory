# GeoMemory

This is a project using Leflet interactive map.
to visualize your memories by logging your memory and photos on a map like seeding a flower.

##

```JS
 if (navigator.geolocation) navigator.geolocation.getCurrentPosition( function (position) { const { latitude } = position.coords; const { longitude } = position.coords; console.log(`https://www.google.co.uk/maps/@${latitude}, ${longitude}`);
},
function () {
alert('could not get your position');
}
);
```

## Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- [Leaflet](https://leafletjs.com/) - JavaScript library

## Acknowledgement

This project is based on [Jonas Schmedtmann](https://github.com/jonasschmedtmann)'s Mapty project.
