<template>
  <v-container>
    <!--Cards -->
    <v-row class="mb-4">
      <v-col cols="12" md="3" v-for="item in modulos" :key="item.key">
        <v-card
          class="pa-4 text-center"
          :elevation="selected === item.key ? 6 : 2"
          @click="seleccionar(item.key)"
          style="cursor: pointer"
        >
          <v-icon size="40">{{ item.icon }}</v-icon>
          <div class="mt-2">{{ item.title }}</div>
        </v-card>
      </v-col>
    </v-row>
    <!--Contenido dinamico-->
    <component :is="componenteActual" />
  </v-container>
</template>
<script>
import DisciplinaListView from "@/views/disciplina/DisciplinaListView.vue";
import CurriculoListView from "@/views/curriculo/CurriculoListView.vue";
import AsignaturaListView from "@/views/asignatura/AsignaturaListView.vue";
import AnioListView from "@/views/anio/AnioListView.vue";

export default {
  data() {
    return {
      selected: "disciplina",

      modulos: [
        { key: "disciplina", title: "Disciplina", icon: "mdi-book" },
        { key: "curriculo", title: "Currículo", icon: "mdi-file-document" },
        { key: "asignatura", title: "Asignatura", icon: "mdi-school" },
        { key: "anio", title: "Año", icon: "mdi-calendar" },
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
        case "anio":
          return AnioListView;
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
