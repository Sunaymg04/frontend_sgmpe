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

    <v-menu
      v-model="notificationsOpen"
      location="bottom end"
      offset="12"
      :close-on-content-click="false"
      @update:modelValue="onNotificationsToggle"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          class="notify-btn"
          :class="{ 'notify-shake': shakeNotifications }"
          icon
          variant="text"
          :loading="notificationsLoading"
          @click="$emit('refresh-notifications')"
        >
          <v-badge
            v-if="unreadNotifications > 0"
            :content="badgeContent"
            color="error"
            floating
          >
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
          <v-icon v-else>mdi-bell-outline</v-icon>
        </v-btn>
      </template>

      <v-card class="notification-menu" elevation="10">
        <div class="notification-header">
          <div>
            <div class="text-subtitle-2 font-weight-bold">Notificaciones</div>
            <div class="text-caption text-medium-emphasis">
              {{ unreadNotifications }} sin leer
            </div>
          </div>
          <v-btn
            icon
            size="small"
            variant="text"
            :loading="notificationsLoading"
            @click="$emit('refresh-notifications')"
          >
            <v-icon size="18">mdi-refresh</v-icon>
          </v-btn>
        </div>

        <v-divider />

        <div v-if="notifications.length" class="notification-list">
          <article
            v-for="item in notifications"
            :key="item.id"
            class="notification-item"
            :class="{ unread: !item.read_at }"
          >
            <div class="notification-main">
              <span class="notification-dot" />
              <div class="notification-content">
                <div class="notification-title">
                  {{ item.title }}
                </div>
                <p
                  class="notification-body"
                  :class="{ collapsed: !isNotificationExpanded(item) }"
                >
                  {{ item.body }}
                </p>
                <div class="notification-footer">
                  <span class="notification-date">
                    {{ formatDate(item.created_at) }}
                  </span>
                  <v-btn
                    v-if="hasLongBody(item)"
                    size="small"
                    variant="text"
                    color="primary"
                    class="notification-toggle"
                    @click.stop="toggleNotification(item)"
                  >
                    {{
                      isNotificationExpanded(item) ? "Ocultar" : "Ver completo"
                    }}
                  </v-btn>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="notification-empty">
          <v-icon size="28">mdi-bell-check-outline</v-icon>
          <span>No tienes notificaciones.</span>
        </div>
      </v-card>
    </v-menu>

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
          <span v-if="showDepartment" class="user-department">
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
    notifications: {
      type: Array,
      default: () => [],
    },
    unreadNotifications: {
      type: Number,
      default: 0,
    },
    notificationsLoading: Boolean,
    shakeNotifications: Boolean,
  },
  data() {
    return {
      notificationsOpen: false,
      expandedNotificationIds: [],
    };
  },
  computed: {
    badgeContent() {
      return this.unreadNotifications > 99
        ? "99+"
        : String(this.unreadNotifications);
    },
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
    showDepartment() {
      return (
        Boolean(this.department) &&
        String(this.role || "")
          .trim()
          .toLowerCase() !== "vicerrector docente"
      );
    },
  },
  methods: {
    onNotificationsToggle(open) {
      if (open && this.unreadNotifications > 0) {
        this.$emit("mark-notifications-read");
      }
    },
    formatDate(value) {
      if (!value) return "";

      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    },
    hasLongBody(item) {
      return String(item?.body || "").length > 95;
    },
    isNotificationExpanded(item) {
      return this.expandedNotificationIds.includes(item.id);
    },
    toggleNotification(item) {
      if (this.isNotificationExpanded(item)) {
        this.expandedNotificationIds = this.expandedNotificationIds.filter(
          (id) => id !== item.id
        );
        return;
      }

      this.expandedNotificationIds = [...this.expandedNotificationIds, item.id];
    },
  },
  emits: [
    "open-profile",
    "toggle-sidebar",
    "refresh-notifications",
    "mark-notifications-read",
  ],
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

.notify-shake {
  animation: bell-shake 0.8s ease-in-out 1;
  transform-origin: 50% 0;
}

.notification-menu {
  width: min(94vw, 520px);
  border-radius: 8px !important;
  overflow: hidden;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}

.notification-list {
  max-height: min(62vh, 520px);
  overflow-y: auto;
  padding: 8px;
  display: grid;
  gap: 8px;
}

.notification-item {
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid transparent;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
}

.notification-item.unread {
  border-left-color: #2563eb;
  background: #eff6ff;
}

.notification-main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.notification-dot {
  flex: 0 0 auto;
  margin-top: 7px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #cbd5e1;
}

.notification-item.unread .notification-dot {
  background: #2563eb;
}

.notification-content {
  min-width: 0;
  flex: 1 1 auto;
}

.notification-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.25;
}

.notification-body {
  margin: 4px 0 0;
  color: #475569;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.4;
  font-size: 0.84rem;
}

.notification-body.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-footer {
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.notification-date {
  font-size: 0.72rem;
  color: #64748b;
}

.notification-toggle {
  min-width: 0;
  padding-inline: 6px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 700;
}

.notification-empty {
  display: grid;
  place-items: center;
  gap: 8px;
  min-height: 150px;
  padding: 24px;
  color: #64748b;
  text-align: center;
}

@keyframes bell-shake {
  0%,
  100% {
    transform: rotate(0);
  }
  15% {
    transform: rotate(14deg);
  }
  30% {
    transform: rotate(-12deg);
  }
  45% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(-8deg);
  }
  75% {
    transform: rotate(5deg);
  }
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
