<template>
  <div>
    <h1>Chat - Demo</h1>
    <div class="overline mb-4">Firelayer - Chat</div>
    <div v-if="!isLoading" class="mx-auto" style="max-width: 300px">
      <v-btn color="primary" dark block @click="signInGoogle">
        <v-icon small left>mdi-google</v-icon> Sign In with Google
      </v-btn>

      <div class="my-3 overline">Or</div>

      <v-btn
        color="primary"
        outlined
        dark
        block
        @click="signInAnon"
      >
        <v-icon small left>mdi-incognito</v-icon> Enter Anonymously
      </v-btn>
    </div>

    <v-progress-circular
      v-else
      :width="3"
      color="red"
      indeterminate
    ></v-progress-circular>
  </div>
</template>

<script>
import { auth } from '../../firebase'

export default {
  middleware: ['redirectIfAuth'],
  data() {
    return {
      isLoading: false
    }
  },
  mounted() {
  },
  methods: {
    async signInGoogle() {
      this.isLoading = true

      try {
        const result = await auth().signInWithPopup(new auth.GoogleAuthProvider())
      } catch (error) {
        console.log(error)
      }

      this.isLoading = false
    },
    async signInAnon() {
      this.isLoading = true

      try {
        await auth().signInAnonymously()
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
