import { createStore } from "vuex";

const STORAGE_KEY = "gpe_auth";
const APPLICATION_CODE = "gestion_plan_estudio";
const VALID_ROLES = [
  "admin",
  "jefe_departamento",
  "decano",
  "rector",
  "vicedecano_docente",
];
const ACTIVITY_MAX = 30;

function clearPersistedAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

clearPersistedAuth();

export default createStore({
  state: {
    auth: null,
    recentActivity: [],
  },
  getters: {
    isAuthenticated(state) {
      const access = Array.isArray(state.auth?.access) ? state.auth.access : [];
      return Boolean(
        state.auth?.username &&
          access.some(
            (item) => item?.active && VALID_ROLES.includes(item?.role)
          )
      );
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
    },
    clearAuth(state) {
      state.auth = null;
      clearPersistedAuth();
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
    registerActivity({ commit }, payload) {
      commit("addActivity", payload);
    },
    async login({ commit }, { username, password, api }) {
      let loginRes;
      try {
        loginRes = await api.post("/login", {
          username,
          password,
          application: APPLICATION_CODE,
        });
      } catch (error) {
        if (error?.response?.status === 401) {
          throw new Error("Usuario o contraseña incorrectos.");
        }

        throw error;
      }

      if (!loginRes?.data?.valid) {
        throw new Error("Usuario o contraseña incorrectos.");
      }

      const accessRes = loginRes;

      if (!accessRes?.data?.can_access) {
        throw new Error(
          "No tiene acceso a la aplicación. Contacte al administrador."
        );
      }

      const access = Array.isArray(accessRes?.data?.access)
        ? accessRes.data.access
        : [];
      if (!access.some((a) => a?.active && VALID_ROLES.includes(a?.role))) {
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
      commit("addActivity", {
        type: "auth",
        label: `Inicio de sesión de ${username}`,
      });
    },
    logout({ commit }) {
      commit("clearAuth");
      commit("clearActivity");
    },
  },
  modules: {},
});
