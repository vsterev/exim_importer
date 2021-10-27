import React, { useState, useContext } from 'react';
import XLSX from 'xlsx';
// import { make_cols } from './MakeColumns';
import { SheetJSFT } from './types';
import Row from './components/row';
import PartnerContext from './utils/partnerContext';
import Template from './components/template';
import styles from './excelReader.module.css';
import { Button } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import ImportExportIcon from '@material-ui/icons/ImportExport';
const ExcelReader = () => {
  const [file, setFile] = useState({});
  const [data, setData] = useState(null);
  // const [cols, setCols] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const { partner } = useContext(PartnerContext);
  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      setIsDisabled(false);
    }
  };
  const datePreformat = (d) => {
    if (d instanceof Date) {
      return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'numeric', day: 'numeric' });
    } else {
      console.log(d);
      const [date, month, year] = d.split('.');
      return new Date(year, month - 1, date).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    }
  };

  const handleFile = () => {
    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, {
        type: rABS ? 'binary' : 'array',
        bookVBA: true,
        cellDates: true,
        cellNF: false,
        cellText: false,
        // setDelimiter: '.',
      });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      console.log(ws);
      /* Convert array of arrays */
      const data1 = XLSX.utils.sheet_to_json(ws, { dateNF: 'YYYY-MM-DD' }).map((row) =>
        Object.keys(row).reduce((obj, key) => {
          obj[key.trim()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
          return obj;
        }, {})
      );
      console.log(data1);
      /* Update state */
      const dataModified = data1.reduce((acc, val) => {
        if (!acc[val[partner?.variablesName?.voucher]]) {
          acc[val[partner?.variablesName?.voucher]] = {
            hotel: val[partner?.variablesName?.hotel],
            checkIn: datePreformat(val[partner?.variablesName?.checkIn]),
            checkOut: datePreformat(val[partner?.variablesName?.checkOut]),
            // checkIn: val[partner?.variablesName?.checkIn],
            // checkOut: val[partner?.variablesName?.checkOut],
            accommodation: val[partner?.variablesName?.accommodation],
            roomType: val[partner?.variablesName?.roomType],
            pansion: val[partner?.variablesName?.pansion],
            action: val[partner?.variablesName?.action] || 'new',
            tourists: [],
            transfer: val[partner?.variablesName?.transfer] || 'group',
            flightIn: val[partner?.variablesName?.flightIn],
            flightOut: val[partner?.variablesName?.flightOut],
          };
        }
        acc[val[partner?.variablesName?.voucher]].tourists.push({
          name: !val[partner?.variablesName?.familyName]
            ? val[partner?.variablesName?.name].split(' ')[1]
            : val[partner?.variablesName?.name],
          familyName: !val[partner?.variablesName?.familyName]
            ? val[partner?.variablesName?.name].split(' ')[0]
            : val[partner?.variablesName?.familyName],
          gender: val[partner?.variablesName?.gender],
          // birthDate: val[partner?.variablesName?.birthDate] ? val[partner?.variablesName?.birthDate] : undefined,
          birthDate: val[partner?.variablesName?.birthDate]
            ? datePreformat(val[partner?.variablesName?.birthDate])
            : undefined,
          email: val[partner?.variablesName?.email],
          phone: val[partner?.variablesName?.phone],
        });

        return acc;
      }, {});
      console.log(dataModified);
      setData(dataModified);
      // setCols(make_cols(ws['!ref']));
    };

    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
    setIsDisabled(true);
  };
  // const clickAct = (a) => {
  //   // console.log(a);
  //   const { checkIn, checkOut, tourists, hotel, pansion } = a;
  //   console.log({ checkIn, checkOut, tourists, hotel, pansion });
  //   iLookServ
  //     .searchHotelServices({ checkIn, checkOut, tourists, hotel, pansion })
  //     .then((a) => {
  //       setOptions(a.arrPrices);
  //     })
  //     .catch(console.log);
  // };

  return (
    <Template
      title={
        !!partner
          ? `Upload an excel Solvex Template to import reservation from ${partner.name}`
          : 'First select a partner for which will import reservations'
      }>
      <div>
        <section className={styles.button}>
          {/* <label htmlFor="partnerSelect">Select a partner: </label>
      <select id="partnerSelect" onChange={(e) => setPartner(e.target.value)} defaultValue={partner}>
        <option value="">please select</option>
        <option value="exim">Exim tours</option>
        <option value="partner2">Partner 2</option>
      </select> */}
          {/* <PartnerSelectNew /> */}
          {/* <label htmlFor="file">
          Upload an excel Solvex Template {!!partner ? `to import reservation from ${partner.name}` : ''}
        </label> */}
          <input type="file" className="form-control" id="file" accept={SheetJSFT} onChange={handleChange} hidden />
          <label htmlFor="file">
            <Button
              component="span"
              variant="contained"
              color="primary"
              disabled={!partner.code}
              startIcon={<CloudUploadIcon />}>
              Upload .xls file
            </Button>
          </label>
          <br />{' '}
          <Button
            component="span"
            variant="contained"
            color="primary"
            onClick={handleFile}
            disabled={isDisabled}
            endIcon={<ImportExportIcon />}>
            IL synchronize
          </Button>
        </section>
        {/* {!!data.length > 0 && JSON.stringify(data)} */}

        {data && (
          <React.Fragment>
            <table>
              <thead>
                <tr>
                  <th>voucher</th>
                  <th>action</th>
                  <th>hotel name</th>
                  <th>room type</th>
                  <th>accomm.</th>
                  <th>pansion</th>
                  <th>checkIn</th>
                  <th>checkOut</th>
                  <th>flightIn</th>
                  <th>flightOut</th>
                  <th>tourists</th>
                  <th>transfer</th>
                  <th>interLook type</th>
                  <th>send reservation</th>
                  <th>IL response</th>
                  {/* <th>IL status</th> */}
                </tr>
              </thead>
              <tbody>
                {Object.entries(data).map(([k, res]) => {
                  return (
                    // <tr key={k}>
                    //   <td>{k}</td>
                    //   <td>{res.action}</td>
                    //   <td>{res.hotel}</td>
                    //   <td>{res.roomType}</td>
                    //   <td>{res.accommodation}</td>
                    //   <td>{res.pansion}</td>
                    //   <td>{res.checkIn}</td>
                    //   <td>{res.checkOut}</td>
                    //   <td>
                    //     {res.tourists.map((el, i) => {
                    //       return (
                    //         <div key={i}>
                    //           {el.gender} {el.name} {el.familyName} - {el.birthDate}
                    //         </div>
                    //       );
                    //     })}
                    //   </td>
                    //   <td>
                    //     <button onClick={() => clickAct(res)}> check</button>
                    //   </td>
                    //   <td>
                    //     {/* {!!options?.length > 0 && JSON.stringify(options)} */}
                    //     {!!options?.length > 0 && (
                    //       <select>
                    //         {options?.map((el) => {
                    //           return (
                    //             <option key={el.id} value={el}>
                    //               {el.roomType}
                    //             </option>
                    //           );
                    //         })}
                    //       </select>
                    //     )}
                    //   </td>
                    // </tr>
                    <Row key={k} k={k} res={res} />
                  );
                })}
              </tbody>
            </table>
          </React.Fragment>
        )}
      </div>
    </Template>
  );
};

export default ExcelReader;
