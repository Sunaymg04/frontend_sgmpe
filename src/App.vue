<template>
  <v-app>
    <AppNavbar :name="name" :role="role" @toggle-drawer="drawer = !drawer" />
    <AppSidebar v-model="drawer" />

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
    <Toaster
      richColors
      position="top-right"
      expand
      :toastOptions="{
        style: {
          background: 'rgba(15,23,42,0.96)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'white',
          backdropFilter: 'blur(14px)',
          boxShadow:
            '0 10px 30px rgba(0,0,0,0.25), 0 0 20px rgba(59,130,246,0.15)',
        },
      }"
    />
  </v-app>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import AppSidebar from "@/components/AppSidebar.vue";
import { Toaster } from "vue-sonner";
export default {
  name: "App",

  components: {
    AppNavbar,
    AppSidebar,
    Toaster,
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
<style>
body {
  background: #f1f5f9;
}
.main-content {
  padding: 20px;
}
</style>
