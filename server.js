// Config
const projectId = 'bigqueryvonex'                         //Id del proyecto
const datasetId = 'academy';                              //Nombre del conjunto de datos

// Data
let writeDisposition = 'WRITE_APPEND';
let has_header = false;
let schema_bq = 'no_automatic';
let today = new Date();
let infoBack = [];
let msgBack;

// DOGET
function doGet() {
  let htmlOutput = HtmlService.createTemplateFromFile('index');
  let show = true;

  htmlOutput.show = show;
  return htmlOutput.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// DATA ATTENDANCE QR
function senddataqr(dni) {
  let headerAttendance = ["id_alumn", "tutor_email", "week", "day", "state", "date", "time","cycle"];
  let tableId = 'alumn_attendance';
  let endEarlyTime = new Date('2023-01-01 16:00:00');
  let timeNow = getTimeSeconds_();
  let dayNow = getDay_();
  let weekNow = getWeek_();
  let dateNow = getDate_();
  let state = "A";

  // Validate Alumn attendance
  let cantAttendance = getAlumnsAttendanceByDateM(dni, dateNow);

  if (cantAttendance.length >= 1){
      if (cantAttendance[0][3] == null){
      // Add Row
      let newRow = headerAttendance.map(function (column) {
        if (column === 'id_alumn') {
          return dni;
        } else if(column === 'tutor_email') {
          return "test@vonex.edu.pe";
        } else if (column === 'week') {
          return weekNow;
        } else if (column === 'day') {
          return dayNow;
        } else if (column === 'state') {
          return state;
        } else if (column === 'date') {
          return dateNow;
        } else if (column === 'time') {
          return timeNow;
        } else if (column === 'cycle') {
          return "test";
        }
      });
      let range = [[...newRow]];

      infoBack.push(...cantAttendance[0],getTime12_())

      // Insert Row
      let responseUploadBigquery = insertBigquery(range, projectId, datasetId, tableId, writeDisposition, has_header, schema_bq);

      if(responseUploadBigquery == 'inserted'){
          msgBack = {
          msg: "ok",
          data: infoBack
        };
      }else{
          msgBack = {
          msg: "error",
          data: infoBack
        };
      }
      return msgBack;
    }else{
      msgBack = {
        msg: "attendance_exist",
        data: cantAttendance
      };
      return msgBack;
    }
  } else {
    msgBack = {
      msg: "error_exist",
      data: cantAttendance
    };
    return msgBack;
  }
}

// Get Alumn by Tutor & DNI
function getAlumnsByDni(dni) {
  let tableId = "alumn";

  let request = {
    query: 'SELECT DISTINCT dni_alumno,apellido_alumno,nombre_alumno ' +
      'FROM '+ projectId + '.' + datasetId +'.'+ tableId + 
      ' WHERE dni_alumno = "'+ dni +'"'+
      'ORDER BY apellido_alumno;',
    useLegacySql: false
  };
  let queryResults = BigQuery.Jobs.query(request, projectId);

  if (queryResults.totalRows == 0) {
    let data = [];
    return data;
  } else {
    const jobId = queryResults.jobReference.jobId;
    let rows = queryResults.rows;
    while (queryResults.pageToken) {
      queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId, {
        pageToken: queryResults.pageToken
      });
      rows = rows.concat(queryResults.rows);
    }
    
    // Append the results.
    let data = new Array(rows.length);
    for (let i = 0; i < rows.length; i++) {
      const cols = rows[i].f;
      data[i] = new Array(cols.length);
      for (let j = 0; j < cols.length; j++) {
        data[i][j] = cols[j].v;
      }
    }

    return data;
    //Logger.log(data);
  }
}
// Get Alumns Attendance by date
function getAlumnsAttendanceByDate(dni, date) {
  let tableId = "alumn_attendance";
  let request = {
    query: 'SELECT * ' +
      'FROM '+ projectId +'.'+datasetId +'.'+ tableId + ' ' +
      'WHERE id_alumn = "' + dni + '" AND date = "'+ date +'" AND tutor_email = "test@vonex.edu.pe"' +
      'LIMIT 100;',
    useLegacySql: false
  };
  let queryResults = BigQuery.Jobs.query(request, projectId);

  if (queryResults.totalRows == 0) {
    let data = [];
    return data;
  } else {
    const jobId = queryResults.jobReference.jobId;
    let rows = queryResults.rows;
    while (queryResults.pageToken) {
      queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId, {
        pageToken: queryResults.pageToken
      });
      rows = rows.concat(queryResults.rows);
    }

    // Append the results.
    let data = new Array(rows.length);
    for (let i = 0; i < rows.length; i++) {
      const cols = rows[i].f;
      data[i] = new Array(cols.length);
      for (let j = 0; j < cols.length; j++) {
        data[i][j] = cols[j].v;
      }
    }

    return data;
    //Logger.log(data);
  }
}
// Get Alumns Attendance by date Merge
function getAlumnsAttendanceByDateM(dni, date) {
  let tableId = "alumn";
  let tableId2 = "alumn_attendance";
  let request = {
    query: 'SELECT dni_alumno, apellido_alumno, nombre_alumno, (SELECT state FROM '+ projectId +'.'+datasetId +'.'+ tableId2 + ' WHERE id_alumn = "'+dni+'" AND date = "'+date+'" AND tutor_email = "test@vonex.edu.pe") AS state ' +
      'FROM '+ projectId +'.'+datasetId +'.'+ tableId + ' ' +
      'WHERE dni_alumno = "' + dni + '" ' +
      'LIMIT 100;',
    useLegacySql: false
  };
  let queryResults = BigQuery.Jobs.query(request, projectId);

  if (queryResults.totalRows == 0) {
    let data = [];
    return data;
  } else {
    const jobId = queryResults.jobReference.jobId;
    let rows = queryResults.rows;
    while (queryResults.pageToken) {
      queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId, {
        pageToken: queryResults.pageToken
      });
      rows = rows.concat(queryResults.rows);
    }

    // Append the results.
    let data = new Array(rows.length);
    for (let i = 0; i < rows.length; i++) {
      const cols = rows[i].f;
      data[i] = new Array(cols.length);
      for (let j = 0; j < cols.length; j++) {
        data[i][j] = cols[j].v;
      }
    }

    return data;
    //Logger.log(data);
  }
}

// Upload Bigquery
function upload_to_BigQ_(range, projectId, datasetId, tableId, writeDisposition, has_header, schema_bq) {
  if (typeof writeDisposition == "undefined") {
    writeDisposition = 'WRITE_EMPTY'
  }

  if (typeof has_header == "undefined" || has_header == true) {
    has_header = 1;
  } else {
    has_header = 0;
  }

  var data = [...range];
  let csvFile = undefined;

  if (data.length >= 1) {
    var csv = "";
    csvFile = csv;

    // Validate items
    for (var row = 0; row < data.length; row++) {
      for (var col = 0; col < data[row].length; col++) {
        if (data[row][col].toString().indexOf(",") != -1) {
          data[row][col] = "\"" + data[row][col] + "\"";
        }
      }

      // join each row's columns
      // add a carriage return to end of each row, except for the last one
      if (row < data.length - 1) {
        csv += data[row].join(",") + "\r\n";
      } else {
        csv += data[row];
      }
    }
    csvFile = csv;
  }

  // return csvFile;
  var csv_name = 'temp_' + new Date().getTime() + '.csv'
  DriveApp.createFile(csv_name, csvFile)

  var files = DriveApp.getFilesByName(csv_name);
  while (files.hasNext()) {
    var file = files.next();

    var table = {
      tableReference: {
        projectId: projectId,
        datasetId: datasetId,
        tableId: tableId
      },
    };

    // Create a new table if it doesn't exist yet.
    try {
      table = BigQuery.Tables.get(projectId, datasetId, tableId)
      Logger.log('BD exists');
    }
    catch (error) {
      table = BigQuery.Tables.insert(table, projectId, datasetId);
      Logger.log('BD created: %s', table.id);
    }

    var data = file.getBlob().setContentType('application/octet-stream');

    if (typeof schema_bq == "undefined" || schema_bq == false || schema_bq == 'automatic') {
      // Create the data upload job.
      var job = {
        configuration: {
          load: {
            destinationTable: {
              projectId: projectId,
              datasetId: datasetId,
              tableId: tableId
            },
            skipLeadingRows: has_header,
            autodetect: true,
            writeDisposition: writeDisposition
          }
        }
      };
    } else { 
      // Insert the data upload job.
      var job = {
        configuration: {
          load: {
            destinationTable: {
              projectId: projectId,
              datasetId: datasetId,
              tableId: tableId
            },
            skipLeadingRows: has_header,

            // Enter a schema below:
            schema: {
              fields: [
                { name: 'id_alumn', type: 'STRING' },
                { name: 'tutor_email', type: 'STRING' },
                { name: 'week', type: 'INTEGER' },
                { name: 'day', type: 'INTEGER' },
                { name: 'state', type: 'STRING' },
                { name: 'date', type: 'DATE' },
                { name: 'time', type: 'TIME' },
                { name: 'cycle', type: 'STRING' },
              ]
            },
            writeDisposition: writeDisposition
          }
        }
      };
    }
    //job = BigQuery.Jobs.insert(job, projectId, data);
    //file.setTrashed(true);

    try {
      job = BigQuery.Jobs.insert(job, projectId, data);
      jobMenssage = 'inserted';
    } catch (err) {
      jobMenssage = 'no_inserted';
    }

    file.setTrashed(true);
    return jobMenssage
  }

  // Log
  Logger.log("Records were uploaded")
}


// Insert Bigquery
function insertBigquery(range, projectId, datasetId, tableId, writeDisposition, has_header, schema_bq) {
  if (typeof writeDisposition == "undefined") {
    writeDisposition = 'WRITE_EMPTY'
  }

  if (typeof has_header == "undefined" || has_header == true) {
    has_header = 1;
  } else {
    has_header = 0;
  }
  
  let rowsString = range.join("\n");
  let dataBlob = Utilities.newBlob(rowsString, 'application/octet-stream');
  let job;

  if (schema_bq == 'no_automatic') {
    // Insert the data upload job.
    job = {
      configuration: {
        load: {
          destinationTable: {
            projectId: projectId,
            datasetId: datasetId,
            tableId: tableId
          },
          skipLeadingRows: has_header,

          // Enter a schema below:
          schema: {
            fields: [
              { name: 'id_alumn', type: 'STRING' },
              { name: 'tutor_email', type: 'STRING' },
              { name: 'week', type: 'INTEGER' },
              { name: 'day', type: 'INTEGER' },
              { name: 'state', type: 'STRING' },
              { name: 'date', type: 'DATE' },
              { name: 'time', type: 'TIME' },
              { name: 'cycle', type: 'STRING' },
            ]
          },
          writeDisposition: writeDisposition
        }
      }
    };
  }

  try {
    job = BigQuery.Jobs.insert(job, projectId, dataBlob);
    jobMenssage = 'inserted';
  } catch (err) {
    jobMenssage = 'no_inserted';
  }

  return jobMenssage
}

// Get Date
function getDate_(){
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  if(month <= 9){ month = "0" + month;}
  if(day <= 9){ day = "0" + day;}

  let date = `${year}-${month}-${day}`;
  return date;
}
// Get Day
function getDay_(){
  let day = today.getDay();
  return day;
}
// Get Week
function getWeek_(){
  let yearWeek = new Date(today.getFullYear(), 0, 1);
  let daysWeek = Math.floor((today - yearWeek) / (24 * 60 * 60 * 1000));
  let week = Math.ceil(( today.getDay() + 1 + daysWeek) / 7);
  return week;
}
// get Time
function getTimeSeconds_(){
  let hour = today.getHours();
  let minute = today.getMinutes();
  let seconds = today.getSeconds();

  if(hour <= 9){ hour = "0" + hour;}
  if(minute <= 9){ minute = "0" + minute;}
  if(seconds <= 9){ seconds = "0" + seconds;}

  let time = `${hour}:${minute}:${seconds}`;
  return time;
}
// get Time
function getTime_(){
  let hour = today.getHours();
  let minute = today.getMinutes();
  let seconds = today.getSeconds();

  if(hour <= 9){ hour = "0" + hour;}
  if(minute <= 9){ minute = "0" + minute;}
  if(seconds <= 9){ seconds = "0" + seconds;}

  let time = `${hour}:${minute}`;
  return time;
}
function getTime12_(){
  let time12 = today.toLocaleString('en-PE', { hour: 'numeric', minute: 'numeric', hour12: true });
  return time12;
}

function testing(){
  //Logger.log(getAlumnsByDni("72976839"))
  //Logger.log(getWeek_())
  //Logger.log(getAlumnsAttendanceByDateM('75242814', '2023-01-31'))
  let tableId = 'alumn_attendance';
  let dataTemp = [["75242814", "test@vonex.edu.pe", "5", "2", "A", "2023-01-31", "09:54:46","test"]];
  Logger.log(insertBigquery(dataTemp, projectId, datasetId, tableId, writeDisposition, has_header, schema_bq))
}

function testing2() {
  let dataTemp = ["75242814", "test@vonex.edu.pe", "5", "2", "A", "2023-01-31", "09:54:46",""];
   // rows data is 2D string array
  Logger.log(dataTemp);

  // newBlob only accepts String so we convert rows into one
  var rowsString = dataTemp.join("\n");
  Logger.log(rowsString);

  // data below is now of type Blob object
  var datas = Utilities.newBlob(rowsString, 'application/octet-stream');
  Logger.log(datas); 
}



