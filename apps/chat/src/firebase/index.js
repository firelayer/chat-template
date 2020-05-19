import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/analytics'
import 'firebase/database'
import config from '../config'

firebase.initializeApp(config.firebase)
firebase.analytics()

export default firebase

export const { auth } = firebase
export const realtime = firebase.database
export const { TIMESTAMP } = realtime.ServerValue
