<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card class="rounded-xl pa-2">
      <!-- Header -->
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon class="mr-2" color="primary">
          mdi-file-document-edit-outline
        </v-icon>

        Crear Currículo
      </v-card-title>

      <!-- Formulario -->
      <v-card-text>
        <v-form ref="form">
          <!-- Nombre -->
          <v-text-field
            v-model="form.nombre"
            label="Nombre del currículo"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-book-outline"
            class="mb-4"
          />

          <!-- Plan de estudio -->
          <v-select
            v-model="form.id_plan_estudio"
            :items="planes"
            item-title="nombre"
            item-value="id"
            label="Planes de estudio"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-school-outline"
            multiple
            chips
          />
        </v-form>
      </v-card-text>

      <!-- Acciones -->
      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn variant="text" color="grey" @click="cerrar"> Cancelar </v-btn>

        <v-btn color="primary" rounded="lg" elevation="2" @click="guardar">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from "@/services/api";

export default {
  props: {
    modelValue: Boolean,
  },

  emits: ["update:modelValue", "guardado", "error"],

  data() {
    return {
      planes: [],

      form: {
        nombre: "",
        id_plan_estudio: [],
      },
    };
  },

  computed: {
    dialog: {
      get() {
        return this.modelValue;
      },

      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },

  methods: {
    async obtenerPlanes() {
      try {
        const res = await api.get("/plan_estudio");

        this.planes = res.data.data;
      } catch (error) {
        console.error(error);
      }
    },

    async guardar() {
      try {
        await api.post("/curriculo", this.form);
        this.cerrar();

        this.$nextTick(() => {
          this.$emit("guardado", "Curriculo creado correctamente");
        });
      } catch (error) {
        console.error(error);
        this.$emit("error", "No se pudo crear el currículo");
      }
    },

    cerrar() {
      this.dialog = false;

      this.form = {
        nombre: "",
        id_plan_estudio: [],
      };
    },
  },

  mounted() {
    this.obtenerPlanes();
  },
};
</script>
