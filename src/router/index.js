import { createRouter, createWebHashHistory } from "vue-router";

import DashboardView from "../views/DashboardView.vue";
import AsignaturaListView from "../views/asignatura/AsignaturaListView.vue";
import CurriculoListView from "../views/curriculo/CurriculoListView.vue";
import DisciplinaListView from "../views/disciplina/DisciplinaListView";

import EstructuraCurricularViews from "../views/EstructuraCurricularViews.vue";
const routes = [
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

export default router;
