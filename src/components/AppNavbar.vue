<template>
  <v-app-bar class="modern-navbar px-4 px-sm-6" elevation="0" height="82">
    <v-btn
      class="sidebar-toggle mr-3"
      icon
      size="small"
      variant="text"
      @click="$emit('toggle-sidebar')"
    >
      <v-icon>{{ sidebarCollapsed ? "mdi-menu-open" : "mdi-menu" }}</v-icon>
    </v-btn>

    <v-toolbar-title class="app-title text-h6 font-weight-bold">
      Sistema de Gestión de Planes de Estudio
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Notificaciones -->
    <v-btn class="notify-btn" icon variant="text">
      <v-badge content="1" color="white" overlap>
        <v-icon>mdi-bell-outline</v-icon>
      </v-badge>
    </v-btn>

    <!-- Usuario -->
    <v-btn class="ml-3 user-card" variant="text" @click="$emit('open-profile')">
      <v-avatar class="user-avatar mr-3" size="34">
        <span class="user-initials">{{ initials }}</span>
      </v-avatar>

      <div class="user-meta text-left">
        <div class="user-name">{{ name }}</div>
        <div class="user-subline">
          <v-chip class="user-role-chip" size="x-small" variant="flat">
            {{ role }}
          </v-chip>
          <span v-if="department" class="user-department">
            {{ department }}
          </span>
        </div>
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
    department: String,
    sidebarCollapsed: Boolean,
  },
  computed: {
    initials() {
      const value = String(this.name || "U").trim();
      if (!value) return "U";

      return value
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    },
  },
  emits: ["open-profile", "toggle-sidebar"],
};
</script>
<style scoped>
.modern-navbar {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #3b82f6 100%);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.18);
}

.app-title {
  color: #eff6ff;
  letter-spacing: 0.01em;
  white-space: normal;
  line-height: 1.1;
}

.sidebar-toggle {
  color: #eff6ff;
}

.notify-btn {
  color: #eff6ff;
}

.user-card {
  text-transform: none;
  letter-spacing: normal;
  border-radius: 16px;
  padding: 8px 10px;
  min-height: 52px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  width: min(100%, 360px);
  max-width: 360px;
  box-sizing: border-box;
  overflow: hidden;
}

.user-card :deep(.v-btn__content) {
  width: 100%;
  min-width: 0;
  justify-content: flex-start;
  gap: 10px;
}

.user-avatar {
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  font-weight: 800;
  font-size: 0.8rem;
}

.user-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 auto;
  max-width: 100%;
}

.user-name {
  color: #fff;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-subline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.user-role-chip {
  width: fit-content;
  font-size: 0.68rem;
  font-weight: 700;
  color: #1d4ed8;
  background: rgba(255, 255, 255, 0.95);
}

.user-department {
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.72rem;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1 1 0;
}

@media (max-width: 1264px) {
  .app-title {
    display: none;
  }

  .user-card {
    max-width: 320px;
  }
}

@media (max-width: 960px) {
  .user-card {
    max-width: 260px;
  }

  .user-department {
    display: none;
  }
}
</style>
