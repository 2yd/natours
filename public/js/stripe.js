import axios from 'axios'
import { showAlert } from './alert'
const stripe = Stripe(
   'pk_test_51OuQHbHSNc0C8r7cxeNEfdZ8OiAuiJOlM3nKeMk0HZMQYHqBgOqJHcrbseBzSYAG2bmZR8QigWiOVgA3RaGp5Fwo001ls1jc3Y'
)

export const bookTour = async tourId => {
   try {
      const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)

      await stripe.redirectToCheckout({
         sessionId: session.data.session.id,
      })
   } catch (error) {
      showAlert('error', error)
   }
}
