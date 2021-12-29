import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import styles from './chart.module.scss'
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line } from 'react-chartjs-2';

const DELTA = 70; //160
const ALPHA = 400;

const LineGraph = ({ tokenAssets, tokenData, todaysTotal }) => {

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        ChartDataLabels,
    );

    const unixToDate = (timestamp) => {
        let date = new Date(timestamp).toLocaleDateString("en-US")
        return date;
    }

    let combine3prizeToOne = (itx, units) => {
        let sum = 0;

        if (!isNaN(parseFloat(itx['1st Prize']))) {
            sum = parseFloat(parseFloat(sum) + parseFloat(itx['1st Prize'].replace(/,/g, '')));
        }
        if (!isNaN(parseFloat(itx['2nd Prize']))) {
            sum = parseFloat(parseFloat(sum) + parseFloat(itx['2nd Prize'].replace(/,/g, '')));
        }
        if (!isNaN(parseFloat(itx['3rd Prize']))) {
            sum = parseFloat(parseFloat(sum) + parseFloat(itx['3rd Prize'].replace(/,/g, '')));
        }
        units = units + sum;
        return units;
    }

    const chartMap = (data) => {
        let payout = [];
        for (let i = ALPHA; i < data.length; i = i + DELTA) {
            payout.push(data[i])
        }
        return payout
    }

    let labels = chartMap(tokenAssets['SOLR'].priceChart.map((etx) => { return unixToDate(etx[0]) }));

    const generateData = () => {

        let unitsum;

        Object.keys(tokenAssets).forEach((itx) => {
            unitsum = { ...unitsum, [itx]: { units: 0 } }
        })

        // tokenData.forEach((etx) => {
        //     unitsum[etx['Token']].units = combine3prizeToOne(etx,unitsum[etx['Token']].units);
        // })

        console.log(unitsum);

        let usdOverTime = [];

        for (let j = ALPHA; j < tokenAssets['SOLR'].priceChart.length; j = j + DELTA) {
            usdOverTime.push(500);
        }

        const unitsOnDate = (itm, date) => {
            let onUnits = 0;

            tokenData.forEach((itx) => {
                if (itx['Token'] == itm && itx['Date Given']?.length > 0) {
                    let gDate = itx['Date Given'].split('/');
                    let oDate = date.split('/');
                    if (parseInt(gDate[2]) <= parseInt(oDate[2])) {
                        if (parseInt(gDate[0]) <= parseInt(oDate[0])) {
                            if (parseInt(gDate[0]) === parseInt(oDate[0])) {
                                if (parseInt(gDate[1]) <= parseInt(oDate[1])) {
                                    onUnits = combine3prizeToOne(itx, onUnits)
                                }
                            }
                            else {
                                onUnits = combine3prizeToOne(itx, onUnits)
                            }
                        }

                    }
                }
            })

            return onUnits;
        }



        Object.keys(unitsum).forEach((itm) => {
            let usdCounter = 0;
            for (let i = ALPHA; i < tokenAssets[itm].priceChart.length; i = i + DELTA) {
                //usdOverTime[usdCounter] = usdOverTime[usdCounter] + parseFloat(tokenAssets[itm].priceChart[i][1] * unitsum[itm].units);
                usdOverTime[usdCounter] = usdOverTime[usdCounter] + parseFloat(tokenAssets[itm].priceChart[i][1] * parseFloat(unitsOnDate(itm, unixToDate(tokenAssets[itm].priceChart[i][0]))));
                usdCounter++;
            }
        })


        usdOverTime[usdOverTime.length - 1] = todaysTotal;
        return usdOverTime;
    }


    const data = {
        labels,
        datasets: [
            {
                label: 'Total Community Earnings ($) ',
                data: generateData(),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            datalabels: {
                color: '#6495ED',
                anchor: 'end',
                align: "end",
                offset: '5',
                font: {
                    weight: "bold",
                    size: "12"
                },
                formatter: function (value) {
                    return (`$${parseInt(value)}`);
                },
            },
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Chart.js Line Chart',
            },
        },
        scales: {
            y: {
              steps : 5
            }
          }
    };

   


    return (
        <div className={styles.lineGraph}>
            {/* <button className={styles.dateLabelToggle} onClick={() => { setShowDates(s => !s) }}>Toggle Dates</button> */}
            <Line options={options} data={data}  ></Line>
        </div>
    )
}

export default LineGraph;