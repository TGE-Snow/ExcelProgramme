<template>
  <div>
    <div class="boxs">
      <input type="file" style="height: 40px" @change="change" />
    </div>
    <div style="display: flex">
      <vxe-button
        type="text"
        status="primary"
        content="初始化编辑"
        @click="events.initEditCode"
      ></vxe-button>

      <div v-for="(item, index) in state.buttonList" :key="index">
        <vxe-button
          type="text"
          status="primary"
          :content="item.text"
          @click="events.testFunc(item.value)"
        ></vxe-button>
        <i class="vxe-icon-edit" @click="events.editCode(item, index)"></i>
      </div>
    </div>
    <vxe-grid v-bind="gridOptions" ref="vxetable"> </vxe-grid>
    <vxe-modal
      v-model="state.modal.show"
      width="600"
      show-footer
      :mask="false"
      :lock-view="false"
      @confirm="events.changeCode"
    >
      <template #title>
        <span style="color: red">编辑</span>
      </template>
      <template #default>
        <div>标题:<vxe-input v-model="state.modal.text"></vxe-input></div>
        <div>
          执行逻辑:<vxe-textarea v-model="state.modal.value"></vxe-textarea>
        </div>
        <vxe-button
          status="primary"
          content="执行"
          @click="events.runCsCode"
        ></vxe-button>
      </template>
    </vxe-modal>
    <vxe-modal
      v-model="state.initmodal.show"
      width="600"
      show-footer
      :mask="false"
      :lock-view="false"
      @confirm="events.changeinitCode"
    >
      <template #title>
        <span style="color: red">初始化</span>
      </template>
      <template #default>
        <div>
          执行逻辑:<vxe-textarea v-model="state.initmodal.code"></vxe-textarea>
        </div>
        <vxe-button
          status="primary"
          content="执行"
          @click="events.runCsCode(state.modal.value)"
        ></vxe-button>
      </template>
    </vxe-modal>
  </div>
</template>

<script>
import { computed, reactive, ref } from "@vue/reactivity";
import { h, nextTick, onMounted, watch } from "@vue/runtime-core";
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
import { executeSql } from "./unit";
export default {
  name: "home",
  setup(props) {
    let state = reactive({
      hmd: `
      
      `,
      data: {},
      modal: {
        show: false,
        text: "",
        value: "",
        index: 0,
      },
      initmodal: {
        show: false,
        code: "",
      },
      initCode: `
      const jn = await executeSql(
        "select ID from sheets0 where row_GS = '天津' and row_SFWZSTZ = '是' order by row_LJTGE desc limit 0,100"
      );
      for (let index = 0; index < jn.rows.length; index++) {
        const item = jn.rows[index];
        await executeSql(
          "update sheets0 SET row_LJPMQ100=" +
            (index + 1) +
            " where ID='" +
            item.ID +
            "'"
        );
      }
      const jw = await executeSql(
        "select ID from sheets0 where row_GS = '津外' and row_SFWZSTZ = '是' order by row_LJTGE desc limit 0,100"
      );
      for (let index = 0; index < jw.rows.length; index++) {
        const item = jw.rows[index];
        await executeSql(
          "update sheets0 SET row_LJPMQ100=" +
            (index + 1) +
            " where ID='" +
            item.ID +
            "'"
        );
      }

      const lstdjw = await executeSql(
        "select row_LSTD from sheets0 where row_GS='津外' GROUP BY row_LSTD"
      );
      for (let index = 0; index < lstdjw.rows.length; index++) {
        const item = lstdjw.rows[index];
        let pm20 = await executeSql(
          "select ID,row_GXZDF from sheets0 where row_GS='津外' and row_LSTD='" +
            item.row_LSTD +
            "' order by row_LSDQJEHJ desc limit 0,20"
        );

        for (let index20 = 0; index20 < pm20.rows.length; index20++) {
          const item20 = pm20.rows[index20];
          await executeSql(
            "update sheets0 SET row_TDDQYJQ20=" +
              (index20 + 1) +
              " where ID='" +
              item20.ID +
              "'"
          );
        }

        let pm15 = await executeSql(
          "select ID,row_GXZDF from sheets0 where row_GS='津外' and row_LSTD='" +
            item.row_LSTD +
            "' and row_TZ != row_LSTD and row_TZBH NOT IN (723,17166,14541,15332,1590,258,4784,2797,19511,7696,4988,26,20279,635,3204,61) order by row_DQXJZSHJ desc limit 0,15"
        );

        for (let index15 = 0; index15 < pm15.rows.length; index15++) {
          const item15 = pm15.rows[index15];
          const dqdf = 75 - index15;
          let df = 0;
          if (isNumber(item15["row_GXZDF"])) {
            df = toNumber(item15["row_GXZDF"]);
          }
          await executeSql(
            "update sheets0 SET row_DQYJDF=" +
              dqdf +
              ",row_ZF=" +
              (dqdf + df) +
              " where ID='" +
              item15.ID +
              "'"
          );
        }
      }

      const lstdjn = await executeSql(
        "select row_LSTD from sheets0 where row_GS='天津' GROUP BY row_LSTD"
      );
      for (let index = 0; index < lstdjn.rows.length; index++) {
        const item = lstdjn.rows[index];
        let pm20 = await executeSql(
          "select ID,row_GXZDF from sheets0 where row_GS='天津' and row_LSTD='" +
            item.row_LSTD +
            "' order by row_LSDQJEHJ desc limit 0,20"
        );

        for (let index20 = 0; index20 < pm20.rows.length; index20++) {
          const item20 = pm20.rows[index20];
          await executeSql(
            "update sheets0 SET row_TDDQYJQ20=" +
              (index20 + 1) +
              " where ID='" +
              item20.ID +
              "'"
          );
        }

        let pm15 = await executeSql(
          "select ID,row_GXZDF from sheets0 where row_GS='天津' and row_LSTD='" +
            item.row_LSTD +
            "' and row_TZ != row_LSTD and row_TZBH NOT IN (723,17166,14541,15332,1590,258,4784,2797,19511,7696,4988,26,20279,635,3204,61) order by row_DQXJZSHJ desc limit 0,15"
        );

        for (let index15 = 0; index15 < pm15.rows.length; index15++) {
          const item15 = pm15.rows[index15];
          const dqdf = 75 - index15;
          let df = 0;
          if (isNumber(item15["row_GXZDF"])) {
            df = toNumber(item15["row_GXZDF"]);
          }
          await executeSql(
            "update sheets0 SET row_DQYJDF=" +
              dqdf +
              ",row_ZF=" +
              (dqdf + df) +
              " where ID='" +
              item15.ID +
              "'"
          );
        }
      }
      `,
      buttonList: [
        {
          text: "全部",
          value: `
          executeSql("select * from sheets0").then(({rows})=>{reloadData(rows);})
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
          text: "团队前20名",
          value: `
          executeSql(
        "select * from sheets0 where row_TDDQYJQ20 > 0 ORDER BY row_GS,row_LSTD,row_TDDQYJQ20"
      ).then(({rows})=>{
            reloadData(rows);
});
          `,
        },
        {
          text: "团队总分前15",
          value: `
          executeSql(
        "select * from sheets0 where row_ZF > 0 ORDER BY row_GS,row_LSTD,row_ZF DESC"
      ).then(({ rows }) => {
        reloadData(rows);
      });
          `,
        },
        {
          text: "团队业绩得分前15",
          value: `
          executeSql(
        "select * from sheets0 where row_DQYJDF > 0 ORDER BY row_GS,row_LSTD,row_DQYJDF DESC"
      ).then(({ rows }) => {
        reloadData(rows);
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
      // let rowList = [];
      // for (let index = 0; index < lstd.rows.length; index++) {
      //   const item = lstd.rows[index];
      //   let { rows } = await executeSql(
      //     "select * from sheets0 where row_GS='天津' and row_LSTD='" +
      //       item.row_LSTD +
      //       "' order by row_DQXJZSHJ desc limit 0,20"
      //   );
      //   rowList = rowList.concat(rows);
      // }
      // reloadData(rowList);
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
                      tCol[colIndex] += " TEXT";
                      valueList.push(keyObj[nk]);
                    } else {
                      keyObj[nk] = element.replace(/"/g, "'");
                      valueList.push(`"${keyObj[nk]}"`);
                    }
                  }
                }
              }

              if (index == 0) {
                const findTable = await executeSql(
                  `SELECT name FROM sqlite_master WHERE type='table' AND name='sheets${
                    Object.keys(state.data).length
                  }';`
                );
                if (findTable.rows.length > 0) {
                  await executeSql(
                    ` DROP TABLE sheets${Object.keys(state.data).length}`
                  );
                }

                await executeSql(
                  `CREATE TABLE IF NOT EXISTS sheets${
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

            const a = await events.testFunc(state.initCode);
            console.log("init", a);
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

        return await eval(`(function (params) {
          return new Promise(async (evalRet) => {
            ${evalCode}
            evalRet(true);
          });
        })();`);
      },
      editCode: ({ text, value }, index) => {
        state.modal.show = true;
        state.modal.text = text;
        state.modal.value = value;
        state.modal.index = index;
      },
      changeCode: () => {
        state.buttonList[state.modal.index].text = state.modal.text;
        state.buttonList[state.modal.index].value = state.modal.value;
      },
      runCsCode: async (value) => {
        await events.testFunc(value);
      },
      initEditCode: () => {
        state.initmodal.show = true;
        state.initmodal.code = clone(state.initCode, true);
      },
      changeinitCode: () => {
        state.initCode = clone(state.initmodal.code, true);
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