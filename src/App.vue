<template>
  <v-app>
    <template v-if="showShell">
      <AppNavbar :name="name" :role="role" @open-profile="profileOpen = true" />
      <AppSidebar v-model="drawer" />
    </template>

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>

    <v-dialog v-model="profileOpen" width="560" class="profile-dialog">
      <v-card class="pa-6 profile-card" elevation="0">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <div class="text-h6 font-weight-bold">Perfil</div>
            <div class="text-body-2 text-medium-emphasis">
              Información de la sesión
            </div>
          </div>
          <v-btn icon variant="text" @click="profileOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card class="pa-4 rounded-xl profile-summary" elevation="0">
          <div class="text-subtitle-1 font-weight-bold">{{ name }}</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ role || "Sin rol" }}
          </div>
        </v-card>

        <v-btn
          class="mt-4"
          variant="outlined"
          rounded="xl"
          block
          @click="showMe = !showMe"
        >
          {{ showMe ? "Ocultar" : "Me" }}
        </v-btn>

        <v-expand-transition>
          <div v-if="showMe" class="mt-4">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              Actividad reciente
            </div>
            <v-card class="pa-3 rounded-xl profile-activity" elevation="0">
              <div v-if="recentActivity.length === 0" class="text-body-2">
                Sin actividad registrada todavía.
              </div>
              <v-list v-else density="compact" class="py-0">
                <v-list-item
                  v-for="a in recentActivity"
                  :key="a.id"
                  class="px-0"
                >
                  <v-list-item-title class="text-body-2">
                    {{ a.label }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ formatWhen(a.at) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-expand-transition>

        <v-btn class="mt-5" color="red" rounded="xl" block @click="logout">
          Log out
        </v-btn>
      </v-card>
    </v-dialog>
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
      profileOpen: false,
      showMe: false,
    };
  },
  computed: {
    showShell() {
      return !this.$route?.meta?.public;
    },
    name() {
      const username = this.$store.getters.authUsername;
      return username || "Usuario";
    },
    role() {
      const role = this.$store.getters.primaryRole;
      return role || "";
    },
    recentActivity() {
      return this.$store.getters.recentActivity || [];
    },
  },
  methods: {
    logout() {
      this.profileOpen = false;
      this.showMe = false;
      this.$store.dispatch("logout");
      this.$router.replace({ name: "login" });
    },
    formatWhen(iso) {
      try {
        const d = new Date(iso);
        return d.toLocaleString();
      } catch {
        return iso;
      }
    },
  },
  watch: {
    profileOpen(open) {
      if (!open) this.showMe = false;
    },
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

.profile-dialog .v-overlay__scrim {
  background: rgba(2, 6, 23, 0.45) !important;
  backdrop-filter: blur(10px);
}

.profile-card {
  border-radius: 22px !important;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.92) !important;
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 60px rgba(2, 6, 23, 0.18);
}

.profile-summary,
.profile-activity {
  border: 1px solid rgba(2, 6, 23, 0.06);
  background: rgba(248, 250, 252, 0.9) !important;
}
</style>
