<template>
  <div>
    <div class="boxs">
      <input type="file" style="height: 40px" @change="change" />
    </div>
    <div>
      <vxe-button
        v-for="item in state.buttonList"
        type="text"
        status="primary"
        :content="item.text"
        @click="events.testFunc(item.value)"
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
      
      `,
      data: {},
      initCode: `
      executeSql("select * from sheets0 where row_GS = '天津' and row_SFWZSTZ = '是' order by row_LJTGE desc limit 0,100").then(({rows})=>{
rows.forEach((element,index) => {
executeSql("update sheets0 SET row_LJPMQ100='"+(index + 1)+"' where ID='"+element.ID+"'");
});
});

executeSql("select * from sheets0 where row_GS = '津外' and row_SFWZSTZ = '是' order by row_LJTGE desc limit 0,100").then(({rows})=>{
rows.forEach((element,index) => {
executeSql("update sheets0 SET row_LJPMQ100='"+(index + 1)+"' where ID='"+element.ID+"'");
});
})

executeSql("select row_LSTD from sheets0 where row_GS='天津' GROUP BY row_LSTD")
  .then(async ({ rows }) => {
    console.log(rows);
    const rowData = rows;
    for (let index = 0; index < rowData.length; index++) {
      const item = rowData[index];
      let { rows } = await executeSql(
        "select ID,row_GXZDF from sheets0 where row_GS='天津' and row_LSTD='" +
          item.row_LSTD +
          "' order by row_DQXJZSHJ desc limit 0,20"
      );
      const rowData1 = rows;
      for (let index1 = 0; index1 < rowData1.length; index1++) {
        const item1 = rowData1[index1];
        const dqdf = 75 - index1;
        let df = 0;
        if (isNumber(item1["row_GXZDF"])) {
          df = toNumber(item1["row_GXZDF"]);
        }
        const zf = dqdf + df;
        await executeSql(
          "update sheets0 SET row_DQYJDF='" +
            dqdf +
            "',row_ZF='" +
            zf +
            "',row_TDDQYJQ20='" +
            (index1+1) +
            "' where ID='" +
            item1.ID +
            "'"
        );
      }
    }
  });
      
      `,
      buttonList: [
        {
          text: "全部",
          value: `
          executeSql("select * from sheets0").then(({rows})=>{
            reloadData(rows);
})
          `,
        },
        {
          text: "津内前100名",
          value: `
          executeSql("select * from sheets0 where row_GS = '天津' and row_SFWZSTZ = '是' order by row_LJTGE desc limit 0,100").then(({rows})=>{
            reloadData(rows);
})
          `,
        },
        {
          text: "津外前100名",
          value: `
          executeSql("select * from sheets0 where row_GS = '津外' and row_SFWZSTZ = '是' order by row_LJTGE desc limit 0,100").then(({rows})=>{
            reloadData(rows);
})
          `,
        },
        {
          text: "津内前20名",
          value: `
          executeSql("select row_LSTD from sheets0 where row_GS='天津' GROUP BY row_LSTD")
  .then(async ({ rows }) => {
    console.log(rows);
    const rowData = rows;
    for (let index = 0; index < rowData.length; index++) {
      const item = rowData[index];
      let { rows } = await executeSql(
        "select * from sheets0 where row_GS='天津' and row_LSTD='" +
          item.row_LSTD +
          "' order by row_DQXJZSHJ desc limit 0,20"
      );
      reloadData(rows);
    }
  });
          `,
        },
      ],
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
                  `CREATE TABLE IF NOT EXISTS sheets${
                    Object.keys(state.data).length
                  } (ID INTEGER PRIMARY KEY,${tCol.join(",")})`
                );
                await executeSql(
                  `DELETE FROM sheets${Object.keys(state.data).length}`
                );
              }

              tableRow.push(keyObj);
              await executeSql(
                `INSERT INTO sheets${
                  Object.keys(state.data).length
                } (${keyList.join(",")}) VALUES (${valueList.join(",")})`
              );
            }

            await events.testFunc(state.initCode);

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
      testFunc: async (value) => {
        let evalCode = clone(value, true);
        for (const key in method) {
          var reg = new RegExp(key, "g");
          evalCode = evalCode.replace(reg, `method.${key}`);
        }
        eval(evalCode);
      },
    };

    const method = {
      reloadData: (rows) => {
        vxetable.value.reloadData(Array.from(rows));
      },
      exportData: (options) => {
        vxetable.value.exportData(options);
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