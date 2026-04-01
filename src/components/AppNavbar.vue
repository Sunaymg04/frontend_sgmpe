<template>
  <v-app-bar color="primary" density="comfortable">
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
    <div class="ml-3 text-white">
      <div class="text-subtitle-2">{{ name }}</div>
      <div class="text-caption">{{ role }}</div>
    </div>
  </v-app-bar>
</template>

<script>
export default {
  name: "AppNavbar",

  props: {
    name: String,
    role: String,
  },
};
</script>
