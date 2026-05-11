<template>
  <v-container>
    <h2 class="mb-6">Lista de Disciplinas</h2>

    <DisciplinaToolbar v-model:search="search" @crear="crearDisciplina" />

    <DisciplinaTable
      :key="tableKey"
      :search="search"
      @editar="editarDisciplina"
      @eliminar="eliminarDisciplina"
    />
    <DisciplinaForm
      v-model="dialogCrear"
      @guardado="disciplinaGuardada"
      @error="mostrarError"
    />
  </v-container>
</template>

<script>
import DisciplinaToolbar from "@/components/disciplina/DisciplinaToolbar.vue";
import DisciplinaTable from "@/components/disciplina/DisciplinaTable.vue";
import DisciplinaForm from "@/components/disciplina/DisciplinaForm.vue";
import { toast } from "vue-sonner";
export default {
  components: {
    DisciplinaToolbar,
    DisciplinaTable,
    DisciplinaForm,
  },

  data() {
    return {
      search: "",
      dialogCrear: false,
      tableKey: 0,
    };
  },

  methods: {
    crearDisciplina() {
      this.dialogCrear = true;
    },
    recargarTabla() {
      this.tableKey++;
    },

    disciplinaGuardada(mensaje) {
      this.recargarTabla();

      toast.success(mensaje, {
        description: "La disciplina fue creada correctamente",

        duration: 4000,
      });
    },
    mostrarError(mensaje) {
      toast.error(mensaje, {
        description: "Ocurrió un problema al guardar",

        duration: 4000,
      });
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
