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
      :disciplina="disciplinaEditar"
      @cerrado="disciplinaEditar = null"
      @guardado="disciplinaGuardada"
      @error="mostrarError"
    />

    <!-- Confirmacion eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="520">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon class="mr-2" color="red">mdi-alert-circle-outline</v-icon>
          Confirmar eliminacion
        </v-card-title>

        <v-card-text class="pt-2">
          Desea eliminar la disciplina actual?
          <div v-if="disciplinaEliminar?.nombre" class="mt-2 text-body-2">
            <strong>Disciplina:</strong> {{ disciplinaEliminar.nombre }}
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            color="grey"
            :disabled="eliminando"
            @click="cancelarEliminar"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="red"
            rounded="lg"
            elevation="2"
            :loading="eliminando"
            @click="confirmarEliminar"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import DisciplinaToolbar from "@/components/disciplina/DisciplinaToolbar.vue";
import DisciplinaTable from "@/components/disciplina/DisciplinaTable.vue";
import DisciplinaForm from "@/components/disciplina/DisciplinaForm.vue";
import api from "@/services/api";
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
      dialogEliminar: false,
      tableKey: 0,
      disciplinaEditar: null,
      disciplinaEliminar: null,
      eliminando: false,
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
      this.disciplinaEditar = disciplina;
      this.dialogCrear = true;
      console.log(disciplina.curriculos);
    },

    eliminarDisciplina(disciplina) {
      this.disciplinaEliminar = disciplina;
      this.dialogEliminar = true;
    },

    async confirmarEliminar() {
      if (!this.disciplinaEliminar?.id) return;

      try {
        this.eliminando = true;
        await api.delete(`/disciplina/${this.disciplinaEliminar.id}`);

        this.dialogEliminar = false;
        this.disciplinaEliminar = null;
        this.recargarTabla();

        toast.success("Disciplina eliminada", {
          description: "La disciplina fue eliminada correctamente",
          duration: 4000,
        });
      } catch (error) {
        console.error(error);
        toast.error("No se pudo eliminar", {
          description: "Ocurrió un problema al eliminar la disciplina",
          duration: 4000,
        });
      } finally {
        this.eliminando = false;
      }
    },

    cancelarEliminar() {
      if (this.eliminando) return;
      this.dialogEliminar = false;
      this.disciplinaEliminar = null;
    },
  },
};
</script>
