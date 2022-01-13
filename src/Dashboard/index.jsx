import React, { useEffect, useState, useRef } from 'react'
import styles from './dashboard.module.scss'
import axios from 'axios'

import LineGraph from '../LineGraph'
import LeaderBoard from '../LeaderBoard'
import Loader from './Loader'

import ReactGA from 'react-ga';
ReactGA.initialize('G-9BMSYLV5HD');
ReactGA.pageview(window.location.pathname + window.location.search);

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

    if (`${month.length}` < 2) {
        month = `0${month}`;
    }

    if (`${day.length}` < 2) {
        day = `0${day}`;
    }

    return `${day}/${month}/${year}`
}

function PageSwitcher({ selectedPage, tokenAssets, todaysTotal, tokenData }) {
    if (selectedPage == "chart") {
        return <LineGraph tokenAssets={tokenAssets} tokenData={tokenData} todaysTotal={todaysTotal} />
    }
    else if (selectedPage == "leaderboard") {
        return <LeaderBoard tokenAssets={tokenAssets} tokenData={tokenData} />
    }
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

    const unixToDate = (timestamp) => {
        let date = new Date(timestamp).toLocaleDateString("en-US")
        return date;
    }

    const getStartDate = () => {
        var d = new Date();
        d.setDate(d.getDate() - 55);
        return d
    }

    const getTokenAssets = async (id, dateGiven) => {
        if (!list) return
        if (tokenAssets)
            try {
                let res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`);
                // console.log('api call -->', id);
                let chart = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart/range?vs_currency=usd&from=${(Math.round(getStartDate().getTime() / 1000))}&to=${(Math.round((new Date()).getTime() / 1000))}`)
                //  console.log('chart api call -->', id);
                let priceChart = chart.data?.prices;
                if (res && chart) {
                    setTokenAssets((obj) => { return ({ ...obj, [res.data.symbol.toUpperCase()]: { image: res.data.image.small, price: res.data.market_data.current_price.usd, id, priceChart } }) })
                    setAssetFetchCount(c => c + 1);
                    console.log(res.data.symbol.toUpperCase(), priceChart?.length, unixToDate(priceChart[0][0]), priceChart[0][0]);
                }
            }
            catch (er) {
                console.log(er);
            }
    }

    const totalUnitsToken = (etx) => {
        let tSum = 0;
        if (!isNaN(parseFloat(etx['1st Prize']))) {
            tSum = tSum + parseFloat(etx['1st Prize'].replace(/,/g, ''));
        }
        if (!isNaN(parseFloat(etx['2nd Prize']))) {
            tSum = tSum + parseFloat(etx['2nd Prize'].replace(/,/g, ''));
        }
        if (!isNaN(parseFloat(etx['3rd Prize']))) {
            tSum = tSum + parseFloat(etx['3rd Prize'].replace(/,/g, ''));
        }

        return tSum;
    }



    const getPriceUSD = (etx, units) => {
        let usd = parseFloat((parseFloat(tokenAssets[etx['Token']].price) * parseFloat(units)).toPrecision(2));
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

    const getTotalPayoutFromChart = () => {
        let sumC = 0;
        data.forEach((etx) => {
            if (!isNaN(parseFloat(etx['Current USD Value (1st Prize)']))) {
                sumC = sumC + parseFloat(etx['Current USD Value (1st Prize)'].replace(/,/g, ''));
            }
            if (!isNaN(parseFloat(etx['Current USD Value (2nd Prize)']))) {
                sumC = sumC + parseFloat(etx['Current USD Value (2nd Prize)'].replace(/,/g, ''));
            }
            if (!isNaN(parseFloat(etx['Current USD Value (3rd Prize)']))) {
                sumC = sumC + parseFloat(etx['Current USD Value (3rd Prize)'].replace(/,/g, ''));
            }
        })
        return sumC;
    }

    const todaysTotal = getTotalPayoutFromChart();

    const [selectedPage, setSelectedPage] = useState("dashboard");

    const dropdown = useRef(null);

    function openLinkNewTab(link) {
        if (!link) return
        let a = document.createElement('a');
        a.target = '_blank';
        a.href = link;
        a.click();
    }

    function proofOfWorkExist(link) {
        if (!link) return ""
        return styles.proofOfWork
    }

 
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
                        <h1>{(() => {
                            if (selectedPage == 'dashboard') return "Community Earnings"
                            if (selectedPage == 'chart') return "Community Earnings Graph"
                            if (selectedPage == 'leaderboard') return "Sponsor Leaderboard"
                        }
                        )()}</h1>
                        <nav>
                            {(selectedPage == 'dashboard') ? <>
                                <span className={styles.dropdown}>
                                    <span>{selectedBtn}</span>
                                    <div className={styles.dropdownList}>
                                        <li onClick={() => { setSelectedBtn(ALL) }}>{ALL}</li>
                                        <li onClick={() => { setSelectedBtn(INSTAGRANTS) }}>{INSTAGRANTS}</li>
                                        <li onClick={() => { setSelectedBtn(BOUNTIES) }}>{BOUNTIES}</li>
                                    </div>
                                </span>
                                <div className={styles.divider} />
                            </> : null
                            }
                            <button className={(selectedPage == 'dashboard') ? styles.selected : null}
                                onClick={() => { setSelectedPage('dashboard') }}
                            >Dashboard</button>
                            <button className={(selectedPage == 'chart') ? styles.selected : null}
                                onClick={() => { setSelectedPage('chart') }}
                            >Earnings Graph</button>
                            <button className={(selectedPage == 'leaderboard') ? styles.selected : null}
                                onClick={() => { setSelectedPage('leaderboard') }}
                            >Leaderboard</button>
                        </nav>
                    </div>

                    {(selectedPage !== 'dashboard') ? <PageSwitcher selectedPage={selectedPage} tokenAssets={tokenAssets} tokenData={data} todaysTotal={todaysTotal} /> :
                        <div className={styles.body}>
                            <span className={styles.titles}>
                                <ul>
                                    <li className={styles.project}>Projects</li>
                                    <li>Token</li>
                                    <li>Total earnings</li>
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
                                                <span className={styles.entry + " " + proofOfWorkExist(etx['Proof of Work'])}
                                                    onClick={() => { openLinkNewTab(etx['Proof of Work']) }}>
                                                    <ul>
                                                        <li className={styles.project}>{etx['Project']}</li>
                                                        <li><img className={styles.tokenImage}
                                                            src={tokenAssets[etx['Token']].image}
                                                            alt="" />
                                                            <p className={styles.price}>{etx['Token']}  <p className={styles.usd}>{getTokenPriceUSD(etx)}</p></p>
                                                        </li>
                                                        {/* <li>{(etx['1st Prize']?.length > 0)
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
                                                    </li> */}
                                                        <li>
                                                            <p className={styles.price}>
                                                                {totalUnitsToken(etx)}
                                                                <p className={styles.usd}>
                                                                    {getPriceUSD(etx, totalUnitsToken(etx))}
                                                                </p>
                                                            </p>
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
                <span className={showGraph ? styles.tailGraph : styles.tailDash} >
                    <p>Amount Earned by the Community</p>
                    <h1>$ {todaysTotal}</h1>
                </span>
            </section>
        )
    }
    else {
        return (
            <span className={styles.loading}>
                <Loader />
            </span>
        )
    }
}



export default Dashboard
// getSumTotal()