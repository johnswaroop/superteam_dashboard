import React, { useEffect, useState } from 'react'
import styles from './dashboard.module.scss'
import axios from 'axios'
import './loader.css'
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line } from 'react-chartjs-2';


const fetchDashboard = async (setData) => {

    try {
        let res1 = await axios.get(`https://api.steinhq.com/v1/storages/61a101d08d29ba23790846d7/Bounties Paid`);
        if (res1) {
            let cleanData1 = deNuller(res1.data);
            setData(cleanData1.reverse());
        }
    }
    catch (e) {
        console.log(e);
    }

}

const deNuller = (data) => {
    let deNulled = data.filter((itm) => {
        if (itm['Token']) return true;
    })
    return deNulled;
}

const dataCleaner = (data) => {

    let deNulled = deNuller(data);

    let newData = deNulled.map((etx) => {
        return { ...etx, 'Project': etx['Bounty'] }
    })

    //console.log(newData);

    return newData;
}


const fetchList = async (setList) => {
    try {
        let list = await axios.get(' https://api.coingecko.com/api/v3/coins/list');
        if (list) {
            setList(list.data)
        }
    }
    catch (e) {
        console.log(e);
    }
}

const formatDate = (date) => {
    let dateSplit = date.split('/');
    let day = dateSplit[0];
    let month = dateSplit[1];
    let year = dateSplit[2];

    if (month.length < 2) {
        month = `0${month}`;
    }

    if (day.length < 2) {
        day = `0${month}`;
    }

    return `${day}/${month}/${year}`
}

const LineGraph = ({ tokenAssets, tokenData }) => {

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        ChartDataLabels
    );


    // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

    const unixToDate = (timestamp) => {
        let date = new Date(timestamp).toLocaleDateString("en-US")
        return date;
    }

    const chartMap = (data) => {
        let payout = [];
        for (let i = 0; i < data.length; i = i + 160) {
            payout.push(data[i])
        }
        payout.push(data[data.length - 1])
        return payout
    }

    let labels = chartMap(tokenAssets['SOLR'].priceChart.map((etx) => { return unixToDate(etx[0]) }));

    const generateData = () => {

        let unitsum;

        Object.keys(tokenAssets).forEach((itx) => {
            unitsum = { ...unitsum, [itx]: { units: 0 } }
        })

        tokenData.forEach((etx) => {
            let sum = 0;
            if (!isNaN(parseFloat(etx['1st Prize']))) {
                sum = parseFloat(parseFloat(sum) + parseFloat(etx['1st Prize'].replace(/,/g, '')));
            }
            if (!isNaN(parseFloat(etx['2nd Prize']))) {
                sum = parseFloat(parseFloat(sum) + parseFloat(etx['2nd Prize'].replace(/,/g, '')));
            }
            if (!isNaN(parseFloat(etx['3rd Prize']))) {
                sum = parseFloat(parseFloat(sum) + parseFloat(etx['3rd Prize'].replace(/,/g, '')));
            }
            unitsum[etx['Token']].units = unitsum[etx['Token']].units + sum;
        })

        let usdOverTime = [];

        for (let j = 0; j < tokenAssets['SOLR'].priceChart.length; j = j + 160) {
            usdOverTime.push(500);
        }

        usdOverTime.push(500);

        Object.keys(unitsum).forEach((itm) => {
            let usdCounter = 0;
            for (let i = 0; i < tokenAssets[itm].priceChart.length; i = i + 160) {
                usdOverTime[usdCounter] = usdOverTime[usdCounter] + parseFloat(tokenAssets[itm].priceChart[i][1] * unitsum[itm].units);
                usdCounter++;
            }
            usdOverTime[usdCounter] = usdOverTime[usdCounter] + parseFloat(tokenAssets[itm].priceChart[(tokenAssets[itm].priceChart.length - 1)][1]) * unitsum[itm].units;
        })

        return usdOverTime;
    }


    const data = {
        labels,
        datasets: [
            {
                label: 'Payout ($) ',
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
                    size : "12"
                },
                formatter: function (value) {
                    return `$${parseInt(value)}`;
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
    };
    // data: chartMap(tokenAssets['SOLR'].priceChart.map((etx) => { return etx[1] })),
    // data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
    return (
        <div className={styles.lineGraph}>
            <Line options={options} data={data}/>
        </div>
    )
}

//btn labels
const ALL = "All"
const BOUNTIES = "Bounties"
const INSTAGRANTS = "Instagrants"

function Dashboard() {

    const [data, setData] = useState([]);
    const [list, setList] = useState(null);
    const [tokenAssets, setTokenAssets] = useState({});
    const [assetFetchCount, setAssetFetchCount] = useState(0);
    const [selectedBtn, setSelectedBtn] = useState(ALL);
    const [showGraph, setShowGraph] = useState(false);

    useEffect(() => {
        fetchDashboard(setData);
        fetchList(setList);
    }, [])

    useEffect(() => {
        if (data.length < 0) return
        if (!list) return
        let completed = [];
        data.forEach((itx) => {
            (!completed.includes(itx['Token'])) ? getTokenAssets(getTokenId(itx['Token'])) : setAssetFetchCount(c => c + 1);
            completed.push(itx['Token']);
        })
    }, [list, data,])

    const getTokenId = (symbol) => {
        // console.log("search -->", symbol);
        if (!list) return;
        let id;
        list.forEach((item) => {
            if (symbol.toLowerCase() == item.symbol) {
                id = item.id;
            }
        })
        return id;
    }

    const getTokenAssets = async (id) => {
        if (!list) return
        if (tokenAssets)
            try {
                let res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`);
                // console.log('api call -->', id);
                let chart = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart/range?vs_currency=usd&from=1633052292&to=1638346822`)
                //  console.log('chart api call -->', id);
                let priceChart = chart.data?.prices;
                if (res && chart) {
                    setTokenAssets((obj) => { return ({ ...obj, [res.data.symbol.toUpperCase()]: { image: res.data.image.small, price: res.data.market_data.current_price.usd, id, priceChart } }) })
                    setAssetFetchCount(c => c + 1);
                }

            }
            catch (er) {
                console.log(er);
            }
    }

    const getPriceUSD = (etx, units) => {
        let usd = parseFloat((parseFloat(tokenAssets[etx['Token']].price) * parseFloat(units.replace(/,/g, ''))).toPrecision(2));
        if (isNaN(usd)) return ''
        return '$' + '' + usd
    }

    const getTokenPriceUSD = (etx) => {
        let usd = parseFloat(tokenAssets[etx['Token']].price).toPrecision(2);
        if (isNaN(usd)) return ''
        return '$' + '' + usd
    }

    const getSumTotal = () => {
        let sum = 500;
        data.forEach((etx) => {
            if (!isNaN(parseFloat(etx['1st Prize']))) {
                sum = sum + (parseFloat(tokenAssets[etx['Token']].price) * parseFloat(etx['1st Prize'].replace(/,/g, '')));
            }
            if (!isNaN(parseFloat(etx['2nd Prize']))) {
                sum = sum + (parseFloat(tokenAssets[etx['Token']].price) * parseFloat(etx['2nd Prize'].replace(/,/g, '')));
            }
            if (!isNaN(parseFloat(etx['3rd Prize']))) {
                sum = sum + (parseFloat(tokenAssets[etx['Token']].price) * parseFloat(etx['3rd Prize'].replace(/,/g, '')));
            }
        })
        return `$ ${parseFloat(sum.toPrecision(7))}`;
    }

    //console.log("assetcount--->", assetFetchCount, "data count --->", data?.length);

    if ((data?.length > 0) && (list?.length > 0) && (data?.length <= assetFetchCount)) {
        return (
            <section className={styles.dashboard}>
                <nav className={styles.topNav}>
                    <a className={styles.logo} href="https://superteam.fun/">
                        <img src="/logo.jpg" alt="" />
                    </a>
                    <a className={styles.linkDoc} href="https://docs.google.com/spreadsheets/d/1I6EEV3RTTPTI5ugX3IWvkjx39pjSym9tk4DBeoXyGys/edit#gid=0">
                        <button>Original Sheet</button>
                    </a>
                </nav>
                <div className={styles.con}>
                    <div className={styles.head}>
                        <h1>Community Payouts</h1>
                        <nav>
                            {(!showGraph) ? <>
                                <button onClick={() => { setSelectedBtn(ALL) }}
                                    className={(selectedBtn == ALL) ? styles.selected : null}>{ALL}
                                </button>
                                <button onClick={() => { setSelectedBtn(BOUNTIES) }}
                                    className={(selectedBtn == BOUNTIES) ? styles.selected : null}>{BOUNTIES}
                                </button>
                                <button onClick={() => { setSelectedBtn(INSTAGRANTS) }}
                                    className={(selectedBtn == INSTAGRANTS) ? styles.selected : null}>{INSTAGRANTS}
                                </button>  </> :
                                <button onClick={() => { setShowGraph(s => !s) }}>
                                    Switch to Dashboard
                                </button>
                            }
                        </nav>
                    </div>

                    {(showGraph) ? <LineGraph tokenAssets={tokenAssets} tokenData={data} /> : <div className={styles.body}>
                        <span className={styles.titles}>
                            <ul>
                                <li className={styles.project}>Projects</li>
                                <li>Token</li>
                                <li>1st Prize</li>
                                <li>2st Prize</li>
                                <li>3rd Prize</li>
                                <li>Date given</li>
                            </ul>
                        </span>
                        <span className={styles.data} key={"data" + selectedBtn}>
                            {
                                data.filter((payload) => {
                                    if (selectedBtn == ALL) { return true }
                                    else if (selectedBtn == BOUNTIES) {
                                        return (payload['Type'] == 'Bounty')
                                    }
                                    else if (selectedBtn == INSTAGRANTS) {
                                        return (payload['Type'] == 'Instagrant')
                                    }
                                }).map((etx) => {
                                    if (etx['1st Prize']?.length > 0 && !isNaN(parseFloat(etx['1st Prize'])))
                                        return (
                                            <span className={styles.entry}>
                                                <ul>
                                                    <li className={styles.project}>{etx['Project']}</li>
                                                    <li><img className={styles.tokenImage}
                                                        src={tokenAssets[etx['Token']].image}
                                                        alt="" />
                                                        <p className={styles.price}>{etx['Token']}  <p className={styles.usd}>{getTokenPriceUSD(etx)}</p></p>
                                                    </li>
                                                    <li>{(etx['1st Prize']?.length > 0)
                                                        ? (<p className={styles.price}>{etx['1st Prize']}
                                                            <p className={styles.usd}>{getPriceUSD(etx, etx['1st Prize'])}</p></p>)
                                                        : (<p className={styles.na}>n/a</p>)}
                                                    </li>

                                                    <li>{(etx['2nd Prize']?.length > 0) ?
                                                        (<p className={styles.price}>{etx['2nd Prize']}
                                                            <p className={styles.usd}>{getPriceUSD(etx, etx['2nd Prize'])}</p></p>)
                                                        : (<p className={styles.na}>n/a</p>)}
                                                    </li>

                                                    <li>{(etx['3rd Prize']?.length > 0)
                                                        ? (<p className={styles.price}>{etx['3rd Prize']}
                                                            <p className={styles.usd}>{getPriceUSD(etx, etx['3rd Prize'])}</p></p>)
                                                        : (<p className={styles.na}>n/a</p>)}
                                                    </li>


                                                    <li>{(etx['Date Given']?.length > 0) ? (formatDate(etx['Date Given'])) : (<p className={styles.na}>n/a</p>)}</li>
                                                </ul>
                                            </span>
                                        )
                                })
                            }
                        </span>
                    </div>}

                </div>
                <span className={showGraph ? styles.tailGraph : styles.tailDash} onClick={() => { setShowGraph(s => !s) }}>
                    <p>Amount Earned by the Community</p>
                    <h1>{getSumTotal()}</h1>
                </span>
            </section>
        )
    }
    else {
        return (
            <div className={styles.dashboard}>
                <div className="circles-loader">
                    Loading...
                </div>
            </div>
        )
    }
}

export default Dashboard
