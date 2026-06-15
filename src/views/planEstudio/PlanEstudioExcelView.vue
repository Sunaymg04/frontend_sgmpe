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

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-card class="excel-card" :loading="loading">
      <div v-if="!loading && data" class="excel-scroll">
        <table class="official-sheet">
          <colgroup>
            <col class="col-no" />
            <col class="col-name" />
            <col class="col-small" />
            <col class="col-small" />
            <col class="col-small" />
            <col class="col-small" />
            <col class="col-small" />
            <col class="col-small" />
            <col class="col-small" />
            <col class="col-small" />
            <col class="col-small" />
          </colgroup>
          <tbody>
            <tr>
              <td colspan="11" class="title-line">REPÚBLICA DE CUBA</td>
            </tr>
            <tr>
              <td colspan="11" class="title-line">
                MINISTERIO DE EDUCACIÓN SUPERIOR
              </td>
            </tr>
            <tr>
              <td colspan="11" class="document-title">
                PLAN DEL PROCESO DOCENTE
              </td>
            </tr>
            <tr class="blank-row">
              <td colspan="11"></td>
            </tr>
            <tr>
              <td colspan="5" class="meta">
                MODALIDAD: {{ upper(data.plan.modalidad) }}
              </td>
              <td colspan="6" class="signature">
                APROBADO:_________________________________
              </td>
            </tr>
            <tr>
              <td colspan="5" class="meta">
                CARRERA: {{ upper(data.plan.programa) }}
              </td>
              <td colspan="6" class="signature">
                Dr.C. Luis Antonio Barranco Olivera
              </td>
            </tr>
            <tr>
              <td colspan="5" class="meta">
                CALIFICACIÓN: {{ upper(data.plan.calificacion) }}
              </td>
              <td colspan="6" class="signature">RECTOR UCLV</td>
            </tr>
            <tr>
              <td colspan="5" class="meta">
                VIGENTE A PARTIR DEL CURSO ESCOLAR
                {{ upper(data.plan.curso) }}
              </td>
              <td colspan="6" class="signature">
                __________ de ____________ de ________
              </td>
            </tr>
            <tr class="blank-row">
              <td colspan="11"></td>
            </tr>

            <tr class="green-header">
              <th rowspan="4">No</th>
              <th rowspan="4">DISCIPLINA Y ASIGNATURA</th>
              <th colspan="3">CANT. DE HORAS</th>
              <th colspan="2">DIST. POR AÑOS</th>
              <th colspan="4">DIST. DE LAS HORAS POR AÑO ACAD.</th>
            </tr>
            <tr class="green-header">
              <th rowspan="3">TOTAL</th>
              <th rowspan="3">CLASE</th>
              <th>PRACT.</th>
              <th>EXAMEN</th>
              <th>TRABAJO</th>
              <th rowspan="3">1</th>
              <th rowspan="3">2</th>
              <th rowspan="3">3</th>
              <th rowspan="3">4</th>
            </tr>
            <tr class="green-header">
              <th>LABORAL</th>
              <th>FINAL DE</th>
              <th>DE</th>
            </tr>
            <tr class="green-header">
              <th>INVEST.</th>
              <th>ASIGNAT.</th>
              <th>CURSO</th>
            </tr>

            <tr class="section-row">
              <td colspan="11">CURRÍCULO BASE</td>
            </tr>
            <tr v-for="(row, index) in baseRows" :key="`base-${index}`">
              <td class="center">{{ row.code }}</td>
              <td :class="{ bold: row.type === 'disciplina' }">
                {{ upper(row.nombre) }}
              </td>
              <td class="num">{{ num(row.fondo_tiempo) }}</td>
              <td class="num">{{ num(row.horas_clase) }}</td>
              <td class="num">{{ num(row.horas_practica_laboral) }}</td>
              <td class="center">{{ row.tiene_examen_final ? 1 : "" }}</td>
              <td class="center">{{ row.tiene_trabajo_curso ? 1 : "" }}</td>
              <td class="num">{{ num(row.anios?.["1ro"]) }}</td>
              <td class="num">{{ num(row.anios?.["2do"]) }}</td>
              <td class="num">{{ num(row.anios?.["3ro"]) }}</td>
              <td class="num">{{ num(row.anios?.["4to"]) }}</td>
            </tr>
            <tr class="continue-row">
              <td colspan="10"></td>
              <td>CONTINÚA</td>
            </tr>

            <tr class="continuation-row">
              <td colspan="11">
                CARRERA: {{ upper(data.plan.programa) }} (CONTINUACIÓN PLAN DEL
                PROCESO DOCENTE)
              </td>
            </tr>
            <tr>
              <td colspan="11" class="meta">
                MODALIDAD: {{ titleCase(data.plan.modalidad) }}
              </td>
            </tr>

            <tr class="green-header">
              <th rowspan="4">No</th>
              <th rowspan="4">DISCIPLINA Y ASIGNATURA</th>
              <th colspan="3">CANTIDAD DE HORAS</th>
              <th colspan="2">DISTRIB. POR AÑOS</th>
              <th colspan="4">DISTRIB. DE LAS HORAS POR AÑO ACAD.</th>
            </tr>
            <tr class="green-header">
              <th rowspan="3">TOTAL</th>
              <th rowspan="3">CLASE</th>
              <th>PRACT.</th>
              <th>EXAMEN</th>
              <th>TRABAJO</th>
              <th rowspan="3">1</th>
              <th rowspan="3">2</th>
              <th rowspan="3">3</th>
              <th rowspan="3">4</th>
            </tr>
            <tr class="green-header">
              <th>LABORAL</th>
              <th>FINAL DE</th>
              <th>DE</th>
            </tr>
            <tr class="green-header">
              <th>INVEST.</th>
              <th>ASIGNAT.</th>
              <th>CURSO</th>
            </tr>

            <tr
              v-for="line in totalLines('base', 'CURRÍCULO BASE')"
              :key="line.key"
              class="total-row"
            >
              <td colspan="2">{{ line.label }}</td>
              <td class="num">{{ num(line.total) }}</td>
              <td class="num">{{ num(line.clase) }}</td>
              <td class="num">{{ num(line.practica) }}</td>
              <td class="num">{{ num(line.examenes) }}</td>
              <td class="num">{{ num(line.trabajos) }}</td>
              <td class="num">{{ num(line.anios["1ro"]) }}</td>
              <td class="num">{{ num(line.anios["2do"]) }}</td>
              <td class="num">{{ num(line.anios["3ro"]) }}</td>
              <td class="num">{{ num(line.anios["4to"]) }}</td>
            </tr>

            <tr class="section-row">
              <td colspan="11">CURRÍCULO PROPIO</td>
            </tr>
            <tr v-for="(row, index) in propioRows" :key="`propio-${index}`">
              <td class="center">{{ row.code }}</td>
              <td :class="{ bold: row.type === 'disciplina' }">
                {{ upper(row.nombre) }}
              </td>
              <td class="num">{{ num(row.fondo_tiempo) }}</td>
              <td class="num">{{ num(row.horas_clase) }}</td>
              <td class="num">{{ num(row.horas_practica_laboral) }}</td>
              <td class="center">{{ row.tiene_examen_final ? 1 : "" }}</td>
              <td class="center">{{ row.tiene_trabajo_curso ? 1 : "" }}</td>
              <td class="num">{{ num(row.anios?.["1ro"]) }}</td>
              <td class="num">{{ num(row.anios?.["2do"]) }}</td>
              <td class="num">{{ num(row.anios?.["3ro"]) }}</td>
              <td class="num">{{ num(row.anios?.["4to"]) }}</td>
            </tr>
            <tr
              v-for="line in totalLines('propio', 'CURRÍCULO PROPIO')"
              :key="line.key"
              class="total-row"
            >
              <td colspan="2">{{ line.label }}</td>
              <td class="num">{{ num(line.total) }}</td>
              <td class="num">{{ num(line.clase) }}</td>
              <td class="num">{{ num(line.practica) }}</td>
              <td class="num">{{ num(line.examenes) }}</td>
              <td class="num">{{ num(line.trabajos) }}</td>
              <td class="num">{{ num(line.anios["1ro"]) }}</td>
              <td class="num">{{ num(line.anios["2do"]) }}</td>
              <td class="num">{{ num(line.anios["3ro"]) }}</td>
              <td class="num">{{ num(line.anios["4to"]) }}</td>
            </tr>

            <tr class="section-row">
              <td colspan="11">CURRÍCULO OPTATIVO/ELECTIVO</td>
            </tr>
            <tr v-for="(row, index) in optativoRows" :key="`opt-${index}`">
              <td class="center">{{ row.code }}</td>
              <td :class="{ bold: row.type === 'disciplina' }">
                {{ upper(row.nombre) }}
              </td>
              <td class="num">{{ num(row.fondo_tiempo) }}</td>
              <td class="num">{{ num(row.horas_clase) }}</td>
              <td class="num">{{ num(row.horas_practica_laboral) }}</td>
              <td class="center">{{ row.tiene_examen_final ? 1 : "" }}</td>
              <td class="center">{{ row.tiene_trabajo_curso ? 1 : "" }}</td>
              <td class="num">{{ num(row.anios?.["1ro"]) }}</td>
              <td class="num">{{ num(row.anios?.["2do"]) }}</td>
              <td class="num">{{ num(row.anios?.["3ro"]) }}</td>
              <td class="num">{{ num(row.anios?.["4to"]) }}</td>
            </tr>
            <tr
              v-for="line in totalLines(
                'optativo',
                'CURRÍCULO OPTATIVO/ELECTIVO'
              )"
              :key="line.key"
              class="total-row"
            >
              <td colspan="2">{{ line.label }}</td>
              <td class="num">{{ num(line.total) }}</td>
              <td class="num">{{ num(line.clase) }}</td>
              <td class="num">{{ num(line.practica) }}</td>
              <td class="num">{{ num(line.examenes) }}</td>
              <td class="num">{{ num(line.trabajos) }}</td>
              <td class="num">{{ num(line.anios["1ro"]) }}</td>
              <td class="num">{{ num(line.anios["2do"]) }}</td>
              <td class="num">{{ num(line.anios["3ro"]) }}</td>
              <td class="num">{{ num(line.anios["4to"]) }}</td>
            </tr>

            <tr class="section-row totals-title">
              <td colspan="11">T O T A L E S</td>
            </tr>
            <tr
              v-for="line in totalLines('all', 'CURRÍCULO')"
              :key="line.key"
              class="total-row"
            >
              <td colspan="2">{{ line.label }}</td>
              <td class="num">{{ num(line.total) }}</td>
              <td class="num">{{ num(line.clase) }}</td>
              <td class="num">{{ num(line.practica) }}</td>
              <td class="num">{{ num(line.examenes) }}</td>
              <td class="num">{{ num(line.trabajos) }}</td>
              <td class="num">{{ num(line.anios["1ro"]) }}</td>
              <td class="num">{{ num(line.anios["2do"]) }}</td>
              <td class="num">{{ num(line.anios["3ro"]) }}</td>
              <td class="num">{{ num(line.anios["4to"]) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import api from "@/services/api";

const years = ["1ro", "2do", "3ro", "4to"];

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
    baseRows() {
      return this.codedRows("base");
    },
    propioRows() {
      return this.codedRows("propio");
    },
    optativoRows() {
      return this.codedRows("optativo");
    },
  },
  methods: {
    num(value) {
      const number = Number(value || 0);
      return number ? number : "";
    },
    upper(value) {
      return String(value || "").toUpperCase();
    },
    titleCase(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    },
    sectionRows(key) {
      return Array.isArray(this.data?.sections?.[key])
        ? this.data.sections[key]
        : [];
    },
    codedRows(key) {
      let discipline = 0;
      let subject = 0;
      let simple = 0;

      return this.sectionRows(key).map((row) => {
        if (key === "base") {
          if (row.type === "disciplina") {
            discipline += 1;
            subject = 0;
            return { ...row, code: discipline };
          }
          subject += 1;
          return { ...row, code: `${discipline},${subject}` };
        }

        if (row.type === "disciplina") return { ...row, code: "" };

        simple += 1;
        const name = this.upper(row.nombre);
        const prefix =
          key === "optativo" && name.includes("ELECTIVA")
            ? "E"
            : key === "optativo"
            ? "O"
            : "P";
        return { ...row, code: `${prefix}${simple}` };
      });
    },
    totals(key) {
      const rows =
        key === "all"
          ? [
              ...this.sectionRows("base"),
              ...this.sectionRows("propio"),
              ...this.sectionRows("optativo"),
            ]
          : this.sectionRows(key);
      const asignaturas = rows.filter((row) => row.type === "asignatura");
      const total = {
        total: 0,
        clase: 0,
        practica: 0,
        examenes: 0,
        trabajos: 0,
        anios: { "1ro": 0, "2do": 0, "3ro": 0, "4to": 0 },
        examenesPorAnio: { "1ro": 0, "2do": 0, "3ro": 0, "4to": 0 },
        trabajosPorAnio: { "1ro": 0, "2do": 0, "3ro": 0, "4to": 0 },
      };

      asignaturas.forEach((row) => {
        total.total += Number(row.fondo_tiempo || 0);
        total.clase += Number(row.horas_clase || 0);
        total.practica += Number(row.horas_practica_laboral || 0);
        total.examenes += row.tiene_examen_final ? 1 : 0;
        total.trabajos += row.tiene_trabajo_curso ? 1 : 0;
        years.forEach((year) => {
          const hours = Number(row.anios?.[year] || 0);
          total.anios[year] += hours;
          total.examenesPorAnio[year] +=
            row.tiene_examen_final && hours > 0 ? 1 : 0;
          total.trabajosPorAnio[year] +=
            row.tiene_trabajo_curso && hours > 0 ? 1 : 0;
        });
      });

      return total;
    },
    totalLines(key, label) {
      const totals = this.totals(key);
      return [
        {
          key: `${key}-horas`,
          label: `TOTAL DE HORAS DEL ${label} POR FORMAS Y AÑOS`,
          total: totals.total,
          clase: totals.clase,
          practica: totals.practica,
          anios: totals.anios,
        },
        {
          key: `${key}-examenes`,
          label: `TOTAL DE EXÁMENES FINALES DEL ${label} POR AÑO`,
          examenes: totals.examenes,
          anios: totals.examenesPorAnio,
        },
        {
          key: `${key}-trabajos`,
          label: `TOTAL DE TRABAJOS DE CURSO DEL ${label} POR AÑO`,
          trabajos: totals.trabajos,
          anios: totals.trabajosPorAnio,
        },
      ];
    },
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
          { responseType: "blob" }
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
  background: #e5e9ee;
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
  border-radius: 4px;
  overflow: hidden;
}
.excel-scroll {
  overflow: auto;
  padding: 20px;
  background: #d8dde4;
}
.official-sheet {
  border-collapse: collapse;
  table-layout: fixed;
  width: 1120px;
  min-width: 1120px;
  margin: 0 auto;
  background: #fff;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
}
.official-sheet td,
.official-sheet th {
  border: 1px solid #000;
  height: 23px;
  padding: 3px 5px;
  vertical-align: middle;
}
.col-no {
  width: 52px;
}
.col-name {
  width: 390px;
}
.col-small {
  width: 68px;
}
.title-line,
.document-title {
  border-left: 0 !important;
  border-right: 0 !important;
  text-align: center;
  font-weight: 700;
}
.document-title {
  font-size: 15px;
}
.blank-row td {
  height: 14px;
  border-left: 0 !important;
  border-right: 0 !important;
}
.meta {
  border-left: 0 !important;
  border-right: 0 !important;
  font-weight: 700;
}
.signature {
  border-left: 0 !important;
  border-right: 0 !important;
  text-align: center;
  font-weight: 700;
}
.green-header th {
  background: #fff !important;
  text-align: center;
  font-weight: 700;
}
.section-row td {
  background: #fff !important;
  text-align: center;
  font-weight: 700;
}
.continuation-row td {
  text-align: center;
  font-weight: 700;
}
.continue-row td {
  text-align: center;
  font-weight: 700;
}
.total-row td {
  background: #fff !important;
  font-weight: 700;
}
.totals-title td {
  background: #fff !important;
}
.bold {
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
