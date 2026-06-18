<template>
  <v-app>
    <template v-if="showShell">
      <AppNavbar
        :name="name"
        :role="role"
        :department="contextName"
        :sidebar-collapsed="sidebarCollapsed"
        :notifications="notifications"
        :unread-notifications="unreadNotifications"
        :notifications-loading="notificationsLoading"
        :shake-notifications="notificationShake"
        @toggle-sidebar="toggleSidebar"
        @open-profile="profileOpen = true"
        @refresh-notifications="loadNotifications"
        @mark-notifications-read="markNotificationsRead"
      />
      <AppSidebar v-model="drawer" :collapsed="sidebarCollapsed" />
    </template>

    <v-main :class="{ 'public-main': !showShell }">
      <v-container v-if="showShell">
        <router-view />
      </v-container>
      <router-view v-else />
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
          <div v-if="contextName" class="text-body-2 text-medium-emphasis">
            {{ contextName }}
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
              Actividad administrativa
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
import api from "@/services/api";
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
      sidebarCollapsed: false,
      profileOpen: false,
      showMe: false,
      contextName: "",
      notifications: [],
      notificationsLoading: false,
      notificationShake: false,
      notificationsTimer: null,
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
    currentAccess() {
      const access = this.$store.getters.authAccess || [];
      const primaryRole = this.$store.getters.primaryRole;
      return (
        access.find((item) => item?.active && item?.role === primaryRole) ||
        access.find((item) => item?.active) ||
        null
      );
    },
    role() {
      return this.formatRole(this.currentAccess?.role);
    },
    isViceRectorDocente() {
      return this.currentAccess?.role === "vicerrector_docente";
    },
    departmentId() {
      if (this.isViceRectorDocente) return null;
      return this.currentAccess?.departamento_id ?? null;
    },
    facultyId() {
      if (this.isViceRectorDocente) return null;
      return this.currentAccess?.facultad_id ?? null;
    },
    recentActivity() {
      return this.$store.getters.recentActivity || [];
    },
    authUsername() {
      return this.$store.getters.authUsername || "";
    },
    unreadNotifications() {
      return this.notifications.filter((item) => !item.read_at).length;
    },
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    logout() {
      this.profileOpen = false;
      this.showMe = false;
      this.stopNotificationsPolling();
      this.notifications = [];
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
    formatRole(role) {
      const normalized = String(role || "").trim();
      const labels = {
        admin: "Administrador",
        jefe_departamento: "Jefe de Departamento",
        jefe_deparatamento: "Jefe de Departamento",
        decano: "Decano",
        rector: "Rector",
        vicerrector_docente: "Vicerrector Docente",
      };

      if (labels[normalized]) {
        return labels[normalized];
      }

      if (!normalized) {
        return "";
      }

      return normalized
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    },
    async loadDepartmentName(departmentId) {
      if (!departmentId) {
        this.contextName = "";
        return;
      }

      try {
        const response = await api.get(`/departamento/${departmentId}`);
        this.contextName = response?.data?.data?.nombre || "";
      } catch {
        this.contextName = "";
      }
    },
    async loadFacultyName(facultyId) {
      if (!facultyId) {
        this.contextName = "";
        return;
      }

      try {
        const response = await api.get(`/facultad/${facultyId}`);
        this.contextName = response?.data?.data?.nombre || "";
      } catch {
        this.contextName = "";
      }
    },
    async loadNotifications() {
      if (!this.showShell || !this.authUsername) {
        this.notifications = [];
        return;
      }

      this.notificationsLoading = true;
      try {
        const response = await api.get("/notifications", {
          params: { username: this.authUsername },
        });
        this.notifications = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
      } catch (error) {
        console.error(error);
      } finally {
        this.notificationsLoading = false;
      }
    },
    async markNotificationsRead() {
      const unreadIds = this.notifications
        .filter((item) => !item.read_at)
        .map((item) => item.id);

      if (!unreadIds.length || !this.authUsername) return;

      const readAt = new Date().toISOString();
      this.notifications = this.notifications.map((item) =>
        unreadIds.includes(item.id) ? { ...item, read_at: readAt } : item
      );

      try {
        await api.post("/notifications/read", {
          username: this.authUsername,
          ids: unreadIds,
        });
      } catch (error) {
        console.error(error);
        await this.loadNotifications();
      }
    },
    triggerNotificationShake() {
      this.notificationShake = false;
      window.setTimeout(() => {
        this.notificationShake = true;
        window.setTimeout(() => {
          this.notificationShake = false;
        }, 900);
      }, 80);
    },
    startNotificationsPolling() {
      this.stopNotificationsPolling();
      this.notificationsTimer = window.setInterval(() => {
        this.loadNotifications();
      }, 60000);
    },
    stopNotificationsPolling() {
      if (this.notificationsTimer) {
        window.clearInterval(this.notificationsTimer);
        this.notificationsTimer = null;
      }
    },
  },
  watch: {
    profileOpen(open) {
      if (!open) this.showMe = false;
    },
    departmentId: {
      immediate: true,
      handler(value) {
        if (this.currentAccess?.role === "decano") {
          return;
        }
        if (this.isViceRectorDocente) {
          this.contextName = "";
          return;
        }
        this.loadDepartmentName(value);
      },
    },
    facultyId: {
      immediate: true,
      handler(value) {
        if (this.isViceRectorDocente) {
          this.contextName = "";
          return;
        }
        if (this.currentAccess?.role !== "decano") {
          return;
        }
        this.loadFacultyName(value);
      },
    },
    authUsername: {
      immediate: true,
      async handler(value) {
        if (!value || !this.showShell) return;
        await this.loadNotifications();
        this.triggerNotificationShake();
        this.startNotificationsPolling();
      },
    },
    showShell: {
      immediate: true,
      async handler(value) {
        if (!value) {
          this.stopNotificationsPolling();
          return;
        }

        if (this.authUsername) {
          await this.loadNotifications();
          this.triggerNotificationShake();
          this.startNotificationsPolling();
        }
      },
    },
  },
  beforeUnmount() {
    this.stopNotificationsPolling();
  },
};
</script>
<style>
body {
  background: #f1f5f9;
}
.public-main {
  min-height: 100vh;
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
