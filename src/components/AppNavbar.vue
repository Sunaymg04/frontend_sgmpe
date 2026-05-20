<template>
  <v-app-bar class="modern-navbar" elevation="0">
    <v-toolbar-title class="text-h6 font-weight-bold">
      Sistema de Gestión de Planes de Estudio
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Notificaciones -->
    <v-btn icon>
      <v-badge content="1" color="white" overlap>
        <v-icon>mdi-bell-outline</v-icon>
      </v-badge>
    </v-btn>

    <!-- Usuario -->
    <v-btn class="ml-2 user-btn" variant="text" @click="$emit('open-profile')">
      <div class="text-left text-white">
        <div class="text-subtitle-2">{{ name }}</div>
        <div class="text-caption opacity-90">{{ role }}</div>
      </div>
      <v-icon class="ml-2" size="18">mdi-chevron-down</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  name: "AppNavbar",

  props: {
    name: String,
    role: String,
  },
  emits: ["open-profile"],
};
</script>
<style scoped>
.modern-navbar {
  background: linear-gradient(to bottom, #1d4ed8, #3b82f6);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
.user-btn {
  text-transform: none;
  letter-spacing: normal;
  border-radius: 14px;
}
</style>
