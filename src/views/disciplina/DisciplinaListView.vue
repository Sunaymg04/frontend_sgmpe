<template>
  <v-container>
    <h2 class="mb-6">Lista de Disciplinas</h2>

    <DisciplinaToolbar v-model:search="search" @crear="crearDisciplina" />

    <DisciplinaTable
      :disciplinas="disciplinasFiltradas"
      @editar="editarDisciplina"
      @eliminar="eliminarDisciplina"
    />
  </v-container>
</template>

<script>
import DisciplinaToolbar from "@/components/disciplina/DisciplinaToolbar.vue";
import DisciplinaTable from "@/components/disciplina/DisciplinaTable.vue";

export default {
  components: {
    DisciplinaToolbar,
    DisciplinaTable,
  },

  data() {
    return {
      search: "",

      disciplinas: [
        {
          id: 1,
          codigo: "D001",
          nombre: "Fundamentos de Programación",
          fondoTiempo: 80,
          curriculos: ["Currículo Base"],
        },
        {
          id: 2,
          codigo: "D002",
          nombre: "Álgebra Lineal",
          fondoTiempo: 72,
          curriculos: ["Currículo Base", "Currículo Profesional"],
        },
        {
          id: 3,
          codigo: "D003",
          nombre: "Historia de la Ciencia",
          fondoTiempo: 60,
          curriculos: ["Currículo General"],
        },
      ],
    };
  },

  computed: {
    disciplinasFiltradas() {
      return this.disciplinas.filter(
        (d) =>
          d.codigo.toLowerCase().includes(this.search.toLowerCase()) ||
          d.nombre.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },

  methods: {
    crearDisciplina() {
      console.log("Crear disciplina");
    },

    editarDisciplina(disciplina) {
      console.log("Editar", disciplina);
    },

    eliminarDisciplina(disciplina) {
      console.log("Eliminar", disciplina);
    },
  },
};
</script>
