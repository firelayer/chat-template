<template>
  <div class="d-flex">
    <div>
      <user-avatar :name="message.name" />
    </div>
    <div class="body-2 ml-2">
      <div><span class="font-weight-bold mr-1">{{ message.name }}</span><span class="caption grey--text">{{ formatDate(message.timestamp) }}</span></div>
      <div>{{ message.text }}</div>
    </div>
  </div>
</template>

<script>
import UserAvatar from '../common/UserAvatar'
import moment from 'moment'

export default {
  components: {
    UserAvatar
  },
  props: {
    message: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    formatDate(date) {
      if (date) {
        return moment(date).format('lll')
      }

      return ''
    }
  }
}
</script>
