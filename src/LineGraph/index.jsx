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
import { Filler } from "chart.js";

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
        Filler
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

    let labels = chartMap(tokenAssets['SOLR'].priceChart.map((etx) => { return newDateFormat(unixToDate(etx[0])) }));

    //console.log(tokenData);

    const generateData = () => {

        let unitsum;

        Object.keys(tokenAssets).forEach((itx) => {
            unitsum = { ...unitsum, [itx]: { units: 0 } }
        })

        // tokenData.forEach((etx) => {
        //     unitsum[etx['Token']].units = combine3prizeToOne(etx,unitsum[etx['Token']].units);
        // })

        //console.log(unitsum);

        let usdOverTime = [];

        for (let j = ALPHA; j < tokenAssets['SOLR'].priceChart.length; j = j + DELTA) {
            usdOverTime.push(500);
        }

        const unitsOnDate = (itm, date) => {
            let onUnits = 0;

            tokenData.forEach((itx) => {
                if (itx['Token'] == itm && itx['Date Given']?.length > 0) {
                    // let gDate = itx['Date Given'].split('/');
                    // let oDate = date.split('/');

                    let GDate = new Date(itx['Date Given']);
                    let ODate = new Date(date);

                    if (GDate <= ODate) {
                        onUnits = combine3prizeToOne(itx, onUnits)
                    }


                    // console.log(parseInt(gDate[2]),parseInt(oDate[2]),(gDate[2]) <= parseInt(oDate[2]));
                    // if (parseInt(gDate[2]) <= parseInt(oDate[2])) {
                    //     if (parseInt(gDate[0]) <= parseInt(oDate[0])) {
                    //         if (parseInt(gDate[0]) === parseInt(oDate[0])) {
                    //             if (parseInt(gDate[1]) <= parseInt(oDate[1])) {
                    //                 onUnits = combine3prizeToOne(itx, onUnits)
                    //             }
                    //         }
                    //         else {
                    //             onUnits = combine3prizeToOne(itx, onUnits)
                    //         }
                    //     }
                    // }
                }
            })

            return onUnits;
        }



        Object.keys(unitsum).forEach((itm) => {
            let usdCounter = 0;
            for (let i = ALPHA; i < tokenAssets[itm].priceChart.length; i = i + DELTA) {
                //usdOverTime[usdCounter] = usdOverTime[usdCounter] + parseFloat(tokenAssets[itm].priceChart[i][1] * unitsum[itm].units);
                if ('1/2/2022' == unixToDate(tokenAssets[itm].priceChart[i][0])) {

                }
                usdOverTime[usdCounter] = usdOverTime[usdCounter] + parseFloat(tokenAssets[itm].priceChart[i][1] * parseFloat(unitsOnDate(itm, unixToDate(tokenAssets[itm].priceChart[i][0]))));
                usdCounter++;
            }
        })


        usdOverTime[usdOverTime.length - 1] = todaysTotal;
        //console.log(usdOverTime);
        return usdOverTime;
    }

    const chartRef = useRef(null);
    const [grad, setgrad] = useState(null)
    useEffect(() => {
        if (chartRef) {
            const chart = chartRef.current;
            let gradient = chart.ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, '#120077');
            gradient.addColorStop(0.5, '#ec4a73');
            gradient.addColorStop(1, '#ec4a4a');
            setgrad(gradient);
        }
    }, [])


    const data = {
        labels,
        datasets: [
            {
                label: 'Total Community Earnings ($) ',
                data: generateData(),
                borderColor: grad,
                backgroundColor: 'rgba(253, 137, 137, 0.096)',
                tension: 0.3,
                fill: true
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                color: '#00000099',
                anchor: 'end',
                align: "end",
                offset: '5',
                backgroundColor: '#ffffff99',
                borderRadius: 10,
                font: {
                    weight: 'bolder',
                    size: "10px",
                    spacing: '50'
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
                steps: 5
            }
        }
    };




    return (
        <div className={styles.lineGraph}>
            {/* <button className={styles.dateLabelToggle} onClick={() => { setShowDates(s => !s) }}>Toggle Dates</button> */}
            {<Line ref={chartRef} options={options} data={data}  ></Line>}
        </div>
    )
}

//DD/MM/YY format
const newDateFormat = (date) => {
    let split = date.split('/');
    return `${split[1]}/${split[0]}/${split[2]}`
}


export default LineGraph;