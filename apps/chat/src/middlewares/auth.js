import { auth, realtime } from '../firebase'
import store from '../store'
import router from '../router'

let currentUserPresence

function setUserPresence(user, name) {
  currentUserPresence = realtime().ref('/users/' + user.uid)

  const isOfflineForDatabase = {
    state: 'offline',
    name,
    timestamp: realtime.ServerValue.TIMESTAMP
  }

  const isOnlineForDatabase = {
    state: 'online',
    name,
    timestamp: realtime.ServerValue.TIMESTAMP
  }

  currentUserPresence.set(isOnlineForDatabase)

  // Create a reference to the special '.info/connected' path in
  // Realtime Database. This path returns `true` when connected
  // and `false` when disconnected.
  realtime().ref('.info/connected').on('value', (snapshot) => {
    // If we're not currently connected, don't do anything.
    if (snapshot.val() === false) return

    // If we are currently connected, then use the 'onDisconnect()'
    // method to add a set which will only trigger once this
    // client has disconnected by closing the app,
    // losing internet, or any other means.
    currentUserPresence.onDisconnect().set(isOfflineForDatabase).then(() => {
      // The promise returned from .onDisconnect().set() will
      // resolve as soon as the server acknowledges the onDisconnect()
      // request, NOT once we've actually disconnected:
      // https://firebase.google.com/docs/reference/js/realtime.OnDisconnect

      // We can now safely set ourselves as 'online' knowing that the
      // server will mark us as offline once we lose connection.
      currentUserPresence.set(isOnlineForDatabase)
    })
  })
}

async function onUserUpdate(user) {
  const { meta: { redirectIfAuth } } = router.currentRoute

  store.commit('app/SET_ISAPPREADY', false)

  if (redirectIfAuth) {
    router.push({ name: 'chat' })
  }

  const token = await user.getIdTokenResult(true)
  const { claims } = token
  const isAdmin = claims && claims.admin === 1
  const name = user.displayName || `anon-${user.uid.substr(0, 4)}`

  store.commit('app/INITIALIZED', { user: {
    uid: user.uid,
    email: user.email,
    displayName: name,
    admin: isAdmin
  } })

  store.commit('app/SET_ISAPPREADY', true)

  setUserPresence(user, name)
}

auth().onAuthStateChanged(async (user) => {
  const { name,  meta: { requiresAuth } } = router.currentRoute

  if (currentUserPresence) currentUserPresence.off()

  if (name === 'error') {
    store.commit('app/SET_ISAPPREADY', true)

    return
  }

  if (store.state.app.isAppReady) store.commit('app/SET_ISAPPREADY', false)

  if (user) {
    onUserUpdate(user)
  } else {
    if (requiresAuth) {
      router.push({ name: 'login' })
    }

    if (store.state.app.user !== null) store.commit('app/RESET')

    store.commit('app/SET_ISAPPREADY', true)
  }

  return
})
