import axios from 'axios'
import { showAlert } from './alert'

export async function updateData(name, email) {
   try {
      const res = await axios({
         method: 'PATCH',
         url: '/api/v1/users/updateMe',
         data: {
            name,
            email,
         },
      })
      if (res.data.status === 'success') {
         showAlert('success', `Data updated successfully!`)
      }
   } catch (error) {
      showAlert('error', error)
   }
}

export const updateSettings = async (data, type) => {
   try {
      const url =
         type === 'password'
            ? '/api/v1/users/update-password'
            : '/api/v1/users/update-me'
      const res = await axios({
         method: 'PATCH',
         url,
         data,
      })
      if (res.data.status === 'success') {
         showAlert('success', `${type.toUpperCase()} updated successfully!`)
      }
   } catch (error) {
      showAlert('error', error)
   }
}
