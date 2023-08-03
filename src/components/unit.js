let tableData = {};
export const setCount = (v) => {
  tableData = v;
};

export const ESort = (sheets, field, type = true) => {
  return tableData[sheets].d.sort((a, b) => {
    if (type) {
      return b[field] - a[field];
    } else {
      return a[field] - b[field];
    }
  });
};

// export const ECut = (sheets, start = 0, end = 1) => {

//     return tableData[sheets].d.splice(start, end);
// }

Array.prototype.ECut = (start = 0, end = 1) => {
  console.log("ecut", this);
  return tableData["sheets0"].d.splice(start, end);
};

let version = 1;

let db = window.openDatabase(
  "mydb",
  `${version++}.0`,
  "Offline document storage",
  5 * 1024 * 1024,
  function (db) {}
);

console.log(db);

export const executeSql = (sql) => {
  return new Promise((reslove) => {
    db.transaction(function (tx) {
      tx.executeSql(
        sql,
        [],
        (a1, a2) => {
          let ret = Array.from(a2.rows);

          reslove({ status: true, rows: ret });
        },
        (a1, a2) => {
          console.error(sql, a2);
          reslove({ status: false });
        }
      );
    });
  });
};
document.executeSql = executeSql;


