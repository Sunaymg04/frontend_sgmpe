<template>
  <v-app>
    <AppNavbar :name="name" :role="role" @toggle-drawer="drawer = !drawer" />
    <AppSidebar v-model="drawer" />

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import AppSidebar from "@/components/AppSidebar.vue";
export default {
  name: "App",

  components: {
    AppNavbar,
    AppSidebar,
  },

  data() {
    return {
      drawer: true,
      name: "Dra. Evelyn Reed",
      role: "Jefe de Departamento",
    };
  },
};
</script>
