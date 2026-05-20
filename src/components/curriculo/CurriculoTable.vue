<template>
  <v-card class="modern-table">
    <v-data-table
      :headers="headers"
      :items="curriculosFiltrados"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:[`item.acciones`]="{ item }">
        <v-btn
          icon
          color="primary"
          variant="text"
          @click="$emit('editar', item)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <v-btn icon color="red" variant="text" @click="$emit('eliminar', item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import api from "@/services/api";
export default {
  props: {
    search: String,
  },
  data() {
    return {
      curriculos: [],
      loading: false,
      headers: [
        { title: "Código", key: "id" },
        { title: "Nombre del currículo", key: "nombre" },
        { title: "Disciplinas", key: "disciplinas" },
        { title: "Acciones", key: "acciones", sortable: false },
      ],
    };
  },
  computed: {
    // 🔥 FILTRO AQUÍ (NO EN EL LISTVIEW)
    curriculosFiltrados() {
      if (!this.search) return this.curriculos;

      return this.curriculos.filter(
        (d) =>
          d.nombre.toLowerCase().includes(this.search.toLowerCase()) ||
          String(d.id).includes(this.search)
      );
    },
  },
  methods: {
    async obtenerCurriculos() {
      try {
        this.loading = true;

        const [resCur, resRel] = await Promise.all([
          api.get("/curriculo"),
          api.get("/curriculo_disciplina"),
        ]);

        const curriculos = resCur.data.data;
        const relaciones = resRel.data.data;

        // contar disciplinas por currículo
        this.curriculos = curriculos.map((c) => {
          const cantidad = relaciones.filter(
            (r) => r.id_curriculo === c.id
          ).length;

          return {
            ...c,
            disciplinas: cantidad,
          };
        });

        console.log(this.curriculos);
      } catch (error) {
        console.error("Error al cargar disciplinas:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.obtenerCurriculos();
  },
};
</script>
<style scoped>
.modern-table {
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
.modern-table :deep(th) {
  font-weight: 700;
  color: #0f172a;
  font-size: 13.5px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.modern-table :deep(thead) {
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}
</style>
