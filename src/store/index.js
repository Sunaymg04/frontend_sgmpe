import { createStore } from "vuex";

const STORAGE_KEY = "gpe_auth";
const APPLICATION_CODE = "gestion_plan_estudio";
const ACTIVITY_MAX = 30;

function loadPersistedAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistAuth(payload) {
  if (!payload) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export default createStore({
  state: {
    auth: loadPersistedAuth(),
    recentActivity: [],
  },
  getters: {
    isAuthenticated(state) {
      return Boolean(state.auth?.username);
    },
    authUsername(state) {
      return state.auth?.username ?? "";
    },
    authAccess(state) {
      return state.auth?.access ?? [];
    },
    primaryRole(state) {
      const access = state.auth?.access ?? [];
      const active = access.find((a) => a?.active);
      return active?.role ?? "";
    },
    recentActivity(state) {
      return state.recentActivity;
    },
  },
  mutations: {
    setAuth(state, payload) {
      state.auth = payload;
      persistAuth(payload);
    },
    clearAuth(state) {
      state.auth = null;
      persistAuth(null);
    },
    addActivity(state, payload) {
      const activity = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        at: new Date().toISOString(),
        ...payload,
      };
      state.recentActivity = [activity, ...state.recentActivity].slice(
        0,
        ACTIVITY_MAX
      );
    },
    clearActivity(state) {
      state.recentActivity = [];
    },
  },
  actions: {
    async login({ commit }, { username, password, usersApi, api }) {
      const validateRes = await usersApi.post("/users/validate", {
        username,
        password,
      });

      if (!validateRes?.data?.valid) {
        throw new Error("Credenciales inválidas.");
      }

      const accessRes = await api.get(
        `/users/${encodeURIComponent(username)}/access`,
        {
          params: { application: APPLICATION_CODE },
        }
      );

      if (!accessRes?.data?.can_access) {
        throw new Error(
          "No tiene acceso a la aplicación. Contacte al administrador."
        );
      }

      const access = Array.isArray(accessRes?.data?.access)
        ? accessRes.data.access
        : [];
      if (!access.some((a) => a?.active)) {
        throw new Error(
          "No tiene roles activos para la aplicación. Contacte al administrador."
        );
      }

      commit("setAuth", {
        username,
        application_code: APPLICATION_CODE,
        access,
      });

      commit("clearActivity");
      commit("addActivity", { type: "auth", label: "Inicio de sesión" });
    },
    logout({ commit }) {
      commit("clearAuth");
      commit("clearActivity");
    },
  },
  modules: {},
});
