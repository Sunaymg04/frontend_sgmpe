<template>
  <v-container>
    <!--Cards -->
    <v-row class="mb-4" justify="center" gutter="16">
      <v-col
        cols="12"
        sm="6"
        md="4"
        class="d-flex justify-center"
        v-for="item in modulos"
        :key="item.key"
      >
        <v-card
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0 }"
          :hovered="{ scale: 1.05, y: -5 }"
          :pressed="{ scale: 0.97 }"
          class="modern-card pa-6 text-center"
          :class="{ active: selected === item.key }"
          @click="seleccionar(item.key)"
        >
          <v-icon size="32" class="mb-2 opacity-90">{{ item.icon }}</v-icon>
          <div class="text-subtitle-1 font-weight-medium">{{ item.title }}</div>
        </v-card>
      </v-col>
    </v-row>
    <!--Contenido dinamico-->
    <transition name="fade-slide" mode="out-in">
      <component :is="componenteActual" :key="selected" />
    </transition>
  </v-container>
</template>
<script>
import DisciplinaListView from "@/views/disciplina/DisciplinaListView.vue";
import CurriculoListView from "@/views/curriculo/CurriculoListView.vue";
import AsignaturaListView from "@/views/asignatura/AsignaturaListView.vue";

export default {
  data() {
    return {
      selected: "disciplina",

      modulos: [
        {
          key: "disciplina",
          title: "Disciplina",
          icon: "mdi-book-open-page-variant",
        },
        {
          key: "curriculo",
          title: "Currículo",
          icon: "mdi-file-document-outline",
        },
        { key: "asignatura", title: "Asignatura", icon: "mdi-school-outline" },
      ],
    };
  },

  computed: {
    componenteActual() {
      switch (this.selected) {
        case "disciplina":
          return DisciplinaListView;
        case "curriculo":
          return CurriculoListView;
        case "asignatura":
          return AsignaturaListView;

        default:
          return DisciplinaListView;
      }
    },
  },

  methods: {
    seleccionar(key) {
      this.selected = key;
    },
  },
};
</script>
<style scoped>
.modern-card {
  width: 100%;
  max-width: 300px; /* 🔥 tamaño ideal */
  height: 120px; /* 🔥 evita que se hagan cuadradas */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
  border-radius: 20px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  transition: transform 0.12s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.12s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 10px 25 px rgba(0, 0, 0, 1);
}
.modern-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgb(0, 0, 0, 0.15);
}
.modern-card.active {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
