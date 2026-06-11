<template>
  <v-container fluid class="excel-page">
    <div class="excel-toolbar">
      <div>
        <h2>Plan del Proceso Docente</h2>
        <p>{{ planInfo }}</p>
      </div>
      <div class="excel-actions">
        <v-btn variant="tonal" color="secondary" @click="$router.back()">
          <v-icon class="mr-2">mdi-arrow-left</v-icon>
          Volver
        </v-btn>
        <v-btn color="primary" :loading="downloading" @click="descargarExcel">
          <v-icon class="mr-2">mdi-microsoft-excel</v-icon>
          Descargar Excel
        </v-btn>
      </div>
    </div>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="comfortable"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-card class="excel-card" :loading="loading">
      <div v-if="!loading && data" class="excel-scroll">
        <table class="excel-table">
          <thead>
            <tr>
              <th class="title" :colspan="8 + data.anios.length">
                Plan del Proceso Docente
              </th>
            </tr>
            <tr>
              <td class="meta" :colspan="8 + data.anios.length">
                Plan: {{ data.plan.nombre }}
              </td>
            </tr>
            <tr>
              <td class="meta" :colspan="8 + data.anios.length">
                Programa: {{ data.plan.programa || "-" }} | Curso:
                {{ data.plan.curso || "-" }} | Modalidad:
                {{ data.plan.modalidad || "-" }}
              </td>
            </tr>
            <tr>
              <th>Disciplina y asignatura</th>
              <th>Cant. de horas</th>
              <th v-for="anio in data.anios" :key="anio.id">
                {{ anio.identificador }}
              </th>
              <th>Total</th>
              <th>Pract. laboral</th>
              <th>Examen final</th>
              <th>Trabajo curso</th>
              <th>Clase</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in data.rows"
              :key="index"
              :class="row.type"
            >
              <td>{{ row.nombre }}</td>
              <td class="num">{{ row.fondo_tiempo || "" }}</td>
              <td v-for="anio in data.anios" :key="anio.id" class="num">
                {{ row.anios?.[anio.identificador] || "" }}
              </td>
              <td class="num">{{ row.fondo_tiempo || "" }}</td>
              <td class="num">{{ row.horas_practica_laboral || "" }}</td>
              <td class="center">{{ row.tiene_examen_final ? "X" : "" }}</td>
              <td class="center">{{ row.tiene_trabajo_curso ? "X" : "" }}</td>
              <td class="num">{{ row.horas_clase || "" }}</td>
            </tr>
            <tr class="total">
              <td>Total de horas del currículo por formas y años</td>
              <td class="num">{{ data.totales.fondo_tiempo }}</td>
              <td v-for="anio in data.anios" :key="anio.id" class="num">
                {{ data.totales.anios?.[anio.identificador] || "" }}
              </td>
              <td class="num">{{ data.totales.fondo_tiempo }}</td>
              <td class="num">{{ data.totales.horas_practica_laboral }}</td>
              <td class="num">{{ data.totales.examenes_finales }}</td>
              <td class="num">{{ data.totales.trabajos_curso }}</td>
              <td class="num">{{ data.totales.horas_clase }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import api from "@/services/api";

export default {
  name: "PlanEstudioExcelView",
  data() {
    return {
      data: null,
      loading: false,
      downloading: false,
      error: "",
    };
  },
  computed: {
    planInfo() {
      if (!this.data?.plan) return "Vista previa del anexo oficial";
      return `${this.data.plan.programa || "Programa"} · ${
        this.data.plan.curso || "Curso"
      }`;
    },
  },
  methods: {
    async cargarPreview() {
      this.loading = true;
      this.error = "";
      try {
        const res = await api.get(
          `/plan_estudio/${this.$route.params.id}/excel-preview`
        );
        this.data = res.data.data;
      } catch (error) {
        console.error(error);
        this.error = "No se pudo cargar la vista previa del Excel.";
      } finally {
        this.loading = false;
      }
    },
    async descargarExcel() {
      this.downloading = true;
      try {
        const res = await api.get(
          `/plan_estudio/${this.$route.params.id}/excel`,
          {
            responseType: "blob",
          }
        );
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = `plan_estudio_${this.$route.params.id}.xls`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(error);
        this.error = "No se pudo descargar el Excel.";
      } finally {
        this.downloading = false;
      }
    },
  },
  mounted() {
    this.cargarPreview();
  },
};
</script>

<style scoped>
.excel-page {
  background: #f6f8fb;
  min-height: 100vh;
}
.excel-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}
.excel-toolbar h2 {
  margin: 0;
  color: #172033;
}
.excel-toolbar p {
  margin: 4px 0 0;
  color: #5f6b7a;
}
.excel-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.excel-card {
  border-radius: 8px;
  overflow: hidden;
}
.excel-scroll {
  overflow: auto;
}
.excel-table {
  border-collapse: collapse;
  min-width: 1120px;
  width: 100%;
  background: white;
  font-size: 12px;
}
.excel-table th,
.excel-table td {
  border: 1px solid #1f2937;
  padding: 6px 8px;
  vertical-align: middle;
}
.excel-table th {
  background: #d9ead3;
  text-align: center;
  font-weight: 700;
}
.excel-table .title {
  background: #93c47d;
  font-size: 18px;
}
.meta {
  background: #f3f6ef;
  font-weight: 700;
}
.curriculo td {
  background: #b6d7a8;
  font-weight: 700;
  text-align: center;
}
.disciplina td {
  background: #d9ead3;
  font-weight: 700;
}
.asignatura td:first-child {
  padding-left: 28px;
}
.total td {
  background: #ffe599;
  font-weight: 700;
}
.num {
  text-align: right;
}
.center {
  text-align: center;
}
@media (max-width: 720px) {
  .excel-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
