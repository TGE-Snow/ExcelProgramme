<template>
  <div>
    <div class="boxs">
      <input type="file" style="height: 40px" @change="change" />
    </div>
    <div>
      <vxe-button
        type="text"
        status="primary"
        content="全部"
        @click="events.testFunc"
      ></vxe-button>
    </div>
    <div>
      <vxe-textarea v-model="state.hmd" placeholder="黑名单"></vxe-textarea>
    </div>
    <vxe-grid v-bind="gridOptions" ref="vxetable"> </vxe-grid>
  </div>
</template>

<script>
import { computed, reactive, ref } from "@vue/reactivity";
import { nextTick, onMounted, watch } from "@vue/runtime-core";
import XLSX from "xlsx/dist/xlsx.core.min.js";
import { Dialog, Toast } from "vant";
import pinyin from "js-pinyin";

import {
  clone,
  getWhatDay,
  isDate,
  isNumber,
  round,
  toDateString,
  toNumber,
} from "xe-utils";
import { ESort, setCount, executeSql } from "./unit";
let db;
export default {
  name: "home",
  setup(props) {
    let state = reactive({
      hmd: `

      

      
      executeSql("select * from sheets0 where row_GS = '天津' and row_SFWZSTZ = '是' order by row_LJTGE desc limit 0,100").then(({rows})=>{
console.log(rows);
Object.keys(rows).forEach((element,index) => {

executeSql(\`update sheets0 SET row_LJPMQ100=\'${index + 1}\' where ID=\'${
        rows[element].ID
      }'\`)

  console.log(rows[element].ID);
});
})
      
      
      
      
      `,
      data: {},
    });

    const vxetable = ref(null);

    const gridOptions = reactive({
      height: 800,
      columns: [],
      border: "full",
      size: "mini",
      toolbarConfig: {
        export: true, // 显示导出按钮
        custom: true, // 显示自定义列按钮
      },
      exportConfig: {
        remote: false,
        types: ["csv"],
        modes: ["current", "selected", "all"],
      },
      filterConfig: {
        remote: false,
      },
    });

    onMounted(async () => {
      // const a = await executeSql("DROP DATABASE mydb;");
      // const b = await executeSql(
      //   "INSERT INTO foo (id, log) VALUES (4, 'foo2')"
      // );
      // console.log(a,b);
      // await executeSql("INSERT INTO foo (id, log) VALUES (3, 'foo3')");
      // db.transaction(function (tx) {
      //   console.log(11111);
      //   tx.executeSql(
      //     "CREATE TABLE IF NOT EXISTS LOGS1 (id unique, log)",
      //     [],
      //     function (t, r) {
      //       console.log("s", t, r);
      //       tx.executeSql(
      //         "INSERT INTO LOGS1 (id, log) VALUES (0, 'test1')",
      //         [],
      //         (a1, a2) => {
      //           console.log("i", a1, a2);
      //         },
      //         (a1, a2) => {
      //           console.log("e", a1, a2);
      //         }
      //       );
      //       // tx.executeSql("INSERT INTO LOGS1 (id, log) VALUES (0, 'test2')");
      //       // tx.executeSql("INSERT INTO LOGS1 (id, log) VALUES (0, 'test3')");
      //     },
      //     function (t, e) {
      //       console.log(t, e);
      //     }
      //   );
      //   tx.executeSql("CREATE TABLE IF NOT EXISTS foo (id unique, log)");
      //   tx.executeSql("INSERT INTO foo (id, log) VALUES (0, 'foo1')");
      //   tx.executeSql("INSERT INTO foo (id, log) VALUES (0, 'foo2')");
      //   tx.executeSql("INSERT INTO foo (id, log) VALUES (0, 'foo3')");
      // });
    });

    const change = (e) => {
      var files = e.target.files[0];
      setfile(files);
    };

    const setfile = (files) => {
      var fileReader = new FileReader();
      fileReader.onload = async function (ev) {
        const data = ev.target.result;

        const { tableCol, tCol } = getTitle(data);

        gridOptions.columns = tableCol;
        console.log(gridOptions.columns);
        try {
          var workbook = XLSX.read(data, {
            type: "binary",
            cellDates: true,
          }); // 以二进制流方式读取得到整份excel表格对象
        } catch (e) {
          Toast("文件类型错误");
          return;
        }
        // 表格的表格范围，可用于判断表头是否数量是否正确
        var fromTo = "";

        // 遍历每张表读取
        for (var sheet in workbook.Sheets) {
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            fromTo = workbook.Sheets[sheet]["!ref"];
            var rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
            let tableRow = [];
            const tColCopy = clone(tCol, true);

            for (let index = 0; index < rows.length; index++) {
              const v = rows[index];
              let keyObj = {};
              let keyList = [];
              let valueList = [];
              for (const key in v) {
                if (Object.hasOwnProperty.call(v, key)) {
                  const element = v[key];
                  const nk = ("row_" + pinyin.getCamelChars(key)).replace(
                    / /g,
                    ""
                  );

                  const colIndex = tColCopy.findIndex((v) => v == nk);

                  if (colIndex > -1) {
                    keyList.push(`${nk}`);
                    if (isNumber(element)) {
                      keyObj[nk] = round(element, 2);
                      tCol[colIndex] += " REAL";
                      valueList.push(keyObj[nk]);
                    } else {
                      keyObj[nk] = element.replace(/"/g, "'");
                      valueList.push(`"${keyObj[nk]}"`);
                    }
                  }
                }
              }

              if (index == 0) {
                await executeSql(
                  `drop table sheets${Object.keys(state.data).length}`
                );
                await executeSql(
                  `CREATE TABLE sheets${
                    Object.keys(state.data).length
                  } (ID INTEGER PRIMARY KEY,${tCol.join(",")})`
                );
              }

              tableRow.push(keyObj);
              await executeSql(
                `INSERT INTO sheets${
                  Object.keys(state.data).length
                } (${keyList.join(",")}) VALUES (${valueList.join(",")})`
              );
            }
            console.log("tableRow", tableRow);
            vxetable.value.reloadData(tableRow);
            state.data[`sheets${Object.keys(state.data).length}`] = tableCol;
          }
          break;
        }
      };
      // 以二进制方式打开文件
      fileReader.readAsBinaryString(files);
    };

    const getTitle = (data) => {
      try {
        var workbook = XLSX.read(data, {
          type: "binary",
          cellDates: true,
          sheetRows: 1,
        }); // 以二进制流方式读取得到整份excel表格对象
      } catch (e) {
        Toast("文件类型错误");
        return;
      }

      let tableCol = [];
      let indexCol = {};
      let tCol = [];

      for (var sheet in workbook.Sheets) {
        if (workbook.Sheets.hasOwnProperty(sheet)) {
          for (const key in workbook.Sheets[sheet]) {
            if (
              !key.startsWith("!") &&
              Object.hasOwnProperty.call(workbook.Sheets[sheet], key)
            ) {
              const element = workbook.Sheets[sheet][key];
              const jp = pinyin.getCamelChars(element.v);
              let jpStr = "";
              if (Object.hasOwnProperty.call(indexCol, jp)) {
                indexCol[jp]++;
                jpStr = jp + "_" + indexCol[jp];
              } else {
                indexCol[jp] = 0;
                jpStr = jp;
              }

              const field = ("row_" + jpStr).replace(/ /g, "");

              tableCol.push({
                field: field,
                title: element.v,
                width: 100,
                visible: true,
                resizable: true,
                sortable: true,
                filterMultiple: true,
              });
              tCol.push(field);
            }
          }

          return { tableCol, tCol };
        }
        break;
      }
    };

    const events = {
      refreshColEvent: () => {
        const $table = vxetable.value;
        if ($table) {
          $table.loadColumn(gridOptions.columns);
        }
      },
      testFunc: async () => {
        eval(state.hmd);
      },
    };

    return {
      state,
      change,
      gridOptions,
      vxetable,
      events,
    };
  },
};
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}
.group {
  height: 100%;
  width: 100%;
  overflow-y: scroll;
}
.labelcs {
  width: 50%;
  text-align: left;
}
</style>