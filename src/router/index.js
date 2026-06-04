import { createRouter, createWebHashHistory } from "vue-router";

import DashboardView from "../views/DashboardView.vue";
import AsignaturaListView from "../views/asignatura/AsignaturaListView.vue";
import CurriculoListView from "../views/curriculo/CurriculoListView.vue";
import DisciplinaListView from "../views/disciplina/DisciplinaListView";
import LoginView from "../views/LoginView.vue";
import PlanEstudioListView from "../views/planEstudio/PlanEstudioListView.vue";

import EstructuraCurricularViews from "../views/EstructuraCurricularViews.vue";
import store from "../store";
const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { public: true },
  },
  {
    path: "/",
    name: "dashboard",
    component: DashboardView,
  },
  {
    path: "/asignatura",
    name: "asignatura",
    component: AsignaturaListView,
  },
  {
    path: "/curriculo",
    name: "curriculo",
    component: CurriculoListView,
  },
  {
    path: "/plan_estudio",
    name: "plan_estudio",
    component: PlanEstudioListView,
  },

  {
    path: "/disciplina",
    name: "disciplina",
    component: DisciplinaListView,
  },
  {
    path: "/estructura_curricular",
    name: "estructura_curricular",
    component: EstructuraCurricularViews,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  const isPublic = Boolean(to.meta?.public);
  const isAuthed = store.getters.isAuthenticated;
  if (!isPublic && !isAuthed) {
    store.dispatch("logout");
    return { name: "login" };
  }
  if (isAuthed && to.name === "login") return { name: "dashboard" };
  return true;
});

router.afterEach((to, from) => {
  if (!store.getters.isAuthenticated) return;
  if (to.name === from.name) return;
  const title = typeof to.name === "string" ? to.name : to.path;
  store.commit("addActivity", { type: "nav", label: `Navegó a ${title}` });
});

export default router;
