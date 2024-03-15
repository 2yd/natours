import '@babel/polyfill'
import { login, logout } from './login.js'
import { displayMap } from './mapbox.js'
import { updateSettings } from './updateSettings.js'
import { bookTour } from './stripe.js'
const loginForm = document.querySelector('.form-login')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const passwordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour')
if (loginForm) {
   loginForm.addEventListener('submit', e => {
      const password = document.getElementById('password').value
      const email = document.getElementById('email').value
      e.preventDefault()
      login(email, password)
   })
}
const map = document.querySelector('#map')
if (map) {
   const locations = JSON.parse(map.dataset.locations)
   displayMap(locations)
}

if (logoutBtn) logoutBtn.addEventListener('click', logout)

if (userDataForm)
   userDataForm.addEventListener('submit', e => {
      e.preventDefault()
      const form = new FormData()
      form.append('name', document.getElementById('name').value)
      form.append('email', document.getElementById('email').value)
      form.append('photo', document.getElementById('photo').files[0])
      updateSettings(form, 'data')
   })

if (passwordForm) {
   passwordForm.addEventListener('submit', async e => {
      e.preventDefault()
      document.querySelector('.btn--save-password').textContent = 'Updating...'
      const passwordCurrent = document.getElementById('password-current').value
      const password = document.getElementById('password').value
      const passwordConfirm = document.getElementById('password-confirm').value
      await updateSettings(
         { passwordCurrent, password, passwordConfirm },
         'password'
      )
      document.querySelector('.btn--save-password').textContent =
         'Save password'
      document.getElementById('password-current').value = ''
      document.getElementById('password').value = ''
      document.getElementById('password-confirm').value = ''
   })
}

if (bookBtn)
   bookBtn.addEventListener('click', e => {
      e.target.textContent = 'Processing...'
      const { tourId } = e.target.dataset
      bookTour(tourId)
   })
