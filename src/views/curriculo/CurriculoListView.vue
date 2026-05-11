<template>
  <v-container>
    <h2 class="mb-4">Lista de Currículos</h2>

    <CurriculoToolbar v-model:search="search" @crear="crearCurriculo" />

    <CurriculoTable
      :key="tableKey"
      :search="search"
      @editar="editarCurriculo"
      @eliminar="eliminarCurriculo"
    />

    <CurriculoForm
      v-model="dialogCrear"
      @guardado="curriculoGuardado"
      @error="mostrarError"
    />
  </v-container>
</template>

<script>
import CurriculoToolbar from "@/components/curriculo/CurriculoToolbar.vue";
import CurriculoTable from "@/components/curriculo/CurriculoTable.vue";
import CurriculoForm from "@/components/curriculo/CurriculoForm.vue";
import { toast } from "vue-sonner";

export default {
  components: {
    CurriculoToolbar,
    CurriculoTable,
    CurriculoForm,
  },

  data() {
    return {
      search: "",
      dialogCrear: false,
      tableKey: 0,
    };
  },

  methods: {
    crearCurriculo() {
      this.dialogCrear = true;
    },

    editarCurriculo(curriculo) {
      console.log("Editar", curriculo);
    },

    eliminarCurriculo(curriculo) {
      console.log("Eliminar", curriculo);
    },

    recargarTabla() {
      this.tableKey++;
    },
    curriculoGuardado(mensaje) {
      this.recargarTabla();

      toast.success(mensaje, {
        description: "El currículo fue creado correctamente",

        duration: 4000,
      });
    },

    mostrarError(mensaje) {
      toast.error(mensaje, {
        description: "Ocurrió un problema al guardar",

        duration: 4000,
      });
    },
  },
};
</script>
<style scoped>
.modern-snackbar {
  backdrop-filter: blur(14px);
}

.modern-snackbar :deep(.v-snackbar__wrapper) {
  border-radius: 18px !important;

  background: rgba(15, 23, 42, 0.92) !important;

  color: white !important;

  border: 1px solid rgba(255, 255, 255, 0.08);

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(59, 130, 246, 0.15);
}
</style>
