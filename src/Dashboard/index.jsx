import React, { useEffect, useState } from 'react'
import styles from './dashboard.module.scss'
import axios from 'axios'
import './loader.css'


const fetchDashboard = async (setData, setSheet1, setSheet2, sheet1, sheet2, selectedBtn) => {

    try {

        if (!sheet1) {
            let res1 = await axios.get(`https://api.steinhq.com/v1/storages/61a101d08d29ba23790846d7/Bounties Paid`);
            if (res1) {
                let cleanData1 = deNuller(res1.data);
                setSheet1(cleanData1);
                (selectedBtn == 0) && setData(cleanData1);
            }
        }
        else {
            (selectedBtn == 0) && setData(sheet1);
        }

        if (!sheet2) {
            let res2 = await axios.get(`https://api.steinhq.com/v1/storages/61a101d08d29ba23790846d7/VJ Bounties Paid`);
            if (res2) {
                let cleanData2 = dataCleaner(res2.data);
                setSheet2(cleanData2);
                (selectedBtn == 1) && setData(cleanData2);
            }
        }
        else {
            (selectedBtn == 1) && setData(sheet2);
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

    console.log(newData);

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

    return `${day}/${month}/${year}`
}

function Dashboard() {

    const [sheet1, setSheet1] = useState(null);
    const [sheet2, setSheet2] = useState(null);
    const [data, setData] = useState([]);
    const [list, setList] = useState(null);
    const [tokenAssets, setTokenAssets] = useState({});
    const [assetFetchCount, setAssetFetchCount] = useState(0);
    const [selectedBtn, setSelectedBtn] = useState(0);

    useEffect(() => {
        fetchDashboard(setData, setSheet1, setSheet2, sheet1, sheet2, selectedBtn);
    }, [selectedBtn])

    useEffect(() => {
        fetchList(setList);
    }, [])

    useEffect(() => {
        if (data.length < 0) return
        if (!list) return
        data.forEach((itx) => {
            getTokenData(getTokenId(itx['Token']));
        })
    }, [list, data,])

    const getTokenId = (symbol) => {
        console.log("search -->", symbol);
        if (!list) return;
        let id;
        list.forEach((item) => {
            if (symbol.toLowerCase() == item.symbol) {
                id = item.id;
            }
        })
        return id;
    }

    const getTokenData = async (id) => {
        if (!list) return
        try {
            let res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`);
            if (res) {
                setTokenAssets((obj) => { return ({ ...obj, [res.data.symbol.toUpperCase()]: { image: res.data.image.small, price: res.data.market_data.current_price.usd } }) })
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
                        <h1>Amount Given to Community Tracking (SuperteamDAO)</h1>
                        <nav>
                            <button onClick={() => { setSelectedBtn(0) }}
                                className={(selectedBtn == 0) ? styles.selected : null}>Bounties Paid</button>
                            <button onClick={() => { setSelectedBtn(1) }}
                                className={(selectedBtn == 1) ? styles.selected : null}>VJ Bounties Paid</button>
                        </nav>
                    </div>
                    <div className={styles.body}>
                        <span className={styles.titles}>
                            <ul>
                                <li className={styles.project}>Projects</li>
                                <li>Token</li>
                                <li>1st Prize</li>
                                <li>2st Prize</li>
                                <li>3rd Prize</li>
                                {(selectedBtn == 0) ? <li>Value on allocation day</li> : null}
                                <li>Date given</li>
                            </ul>
                        </span>
                        <span className={styles.data} key={"data" + selectedBtn}>
                            {
                                data.map((etx) => {
                                    console.log(tokenAssets[etx['Token']].image)
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

                                                {(selectedBtn == 0)
                                                    ? <li>{(etx['Value on Day Allocated']?.length > 0) ? (`$${etx['Value on Day Allocated']}`) : (<p className={styles.na}>n/a</p>)}</li>
                                                    : null
                                                }
                                                <li>{(etx['Date Given']?.length > 0) ? (formatDate(etx['Date Given'])) : (<p className={styles.na}>n/a</p>)}</li>
                                            </ul>
                                        </span>
                                    )
                                })
                            }
                        </span>
                    </div>

                </div>
                <span className={styles.tail}>
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
