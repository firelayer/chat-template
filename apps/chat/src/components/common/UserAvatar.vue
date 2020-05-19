<template>
  <v-avatar size="40" class="elevation-1 grey lighten-1">
    <span>{{ initials }}</span>
  </v-avatar>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  computed: {
    initials() {
      const { name } = this

      if (!name) return ''

      const initials = name.match(/\b\w/g) || []

      return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase()
    }
  }
}
</script>
