export const displayMap = locations => {
   const map = L.map('map', {
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
   }).setView([42.3601, -71.0589], 10)
   const icon = L.icon({
      iconUrl: '/img/pin.png',
      iconSize: [30, 37],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
   })
   L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}',
      {
         minZoom: 0,
         maxZoom: 20,
         attribution:
            '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
         ext: 'png',
      }
   ).addTo(map)
   L.control
      .zoom({
         position: 'bottomleft',
      })
      .addTo(map)
   let group = L.featureGroup()

   for (let location of locations) {
      let marker = L.marker(
         [location.coordinates[1], location.coordinates[0]],
         {
            icon: icon,
         }
      )
         .addTo(map)
         .bindPopup(
            L.popup({
               maxWidth: 250,
               minWidth: 100,
               autoClose: false,
               closeOnClick: false,
            }).setContent(`Day ${location.day}: ${location.description}`)
         )
      marker.openPopup()
      group.addLayer(marker)
   }

   map.fitBounds(group.getBounds(), { padding: [100, 100] })
}
